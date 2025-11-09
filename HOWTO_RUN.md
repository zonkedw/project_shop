# Инструкция по запуску

## Шаг 1: Применение схемы БД к fitness_baze

### Через pgAdmin (рекомендуется):
1. Откройте pgAdmin
2. Подключитесь к серверу PostgreSQL
3. Найдите БД **fitness_baze**
4. Правой кнопкой → Query Tool
5. File → Open → Выберите `database/schema.sql`
6. Нажмите Execute (▶️) или F5

### Проверка:
```sql
-- В Query Tool выполните:
SELECT tablename FROM pg_tables WHERE schemaname = 'public';
```
Должно быть 18+ таблиц.

---

## Шаг 2: Настройка backend

```bash
cd backend

# Установить зависимости (если еще не установлены)
npm install

# Создать .env файл
copy .env.example .env
```

### Редактируйте .env:
```env
PORT=3000
NODE_ENV=development

DB_HOST=localhost
DB_PORT=5432
DB_NAME=fitness_baze          ← ваша БД
DB_USER=postgres              ← ваш пользователь
DB_PASSWORD=ВАШ_ПАРОЛЬ        ← ваш пароль PostgreSQL

JWT_SECRET=создайте_длинный_случайный_ключ_32_символа
JWT_EXPIRES_IN=7d
```

### Генерация JWT_SECRET (опционально):
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Запуск backend:
```bash
npm run dev
```

✅ Backend запущен на http://localhost:3000

### Проверка работы:
```bash
# Откройте браузер
http://localhost:3000

# Должен показать:
{
  "message": "FitPilot API",
  "version": "1.0.0",
  "status": "running"
}
```

---

## Шаг 3: Настройка и запуск Flutter (frontend)

### Если Flutter еще не установлен:
https://docs.flutter.dev/get-started/install

### Инициализация Flutter проекта:

**ВАЖНО:** Файлы Flutter уже созданы в папке `frontend/`, но нужно установить зависимости:

```bash
cd frontend

# Установить зависимости
flutter pub get

# Проверить Flutter
flutter doctor
```

### Настройка подключения к API:

Если тестируете на **реальном устройстве** (не эмуляторе), отредактируйте:
`frontend/lib/services/api_service.dart`

```dart
// Замените localhost на IP вашего компьютера
static const String baseUrl = 'http://192.168.1.XXX:3000/api';
```

Узнать IP:
```bash
# Windows
ipconfig

# macOS/Linux
ifconfig
```

### Запуск приложения:

```bash
# Запустить на эмуляторе/устройстве
flutter run

# Или выбрать устройство
flutter run -d chrome        # для веб
flutter run -d windows       # для Windows
```

---

## Полная последовательность запуска

### Терминал 1 (Backend):
```bash
cd C:\Users\macsh\Desktop\project_shop-main\backend
npm run dev
```

### Терминал 2 (Frontend):
```bash
cd C:\Users\macsh\Desktop\project_shop-main\frontend
flutter run
```

---

## Тестирование API через cURL/Postman

### 1. Регистрация:
```bash
curl -X POST http://localhost:3000/api/auth/register ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"test@example.com\",\"password\":\"Test123456\",\"username\":\"testuser\"}"
```

### 2. Авторизация:
```bash
curl -X POST http://localhost:3000/api/auth/login ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"test@example.com\",\"password\":\"Test123456\"}"
```

### 3. Поиск продуктов (нужен токен):
```bash
curl -X GET "http://localhost:3000/api/nutrition/products/search?q=курица" ^
  -H "Authorization: Bearer ВАШ_ТОКЕН"
```

### 4. Получить упражнения:
```bash
curl -X GET "http://localhost:3000/api/workouts/exercises" ^
  -H "Authorization: Bearer ВАШ_ТОКЕН"
```

---

## Возможные проблемы и решения

### Ошибка: Cannot connect to database
**Решение:**
1. Проверьте, что PostgreSQL запущен
2. Проверьте данные в `.env` (DB_NAME, DB_USER, DB_PASSWORD)
3. Проверьте, что БД `fitness_baze` существует:
   ```bash
   psql -U postgres -l
   ```

### Ошибка: Port 3000 already in use
**Решение:**
Измените `PORT=3001` в `.env` или завершите процесс:
```bash
# Windows (PowerShell)
Get-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess | Stop-Process
```

### Flutter: http package error
**Решение:**
```bash
cd frontend
flutter clean
flutter pub get
```

### CORS ошибка при запуске Flutter web
**Решение:**
Запустите Chrome с отключенным CORS (для разработки):
```bash
flutter run -d chrome --web-browser-flag "--disable-web-security"
```

---

## Структура проекта

```
project_shop-main/
├── backend/              ← Backend (Node.js + Express)
│   ├── .env             ← Настройки (создайте из .env.example)
│   ├── server.js        ← Запуск сервера
│   ├── routes/          ← API роуты
│   └── package.json
│
├── frontend/            ← Frontend (Flutter)
│   ├── lib/
│   │   ├── main.dart           ← Точка входа
│   │   ├── providers/          ← State management
│   │   ├── services/           ← API клиент
│   │   ├── screens/            ← Экраны UI
│   │   └── utils/              ← Утилиты, темы
│   └── pubspec.yaml
│
├── database/
│   └── schema.sql       ← Схема БД (применить в pgAdmin)
│
└── docs/               ← Документация
```

---

## Доступные модули

### ✅ Готово:
- Регистрация/авторизация
- Модуль питания (CRUD продуктов, приемы пищи)
- Модуль тренировок (упражнения, сессии)
- Flutter UI (авторизация, главный экран)

### 🚧 В разработке:
- Детальные экраны питания
- Детальные экраны тренировок
- Сканер штрих-кодов
- AI-ассистент
- Интеграции с Health

---

## Следующие шаги разработки

1. **Экраны добавления питания** (frontend)
2. **Экраны добавления тренировок** (frontend)
3. **Сканер штрих-кодов** (mobile_scanner)
4. **Модуль профиля пользователя** (backend + frontend)
5. **AI-ассистент** (backend + frontend)

---

## Полезные команды

### Backend:
```bash
npm run dev          # Запуск с автоперезагрузкой
npm start            # Обычный запуск
npm test             # Тесты (когда будут)
```

### Frontend:
```bash
flutter run          # Запуск
flutter build apk    # Сборка Android APK
flutter build ios    # Сборка iOS (только на macOS)
flutter clean        # Очистка кеша
flutter pub get      # Установка зависимостей
```

### Database:
```bash
# Подключение к БД
psql -U postgres -d fitness_baze

# Внутри psql:
\dt                  # Список таблиц
\d users             # Описание таблицы users
SELECT * FROM users; # Запрос
\q                   # Выход
```

---

## 🎉 Готово!

После выполнения всех шагов у вас будет:
- ✅ Backend API на порту 3000
- ✅ База данных PostgreSQL (fitness_baze)
- ✅ Flutter приложение

**Можно начинать разработку!** 🚀
