-- FitPilot Database Schema
-- PostgreSQL 14+
-- Дата создания: 2025-11-09
-- Авторы: Качкалов М.О., Чернышова В.Ю., Шпитонков К.А.

-- Создание базы данных (выполнить отдельно)
-- CREATE DATABASE fitpilot_db;
-- \c fitpilot_db;

-- Расширения
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- ТАБЛИЦА: users (Пользователи)
-- =====================================================
CREATE TABLE users (
    user_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    username VARCHAR(50) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    is_verified BOOLEAN DEFAULT FALSE,
    role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user', 'premium', 'admin'))
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);

-- =====================================================
-- ТАБЛИЦА: user_profiles (Профили пользователей)
-- =====================================================
CREATE TABLE user_profiles (
    profile_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    full_name VARCHAR(100),
    date_of_birth DATE,
    gender VARCHAR(10) CHECK (gender IN ('male', 'female', 'other')),
    height_cm DECIMAL(5,2),
    current_weight_kg DECIMAL(5,2),
    target_weight_kg DECIMAL(5,2),
    activity_level VARCHAR(20) CHECK (activity_level IN ('sedentary', 'light', 'moderate', 'active', 'very_active')),
    goal VARCHAR(20) CHECK (goal IN ('lose_weight', 'maintain', 'gain_weight', 'gain_muscle')),
    daily_calories_target INTEGER,
    protein_target_g INTEGER,
    carbs_target_g INTEGER,
    fats_target_g INTEGER,
    water_target_ml INTEGER DEFAULT 2000,
    training_location VARCHAR(20) CHECK (training_location IN ('home', 'gym', 'both')),
    available_equipment TEXT[], -- массив доступного оборудования
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_user_profiles_user_id ON user_profiles(user_id);

-- =====================================================
-- ТАБЛИЦА: products (Продукты питания)
-- =====================================================
CREATE TABLE products (
    product_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    brand VARCHAR(100),
    barcode VARCHAR(13), -- EAN-13
    serving_size_g DECIMAL(8,2),
    serving_size_ml DECIMAL(8,2),
    calories_per_100 DECIMAL(8,2) NOT NULL,
    protein_per_100 DECIMAL(8,2) NOT NULL,
    carbs_per_100 DECIMAL(8,2) NOT NULL,
    fats_per_100 DECIMAL(8,2) NOT NULL,
    fiber_per_100 DECIMAL(8,2),
    sugar_per_100 DECIMAL(8,2),
    category VARCHAR(50),
    is_verified BOOLEAN DEFAULT FALSE,
    created_by UUID REFERENCES users(user_id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_products_barcode ON products(barcode);
CREATE INDEX idx_products_name ON products(name);
CREATE INDEX idx_products_category ON products(category);

-- =====================================================
-- ТАБЛИЦА: recipes (Рецепты)
-- =====================================================
CREATE TABLE recipes (
    recipe_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    servings INTEGER DEFAULT 1,
    total_calories DECIMAL(8,2),
    total_protein DECIMAL(8,2),
    total_carbs DECIMAL(8,2),
    total_fats DECIMAL(8,2),
    cooking_time_min INTEGER,
    instructions TEXT,
    is_public BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_recipes_user_id ON recipes(user_id);
CREATE INDEX idx_recipes_name ON recipes(name);

-- =====================================================
-- ТАБЛИЦА: recipe_ingredients (Ингредиенты рецептов)
-- =====================================================
CREATE TABLE recipe_ingredients (
    ingredient_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    recipe_id UUID NOT NULL REFERENCES recipes(recipe_id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(product_id) ON DELETE RESTRICT,
    quantity_g DECIMAL(8,2),
    quantity_ml DECIMAL(8,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_recipe_ingredients_recipe_id ON recipe_ingredients(recipe_id);
CREATE INDEX idx_recipe_ingredients_product_id ON recipe_ingredients(product_id);

-- =====================================================
-- ТАБЛИЦА: meals (Приемы пищи)
-- =====================================================
CREATE TABLE meals (
    meal_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    meal_date DATE NOT NULL,
    meal_type VARCHAR(20) CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack')),
    total_calories DECIMAL(8,2) DEFAULT 0,
    total_protein DECIMAL(8,2) DEFAULT 0,
    total_carbs DECIMAL(8,2) DEFAULT 0,
    total_fats DECIMAL(8,2) DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_meals_user_id ON meals(user_id);
CREATE INDEX idx_meals_date ON meals(meal_date);

-- =====================================================
-- ТАБЛИЦА: meal_items (Элементы приема пищи)
-- =====================================================
CREATE TABLE meal_items (
    meal_item_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    meal_id UUID NOT NULL REFERENCES meals(meal_id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(product_id) ON DELETE RESTRICT,
    recipe_id UUID REFERENCES recipes(recipe_id) ON DELETE RESTRICT,
    quantity_g DECIMAL(8,2),
    quantity_ml DECIMAL(8,2),
    calories DECIMAL(8,2),
    protein DECIMAL(8,2),
    carbs DECIMAL(8,2),
    fats DECIMAL(8,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_product_or_recipe CHECK (
        (product_id IS NOT NULL AND recipe_id IS NULL) OR
        (product_id IS NULL AND recipe_id IS NOT NULL)
    )
);

CREATE INDEX idx_meal_items_meal_id ON meal_items(meal_id);

-- =====================================================
-- ТАБЛИЦА: exercises (Упражнения)
-- =====================================================
CREATE TABLE exercises (
    exercise_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    muscle_group VARCHAR(50), -- грудь, спина, ноги, плечи и т.д.
    equipment VARCHAR(50), -- штанга, гантели, тренажер, собственный вес
    difficulty VARCHAR(20) CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
    video_url TEXT,
    instructions TEXT,
    is_verified BOOLEAN DEFAULT FALSE,
    created_by UUID REFERENCES users(user_id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_exercises_name ON exercises(name);
CREATE INDEX idx_exercises_muscle_group ON exercises(muscle_group);
CREATE INDEX idx_exercises_equipment ON exercises(equipment);

-- =====================================================
-- ТАБЛИЦА: workout_plans (Планы тренировок)
-- =====================================================
CREATE TABLE workout_plans (
    plan_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    goal VARCHAR(50), -- strength, hypertrophy, endurance, weight_loss
    difficulty VARCHAR(20) CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
    duration_weeks INTEGER,
    days_per_week INTEGER,
    location VARCHAR(20) CHECK (location IN ('home', 'gym', 'both')),
    is_public BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_workout_plans_user_id ON workout_plans(user_id);
CREATE INDEX idx_workout_plans_goal ON workout_plans(goal);

-- =====================================================
-- ТАБЛИЦА: workout_sessions (Тренировочные сессии)
-- =====================================================
CREATE TABLE workout_sessions (
    session_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    plan_id UUID REFERENCES workout_plans(plan_id) ON DELETE SET NULL,
    session_date DATE NOT NULL,
    start_time TIMESTAMP,
    end_time TIMESTAMP,
    duration_min INTEGER,
    total_volume_kg DECIMAL(10,2), -- общий объем (подходы * повторы * вес)
    notes TEXT,
    completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_workout_sessions_user_id ON workout_sessions(user_id);
CREATE INDEX idx_workout_sessions_date ON workout_sessions(session_date);

-- =====================================================
-- ТАБЛИЦА: workout_sets (Подходы в тренировке)
-- =====================================================
CREATE TABLE workout_sets (
    set_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID NOT NULL REFERENCES workout_sessions(session_id) ON DELETE CASCADE,
    exercise_id UUID NOT NULL REFERENCES exercises(exercise_id) ON DELETE RESTRICT,
    set_number INTEGER NOT NULL,
    reps INTEGER,
    weight_kg DECIMAL(6,2),
    duration_sec INTEGER, -- для кардио или планок
    distance_m DECIMAL(8,2), -- для бега, плавания
    rest_sec INTEGER,
    is_warmup BOOLEAN DEFAULT FALSE,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_workout_sets_session_id ON workout_sets(session_id);
CREATE INDEX idx_workout_sets_exercise_id ON workout_sets(exercise_id);

-- =====================================================
-- ТАБЛИЦА: personal_records (Личные рекорды)
-- =====================================================
CREATE TABLE personal_records (
    pr_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    exercise_id UUID NOT NULL REFERENCES exercises(exercise_id) ON DELETE CASCADE,
    record_type VARCHAR(20) CHECK (record_type IN ('max_weight', 'max_reps', 'max_volume', 'best_time')),
    value DECIMAL(10,2) NOT NULL,
    achieved_date DATE NOT NULL,
    session_id UUID REFERENCES workout_sessions(session_id) ON DELETE SET NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_personal_records_user_id ON personal_records(user_id);
CREATE INDEX idx_personal_records_exercise_id ON personal_records(exercise_id);

-- =====================================================
-- ТАБЛИЦА: body_measurements (Замеры тела)
-- =====================================================
CREATE TABLE body_measurements (
    measurement_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    measurement_date DATE NOT NULL,
    weight_kg DECIMAL(5,2),
    body_fat_percent DECIMAL(4,2),
    muscle_mass_kg DECIMAL(5,2),
    waist_cm DECIMAL(5,2),
    chest_cm DECIMAL(5,2),
    hips_cm DECIMAL(5,2),
    biceps_cm DECIMAL(5,2),
    thighs_cm DECIMAL(5,2),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_body_measurements_user_id ON body_measurements(user_id);
CREATE INDEX idx_body_measurements_date ON body_measurements(measurement_date);

-- =====================================================
-- ТАБЛИЦА: health_integrations (Интеграции с экосистемами здоровья)
-- =====================================================
CREATE TABLE health_integrations (
    integration_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    provider VARCHAR(50) CHECK (provider IN ('apple_health', 'google_fit', 'huawei_health')),
    is_enabled BOOLEAN DEFAULT TRUE,
    last_sync TIMESTAMP,
    access_token TEXT,
    refresh_token TEXT,
    token_expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, provider)
);

CREATE INDEX idx_health_integrations_user_id ON health_integrations(user_id);

-- =====================================================
-- ТАБЛИЦА: health_data (Данные из экосистем здоровья)
-- =====================================================
CREATE TABLE health_data (
    data_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    data_date DATE NOT NULL,
    steps INTEGER,
    active_calories DECIMAL(8,2),
    resting_heart_rate INTEGER,
    sleep_hours DECIMAL(4,2),
    distance_km DECIMAL(8,2),
    floors_climbed INTEGER,
    source VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_health_data_user_id ON health_data(user_id);
CREATE INDEX idx_health_data_date ON health_data(data_date);

-- =====================================================
-- ТАБЛИЦА: ai_interactions (Взаимодействия с AI-ассистентом)
-- =====================================================
CREATE TABLE ai_interactions (
    interaction_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    message_type VARCHAR(20) CHECK (message_type IN ('user', 'assistant')),
    message_text TEXT NOT NULL,
    context JSONB, -- контекст для AI (цели, прогресс и т.д.)
    tokens_used INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_ai_interactions_user_id ON ai_interactions(user_id);
CREATE INDEX idx_ai_interactions_created_at ON ai_interactions(created_at);

-- =====================================================
-- ТАБЛИЦА: notifications (Уведомления)
-- =====================================================
CREATE TABLE notifications (
    notification_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    type VARCHAR(50) CHECK (type IN ('meal_reminder', 'water_reminder', 'workout_reminder', 'progress_update', 'system')),
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    scheduled_for TIMESTAMP,
    sent_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);

-- =====================================================
-- ТАБЛИЦА: user_favorites (Избранное пользователя)
-- =====================================================
CREATE TABLE user_favorites (
    favorite_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    favorite_type VARCHAR(20) CHECK (favorite_type IN ('product', 'recipe', 'exercise', 'workout_plan')),
    item_id UUID NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, favorite_type, item_id)
);

CREATE INDEX idx_user_favorites_user_id ON user_favorites(user_id);

-- =====================================================
-- ФУНКЦИИ И ТРИГГЕРЫ
-- =====================================================

-- Функция для автоматического обновления updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Применение триггера к таблицам
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_recipes_updated_at BEFORE UPDATE ON recipes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_meals_updated_at BEFORE UPDATE ON meals
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_exercises_updated_at BEFORE UPDATE ON exercises
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_workout_plans_updated_at BEFORE UPDATE ON workout_plans
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_workout_sessions_updated_at BEFORE UPDATE ON workout_sessions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- SEED DATA (базовые данные для тестирования)
-- =====================================================

-- Вставка базовых упражнений
INSERT INTO exercises (name, description, muscle_group, equipment, difficulty, is_verified) VALUES
('Отжимания', 'Классические отжимания от пола', 'грудь', 'собственный вес', 'beginner', TRUE),
('Приседания', 'Приседания с собственным весом', 'ноги', 'собственный вес', 'beginner', TRUE),
('Подтягивания', 'Подтягивания на перекладине', 'спина', 'турник', 'intermediate', TRUE),
('Планка', 'Статическое упражнение на кор', 'пресс', 'собственный вес', 'beginner', TRUE),
('Жим штанги лежа', 'Базовое упражнение на грудь', 'грудь', 'штанга', 'intermediate', TRUE);

-- Вставка базовых продуктов
INSERT INTO products (name, brand, calories_per_100, protein_per_100, carbs_per_100, fats_per_100, category, is_verified) VALUES
('Куриная грудка', NULL, 165, 31.0, 0, 3.6, 'мясо', TRUE),
('Рис белый вареный', NULL, 130, 2.7, 28.0, 0.3, 'крупы', TRUE),
('Гречка вареная', NULL, 92, 3.4, 18.0, 0.6, 'крупы', TRUE),
('Яйцо куриное', NULL, 157, 12.7, 0.7, 11.5, 'яйца', TRUE),
('Творог 5%', NULL, 121, 16.0, 3.0, 5.0, 'молочное', TRUE),
('Банан', NULL, 89, 1.1, 23.0, 0.3, 'фрукты', TRUE),
('Овсянка', NULL, 68, 2.4, 12.0, 1.4, 'крупы', TRUE);

COMMIT;

-- Конец схемы базы данных
