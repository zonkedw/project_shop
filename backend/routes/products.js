const express = require('express');
const pool = require('../config/database');

const router = express.Router();

// Получить все товары
router.get('/', async (req, res) => {
  try {
    const { category, search, limit, offset } = req.query;
    
    let query = 'SELECT * FROM products WHERE 1=1';
    const params = [];
    let paramIndex = 1;

    // Фильтр по категории
    if (category) {
      query += ` AND category = $${paramIndex}`;
      params.push(category);
      paramIndex++;
    }

    // Поиск по названию
    if (search) {
      query += ` AND name ILIKE $${paramIndex}`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    // Сортировка
    query += ' ORDER BY created_at DESC';

    // Пагинация
    if (limit) {
      query += ` LIMIT $${paramIndex}`;
      params.push(parseInt(limit));
      paramIndex++;
    }

    if (offset) {
      query += ` OFFSET $${paramIndex}`;
      params.push(parseInt(offset));
    }

    const result = await pool.query(query, params);
    
    res.json(result.rows);
  } catch (error) {
    console.error('Ошибка получения товаров:', error);
    res.status(500).json({ error: 'Ошибка получения товаров' });
  }
});

// Получить товар по ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(
      'SELECT * FROM products WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Товар не найден' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Ошибка получения товара:', error);
  }
});

// Получить товары по категориям (для главной страницы)
router.get('/categories/grouped', async (req, res) => {
  console.log('=== PRODUCTS API ===');
  
  try {
    // Товары со скидкой (акции)
    const salesResult = await pool.query(
      'SELECT * FROM products WHERE discount > 0 ORDER BY discount DESC LIMIT 8'
    );
    
    // Новинки
    const newResult = await pool.query(
      'SELECT * FROM products WHERE is_new = true ORDER BY created_at DESC LIMIT 8'
    );

    // Популярные
    const popularResult = await pool.query(
      'SELECT * FROM products WHERE is_popular = true ORDER BY rating DESC, reviews DESC LIMIT 8'
    );

    const result = {
      sales: salesResult.rows,
      new: newResult.rows,
      popular: popularResult.rows
    };

    console.log('SUCCESS: Товары получены:', {
      sales: result.sales.length,
      new: result.new.length,
      popular: result.popular.length
    });

    // Если нет товаров в БД, возвращаем моковые данные
    if (result.sales.length === 0 && result.new.length === 0 && result.popular.length === 0) {
      console.log('WARNING: БД пуста, возвращаем моковые данные');
      return res.json({
        sales: [
          { id: 1, name: 'Хлеб белый', price: 45.90, originalPrice: 55.90, discount: 18, image: 'https://via.placeholder.com/200' },
          { id: 2, name: 'Молоко 3.2%', price: 68.90, originalPrice: 78.90, discount: 13, image: 'https://via.placeholder.com/200' }
        ],
        new: [
          { id: 3, name: 'Колбаса Докторская', price: 320.90, isNew: true, image: 'https://via.placeholder.com/200' },
          { id: 4, name: 'Сыр Российский', price: 280.50, isNew: true, image: 'https://via.placeholder.com/200' }
        ],
        popular: [
          { id: 5, name: 'Гречка ядрица', price: 115.90, isPopular: true, rating: 4.8, reviews: 312, image: 'https://via.placeholder.com/200' },
          { id: 6, name: 'Рис круглозерный', price: 89.90, isPopular: true, rating: 4.7, reviews: 278, image: 'https://via.placeholder.com/200' }
        ]
      });
    }

    res.json(result);
  } catch (error) {
    console.error('ERROR: Ошибка получения товаров:', error);
    res.status(500).json({ error: 'Ошибка получения товаров' });
  }
});

// Получить все категории
router.get('/meta/categories', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT DISTINCT category FROM products WHERE category IS NOT NULL ORDER BY category'
    );
    
    const categories = result.rows.map(row => row.category);
    res.json(categories);
  } catch (error) {
    console.error('Ошибка получения категорий:', error);
    res.status(500).json({ error: 'Ошибка получения категорий' });
  }
});

module.exports = router;
