# FoodShop Backend API

Backend сервер для интернет-магазина продуктов питания на Express.js с PostgreSQL.

## 🚀 Быстрый старт

### 1. Установка зависимостей
```bash
cd backend
npm install
```

### 2. Настройка базы данных
1. Убедитесь, что PostgreSQL запущен
2. Создайте базу данных `project_foodshop` (уже создана)
3. Скопируйте `.env.example` в `.env` и настройте параметры:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=project_foodshop
DB_USER=postgres
DB_PASSWORD=ваш_пароль

# Server Configuration
PORT=4000
NODE_ENV=development

# JWT Configuration
JWT_SECRET=ваш_секретный_ключ_для_jwt
JWT_EXPIRES_IN=7d

# CORS Configuration
FRONTEND_URL=http://localhost:3000
```

### 3. Инициализация базы данных
```bash
npm run init-db
```

### 4. Запуск сервера
```bash
# Development режим с автоперезагрузкой
npm run dev

# Production режим
npm start
```

## 📋 API Endpoints

### Аутентификация (`/api/auth`)
- `POST /api/auth/register` - Регистрация пользователя
- `POST /api/auth/login` - Авторизация пользователя
- `GET /api/auth/me` - Получение информации о текущем пользователе

### Товары (`/api/products`)
- `GET /api/products` - Получить все товары (с фильтрами)
- `GET /api/products/:id` - Получить товар по ID
- `GET /api/products/categories/grouped` - Товары по категориям (акции, новинки, популярные)
- `GET /api/products/meta/categories` - Список всех категорий

### Новости (`/api/news`)
- `GET /api/news` - Получить все новости
- `GET /api/news/:id` - Получить новость по ID
- `POST /api/news` - Создать новость (требует авторизации)
- `PUT /api/news/:id` - Обновить новость (только автор)
- `DELETE /api/news/:id` - Удалить новость (только автор)

### Системные
- `GET /health` - Проверка состояния сервера и БД
- `GET /` - Информация об API

## 🗄️ Структура базы данных

### Таблица `users`
```sql
- id (SERIAL PRIMARY KEY)
- name (VARCHAR(100))
- email (VARCHAR(255) UNIQUE)
- password (VARCHAR(255))
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

### Таблица `products`
```sql
- id (SERIAL PRIMARY KEY)
- name (VARCHAR(255))
- price (DECIMAL(10,2))
- original_price (DECIMAL(10,2))
- image (VARCHAR(500))
- rating (DECIMAL(2,1))
- reviews (INTEGER)
- discount (INTEGER)
- is_new (BOOLEAN)
- is_popular (BOOLEAN)
- category (VARCHAR(100))
- description (TEXT)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

### Таблица `news`
```sql
- id (SERIAL PRIMARY KEY)
- title (VARCHAR(255))
- content (TEXT)
- author_id (INTEGER REFERENCES users(id))
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

## 🔐 Аутентификация

API использует JWT токены для аутентификации. После успешной регистрации или авторизации клиент получает токен, который нужно передавать в заголовке:

```
Authorization: Bearer <token>
```

## 🛡️ Безопасность

- Helmet для базовой защиты
- CORS настроен для фронтенда
- Rate limiting (100 запросов за 15 минут)
- Хеширование паролей с bcrypt
- JWT токены с истечением срока действия

## 📝 Примеры запросов

### Регистрация
```bash
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Иван","email":"ivan@example.com","password":"123456"}'
```

### Авторизация
```bash
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"ivan@example.com","password":"123456"}'
```

### Получение товаров
```bash
curl http://localhost:4000/api/products
```

### Создание новости (требует токен)
```bash
curl -X POST http://localhost:4000/api/news \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"title":"Заголовок","content":"Содержание новости"}'
```

## 🔧 Разработка

### Структура проекта
```
backend/
├── config/
│   └── database.js          # Конфигурация PostgreSQL
├── middleware/
│   └── auth.js              # Middleware для аутентификации
├── routes/
│   ├── auth.js              # Маршруты аутентификации
│   ├── products.js          # Маршруты товаров
│   └── news.js              # Маршруты новостей
├── scripts/
│   └── initDatabase.js      # Скрипт инициализации БД
├── .env                     # Переменные окружения
├── package.json
└── server.js                # Главный файл сервера
```

### Команды npm
- `npm start` - Запуск в production режиме
- `npm run dev` - Запуск в development режиме с nodemon
- `npm run init-db` - Инициализация базы данных

## 🐛 Отладка

1. Проверьте состояние сервера: `GET /health`
2. Убедитесь, что PostgreSQL запущен
3. Проверьте настройки в `.env` файле
4. Посмотрите логи в консоли сервера

## 📦 Зависимости

- **express** - Web framework
- **pg** - PostgreSQL client
- **bcryptjs** - Хеширование паролей
- **jsonwebtoken** - JWT токены
- **cors** - CORS middleware
- **helmet** - Безопасность
- **dotenv** - Переменные окружения
- **express-rate-limit** - Rate limiting
