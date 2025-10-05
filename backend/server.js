const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

// Импорт маршрутов
const authRoutes = require('./routes/auth');
const productsRoutes = require('./routes/products');
const newsRoutes = require('./routes/news');
const ordersRoutes = require('./routes/orders');

// Импорт конфигурации базы данных
const pool = require('./config/database');

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware для безопасности
app.use(helmet());

// CORS настройки - разрешаем все порты localhost
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:3001', 
    'http://localhost:3002',
    process.env.FRONTEND_URL
  ].filter(Boolean),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 минут
  max: 100, // максимум 100 запросов с одного IP за 15 минут
  message: {
    error: 'Слишком много запросов с вашего IP, попробуйте позже'
  }
});
app.use('/api/', limiter);

// Middleware для парсинга JSON
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Middleware для отладки тела запроса
app.use('/api/news', (req, res, next) => {
  console.log('=== NEWS API REQUEST DEBUG ===');
  console.log('Method:', req.method);
  console.log('URL:', req.url);
  console.log('Headers:', req.headers);
  console.log('Raw Body:', req.body);
  console.log('Content-Type:', req.get('Content-Type'));
  console.log('Content-Length:', req.get('Content-Length'));
  console.log('================================');
  next();
});

// Логирование запросов в development режиме
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    if (req.method === 'POST' && req.path.includes('/news')) {
      console.log('Request body:', req.body);
      console.log('Content-Type:', req.headers['content-type']);
      console.log('Authorization:', req.headers['authorization'] ? 'Есть' : 'Нет');
    }
    next();
  });
}

// Проверка здоровья сервера
app.get('/health', async (req, res) => {
  try {
    // Проверяем подключение к базе данных
    await pool.query('SELECT 1');
    res.json({
      status: 'OK',
      timestamp: new Date().toISOString(),
      database: 'Connected'
    });
  } catch (error) {
    res.status(500).json({
      status: 'ERROR',
      timestamp: new Date().toISOString(),
      database: 'Disconnected',
      error: error.message
    });
  }
});

// Тестовый endpoint для проверки JSON парсинга
app.post('/test-json', (req, res) => {
  console.log('TEST JSON ENDPOINT');
  console.log('Headers:', req.headers);
  console.log('Body:', req.body);
  console.log('Body type:', typeof req.body);
  
  res.json({
    message: 'JSON тест успешен',
    receivedBody: req.body,
    bodyType: typeof req.body,
    timestamp: new Date().toISOString()
  });
});

// API маршруты
app.use('/api/auth', authRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/news', newsRoutes);
app.use('/api/orders', ordersRoutes);

// Базовый маршрут
app.get('/', (req, res) => {
  res.json({
    message: 'FoodShop API Server',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      products: '/api/products',
      news: '/api/news',
      orders: '/api/orders',
      health: '/health'
    }
  });
});

// Обработка несуществующих маршрутов
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Маршрут не найден',
    path: req.originalUrl,
    method: req.method
  });
});

// Глобальная обработка ошибок
app.use((error, req, res, next) => {
  console.error('Глобальная ошибка:', error);
  
  res.status(error.status || 500).json({
    error: process.env.NODE_ENV === 'production' 
      ? 'Внутренняя ошибка сервера' 
      : error.message,
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  });
});

// Запуск сервера
app.listen(PORT, () => {
  console.log(`🚀 Сервер запущен на порту ${PORT}`);
  console.log(`🌐 API доступен по адресу: http://localhost:${PORT}`);
  console.log(`📊 Проверка здоровья: http://localhost:${PORT}/health`);
  console.log(`🔧 Режим: ${process.env.NODE_ENV || 'development'}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM получен, завершение работы сервера...');
  pool.end(() => {
    console.log('Подключение к базе данных закрыто');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT получен, завершение работы сервера...');
  pool.end(() => {
    console.log('Подключение к базе данных закрыто');
    process.exit(0);
  });
});
