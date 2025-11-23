# FitPilot

Мобильное приложение для учёта питания и тренировок

## Курсовой проект

Модуль: ПМ.09 Проектирование, разработка и оптимизация веб-приложений  
Группа: 22ИС4-2  
Срок сдачи: 19 декабря 2025

**Авторы:**
- Качкалов Максим Олегович
- Чернышова Варвара Юрьевна
- Шпитонков Константин Александрович

**Руководитель:** Федотов Иван Вячеславович

## О проекте

Приложение для контроля питания и тренировок с функциями:
- Учёт калорий и БЖУ
- База продуктов РФ
- Библиотека упражнений
- Дневник питания и тренировок
- Статистика прогресса

## Технологии

**Frontend:** React Native + Expo  
**Backend:** Node.js + Express  
**База данных:** PostgreSQL  
**Аутентификация:** JWT  

## Структура

```
project_shop-main/
 backend/          # Серверная часть
    routes/      # API роуты
    config/      # Конфигурация БД
    server.js    # Точка входа
 frontend/        # Мобильное приложение
    src/
       screens/ # Экраны
       services/# API клиент
    App.js
 database/
     schema.sql   # Схема БД
```

## Запуск

### 1. База данных

В pgAdmin выполните schema.sql для БД fitness_baze

### 2. Backend

```bash
cd backend
npm run dev
```

### 3. Frontend

Установите Expo Go на телефон

```bash
cd frontend
npm start
```

Отсканируйте QR код в Expo Go

**Для телефона:** измените IP в rontend/src/services/api.js

## API Endpoints

**Auth:**
- POST /api/auth/register
- POST /api/auth/login

**Пользователи:**
- GET /api/users/profile
- PUT /api/users/profile

**Питание:**
- GET /api/nutrition/products/search
- GET /api/nutrition/diary
- POST /api/nutrition/meals

**Тренировки:**
- GET /api/workouts/exercises
- POST /api/workouts/sessions
- GET /api/workouts/stats

**Рецепты:**
- GET /api/recipes
- POST /api/recipes

## База данных

18 таблиц PostgreSQL:
- users, user_profiles
- products, recipes
- meals, meal_items
- exercises, workout_sessions
- body_measurements
- health_integrations

## Статус

Реализовано:
- Backend API (25+ endpoints)
- Схема БД (18 таблиц)
- Frontend (React Native + Expo)
- Авторизация
- Базовые экраны

В разработке:
- Детальные экраны питания
- Детальные экраны тренировок
- Сканер штрих-кодов
