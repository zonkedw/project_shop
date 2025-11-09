# Применение схемы базы данных

## Способ 1: Через pgAdmin (GUI)

### Шаги:
1. Откройте pgAdmin
2. Подключитесь к серверу PostgreSQL
3. Найдите базу данных **fitness_baze**
4. Правой кнопкой → Query Tool
5. Откройте файл `schema.sql` (File → Open)
6. Нажмите Execute (F5) или кнопку ▶️
7. Проверьте результат - должны создаться все таблицы

### Проверка:
В Query Tool выполните:
```sql
SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;
```

Должно показать все созданные таблицы.

---

## Способ 2: Через командную строку

```bash
# Из корня проекта
psql -U postgres -d fitness_baze -f database/schema.sql

# Или с вашим пользователем
psql -U ваш_пользователь -d fitness_baze -f database/schema.sql
```

---

## Способ 3: Через PowerShell (Windows)

```powershell
# Перейти в папку PostgreSQL bin
cd "C:\Program Files\PostgreSQL\14\bin"

# Применить схему
.\psql.exe -U postgres -d fitness_baze -f "C:\Users\macsh\Desktop\project_shop-main\database\schema.sql"
```

---

## Проверка успешного применения

### 1. Проверить количество таблиц:
```sql
SELECT COUNT(*) FROM information_schema.tables 
WHERE table_schema = 'public' AND table_type = 'BASE TABLE';
```
Должно быть: **18 таблиц**

### 2. Проверить наличие seed data:
```sql
-- Проверить продукты
SELECT COUNT(*) FROM products;
-- Должно быть: 7 продуктов

-- Проверить упражнения  
SELECT COUNT(*) FROM exercises;
-- Должно быть: 5 упражнений
```

### 3. Список всех таблиц:
```sql
\dt
```

Должны быть:
- users
- user_profiles
- products
- recipes
- recipe_ingredients
- meals
- meal_items
- exercises
- workout_plans
- workout_sessions
- workout_sets
- personal_records
- body_measurements
- health_integrations
- health_data
- ai_interactions
- notifications
- user_favorites

---

## Если возникли ошибки

### Ошибка: "relation already exists"
**Решение:** Таблицы уже созданы. Если нужно пересоздать:
```sql
-- ВНИМАНИЕ: удалит все данные!
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO public;

-- Затем повторно примените schema.sql
```

### Ошибка: "extension uuid-ossp does not exist"
**Решение:**
```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
```

### Ошибка доступа
**Решение:** Убедитесь, что у пользователя есть права:
```sql
GRANT ALL PRIVILEGES ON DATABASE fitness_baze TO postgres;
```

---

## После применения схемы

Обновите файл `.env` в папке backend:
```env
DB_NAME=fitness_baze
DB_USER=postgres
DB_PASSWORD=ваш_пароль
```

Затем запустите backend:
```bash
cd backend
npm run dev
```

✅ Схема применена успешно!
