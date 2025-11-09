# Инструкция по установке FitPilot

## Системные требования

### Минимальные требования
- **ОС:** Windows 10/11, macOS 10.15+, Linux (Ubuntu 20.04+)
- **RAM:** 4 GB
- **Дисковое пространство:** 2 GB

### Программное обеспечение
- Node.js >= 16.x
- PostgreSQL >= 14.x
- Git
- Flutter SDK >= 3.x (для мобильного приложения)

---

## Установка зависимостей

### 1. Node.js

**Windows:**
```bash
# Скачать установщик с https://nodejs.org/
# Запустить установщик и следовать инструкциям
```

**macOS (через Homebrew):**
```bash
brew install node
```

**Linux (Ubuntu/Debian):**
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

Проверка установки:
```bash
node --version  # должно быть >= 16.x
npm --version
```

### 2. PostgreSQL

**Windows:**
```bash
# Скачать установщик с https://www.postgresql.org/download/windows/
# Запустить и следовать инструкциям
# Запомнить пароль для пользователя postgres
```

**macOS (через Homebrew):**
```bash
brew install postgresql@14
brew services start postgresql@14
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

Проверка установки:
```bash
psql --version  # должно быть >= 14.x
```

### 3. Git

**Windows:**
```bash
# Скачать установщик с https://git-scm.com/
```

**macOS:**
```bash
brew install git
```

**Linux:**
```bash
sudo apt install git
```

### 4. Flutter (опционально, для мобильного приложения)

Следуйте официальной инструкции: https://docs.flutter.dev/get-started/install

---

## Настройка проекта

### Шаг 1: Клонирование репозитория

```bash
git clone https://github.com/zonkedw/project_shop.git
cd project_shop-main
git checkout kursov_fitness
```

### Шаг 2: Настройка базы данных

#### 2.1. Создание пользователя PostgreSQL (опционально)

```bash
# Войти в PostgreSQL
sudo -u postgres psql

# Создать пользователя
CREATE USER fitpilot_user WITH PASSWORD 'your_secure_password';
ALTER USER fitpilot_user CREATEDB;

# Выход
\q
```

#### 2.2. Создание базы данных

```bash
# С пользователем postgres
sudo -u postgres createdb fitpilot_db

# Или с созданным пользователем
createdb -U fitpilot_user fitpilot_db
```

#### 2.3. Применение схемы

```bash
# Из корня проекта
psql -U fitpilot_user -d fitpilot_db -f database/schema.sql

# Или с пользователем postgres
sudo -u postgres psql -d fitpilot_db -f database/schema.sql
```

Проверка:
```bash
psql -U fitpilot_user -d fitpilot_db -c "\dt"
# Должен показать список таблиц
```

### Шаг 3: Настройка backend

```bash
cd backend

# Установка зависимостей
npm install
```

#### 3.1. Создание .env файла

**Windows:**
```bash
copy .env.example .env
```

**macOS/Linux:**
```bash
cp .env.example .env
```

#### 3.2. Редактирование .env

Откройте `.env` в текстовом редакторе и настройте:

```env
PORT=3000
NODE_ENV=development

DB_HOST=localhost
DB_PORT=5432
DB_NAME=fitpilot_db
DB_USER=fitpilot_user          # или postgres
DB_PASSWORD=your_secure_password

JWT_SECRET=your_jwt_secret_key_min_32_chars
JWT_EXPIRES_IN=7d

CORS_ORIGINS=http://localhost:3000,http://localhost:8080
```

**Важно:** Замените `your_secure_password` и `your_jwt_secret_key_min_32_chars` на свои значения!

Для генерации JWT_SECRET можно использовать:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Шаг 4: Запуск backend

```bash
# Из папки backend/
npm run dev
```

Если все настроено правильно, вы увидите:
```
🚀 FitPilot Backend запущен на порту 3000
📝 Среда: development
🔗 http://localhost:3000
✅ Подключено к базе данных PostgreSQL
```

Откройте браузер: http://localhost:3000
Должен отобразиться JSON:
```json
{
  "message": "FitPilot API",
  "version": "1.0.0",
  "status": "running"
}
```

---

## Проверка работы API

### Через cURL

**Health check:**
```bash
curl http://localhost:3000/api/health
```

**Регистрация:**
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123456",
    "username": "testuser"
  }'
```

**Авторизация:**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123456"
  }'
```

### Через Insomnia / Postman

1. Скачать Insomnia: https://insomnia.rest/download
2. Импортировать коллекцию (будет добавлена позже)
3. Тестировать endpoints

---

## Настройка frontend (Flutter)

### Шаг 1: Установка Flutter SDK

Следуйте официальной инструкции для вашей ОС:
- Windows: https://docs.flutter.dev/get-started/install/windows
- macOS: https://docs.flutter.dev/get-started/install/macos
- Linux: https://docs.flutter.dev/get-started/install/linux

### Шаг 2: Проверка Flutter

```bash
flutter doctor
```

Устраните все проблемы, отмеченные красным крестиком.

### Шаг 3: Инициализация проекта (будет выполнено позже)

```bash
cd project_shop-main
flutter create frontend
cd frontend
flutter pub get
```

---

## Решение проблем

### Проблема: "Cannot connect to database"

**Решение:**
1. Убедитесь, что PostgreSQL запущен:
   ```bash
   # Windows (PowerShell as Admin)
   Get-Service postgresql*
   
   # macOS
   brew services list
   
   # Linux
   sudo systemctl status postgresql
   ```

2. Проверьте параметры подключения в `.env`
3. Проверьте, что БД существует:
   ```bash
   psql -U fitpilot_user -l
   ```

### Проблема: "Port 3000 already in use"

**Решение:**
1. Измените `PORT` в `.env` на другой (например, 3001)
2. Или завершите процесс на порту 3000:
   ```bash
   # Windows
   netstat -ano | findstr :3000
   taskkill /PID <PID> /F
   
   # macOS/Linux
   lsof -ti:3000 | xargs kill -9
   ```

### Проблема: "JWT_SECRET is not defined"

**Решение:**
Убедитесь, что в `.env` файле установлен `JWT_SECRET`:
```env
JWT_SECRET=your_long_random_secret_key_at_least_32_characters
```

### Проблема: npm install завершается с ошибками

**Решение:**
```bash
# Очистить кеш npm
npm cache clean --force

# Удалить node_modules и lock файл
rm -rf node_modules package-lock.json

# Переустановить
npm install
```

---

## Полезные команды

### PostgreSQL

```bash
# Вход в psql
psql -U fitpilot_user -d fitpilot_db

# Список баз данных
\l

# Список таблиц
\dt

# Описание таблицы
\d users

# Выполнить SQL
SELECT * FROM users;

# Выход
\q
```

### Node.js

```bash
# Запуск с автоперезагрузкой
npm run dev

# Обычный запуск
npm start

# Проверка версии
node --version
npm --version
```

### Git

```bash
# Проверка текущей ветки
git branch

# Переключение на ветку
git checkout kursov_fitness

# Статус
git status

# Коммит
git add .
git commit -m "Your message"

# Пуш
git push origin kursov_fitness
```

---

## Следующие шаги

После успешной установки:

1. Изучите [API Documentation](API.md)
2. Изучите [Database Schema](DATABASE.md)
3. Начните разработку модулей:
   - Модуль питания
   - Модуль тренировок
   - AI-ассистент
4. Создайте frontend на Flutter

---

**Если возникли проблемы, не описанные в этом руководстве, обратитесь к руководителю проекта или создайте issue в репозитории.**
