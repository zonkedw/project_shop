const express = require('express');
const router = express.Router();
const { query, getClient } = require('../config/database');
const { authMiddleware } = require('../middleware/auth');
const {
  searchProductsSchema,
  getProductByIdSchema,
  getProductByBarcodeSchema,
  createProductSchema,
  addMealSchema,
  diarySchema,
} = require('../validators/nutritionValidators');

// Все роуты требуют авторизации
router.use(authMiddleware);

/**
 * @route   GET /api/nutrition/products/search
 * @desc    Поиск продуктов по названию
 * @access  Private
 */
router.get('/products/search', searchProductsSchema, async (req, res, next) => {
  try {
    const { q, category, limit = 20, offset = 0 } = req.query;

    let queryText = `
      SELECT product_id, name, brand, barcode, 
             calories_per_100, protein_per_100, carbs_per_100, fats_per_100,
             fiber_per_100, sugar_per_100, category, is_verified
      FROM products
      WHERE name ILIKE $1
    `;
    const params = [`%${q}%`];

    if (category) {
      queryText += ` AND category = $${params.length + 1}`;
      params.push(category);
    }

    queryText += ` ORDER BY is_verified DESC, name ASC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(parseInt(limit), parseInt(offset));

    const result = await query(queryText, params);

    res.json({
      success: true,
      data: {
        products: result.rows,
        count: result.rows.length,
        limit: parseInt(limit),
        offset: parseInt(offset),
      },
    });
  } catch (error) {
    console.error('Product search error:', error);
    next(error);
  }
});

/**
 * @route   GET /api/nutrition/products/barcode/:barcode
 * @desc    Получить продукт по штрих-коду
 * @access  Private
 */
router.get('/products/barcode/:barcode', getProductByBarcodeSchema, async (req, res, next) => {
  try {
    const { barcode } = req.params;

    const result = await query(
      'SELECT * FROM products WHERE barcode = $1',
      [barcode]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Продукт не найден' });
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Barcode lookup error:', error);
    next(error);
  }
});

/**
 * @route   GET /api/nutrition/products/:id
 * @desc    Получить продукт по ID
 * @access  Private
 */
router.get('/products/:id', getProductByIdSchema, async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await query(
      'SELECT * FROM products WHERE product_id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Продукт не найден' });
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Get product error:', error);
    next(error);
  }
});

/**
 * @route   POST /api/nutrition/products
 * @desc    Создать новый продукт
 * @access  Private
 */
router.post('/products', async (req, res) => {
  try {
    const {
      name, brand, barcode, serving_size_g, serving_size_ml,
      calories_per_100, protein_per_100, carbs_per_100, fats_per_100,
      fiber_per_100, sugar_per_100, category
    } = req.body;

    const result = await query(
      `INSERT INTO products (
        name, brand, barcode, serving_size_g, serving_size_ml,
        calories_per_100, protein_per_100, carbs_per_100, fats_per_100,
        fiber_per_100, sugar_per_100, category, created_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING *`,
      [name, brand, barcode, serving_size_g, serving_size_ml,
       calories_per_100, protein_per_100, carbs_per_100, fats_per_100,
       fiber_per_100, sugar_per_100, category, req.user.user_id]
    );

    res.status(201).json({
      success: true,
      message: 'Продукт создан',
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Create product error:', error);
    if (error.code === '23505') { // Unique violation
      return res.status(409).json({ success: false, error: 'Продукт с таким штрих-кодом уже существует' });
    }
    res.status(500).json({ success: false, error: 'Ошибка создания продукта' });
  }
});

/**
 * @route   GET /api/nutrition/categories
 * @desc    Получить список категорий продуктов
 * @access  Private
 */
router.get('/categories', async (req, res) => {
  try {
    const result = await query(
      'SELECT DISTINCT category FROM products WHERE category IS NOT NULL ORDER BY category'
    );

    res.json({
      categories: result.rows.map(row => row.category)
    });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ error: 'Ошибка получения категорий' });
  }
});

/**
 * @route   POST /api/nutrition/meals
 * @desc    Добавить прием пищи
 * @access  Private
 */
router.post('/meals', addMealSchema, async (req, res) => {
  const client = await getClient();
  
  try {
    const { meal_date, meal_type, items, notes } = req.body;

    // Валидация
    if (!meal_date || !meal_type || !items || items.length === 0) {
      return res.status(400).json({ error: 'Дата, тип приема пищи и продукты обязательны' });
    }

    await client.query('BEGIN');

    // Создать прием пищи
    const mealResult = await client.query(
      `INSERT INTO meals (user_id, meal_date, meal_type, notes)
       VALUES ($1, $2, $3, $4)
       RETURNING meal_id`,
      [req.user.user_id, meal_date, meal_type, notes]
    );

    const mealId = mealResult.rows[0].meal_id;

    // Добавить продукты/рецепты
    let totalCalories = 0, totalProtein = 0, totalCarbs = 0, totalFats = 0;

    for (const item of items) {
      const { product_id, recipe_id, quantity_g, quantity_ml } = item;

      if (!product_id && !recipe_id) {
        await client.query('ROLLBACK');
        return res.status(400).json({ error: 'Укажите product_id или recipe_id' });
      }

      let calories, protein, carbs, fats;

      if (product_id) {
        // Получить нутриенты продукта
        const productResult = await client.query(
          'SELECT calories_per_100, protein_per_100, carbs_per_100, fats_per_100 FROM products WHERE product_id = $1',
          [product_id]
        );

        if (productResult.rows.length === 0) {
          await client.query('ROLLBACK');
          return res.status(404).json({ error: `Продукт ${product_id} не найден` });
        }

        const product = productResult.rows[0];
        const multiplier = (quantity_g || quantity_ml) / 100;

        calories = product.calories_per_100 * multiplier;
        protein = product.protein_per_100 * multiplier;
        carbs = product.carbs_per_100 * multiplier;
        fats = product.fats_per_100 * multiplier;

        await client.query(
          `INSERT INTO meal_items (meal_id, product_id, quantity_g, quantity_ml, calories, protein, carbs, fats)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
          [mealId, product_id, quantity_g, quantity_ml, calories, protein, carbs, fats]
        );
      } else {
        // Логика для рецептов (упрощенная версия)
        const recipeResult = await client.query(
          'SELECT total_calories, total_protein, total_carbs, total_fats, servings FROM recipes WHERE recipe_id = $1',
          [recipe_id]
        );

        if (recipeResult.rows.length === 0) {
          await client.query('ROLLBACK');
          return res.status(404).json({ error: `Рецепт ${recipe_id} не найден` });
        }

        const recipe = recipeResult.rows[0];
        const servingsMultiplier = (quantity_g || 1) / (recipe.servings || 1);

        calories = recipe.total_calories * servingsMultiplier;
        protein = recipe.total_protein * servingsMultiplier;
        carbs = recipe.total_carbs * servingsMultiplier;
        fats = recipe.total_fats * servingsMultiplier;

        await client.query(
          `INSERT INTO meal_items (meal_id, recipe_id, quantity_g, calories, protein, carbs, fats)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [mealId, recipe_id, quantity_g, calories, protein, carbs, fats]
        );
      }

      totalCalories += calories;
      totalProtein += protein;
      totalCarbs += carbs;
      totalFats += fats;
    }

    // Обновить итоги приема пищи
    await client.query(
      `UPDATE meals SET total_calories = $1, total_protein = $2, total_carbs = $3, total_fats = $4
       WHERE meal_id = $5`,
      [totalCalories, totalProtein, totalCarbs, totalFats, mealId]
    );

    await client.query('COMMIT');

    res.status(201).json({
      success: true,
      message: 'Прием пищи добавлен',
      data: {
        meal_id: mealId,
        totals: {
          calories: totalCalories,
          protein: totalProtein,
          carbs: totalCarbs,
          fats: totalFats
        }
      }
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Create meal error:', error);
    res.status(500).json({ success: false, error: 'Ошибка создания приема пищи' });
  } finally {
    client.release();
  }
});

/**
 * @route   GET /api/nutrition/diary
 * @desc    Получить дневник питания за день
 * @access  Private
 */
router.get('/diary', diarySchema, async (req, res, next) => {
  try {
    const { date } = req.query;

    // Получить все приемы пищи за день
    const mealsResult = await query(
      `SELECT m.meal_id, m.meal_type, m.total_calories, m.total_protein, 
              m.total_carbs, m.total_fats, m.notes, m.created_at
       FROM meals m
       WHERE m.user_id = $1 AND m.meal_date = $2
       ORDER BY 
         CASE m.meal_type
           WHEN 'breakfast' THEN 1
           WHEN 'lunch' THEN 2
           WHEN 'dinner' THEN 3
           WHEN 'snack' THEN 4
         END`,
      [req.user.user_id, date]
    );

    // Для каждого приема получить продукты
    const meals = [];
    let dailyTotals = { calories: 0, protein: 0, carbs: 0, fats: 0 };

    for (const meal of mealsResult.rows) {
      const itemsResult = await query(
        `SELECT mi.*, 
                p.name as product_name, p.brand, 
                r.name as recipe_name
         FROM meal_items mi
         LEFT JOIN products p ON mi.product_id = p.product_id
         LEFT JOIN recipes r ON mi.recipe_id = r.recipe_id
         WHERE mi.meal_id = $1`,
        [meal.meal_id]
      );

      meals.push({
        ...meal,
        items: itemsResult.rows
      });

      dailyTotals.calories += parseFloat(meal.total_calories || 0);
      dailyTotals.protein += parseFloat(meal.total_protein || 0);
      dailyTotals.carbs += parseFloat(meal.total_carbs || 0);
      dailyTotals.fats += parseFloat(meal.total_fats || 0);
    }

    // Получить целевые значения пользователя
    const profileResult = await query(
      'SELECT daily_calories_target, protein_target_g, carbs_target_g, fats_target_g FROM user_profiles WHERE user_id = $1',
      [req.user.user_id]
    );

    const targets = profileResult.rows[0] || {};

    res.json({
      success: true,
      data: {
        date,
        meals,
        totals: {
          calories: Math.round(dailyTotals.calories),
          protein: Math.round(dailyTotals.protein),
          carbs: Math.round(dailyTotals.carbs),
          fats: Math.round(dailyTotals.fats)
        },
        targets: {
          calories: targets.daily_calories_target,
          protein: targets.protein_target_g,
          carbs: targets.carbs_target_g,
          fats: targets.fats_target_g
        },
        remaining: {
          calories: (targets.daily_calories_target || 0) - Math.round(dailyTotals.calories),
          protein: (targets.protein_target_g || 0) - Math.round(dailyTotals.protein),
          carbs: (targets.carbs_target_g || 0) - Math.round(dailyTotals.carbs),
          fats: (targets.fats_target_g || 0) - Math.round(dailyTotals.fats)
        }
      }
    });
  } catch (error) {
    console.error('Get diary error:', error);
    next(error);
  }
});

/**
 * @route   DELETE /api/nutrition/meals/:id
 * @desc    Удалить прием пищи
 * @access  Private
 */
router.delete('/meals/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await query(
      'DELETE FROM meals WHERE meal_id = $1 AND user_id = $2 RETURNING meal_id',
      [id, req.user.user_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Прием пищи не найден' });
    }

    res.json({ success: true, message: 'Прием пищи удален', data: { meal_id: result.rows[0].meal_id } });
  } catch (error) {
    console.error('Delete meal error:', error);
    next(error);
  }
});

module.exports = router;
