const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { query } = require('../config/database');

/**
 * @route   POST /api/auth/register
 * @desc    Регистрация нового пользователя
 * @access  Public
 */
router.post('/register', async (req, res) => {
  try {
    const { email, password, username } = req.body;

    // Валидация
    if (!email || !password || !username) {
      return res.status(400).json({ error: 'Все поля обязательны' });
    }

    // Проверка существования пользователя
    const existingUser = await query(
      'SELECT user_id FROM users WHERE email = $1 OR username = $2',
      [email, username]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: 'Пользователь уже существует' });
    }

    // Хеширование пароля
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Создание пользователя
    const result = await query(
      'INSERT INTO users (email, password_hash, username) VALUES ($1, $2, $3) RETURNING user_id, email, username, created_at',
      [email, passwordHash, username]
    );

    const user = result.rows[0];

    // Создание профиля пользователя
    await query(
      'INSERT INTO user_profiles (user_id) VALUES ($1)',
      [user.user_id]
    );

    // Генерация JWT токена
    const token = jwt.sign(
      { user_id: user.user_id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.status(201).json({
      message: 'Регистрация успешна',
      token,
      user: {
        user_id: user.user_id,
        email: user.email,
        username: user.username
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Ошибка сервера при регистрации' });
  }
});

/**
 * @route   POST /api/auth/login
 * @desc    Авторизация пользователя
 * @access  Public
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Валидация
    if (!email || !password) {
      return res.status(400).json({ error: 'Email и пароль обязательны' });
    }

    // Поиск пользователя
    const result = await query(
      'SELECT user_id, email, username, password_hash, is_active FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Неверные учетные данные' });
    }

    const user = result.rows[0];

    // Проверка активности аккаунта
    if (!user.is_active) {
      return res.status(403).json({ error: 'Аккаунт заблокирован' });
    }

    // Проверка пароля
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Неверные учетные данные' });
    }

    // Обновление времени последнего входа
    await query(
      'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE user_id = $1',
      [user.user_id]
    );

    // Генерация JWT токена
    const token = jwt.sign(
      { user_id: user.user_id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.json({
      message: 'Авторизация успешна',
      token,
      user: {
        user_id: user.user_id,
        email: user.email,
        username: user.username
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Ошибка сервера при авторизации' });
  }
});

module.exports = router;
