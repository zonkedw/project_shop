const jwt = require('jsonwebtoken');

/**
 * Middleware для проверки JWT токена
 */
const authMiddleware = (req, res, next) => {
  try {
    // Получение токена из заголовка
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ error: 'Токен не предоставлен' });
    }

    // Верификация токена
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Добавление данных пользователя в request
    req.user = decoded;
    
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Токен истек' });
    }
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Невалидный токен' });
    }
    res.status(500).json({ error: 'Ошибка авторизации' });
  }
};

/**
 * Middleware для проверки роли администратора
 */
const adminMiddleware = async (req, res, next) => {
  try {
    const { query } = require('../config/database');
    
    const result = await query(
      'SELECT role FROM users WHERE user_id = $1',
      [req.user.user_id]
    );

    if (result.rows.length === 0 || result.rows[0].role !== 'admin') {
      return res.status(403).json({ error: 'Доступ запрещен. Требуются права администратора' });
    }

    next();
  } catch (error) {
    console.error('Admin middleware error:', error);
    res.status(500).json({ error: 'Ошибка проверки прав доступа' });
  }
};

module.exports = { authMiddleware, adminMiddleware };
