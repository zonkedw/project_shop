# Запуск с Expo Go

## ШАГ 1: База данных (один раз)

pgAdmin → fitness_baze → Query Tool → Open → database/schema.sql → Execute ▶️

## ШАГ 2: Backend (сервер)

```bash
cd backend
npm run dev
```

Сервер: http://localhost:3000

## ШАГ 3: Frontend (Expo)

### Установите Expo Go на телефон:
- Android: https://play.google.com/store/apps/details?id=host.exp.exponent
- iOS: https://apps.apple.com/app/expo-go/id982107779

### Запустите проект:

```bash
cd frontend
npm start
```

Откроется Expo DevTools в браузере.

### На телефоне:

1. Откройте Expo Go
2. Отсканируйте QR код из терминала или браузера
3. Приложение загрузится и запустится

**ВАЖНО:** ПК и телефон должны быть в одной WiFi сети!

### Изменить IP для телефона:

Откройте `frontend/src/services/api.js`

Строка 7:
```javascript
const API_URL = 'http://localhost:3000/api';
```

Замените на IP вашего ПК (узнать: `ipconfig`):
```javascript
const API_URL = 'http://192.168.X.X:3000/api';
```

## Команды Expo

```bash
npm start          # Запуск с QR кодом
npm run android    # Запуск Android эмулятора
npm run ios        # Запуск iOS эмулятора (только macOS)
npm run web        # Запуск в браузере
```

## Горячая перезагрузка

При изменении кода приложение автоматически обновится на телефоне.

## Проблемы

**Телефон не видит QR код:**
- Проверьте что ПК и телефон в одной WiFi
- Попробуйте Tunnel mode: `npx expo start --tunnel`

**Connection refused:**
- Измените API_URL на IP компьютера (см. выше)
- Проверьте фаервол Windows

**Backend не запускается:**
- Проверьте пароль в `backend/.env`

## Преимущества Expo Go

- Не нужна установка, просто сканируй QR
- Изменения видны моментально
- Не нужен USB кабель
- Работает через WiFi

## Готово!

После запуска:
- Backend на http://localhost:3000
- Expo DevTools в браузере
- Приложение в Expo Go на телефоне
