# Установка и запуск

## Требования

- Node.js 16+
- PostgreSQL 14+
- Flutter 3+ (для мобильного приложения)

## Быстрый старт

### 1. База данных

В pgAdmin выполните файл `database/schema.sql` для БД `fitness_baze`

Проверка:
```sql
SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';
```
Должно быть 18 таблиц.

### 2. Backend

```bash
cd backend
npm install
```

Файл `.env` уже создан, проверьте параметры:
- DB_NAME=fitness_baze
- DB_USER=postgres
- DB_PASSWORD=postgres (измените на ваш)

Запуск:
```bash
npm run dev
```

Backend доступен: http://localhost:3000

### 3. Frontend

```bash
cd frontend
flutter pub get
flutter run
```

## Тестирование API

Регистрация:
```bash
curl -X POST http://localhost:3000/api/auth/register -H "Content-Type: application/json" -d "{\"email\":\"test@test.com\",\"password\":\"123456\",\"username\":\"testuser\"}"
```

Авторизация:
```bash
curl -X POST http://localhost:3000/api/auth/login -H "Content-Type: application/json" -d "{\"email\":\"test@test.com\",\"password\":\"123456\"}"
```

## Решение проблем

**Ошибка подключения к БД:**
- Проверьте что PostgreSQL запущен
- Проверьте пароль в `.env`

**Порт занят:**
Измените PORT в `.env`

**Flutter ошибки:**
```bash
flutter clean
flutter pub get
```
