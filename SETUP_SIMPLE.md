# Запуск проекта

## ШАГ 1: База данных (один раз)

У вас уже есть БД `fitness_baze` в pgAdmin.

Нужно создать таблицы (продукты, пользователи, тренировки и т.д.):

1. Откройте pgAdmin
2. Найдите БД `fitness_baze` → Правая кнопка → Query Tool
3. File → Open → Выберите `database/schema.sql`
4. Нажмите Execute (кнопка ▶️)

Готово. Таблицы созданы.

## ШАГ 2: Backend (сервер)

Откройте терминал:

```bash
cd backend
npm run dev
```

Сервер запустится на http://localhost:3000

Проверка: откройте в браузере http://localhost:3000

## ШАГ 3: Frontend

### На ПК:
```bash
cd frontend
flutter run -d windows
```

### На телефоне:
1. Подключите телефон USB
2. Включите отладку по USB
3. ```bash
   flutter run
   ```

**Важно для телефона:**
Откройте файл `frontend/lib/services/api_service.dart`

Замените:
```dart
static const String baseUrl = 'http://localhost:3000/api';
```

На (ваш IP компьютера):
```dart
static const String baseUrl = 'http://192.168.X.X:3000/api';
```

Узнать IP: `ipconfig` в терминале, строка IPv4

## Проблемы

**Backend не запускается:**
Откройте `backend/.env` и измените `DB_PASSWORD` на ваш пароль от PostgreSQL

**Flutter не видит телефон:**
```bash
flutter devices
```

**Таблицы не созданы:**
В pgAdmin повторите ШАГ 1

## Expo Go НЕ НУЖЕН
У вас Flutter, не React Native. Expo Go не используется.
