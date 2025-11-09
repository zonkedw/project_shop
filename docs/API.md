# FitPilot API Documentation

## Обзор
REST API для мобильного приложения FitPilot - системы учета питания и тренировок с AI-персонализацией.

**Base URL:** `http://localhost:3000/api`

**Версия:** 1.0.0

---

## Аутентификация

API использует JWT (JSON Web Token) для аутентификации.

После успешной авторизации/регистрации клиент получает токен, который необходимо передавать в заголовке каждого запроса:

```
Authorization: Bearer <token>
```

---

## Endpoints

### 1. Аутентификация

#### 1.1. Регистрация
```http
POST /api/auth/register
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123",
  "username": "fitness_user"
}
```

**Response (201):**
```json
{
  "message": "Регистрация успешна",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "user_id": "uuid",
    "email": "user@example.com",
    "username": "fitness_user"
  }
}
```

#### 1.2. Авторизация
```http
POST /api/auth/login
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123"
}
```

**Response (200):**
```json
{
  "message": "Авторизация успешна",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "user_id": "uuid",
    "email": "user@example.com",
    "username": "fitness_user"
  }
}
```

---

### 2. Профиль пользователя

#### 2.1. Получить профиль
```http
GET /api/users/profile
```
*Требует авторизации*

**Response (200):**
```json
{
  "profile_id": "uuid",
  "user_id": "uuid",
  "full_name": "Иван Иванов",
  "date_of_birth": "1990-01-01",
  "gender": "male",
  "height_cm": 180,
  "current_weight_kg": 85,
  "target_weight_kg": 80,
  "activity_level": "moderate",
  "goal": "lose_weight",
  "daily_calories_target": 2200,
  "protein_target_g": 165,
  "carbs_target_g": 220,
  "fats_target_g": 73
}
```

#### 2.2. Обновить профиль
```http
PUT /api/users/profile
```
*Требует авторизации*

**Request Body:**
```json
{
  "full_name": "Иван Иванов",
  "height_cm": 180,
  "current_weight_kg": 84,
  "target_weight_kg": 80,
  "goal": "lose_weight",
  "activity_level": "moderate"
}
```

---

### 3. Питание

#### 3.1. Поиск продуктов
```http
GET /api/nutrition/products/search?q=курица&limit=10
```
*Требует авторизации*

**Response (200):**
```json
{
  "products": [
    {
      "product_id": "uuid",
      "name": "Куриная грудка",
      "brand": null,
      "barcode": "4607034170011",
      "calories_per_100": 165,
      "protein_per_100": 31.0,
      "carbs_per_100": 0,
      "fats_per_100": 3.6,
      "category": "мясо"
    }
  ],
  "count": 1
}
```

#### 3.2. Получить продукт по штрих-коду
```http
GET /api/nutrition/products/barcode/:barcode
```
*Требует авторизации*

**Response (200):**
```json
{
  "product_id": "uuid",
  "name": "Куриная грудка Петелинка",
  "barcode": "4607034170011",
  "calories_per_100": 165,
  "protein_per_100": 31.0,
  "carbs_per_100": 0,
  "fats_per_100": 3.6
}
```

#### 3.3. Добавить прием пищи
```http
POST /api/nutrition/meals
```
*Требует авторизации*

**Request Body:**
```json
{
  "meal_date": "2025-11-09",
  "meal_type": "lunch",
  "items": [
    {
      "product_id": "uuid",
      "quantity_g": 200
    },
    {
      "product_id": "uuid",
      "quantity_g": 150
    }
  ]
}
```

#### 3.4. Получить дневник питания
```http
GET /api/nutrition/diary?date=2025-11-09
```
*Требует авторизации*

**Response (200):**
```json
{
  "date": "2025-11-09",
  "totals": {
    "calories": 1850,
    "protein": 145,
    "carbs": 180,
    "fats": 60
  },
  "meals": [
    {
      "meal_id": "uuid",
      "meal_type": "breakfast",
      "total_calories": 450,
      "items": [...]
    }
  ]
}
```

---

### 4. Тренировки

#### 4.1. Получить список упражнений
```http
GET /api/workouts/exercises?muscle_group=грудь&limit=20
```
*Требует авторизации*

**Response (200):**
```json
{
  "exercises": [
    {
      "exercise_id": "uuid",
      "name": "Жим штанги лежа",
      "muscle_group": "грудь",
      "equipment": "штанга",
      "difficulty": "intermediate",
      "description": "Базовое упражнение...",
      "video_url": null
    }
  ],
  "count": 15
}
```

#### 4.2. Создать тренировочную сессию
```http
POST /api/workouts/sessions
```
*Требует авторизации*

**Request Body:**
```json
{
  "session_date": "2025-11-09",
  "plan_id": "uuid",
  "sets": [
    {
      "exercise_id": "uuid",
      "set_number": 1,
      "reps": 10,
      "weight_kg": 80,
      "rest_sec": 120
    }
  ]
}
```

#### 4.3. Получить историю тренировок
```http
GET /api/workouts/sessions?start_date=2025-11-01&end_date=2025-11-09
```
*Требует авторизации*

---

### 5. AI-ассистент

#### 5.1. Отправить сообщение AI
```http
POST /api/ai/chat
```
*Требует авторизации*

**Request Body:**
```json
{
  "message": "Какой рацион мне подходит для похудения?"
}
```

**Response (200):**
```json
{
  "response": "Основываясь на вашем профиле...",
  "context": {
    "daily_calories": 2200,
    "protein_g": 165,
    "carbs_g": 220,
    "fats_g": 73
  }
}
```

#### 5.2. Генерировать рацион
```http
POST /api/ai/generate-meal-plan
```
*Требует авторизации*

**Request Body:**
```json
{
  "target_calories": 2200,
  "preferences": ["без молочных продуктов"],
  "meals_per_day": 4
}
```

---

### 6. Интеграции

#### 6.1. Подключить Apple Health
```http
POST /api/integrations/apple-health
```
*Требует авторизации*

**Request Body:**
```json
{
  "access_token": "token_from_apple"
}
```

#### 6.2. Синхронизировать данные
```http
POST /api/integrations/sync
```
*Требует авторизации*

**Response (200):**
```json
{
  "synced": true,
  "data": {
    "steps": 8500,
    "active_calories": 450,
    "date": "2025-11-09"
  }
}
```

---

## Коды ошибок

| Код | Описание |
|-----|----------|
| 400 | Bad Request - неверные данные запроса |
| 401 | Unauthorized - требуется авторизация |
| 403 | Forbidden - доступ запрещен |
| 404 | Not Found - ресурс не найден |
| 409 | Conflict - конфликт данных |
| 429 | Too Many Requests - превышен лимит запросов |
| 500 | Internal Server Error - ошибка сервера |

---

## Rate Limiting

API ограничивает количество запросов до 100 в 15 минут с одного IP-адреса.

---

## Changelog

### v1.0.0 (2025-11-09)
- Первая версия API
- Базовые модули: аутентификация, профиль, питание, тренировки
- AI-ассистент (в разработке)
- Интеграции с экосистемами здоровья (в разработке)
