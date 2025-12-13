# FitPilot Backend

Backend API для фитнес-приложения FitPilot с интеграцией AI.

## Быстрый старт

1. **Установите зависимости:**
   ```bash
   npm install
   ```

2. **Создайте `.env` файл:**
   ```bash
   cp .env.example .env
   ```

3. **Заполните обязательные переменные в `.env`:**
   - `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`
   - `JWT_SECRET`

4. **Запустите сервер:**
   ```bash
   npm run dev
   ```

## Структура проекта

```
backend/
├── config/           # Конфигурация
│   ├── database.js   # Подключение к PostgreSQL
│   └── index.js      # Проверка env переменных
├── middleware/       # Middleware
│   ├── auth.js       # JWT авторизация
│   └── errorHandler.js # Централизованный обработчик ошибок
├── routes/           # API роуты
│   ├── ai.js         # AI-ассистент
│   ├── auth.js       # Авторизация
│   ├── nutrition.js  # Питание
│   ├── workouts.js   # Тренировки
│   └── ...
├── services/         # Бизнес-логика
│   └── aiLogger.js   # Логирование AI-взаимодействий
├── validators/       # Валидация запросов
│   └── aiValidators.js
├── __tests__/        # Тесты
│   └── ai.test.js
└── server.js         # Точка входа
```

## API Endpoints

### AI-ассистент

- `POST /api/ai/chat` - Чат с AI
- `POST /api/ai/recommendations/mealplan` - Генерация рациона
- `POST /api/ai/recommendations/mealplan/apply` - Применение рациона
- `POST /api/ai/recommendations/workout` - Генерация тренировки
- `POST /api/ai/recommendations/workout/apply` - Применение тренировки

Все AI endpoints требуют авторизации и имеют rate limit: 60 запросов / 15 минут на пользователя.

## Тестирование

```bash
npm test
```

Тесты используют моки БД, реальная база данных не требуется.

## Переменные окружения

**Обязательные:**
- `DB_HOST`, `DB_NAME`, `DB_USER`, `DB_PASSWORD` - настройки PostgreSQL
- `JWT_SECRET` - секретный ключ для JWT токенов

**Опциональные:**
- `PORT` - порт сервера (по умолчанию: 3000)
- `NODE_ENV` - окружение (development/production/test)
- `CORS_ORIGINS` - разрешённые источники для CORS (через запятую)
- `JWT_EXPIRES_IN` - срок действия токена (по умолчанию: 7d)

**AI (опционально):**
- `AI_API_URL` - URL провайдера AI (OpenAI, Anthropic и т.д.)
- `AI_API_KEY` - API ключ
- `AI_MODEL` - Модель (по умолчанию: gpt-4o-mini)

Если AI переменные не указаны, используется fallback-логика без внешнего AI.

**Пример `.env` файла:**
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=fitpilot
DB_USER=postgres
DB_PASSWORD=your_password

JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRES_IN=7d

PORT=3000
NODE_ENV=development
CORS_ORIGINS=http://localhost:19006,http://localhost:3001

AI_API_URL=https://api.openai.com
AI_API_KEY=your_openai_api_key
AI_MODEL=gpt-4o-mini
```

## Валидация и формат ответов

Все API endpoints используют валидацию через `celebrate` и Joi схемы из папки `validators/`.

**Формат успешного ответа:**
```json
{
  "success": true,
  "data": { ... },
  "message": "Опциональное сообщение"
}
```

**Формат ошибки:**
```json
{
  "success": false,
  "error": "Описание ошибки"
}
```

Ошибки валидации автоматически обрабатываются через `celebrate` middleware.

## Логирование

AI-взаимодействия автоматически логируются в таблицу `ai_interactions`:
- Запросы пользователей
- Ответы AI
- Количество использованных токенов (если доступно)
- Контекст (профиль, итоги дня и т.д.)

