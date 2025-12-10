require('dotenv').config();

// Проверка конфигурации (кроме тестов)
if (process.env.NODE_ENV !== 'test') {
  try {
    require('./config/index');
  } catch (error) {
    console.error('❌ Ошибка конфигурации:', error.message);
    process.exit(1);
  }
}

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const bodyParser = require('body-parser');
const { errors } = require('celebrate');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet()); // Безопасность headers
app.use(cors({
  origin: process.env.CORS_ORIGINS?.split(',') || '*',
  credentials: true
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 минут
  max: 100 // максимум 100 запросов с одного IP
});
app.use('/api/', limiter);

// Базовый роут
app.get('/', (req, res) => {
  res.json({
    message: 'FitPilot API',
    version: '1.0.0',
    status: 'running'
  });
});

// API Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Роуты
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/nutrition', require('./routes/nutrition'));
app.use('/api/recipes', require('./routes/recipes'));
app.use('/api/workouts', require('./routes/workouts'));
app.use('/api/ai', require('./routes/ai'));

// Ошибки валидации celebrate
app.use(errors());

// 404 handler
app.use(notFoundHandler);

// Централизованный error handler
app.use(errorHandler);

// Запуск сервера (не стартуем в тестовой среде)
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`FitPilot Backend запущен на порту ${PORT}`);
    console.log(`Среда: ${process.env.NODE_ENV || 'development'}`);
    console.log(`http://localhost:${PORT}`);
  });
}

module.exports = app;
