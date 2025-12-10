/**
 * Централизованный обработчик ошибок
 */

const { isCelebrateError } = require('celebrate');

/**
 * Обработчик ошибок для Express
 */
const errorHandler = (err, req, res, next) => {
  // Логируем ошибку
  console.error('Error:', {
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    path: req.path,
    method: req.method,
    userId: req.user?.user_id,
  });

  // Ошибки валидации celebrate
  if (isCelebrateError(err)) {
    const details = {};
    err.details.forEach((error) => {
      error.details.forEach((detail) => {
        details[detail.path.join('.')] = detail.message;
      });
    });
    
    return res.status(400).json({
      error: 'Validation error',
      details,
    });
  }

  // Ошибки JWT
  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    return res.status(401).json({
      error: err.name === 'TokenExpiredError' ? 'Token expired' : 'Invalid token',
    });
  }

  // Ошибки базы данных
  if (err.code && err.code.startsWith('23')) {
    return res.status(409).json({
      error: 'Database constraint violation',
      message: process.env.NODE_ENV === 'development' ? err.message : undefined,
    });
  }

  // Ошибки подключения к БД
  if (err.code === 'ECONNREFUSED' || err.code === 'ENOTFOUND') {
    return res.status(503).json({
      error: 'Database connection error',
    });
  }

  // Ошибки rate limit
  if (err.status === 429) {
    return res.status(429).json({
      error: 'Too many requests',
      message: 'Превышен лимит запросов. Попробуйте позже.',
    });
  }

  // Ошибки AI (AbortError от fetch)
  if (err.name === 'AbortError') {
    return res.status(504).json({
      error: 'AI service timeout',
      message: 'Превышено время ожидания ответа от AI. Попробуйте позже.',
    });
  }

  // Ошибки с явным статусом
  if (err.statusCode) {
    return res.status(err.statusCode).json({
      error: err.message || 'Error',
      ...(err.details && { details: err.details }),
    });
  }

  // Остальные ошибки
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
};

/**
 * Обработчик 404
 */
const notFoundHandler = (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.path,
    method: req.method,
  });
};

module.exports = {
  errorHandler,
  notFoundHandler,
};

