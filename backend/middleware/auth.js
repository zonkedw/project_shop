const jwt = require('jsonwebtoken');
const pool = require('../config/database');

const authenticateToken = async (req, res, next) => {
  console.log('=== AUTH CHECK ===');
  
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    console.log('ERROR: Нет токена');
    return res.status(401).json({ error: 'Нет токена' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Token OK, userId:', decoded.userId);
    
    const userResult = await pool.query(
      'SELECT id, name, email, is_admin FROM users WHERE id = $1',
      [decoded.userId]
    );

    if (userResult.rows.length === 0) {
      console.log('ERROR: Пользователь не найден');
      return res.status(401).json({ error: 'Пользователь не найден' });
    }

    req.user = userResult.rows[0];
    console.log('SUCCESS: Пользователь авторизован:', req.user.id);
    next();
  } catch (error) {
    console.log('ERROR: Ошибка токена:', error.message);
    return res.status(403).json({ error: 'Неверный токен' });
  }
};

const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.is_admin !== true) {
    return res.status(403).json({ error: 'Требуются права администратора' });
  }
  next();
};

module.exports = { authenticateToken, requireAdmin };
