## Mars Lab Project

Мини-приложение для отправки и просмотра отчётов (Express + MongoDB + React).

### Запуск
```bash
npm install
cp .env.example .env    # при необходимости укажите MONGODB_URI/PORT/UPLOAD_DIR
npm run build           # собирает фронтенд в frontend/public/bundle.js
npm start               # nodemon backend/src/app.js
```
По умолчанию API: `http://localhost:3000/api`, загрузки отдаются по `/uploads`.

### API
- `GET /api/check-connection` — проверка доступности по окнам из `periods.json`.
- `POST /api/upload-file` (FormData: file) — загрузка файла, ответ `{fileName}`.
- `POST /api/reports` — создание отчёта `{scientistName, reportContent, fileName?}`.
- `GET /api/reports` — список отчётов.

### Фронтенд
Файлы в `frontend/public`: `index.html`, `bundle.js` (webpack), `styles.css`.
Исходники React — в `frontend/src`. Главная — отправка отчёта, /reports — список.

### Примечания
- Папка `uploads/` создаётся автоматически при старте.
- `periods.json` задаёт доступные окна связи; если файла нет, связь считается доступной.
- Стили и навигация упростили: минимальный JS в `main.js` только для меню/формы.
