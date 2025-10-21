const express = require('express');
const pool = require('../config/database');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Простой тестовый endpoint
router.post('/test', authenticateToken, (req, res) => {
  res.json({
    message: 'Тест успешен',
    receivedBody: req.body,
    user: req.user,
    timestamp: new Date().toISOString()
  });
});

// Получить все новости
router.get('/', async (req, res) => {
  try {
    const { limit, offset } = req.query;
    
    let query = `
      SELECT 
        n.id, 
        n.title, 
        n.content, 
        n.created_at, 
        n.updated_at,
        u.name as author_name,
        u.email as author_email
      FROM news n
      LEFT JOIN users u ON n.author_id = u.id
      ORDER BY n.created_at DESC
    `;
    
    const params = [];
    let paramIndex = 1;

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
    console.error('Ошибка получения новостей:', error);
    res.status(500).json({ error: 'Ошибка получения новостей' });
  }
});

// Получить новость по ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(`
      SELECT 
        n.id, 
        n.title, 
        n.content, 
        n.created_at, 
        n.updated_at,
        u.name as author_name,
        u.email as author_email
      FROM news n
      LEFT JOIN users u ON n.author_id = u.id
      WHERE n.id = $1
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Новость не найдена' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Ошибка получения новости:', error);
    res.status(500).json({ error: 'Ошибка получения новости' });
  }
});

// Создать новость - НОВАЯ ПРОСТАЯ ВЕРСИЯ
router.post('/', authenticateToken, requireAdmin, async (req, res) => {
  console.log('=== СОЗДАНИЕ НОВОСТИ ===');
  console.log('Body:', req.body);
  console.log('User:', req.user);
  
  // Простая проверка
  if (!req.body || !req.body.title || !req.body.content) {
    console.log('ERROR: Нет данных в body');
    return res.status(400).json({ 
      error: 'Отсутствуют данные',
      received: req.body 
    });
  }

  const title = String(req.body.title).trim();
  const content = String(req.body.content).trim();
  
  console.log('Обработанные данные:', { title, content });

  if (!title || !content) {
    console.log('ERROR: Пустые поля после trim');
    return res.status(400).json({ 
      error: 'Пустые поля',
      title: title,
      content: content
    });
  }

  try {
    // Создаем новость
    const result = await pool.query(
      'INSERT INTO news (title, content, author_id, created_at) VALUES ($1, $2, $3, NOW()) RETURNING *',
      [title, content, req.user.id]
    );

    console.log('SUCCESS: Новость создана:', result.rows[0]);
    
    res.status(201).json({
      success: true,
      news: result.rows[0],
      message: 'Новость успешно создана'
    });
  } catch (error) {
    console.error('ERROR: Ошибка БД:', error);
    res.status(500).json({ 
      error: 'Ошибка базы данных',
      details: error.message 
    });
  }
});

// Обновить новость (требует авторизации, только автор может редактировать)
router.put('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content } = req.body;

    if (!title || !content) {
      return res.status(400).json({ error: 'Заголовок и содержание обязательны' });
    }

    const result = await pool.query(
      `UPDATE news 
       SET title = $1, content = $2, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $3 
       RETURNING id, title, content, created_at, updated_at`,
      [title, content, id]
    );

    if (result.rows.length === 0) return res.status(404).json({ error: 'Новость не найдена' });
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Ошибка обновления новости:', error);
    res.status(500).json({ error: 'Ошибка обновления новости' });
  }
});

// Удалить новость (требует авторизации, только автор может удалить)
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await pool.query('SELECT id FROM news WHERE id = $1', [id]);
    if (existing.rows.length === 0) return res.status(404).json({ error: 'Новость не найдена' });
    await pool.query('DELETE FROM news WHERE id = $1', [id]);
    res.json({ message: 'Новость успешно удалена' });
  } catch (error) {
    console.error('Ошибка удаления новости:', error);
    res.status(500).json({ error: 'Ошибка удаления новости' });
  }
});

module.exports = router;
