const express = require('express');
const pool = require('../config/database');

const router = express.Router();

// Получить все товары
router.get('/', async (req, res) => {
  try {
    const { category, search, limit, offset, minPrice, maxPrice, isNew, isPopular, hasDiscount, sort } = req.query;
    
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

    if (minPrice) {
      query += ` AND price >= $${paramIndex}`;
      params.push(parseFloat(minPrice));
      paramIndex++;
    }

    if (maxPrice) {
      query += ` AND price <= $${paramIndex}`;
      params.push(parseFloat(maxPrice));
      paramIndex++;
    }

    if (isNew === 'true') {
      query += ` AND is_new = true`;
    }

    if (isPopular === 'true') {
      query += ` AND is_popular = true`;
    }

    if (hasDiscount === 'true') {
      query += ` AND discount > 0`;
    }

    // Сортировка
    if (sort === 'price_asc') query += ' ORDER BY price ASC, id DESC';
    else if (sort === 'price_desc') query += ' ORDER BY price DESC, id DESC';
    else if (sort === 'rating_desc') query += ' ORDER BY rating DESC, reviews DESC';
    else query += ' ORDER BY created_at DESC';

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

// Поиск с пагинацией и общим количеством
router.get('/search', async (req, res) => {
  try {
    const { q, category, minPrice, maxPrice, sort, page = 1, pageSize = 12, isNew, isPopular, hasDiscount } = req.query;

    const where = [];
    const params = [];
    let i = 1;

    if (q) {
      where.push(`name ILIKE $${i++}`);
      params.push(`%${q}%`);
    }

    if (category) {
      where.push(`category = $${i++}`);
      params.push(category);
    }

    if (minPrice) {
      where.push(`price >= $${i++}`);
      params.push(parseFloat(minPrice));
    }

    if (maxPrice) {
      where.push(`price <= $${i++}`);
      params.push(parseFloat(maxPrice));
    }

    if (isNew === 'true') where.push(`is_new = true`);
    if (isPopular === 'true') where.push(`is_popular = true`);
    if (hasDiscount === 'true') where.push(`discount > 0`);

    const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';

    const countSql = `SELECT COUNT(*)::int AS total FROM products ${whereSql}`;
    const countRes = await pool.query(countSql, params);
    const total = countRes.rows[0].total || 0;

    let orderSql = 'ORDER BY created_at DESC';
    if (sort === 'price_asc') orderSql = 'ORDER BY price ASC, id DESC';
    else if (sort === 'price_desc') orderSql = 'ORDER BY price DESC, id DESC';
    else if (sort === 'rating_desc') orderSql = 'ORDER BY rating DESC, reviews DESC';

    const p = Math.max(parseInt(page), 1);
    const ps = Math.max(parseInt(pageSize), 1);
    const offset = (p - 1) * ps;

    const itemsSql = `SELECT * FROM products ${whereSql} ${orderSql} LIMIT $${i} OFFSET $${i + 1}`;
    const itemsRes = await pool.query(itemsSql, [...params, ps, offset]);

    res.json({ items: itemsRes.rows, total, page: p, pageSize: ps });
  } catch (error) {
    console.error('Ошибка поиска товаров:', error);
    res.status(500).json({ error: 'Ошибка поиска товаров' });
  }
});

// Подсказки для поиска
router.get('/suggest', async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || !q.trim()) return res.json([]);
    const result = await pool.query(
      'SELECT id, name, price, image FROM products WHERE name ILIKE $1 ORDER BY rating DESC, reviews DESC LIMIT 8',
      [`%${q}%`]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Ошибка подсказок поиска:', error);
    res.status(500).json({ error: 'Ошибка подсказок поиска' });
  }
});

// Получить товары по списку ID
router.get('/by-ids', async (req, res) => {
  try {
    const { ids } = req.query;
    if (!ids) return res.json([]);
    const list = ids.split(',').map(x => parseInt(x)).filter(Number.isInteger);
    if (!list.length) return res.json([]);
    const result = await pool.query('SELECT * FROM products WHERE id = ANY($1::int[])', [list]);
    res.json(result.rows);
  } catch (error) {
    console.error('Ошибка получения списка товаров:', error);
    res.status(500).json({ error: 'Ошибка получения списка товаров' });
  }
});

// Связанные товары по категории
router.get('/related/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const current = await pool.query('SELECT category FROM products WHERE id = $1', [id]);
    if (!current.rows.length) return res.json([]);
    const category = current.rows[0].category;
    const related = await pool.query(
      'SELECT * FROM products WHERE category = $1 AND id <> $2 ORDER BY rating DESC, reviews DESC LIMIT 8',
      [category, id]
    );
    res.json(related.rows);
  } catch (error) {
    console.error('Ошибка получения связанных товаров:', error);
    res.status(500).json({ error: 'Ошибка получения связанных товаров' });
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
