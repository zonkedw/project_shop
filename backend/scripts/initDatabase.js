const pool = require('../config/database');
const bcrypt = require('bcryptjs');

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
        is_admin BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Таблица users создана');

    // Добавляем колонку is_admin, если таблица уже была
    await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE`);
    console.log('✅ Колонка users.is_admin гарантирована');

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

    // Создание и актуализация таблиц заказов
    await pool.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        order_number VARCHAR(50) UNIQUE NOT NULL,
        status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending','confirmed','preparing','delivering','completed','cancelled')),
        subtotal_price DECIMAL(10,2) DEFAULT 0,
        total_price DECIMAL(10,2) NOT NULL,
        total_items INTEGER NOT NULL,
        delivery_method VARCHAR(20) NOT NULL CHECK (delivery_method IN ('courier','pickup')),
        delivery_price DECIMAL(10,2) DEFAULT 0,
        delivery_address TEXT,
        delivery_city VARCHAR(100),
        delivery_postal_code VARCHAR(10),
        payment_method VARCHAR(20) NOT NULL CHECK (payment_method IN ('card','cash')),
        customer_first_name VARCHAR(100) NOT NULL,
        customer_last_name VARCHAR(100),
        customer_email VARCHAR(255) NOT NULL,
        customer_phone VARCHAR(20) NOT NULL,
        discount_code VARCHAR(50),
        discount_amount DECIMAL(10,2) DEFAULT 0,
        comment TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    await pool.query(`
      CREATE TABLE IF NOT EXISTS order_items (
        id SERIAL PRIMARY KEY,
        order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
        product_id INTEGER NOT NULL,
        product_name VARCHAR(255) NOT NULL,
        price DECIMAL(10,2) NOT NULL,
        quantity INTEGER NOT NULL CHECK (quantity > 0),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    await pool.query(`ALTER TABLE orders ADD COLUMN IF NOT EXISTS subtotal_price DECIMAL(10,2) DEFAULT 0`);
    await pool.query(`ALTER TABLE orders ADD COLUMN IF NOT EXISTS discount_code VARCHAR(50)`);
    await pool.query(`ALTER TABLE orders ADD COLUMN IF NOT EXISTS discount_amount DECIMAL(10,2) DEFAULT 0`);
    await pool.query(`ALTER TABLE orders ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id)`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status)`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at)`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id)`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON order_items(product_id)`);
    console.log('✅ Таблицы orders и order_items созданы/актуализированы');

    // Создаем администратора по умолчанию, если отсутствует
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@foodshop.local';
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin12345';
    const exists = await pool.query('SELECT id FROM users WHERE email = $1', [adminEmail.toLowerCase()]);
    if (exists.rows.length === 0) {
      console.log('👤 Создание пользователя-администратора:', adminEmail);
      const salt = await bcrypt.genSalt(12);
      const hash = await bcrypt.hash(adminPassword, salt);
      await pool.query(
        'INSERT INTO users (name, email, password, is_admin) VALUES ($1, $2, $3, TRUE)',
        ['Administrator', adminEmail.toLowerCase(), hash]
      );
      console.log('✅ Администратор создан (email и пароль заданы через переменные окружения или значения по умолчанию)');
    } else {
      console.log('ℹ️ Администратор уже существует:', adminEmail);
    }

    // Заполнение таблицы товаров тестовыми данными (идемпотентно)
    const productsCount = await pool.query('SELECT COUNT(*) FROM products');
    if (parseInt(productsCount.rows[0].count) < 60) {
      console.log('📦 Добавление/актуализация тестовых товаров...');

      const testProducts = [
        // Хлебобулочные
        ['Хлеб белый нарезной', 45.90, 55.90, 'https://korchma.ru/wa-data/public/shop/products/54/02/254/images/1716/1716.970.jpg', 4.5, 128, 18, false, true, 'Хлебобулочные'],
        ['Батон нарезной', 39.90, 49.90, 'https://static.ozone.ru/multimedia/c400/1019420978.jpg', 4.4, 97, 20, false, false, 'Хлебобулочные'],
        ['Булочки с кунжутом 4шт', 69.90, 79.90, 'https://avatars.mds.yandex.net/get-mpic/5345713/img_id1991913021489187629.jpeg/600x800', 4.6, 72, 12, false, false, 'Хлебобулочные'],

        // Молочные продукты
        ['Молоко 3.2% 1л', 68.90, 78.90, 'https://taumart.ru/upload/dev2fun.imagecompress/webp/iblock/33e/g47lfidq2xumgq2b03e1s59mgmkdi86b.webp', 4.8, 245, 13, false, false, 'Молочные продукты'],
        ['Творог 9% 200г', 95.90, null, 'https://tsx.x5static.net/i/800x800-fit/xdelivery/files/8e/f2/0e3454381148c23ee98bbc315032.jpg', 4.5, 78, 0, true, false, 'Молочные продукты'],
        ['Йогурт натуральный 150г', 65.90, null, 'https://tsx.x5static.net/i/800x800-fit/xdelivery/files/e8/f6/a5f3aee518ff58c0ccd78c4ed7d8.jpg', 4.3, 92, 0, true, false, 'Молочные продукты'],
        ['Сметана 20% 300г', 79.90, 89.90, 'https://avatars.mds.yandex.net/get-mpic/1990792/img_id1019805844258258622.jpeg/600x800', 4.6, 110, 11, false, true, 'Молочные продукты'],
        ['Сыр твёрдый Российский', 280.50, null, 'https://main-cdn.sbermegamarket.ru/big1/hlr-system/189/810/334/141/917/56/100045265297b0.jpg', 4.6, 134, 0, true, false, 'Молочные продукты'],
        ['Масло сливочное 82.5%', 145.90, 165.90, 'https://img.vkusvill.ru/pim/images/site_LargeWebP/0034c5b6-de1f-4b6a-a71c-c43de0af1b94.webp?1705070428.9978', 4.7, 156, 12, false, false, 'Молочные продукты'],

        // Яйца
        ['Яйца куриные С1 10шт', 89.90, 105.90, 'https://e3.edimdoma.ru/data/posts/0001/6304/16304-ed4_wide.jpg?1745925245', 4.6, 89, 15, false, false, 'Яйца'],
        ['Яйца перепелиные 20шт', 159.90, 179.90, 'https://avatars.mds.yandex.net/get-mpic/5352354/img_id9060392871140827570.jpeg/600x800', 4.7, 66, 11, false, true, 'Яйца'],

        // Мясные продукты
        ['Колбаса варёная Докторская', 320.90, null, 'https://storum.ru/image/products/276069.png', 4.4, 67, 0, true, false, 'Мясные продукты'],
        ['Филе куриное 1кг', 289.90, 329.90, 'https://avatars.mds.yandex.net/get-mpic/12456378/img_id783228506302807695.jpeg/600x800', 4.6, 210, 12, false, true, 'Мясные продукты'],
        ['Фарш говяжий 500г', 219.90, 249.90, 'https://avatars.mds.yandex.net/get-mpic/5232082/img_id8841929893400218218.jpeg/600x800', 4.5, 140, 12, false, false, 'Мясные продукты'],

        // Крупы
        ['Гречка ядрица 800г', 115.90, null, 'https://baron.kz/image/cache/catalog/catalog/bakaleya/krupa-grechnevaya-yadrica-makfa-800-g-1200x800.jpg', 4.8, 312, 0, false, true, 'Крупы'],
        ['Рис круглозерный 1кг', 89.90, null, 'https://swlife.ru/image/cache/catalog/product/9e/e2/9ee21afb67ba78ff9df8708341ed4a6f-0x0.webp', 4.7, 278, 0, false, true, 'Крупы'],
        ['Рис басмати 900г', 189.90, 219.90, 'https://avatars.mds.yandex.net/get-mpic/5232082/img_id1620944954356809289.jpeg/600x800', 4.7, 166, 14, false, false, 'Крупы'],
        ['Овсяные хлопья 500г', 79.90, 89.90, 'https://avatars.mds.yandex.net/get-mpic/3973972/img_id22789798925304452.jpeg/600x800', 4.5, 190, 11, false, false, 'Крупы'],

        // Макаронные изделия
        ['Макароны спагетти 500г', 75.90, null, 'https://www.miamland.com/bundles/miamland/images/visuel/400/3038350208613-400.webp', 4.5, 189, 0, false, true, 'Макаронные изделия'],
        ['Пенне 500г', 69.90, 79.90, 'https://avatars.mds.yandex.net/get-mpic/5232082/img_id8751735140356960373.jpeg/600x800', 4.4, 102, 13, false, false, 'Макаронные изделия'],
        ['Фузилли 500г', 69.90, 79.90, 'https://avatars.mds.yandex.net/get-mpic/5232082/img_id6569163117188746933.jpeg/600x800', 4.5, 95, 12, false, false, 'Макаронные изделия'],

        // Сахар и подсластители
        ['Сахар-песок 1кг', 55.90, null, 'https://sibprod.info/upload/resize_cache/iblock/6f8/1800_1200_19d1669f6609e6dfcaeac28e5aab5b3be/6f8b9276f69bd008fa13ef3c0f38a64c.jpg', 4.6, 156, 0, false, true, 'Сахар и подсластители'],
        ['Сахар тростниковый 500г', 99.90, 119.90, 'https://avatars.mds.yandex.net/get-mpic/5232082/img_id1106618919105295906.jpeg/600x800', 4.4, 88, 17, false, false, 'Сахар и подсластители'],
        ['Подсластитель стевия 100г', 159.90, 189.90, 'https://avatars.mds.yandex.net/get-mpic/5232082/img_id8357944039183976555.jpeg/600x800', 4.3, 61, 16, true, false, 'Сахар и подсластители']
      ];

      for (const product of testProducts) {
        const exists = await pool.query('SELECT 1 FROM products WHERE name = $1 LIMIT 1', [product[0]]);
        if (exists.rows.length === 0) {
          await pool.query(
            'INSERT INTO products (name, price, original_price, image, rating, reviews, discount, is_new, is_popular, category) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)',
            product
          );
        }
      }
      console.log('✅ Тестовые товары добавлены/актуализированы');
    }

    console.log('🎉 База данных успешно инициализирована!');
  } catch (error) {
    console.error('❌ Ошибка при создании таблиц:', error);
  } finally {
    process.exit(0);
  }
};

createTables();
