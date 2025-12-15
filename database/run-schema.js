/**
 * Скрипт для выполнения схемы базы данных FitPilot
 * Использование: node database/run-schema.js
 */

require('dotenv').config({ path: require('path').join(__dirname, '../backend/.env') });
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Конфигурация подключения
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'fitpilot_db',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD,
});

async function runSchema() {
  const client = await pool.connect();
  
  try {
    console.log('📖 Чтение файла schema.sql...');
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schemaSQL = fs.readFileSync(schemaPath, 'utf8');
    
    console.log('🚀 Выполнение схемы базы данных...');
    await client.query(schemaSQL);
    
    console.log('✅ Схема базы данных успешно применена!');
    console.log('📊 Созданы все таблицы, индексы, триггеры и базовые данные.');
    
  } catch (error) {
    console.error('❌ Ошибка при выполнении схемы:');
    console.error(error.message);
    if (error.code === '3D000') {
      console.error('\n💡 Подсказка: База данных не существует. Создайте её командой:');
      console.error(`   CREATE DATABASE ${process.env.DB_NAME || 'fitpilot_db'};`);
    } else if (error.code === '28P01') {
      console.error('\n💡 Подсказка: Неверные учетные данные. Проверьте файл backend/.env');
    }
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

// Проверка переменных окружения
const requiredVars = ['DB_HOST', 'DB_NAME', 'DB_USER', 'DB_PASSWORD'];
const missing = requiredVars.filter(v => !process.env[v]);

if (missing.length > 0) {
  console.error('❌ Отсутствуют переменные окружения:', missing.join(', '));
  console.error('💡 Создайте файл backend/.env на основе backend/.env.example');
  process.exit(1);
}

runSchema();
