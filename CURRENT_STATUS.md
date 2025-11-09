# Текущее состояние проекта

Дата: 09.11.2025

## Выполнено

### Backend (Node.js + Express)
- Модуль аутентификации (регистрация, вход)
- Модуль пользователей (профиль, замеры тела)
- Модуль питания (продукты, поиск, дневник)
- Модуль рецептов (CRUD рецептов с ингредиентами)
- Модуль тренировок (упражнения, сессии, статистика)

**API endpoints: 25+**

### База данных
- PostgreSQL с 18 таблицами
- Применить schema.sql к fitness_baze в pgAdmin

### Frontend (Flutter)
- Базовая структура приложения
- Экраны авторизации (Login, Register)
- Главный экран с навигацией
- Экраны питания (дневник, добавление еды)
- State management через Provider

### Документация
- README.md
- SETUP_SIMPLE.md (инструкция запуска)
- API.md (документация API)
- DATABASE.md (схема БД)

## Установка

### 1. База данных
В pgAdmin выполнить `database/schema.sql` для БД `fitness_baze`

### 2. Backend
```bash
cd backend
npm install
```

Файл `.env` создан автоматически. Проверить DB_PASSWORD.

Запуск:
```bash
npm run dev
```

Сервер: http://localhost:3000

### 3. Frontend
```bash
cd frontend
flutter pub get
flutter run
```

## API

### Аутентификация
- POST /api/auth/register
- POST /api/auth/login

### Пользователи
- GET /api/users/profile
- PUT /api/users/profile
- POST /api/users/measurements
- GET /api/users/measurements

### Питание
- GET /api/nutrition/products/search
- GET /api/nutrition/products/barcode/:barcode
- POST /api/nutrition/products
- GET /api/nutrition/categories
- POST /api/nutrition/meals
- GET /api/nutrition/diary
- DELETE /api/nutrition/meals/:id

### Рецепты
- GET /api/recipes
- GET /api/recipes/:id
- POST /api/recipes
- PUT /api/recipes/:id
- DELETE /api/recipes/:id

### Тренировки
- GET /api/workouts/exercises
- POST /api/workouts/exercises
- GET /api/workouts/muscle-groups
- POST /api/workouts/sessions
- GET /api/workouts/sessions
- DELETE /api/workouts/sessions/:id
- GET /api/workouts/stats

## В разработке

- Детальные экраны тренировок Flutter
- Сканер штрих-кодов
- AI-ассистент
- Интеграции с экосистемами здоровья

## Структура файлов

```
project_shop-main/
├── backend/
│   ├── routes/           # API роуты
│   ├── config/           # Конфигурация БД
│   ├── middleware/       # Auth middleware
│   ├── server.js         # Точка входа
│   └── .env              # Настройки (создан)
├── frontend/
│   └── lib/
│       ├── main.dart
│       ├── providers/    # State management
│       ├── services/     # API клиент
│       └── screens/      # UI экраны
├── database/
│   └── schema.sql        # Схема БД
└── docs/                 # Документация
```

## Проблемы и решения

**Backend не запускается:**
- Проверить PostgreSQL запущен
- Проверить DB_PASSWORD в .env

**Flutter ошибки:**
```bash
flutter clean
flutter pub get
```

**Порт 3000 занят:**
Изменить PORT в .env

## Следующие шаги

1. Завершить UI экраны питания
2. Создать UI экраны тренировок
3. Добавить сканер штрих-кодов
4. Интегрировать AI
5. Тестирование
6. Документация пользователя

## Git

Ветка: kursov_fitness
Коммитов: 8
GitHub: https://github.com/zonkedw/project_shop

Последний коммит: feat: Add recipes module and nutrition screens for Flutter
