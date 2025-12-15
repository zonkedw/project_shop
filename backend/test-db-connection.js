/**
 * Скрипт для проверки подключения к базе данных
 * Запуск: node test-db-connection.js
 */

require('dotenv').config();
const { Pool } = require('pg');

console.log('🔍 Проверка подключения к базе данных...\n');

// Проверка переменных окружения
console.log('1️⃣ Проверка переменных окружения:');
const requiredVars = ['DB_HOST', 'DB_NAME', 'DB_USER', 'DB_PASSWORD'];
const missing = [];
const config = {};

requiredVars.forEach(varName => {
  if (process.env[varName]) {
    config[varName] = varName === 'DB_PASSWORD' ? '***' : process.env[varName];
    console.log(`   ✅ ${varName}: ${config[varName]}`);
  } else {
    missing.push(varName);
    console.log(`   ❌ ${varName}: ОТСУТСТВУЕТ`);
  }
});

if (missing.length > 0) {
  console.error(`\n❌ Ошибка: Отсутствуют переменные: ${missing.join(', ')}`);
  console.error('💡 Создайте файл backend/.env с этими переменными');
  process.exit(1);
}

// Проверка подключения
console.log('\n2️⃣ Попытка подключения к базе данных...');
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  connectionTimeoutMillis: 5000,
});

pool.on('error', (err) => {
  console.error('❌ Ошибка пула подключений:', err.message);
  process.exit(1);
});

(async () => {
  let client;
  try {
    client = await pool.connect();
    console.log('   ✅ Подключение установлено!');

    // Проверка существования таблицы users
    console.log('\n3️⃣ Проверка структуры базы данных...');
    const tablesCheck = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('users', 'user_profiles')
      ORDER BY table_name;
    `);

    if (tablesCheck.rows.length === 0) {
      console.log('   ⚠️  Таблицы users и user_profiles не найдены!');
      console.log('   💡 Запустите: node database/run-schema.js');
    } else {
      console.log('   ✅ Найдены таблицы:');
      tablesCheck.rows.forEach(row => {
        console.log(`      - ${row.table_name}`);
      });

      // Проверка структуры таблицы users
      const usersColumns = await client.query(`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'users' 
        ORDER BY ordinal_position;
      `);

      if (usersColumns.rows.length > 0) {
        console.log('\n   📋 Структура таблицы users:');
        usersColumns.rows.forEach(col => {
          console.log(`      - ${col.column_name} (${col.data_type})`);
        });
      }

      // Проверка количества пользователей
      const userCount = await client.query('SELECT COUNT(*) as count FROM users');
      console.log(`\n   👥 Пользователей в базе: ${userCount.rows[0].count}`);
    }

    // Тестовый запрос
    console.log('\n4️⃣ Тестовый запрос...');
    const testQuery = await client.query('SELECT NOW() as current_time, version() as pg_version');
    console.log('   ✅ Запрос выполнен успешно!');
    console.log(`   📅 Время БД: ${testQuery.rows[0].current_time}`);
    console.log(`   🗄️  Версия PostgreSQL: ${testQuery.rows[0].pg_version.split(',')[0]}`);

    console.log('\n✅ Все проверки пройдены! База данных готова к работе.');
    
  } catch (error) {
    console.error('\n❌ Ошибка подключения:');
    console.error(`   Код: ${error.code}`);
    console.error(`   Сообщение: ${error.message}`);
    
    if (error.code === '28P01') {
      console.error('\n💡 Ошибка аутентификации (28P01):');
      console.error('   - Проверьте правильность DB_USER и DB_PASSWORD в .env');
      console.error('   - Убедитесь, что пользователь существует в PostgreSQL');
    } else if (error.code === '3D000') {
      console.error('\n💡 База данных не существует (3D000):');
      console.error(`   - Создайте базу: CREATE DATABASE ${process.env.DB_NAME};`);
    } else if (error.code === 'ECONNREFUSED') {
      console.error('\n💡 Сервер недоступен (ECONNREFUSED):');
      console.error('   - Убедитесь, что PostgreSQL запущен');
      console.error('   - Проверьте DB_HOST и DB_PORT в .env');
    }
    
    process.exit(1);
  } finally {
    if (client) client.release();
    await pool.end();
  }
})();

