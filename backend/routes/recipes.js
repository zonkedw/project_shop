const express = require('express');
const router = express.Router();
const { query, getClient } = require('../config/database');
const { authMiddleware } = require('../middleware/auth');

router.use(authMiddleware);

/**
 * @route   GET /api/recipes
 * @desc    Получить рецепты пользователя
 * @access  Private
 */
router.get('/', async (req, res) => {
  try {
    const { limit = 20, offset = 0 } = req.query;

    const result = await query(
      `SELECT * FROM recipes 
       WHERE user_id = $1 OR is_public = true
       ORDER BY created_at DESC
       LIMIT $2 OFFSET $3`,
      [req.user.user_id, parseInt(limit), parseInt(offset)]
    );

    res.json({
      recipes: result.rows,
      count: result.rows.length
    });
  } catch (error) {
    console.error('Get recipes error:', error);
    res.status(500).json({ error: 'Ошибка получения рецептов' });
  }
});

/**
 * @route   GET /api/recipes/:id
 * @desc    Получить рецепт с ингредиентами
 * @access  Private
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const recipeResult = await query(
      'SELECT * FROM recipes WHERE recipe_id = $1',
      [id]
    );

    if (recipeResult.rows.length === 0) {
      return res.status(404).json({ error: 'Рецепт не найден' });
    }

    const ingredientsResult = await query(
      `SELECT ri.*, p.name as product_name, p.brand, 
              p.calories_per_100, p.protein_per_100, p.carbs_per_100, p.fats_per_100
       FROM recipe_ingredients ri
       JOIN products p ON ri.product_id = p.product_id
       WHERE ri.recipe_id = $1`,
      [id]
    );

    res.json({
      ...recipeResult.rows[0],
      ingredients: ingredientsResult.rows
    });
  } catch (error) {
    console.error('Get recipe error:', error);
    res.status(500).json({ error: 'Ошибка получения рецепта' });
  }
});

/**
 * @route   POST /api/recipes
 * @desc    Создать рецепт
 * @access  Private
 */
router.post('/', async (req, res) => {
  const client = await getClient();

  try {
    const {
      name, description, servings, cooking_time_min,
      instructions, ingredients, is_public
    } = req.body;

    if (!name || !ingredients || ingredients.length === 0) {
      return res.status(400).json({ error: 'Название и ингредиенты обязательны' });
    }

    await client.query('BEGIN');

    let totalCalories = 0, totalProtein = 0, totalCarbs = 0, totalFats = 0;

    // Рассчитать общие нутриенты
    for (const ingredient of ingredients) {
      const productResult = await client.query(
        'SELECT calories_per_100, protein_per_100, carbs_per_100, fats_per_100 FROM products WHERE product_id = $1',
        [ingredient.product_id]
      );

      if (productResult.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(404).json({ error: `Продукт ${ingredient.product_id} не найден` });
      }

      const product = productResult.rows[0];
      const quantity = ingredient.quantity_g || ingredient.quantity_ml || 0;
      const multiplier = quantity / 100;

      totalCalories += product.calories_per_100 * multiplier;
      totalProtein += product.protein_per_100 * multiplier;
      totalCarbs += product.carbs_per_100 * multiplier;
      totalFats += product.fats_per_100 * multiplier;
    }

    // Создать рецепт
    const recipeResult = await client.query(
      `INSERT INTO recipes (
        user_id, name, description, servings, total_calories, total_protein,
        total_carbs, total_fats, cooking_time_min, instructions, is_public
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *`,
      [
        req.user.user_id, name, description, servings,
        totalCalories, totalProtein, totalCarbs, totalFats,
        cooking_time_min, instructions, is_public || false
      ]
    );

    const recipeId = recipeResult.rows[0].recipe_id;

    // Добавить ингредиенты
    for (const ingredient of ingredients) {
      await client.query(
        `INSERT INTO recipe_ingredients (recipe_id, product_id, quantity_g, quantity_ml)
         VALUES ($1, $2, $3, $4)`,
        [recipeId, ingredient.product_id, ingredient.quantity_g, ingredient.quantity_ml]
      );
    }

    await client.query('COMMIT');

    res.status(201).json({
      message: 'Рецепт создан',
      recipe: recipeResult.rows[0]
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Create recipe error:', error);
    res.status(500).json({ error: 'Ошибка создания рецепта' });
  } finally {
    client.release();
  }
});

/**
 * @route   PUT /api/recipes/:id
 * @desc    Обновить рецепт
 * @access  Private
 */
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, servings, cooking_time_min, instructions, is_public } = req.body;

    const result = await query(
      `UPDATE recipes SET
        name = COALESCE($1, name),
        description = COALESCE($2, description),
        servings = COALESCE($3, servings),
        cooking_time_min = COALESCE($4, cooking_time_min),
        instructions = COALESCE($5, instructions),
        is_public = COALESCE($6, is_public)
       WHERE recipe_id = $7 AND user_id = $8
       RETURNING *`,
      [name, description, servings, cooking_time_min, instructions, is_public, id, req.user.user_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Рецепт не найден' });
    }

    res.json({
      message: 'Рецепт обновлен',
      recipe: result.rows[0]
    });
  } catch (error) {
    console.error('Update recipe error:', error);
    res.status(500).json({ error: 'Ошибка обновления рецепта' });
  }
});

/**
 * @route   DELETE /api/recipes/:id
 * @desc    Удалить рецепт
 * @access  Private
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await query(
      'DELETE FROM recipes WHERE recipe_id = $1 AND user_id = $2 RETURNING recipe_id',
      [id, req.user.user_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Рецепт не найден' });
    }

    res.json({ message: 'Рецепт удален' });
  } catch (error) {
    console.error('Delete recipe error:', error);
    res.status(500).json({ error: 'Ошибка удаления рецепта' });
  }
});

module.exports = router;
