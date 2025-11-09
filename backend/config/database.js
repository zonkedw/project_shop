const { Pool } = require('pg');

// Конфигурация подключения к PostgreSQL
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'fitpilot_db',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD,
  max: 20, // максимальное количество клиентов в пуле
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Проверка подключения
pool.on('connect', () => {
  console.log('Подключено к базе данных PostgreSQL');
});

pool.on('error', (err) => {
  console.error('Ошибка подключения к БД:', err.message);
  process.exit(-1);
});

// Функция для выполнения запросов
const query = async (text, params) => {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log('Executed query', { text, duration, rows: res.rowCount });
    return res;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
};

// Функция для получения клиента (для транзакций)
const getClient = async () => {
  const client = await pool.connect();
  const query = client.query.bind(client);
  const release = client.release.bind(client);
  
  // Расширяем клиент для удобной работы с транзакциями
  client.query = (...args) => {
    client.lastQuery = args;
    return query(...args);
  };
  
  client.release = () => {
    client.lastQuery = null;
    return release();
  };
  
  return client;
};

module.exports = {
  pool,
  query,
  getClient
};
