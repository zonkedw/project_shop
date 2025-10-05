const pool = require('../config/database');

const createTables = async () => {
  try {
    console.log('🚀 Создание таблиц в базе данных...');

    // Создание таблицы пользователей
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Таблица users создана');

    // Создание таблицы товаров
    await pool.query(`
      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        price DECIMAL(10,2) NOT NULL,
        original_price DECIMAL(10,2),
        image VARCHAR(500),
        rating DECIMAL(2,1) DEFAULT 0,
        reviews INTEGER DEFAULT 0,
        discount INTEGER DEFAULT 0,
        is_new BOOLEAN DEFAULT FALSE,
        is_popular BOOLEAN DEFAULT FALSE,
        category VARCHAR(100),
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Таблица products создана');

    // Создание таблицы новостей
    await pool.query(`
      CREATE TABLE IF NOT EXISTS news (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        author_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Таблица news создана');

    // Заполнение таблицы товаров тестовыми данными
    const productsCount = await pool.query('SELECT COUNT(*) FROM products');
    if (parseInt(productsCount.rows[0].count) === 0) {
      console.log('📦 Добавление тестовых товаров...');
      
      const testProducts = [
        // Акции
        ['Хлеб белый нарезной', 45.90, 55.90, 'https://korchma.ru/wa-data/public/shop/products/54/02/254/images/1716/1716.970.jpg', 4.5, 128, 18, false, false, 'Хлебобулочные'],
        ['Молоко 3.2% 1л', 68.90, 78.90, 'https://taumart.ru/upload/dev2fun.imagecompress/webp/iblock/33e/g47lfidq2xumgq2b03e1s59mgmkdi86b.webp', 4.8, 245, 13, false, false, 'Молочные продукты'],
        ['Яйца куриные С1 10шт', 89.90, 105.90, 'https://e3.edimdoma.ru/data/posts/0001/6304/16304-ed4_wide.jpg?1745925245', 4.6, 89, 15, false, false, 'Яйца'],
        ['Масло сливочное 82.5%', 145.90, 165.90, 'https://img.vkusvill.ru/pim/images/site_LargeWebP/0034c5b6-de1f-4b6a-a71c-c43de0af1b94.webp?1705070428.9978', 4.7, 156, 12, false, false, 'Молочные продукты'],
        
        // Новинки
        ['Колбаса варёная Докторская', 320.90, null, 'https://storum.ru/image/products/276069.png', 4.4, 67, 0, true, false, 'Мясные продукты'],
        ['Сыр твёрдый Российский', 280.50, null, 'https://main-cdn.sbermegamarket.ru/big1/hlr-system/189/810/334/141/917/56/100045265297b0.jpg', 4.6, 134, 0, true, false, 'Молочные продукты'],
        ['Творог 9% 200г', 95.90, null, 'https://tsx.x5static.net/i/800x800-fit/xdelivery/files/8e/f2/0e3454381148c23ee98bbc315032.jpg', 4.5, 78, 0, true, false, 'Молочные продукты'],
        ['Йогурт натуральный 150г', 65.90, null, 'https://tsx.x5static.net/i/800x800-fit/xdelivery/files/e8/f6/a5f3aee518ff58c0ccd78c4ed7d8.jpg', 4.3, 92, 0, true, false, 'Молочные продукты'],
        
        // Популярные
        ['Гречка ядрица 800г', 115.90, null, 'https://baron.kz/image/cache/catalog/catalog/bakaleya/krupa-grechnevaya-yadrica-makfa-800-g-1200x800.jpg', 4.8, 312, 0, false, true, 'Крупы'],
        ['Рис круглозерный 1кг', 89.90, null, 'https://swlife.ru/image/cache/catalog/product/9e/e2/9ee21afb67ba78ff9df8708341ed4a6f-0x0.webp', 4.7, 278, 0, false, true, 'Крупы'],
        ['Макароны спагетти 500г', 75.90, null, 'https://www.miamland.com/bundles/miamland/images/visuel/400/3038350208613-400.webp', 4.5, 189, 0, false, true, 'Макаронные изделия'],
        ['Сахар-песок 1кг', 55.90, null, 'https://sibprod.info/upload/resize_cache/iblock/6f8/1800_1200_19d1669f6609e6dfcaeac28e5aab5b3be/6f8b9276f69bd008fa13ef3c0f38a64c.jpg', 4.6, 156, 0, false, true, 'Сахар и подсластители']
      ];

      for (const product of testProducts) {
        await pool.query(`
          INSERT INTO products (name, price, original_price, image, rating, reviews, discount, is_new, is_popular, category)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        `, product);
      }
      console.log('✅ Тестовые товары добавлены');
    }

    console.log('🎉 База данных успешно инициализирована!');
  } catch (error) {
    console.error('❌ Ошибка при создании таблиц:', error);
  } finally {
    process.exit(0);
  }
};

createTables();
