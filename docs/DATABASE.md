# База данных FitPilot

## Обзор

FitPilot использует PostgreSQL 14+ как основную СУБД для хранения всех данных приложения.

## Структура базы данных

### Основные таблицы

#### 1. users - Пользователи
Хранит основную информацию об учетных записях пользователей.

**Поля:**
- `user_id` (UUID, PK) - уникальный идентификатор
- `email` (VARCHAR, UNIQUE) - email пользователя
- `password_hash` (VARCHAR) - хеш пароля (bcrypt)
- `username` (VARCHAR, UNIQUE) - имя пользователя
- `created_at` (TIMESTAMP) - дата создания
- `is_active` (BOOLEAN) - статус активности
- `role` (VARCHAR) - роль: user, premium, admin

#### 2. user_profiles - Профили
Детальная информация о пользователях: физические данные и цели.

**Поля:**
- `profile_id` (UUID, PK)
- `user_id` (UUID, FK → users)
- `full_name`, `date_of_birth`, `gender`
- `height_cm`, `current_weight_kg`, `target_weight_kg`
- `activity_level` (sedentary, light, moderate, active, very_active)
- `goal` (lose_weight, maintain, gain_weight, gain_muscle)
- `daily_calories_target`, `protein_target_g`, `carbs_target_g`, `fats_target_g`
- `training_location` (home, gym, both)

#### 3. products - Продукты питания
База продуктов с нутриентами.

**Поля:**
- `product_id` (UUID, PK)
- `name`, `brand`, `barcode` (EAN-13)
- `calories_per_100`, `protein_per_100`, `carbs_per_100`, `fats_per_100`
- `fiber_per_100`, `sugar_per_100`
- `category`, `is_verified`

#### 4. recipes - Рецепты
Пользовательские рецепты блюд.

**Поля:**
- `recipe_id` (UUID, PK)
- `user_id` (UUID, FK)
- `name`, `description`, `servings`
- `total_calories`, `total_protein`, `total_carbs`, `total_fats`
- `cooking_time_min`, `instructions`
- `is_public`

#### 5. meals - Приемы пищи
Журнал питания пользователей.

**Поля:**
- `meal_id` (UUID, PK)
- `user_id` (UUID, FK)
- `meal_date`, `meal_type` (breakfast, lunch, dinner, snack)
- `total_calories`, `total_protein`, `total_carbs`, `total_fats`

#### 6. exercises - Упражнения
Библиотека упражнений.

**Поля:**
- `exercise_id` (UUID, PK)
- `name`, `description`
- `muscle_group` (грудь, спина, ноги, плечи, пресс и т.д.)
- `equipment` (штанга, гантели, тренажер, собственный вес)
- `difficulty` (beginner, intermediate, advanced)
- `video_url`, `instructions`

#### 7. workout_sessions - Тренировочные сессии
История тренировок пользователей.

**Поля:**
- `session_id` (UUID, PK)
- `user_id` (UUID, FK)
- `session_date`, `start_time`, `end_time`
- `duration_min`, `total_volume_kg`
- `completed`

#### 8. workout_sets - Подходы
Детализация подходов в тренировках.

**Поля:**
- `set_id` (UUID, PK)
- `session_id` (UUID, FK)
- `exercise_id` (UUID, FK)
- `set_number`, `reps`, `weight_kg`
- `duration_sec`, `distance_m`, `rest_sec`

#### 9. health_integrations - Интеграции
Подключения к экосистемам здоровья.

**Поля:**
- `integration_id` (UUID, PK)
- `user_id` (UUID, FK)
- `provider` (apple_health, google_fit, huawei_health)
- `access_token`, `refresh_token`
- `last_sync`

#### 10. ai_interactions - AI-диалоги
История взаимодействий с AI-ассистентом.

**Поля:**
- `interaction_id` (UUID, PK)
- `user_id` (UUID, FK)
- `message_type` (user, assistant)
- `message_text`, `context` (JSONB)
- `tokens_used`

## Связи между таблицами

```
users (1) ──→ (1) user_profiles
users (1) ──→ (N) meals
users (1) ──→ (N) workout_sessions
users (1) ──→ (N) recipes
users (1) ──→ (N) health_integrations
users (1) ──→ (N) ai_interactions

meals (1) ──→ (N) meal_items
meal_items (N) ──→ (1) products
meal_items (N) ──→ (1) recipes

recipes (1) ──→ (N) recipe_ingredients
recipe_ingredients (N) ──→ (1) products

workout_sessions (1) ──→ (N) workout_sets
workout_sets (N) ──→ (1) exercises
```

## Индексы

Для оптимизации производительности созданы индексы на:
- `users.email`, `users.username`
- `products.barcode`, `products.name`
- `meals.user_id`, `meals.meal_date`
- `workout_sessions.user_id`, `workout_sessions.session_date`
- `exercises.muscle_group`, `exercises.equipment`

## Триггеры

**update_updated_at_column()** - автоматическое обновление поля `updated_at` при изменении записи.

Применяется к таблицам: users, user_profiles, products, recipes, meals, exercises, workout_plans, workout_sessions.

## Seed Data

При инициализации БД добавляются:
- 5 базовых упражнений
- 7 популярных продуктов РФ

## Установка и миграции

### Первичная установка

```bash
# 1. Создать базу данных
createdb fitpilot_db

# 2. Применить схему
psql -d fitpilot_db -f database/schema.sql
```

### Backup

```bash
pg_dump fitpilot_db > backup_$(date +%Y%m%d).sql
```

### Restore

```bash
psql fitpilot_db < backup_20251109.sql
```

## Безопасность

- Все пароли хешируются с использованием bcrypt (10 раундов)
- JWT токены хранятся на клиенте, не в БД
- Sensitive данные (токены интеграций) шифруются
- Используется параметризация запросов (защита от SQL injection)
- Row Level Security (RLS) для изоляции данных пользователей (опционально)

## Производительность

**Рекомендации:**
- Регулярный VACUUM ANALYZE
- Мониторинг slow queries
- Connection pooling (pg-pool)
- Кэширование частых запросов (Redis в будущем)

## Масштабирование

При росте нагрузки:
1. Read replicas для аналитики
2. Partitioning для больших таблиц (meals, workout_sessions)
3. Архивация старых данных (>2 года)
