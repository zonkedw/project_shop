# СТАРТ ПРОЕКТА - 3 ШАГА

## 1. БД (один раз)

pgAdmin → fitness_baze → Query Tool → Open file → database/schema.sql → Execute ▶️

## 2. Backend

```bash
cd backend
npm run dev
```

Откройте браузер: http://localhost:3000

## 3. Приложение

### ПК:
```bash
cd frontend
flutter run -d windows
```

### Телефон:
1. Измените IP в `frontend/lib/services/api_service.dart`:
   ```dart
   static const String baseUrl = 'http://192.168.X.X:3000/api';
   ```
   IP узнать: `ipconfig`

2. Подключите телефон USB, включите отладку

3. ```bash
   flutter run
   ```

## Проблемы

**Backend:** Измените пароль в `backend/.env`

**БД:** Повторите шаг 1

**Телефон не виден:** `flutter devices`

---

**Expo Go НЕ НУЖЕН** - у вас Flutter, не React Native

**Подробная инструкция:** README_ZAPUSK.md
