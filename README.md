![CI](https://github.com/Raphailinc/Mars-Lab-Project/actions/workflows/ci.yml/badge.svg)

## Mars Lab Project

![UI](docs/mars-lab.svg)

Мини-приложение для отправки и просмотра отчётов (Express + MongoDB + React).

### Quickstart
```bash
npm install
npm run build
npm start              # http://localhost:3000/api
```
`.env` (пример):
```
MONGODB_URI=mongodb://localhost:27017/mars_lab
PORT=3000
UPLOAD_DIR=uploads
```

### API (curl-примеры)
```bash
# Проверка связи
curl -i http://localhost:3000/api/check-connection

# Загрузка файла
curl -F "file=@report.pdf" http://localhost:3000/api/upload-file
# -> {"fileName":"<stored-name>"}

# Создать отчёт и получить список
curl -X POST http://localhost:3000/api/reports \
  -H "Content-Type: application/json" \
  -d '{"scientistName":"Alice","reportContent":"Soil sample","fileName":"report.pdf"}'
curl http://localhost:3000/api/reports
```

### Архитектура
- `backend/src/app.js` — Express API, guard по окнам связи, Multer uploads, MongoDB (Mongoose).
- `backend/tests/` — Jest + supertest + mongodb-memory-server (in-memory) для API.
- `frontend/src/` — React SPA (отправка отчёта, список /reports), сборка webpack в `frontend/public/bundle.js`.
- `uploads/` — сохраняются автоматически, раздаются статикой `/uploads`.
- `periods.json` — окна связи (health-check /api/check-connection).

### Quality
- Линт: `npm run lint` (ESLint + Prettier)
- Тесты: `npm test` (Jest + supertest + mongodb-memory-server, с coverage)
- CI: GitHub Actions (`ci.yml`) — lint + tests on Node 18.
