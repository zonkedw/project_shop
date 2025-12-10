/**
 * Конфигурация приложения с проверкой обязательных переменных окружения
 */

const requiredEnvVars = [
  'DB_HOST',
  'DB_NAME',
  'DB_USER',
  'DB_PASSWORD',
  'JWT_SECRET',
];

const optionalEnvVars = {
  PORT: 3000,
  DB_PORT: 5432,
  NODE_ENV: 'development',
  CORS_ORIGINS: '*',
  AI_API_URL: null,
  AI_API_KEY: null,
  AI_MODEL: 'gpt-4o-mini',
  JWT_EXPIRES_IN: '7d',
};

/**
 * Проверяет наличие обязательных переменных окружения
 */
const validateConfig = () => {
  const missing = [];
  
  for (const varName of requiredEnvVars) {
    if (!process.env[varName]) {
      missing.push(varName);
    }
  }
  
  if (missing.length > 0) {
    throw new Error(
      `Отсутствуют обязательные переменные окружения: ${missing.join(', ')}\n` +
      `Создайте файл .env на основе .env.example`
    );
  }
};

/**
 * Возвращает конфигурацию с дефолтными значениями
 */
const getConfig = () => {
  const config = {};
  
  // Обязательные переменные
  for (const varName of requiredEnvVars) {
    config[varName] = process.env[varName];
  }
  
  // Опциональные переменные с дефолтами
  for (const [varName, defaultValue] of Object.entries(optionalEnvVars)) {
    config[varName] = process.env[varName] !== undefined 
      ? process.env[varName] 
      : defaultValue;
  }
  
  return config;
};

// Проверяем конфиг при загрузке модуля (только если не тесты)
if (process.env.NODE_ENV !== 'test') {
  validateConfig();
}

module.exports = {
  validateConfig,
  getConfig,
  config: getConfig(),
};

