# Backend - Sistema de Hotelaria

API REST em Node.js + Express + SQLite.

## Requisitos

- Node.js 18+

## Como rodar

```bash
npm install
npm run dev
```

Ou em modo normal:

```bash
npm start
```

API disponível em `http://localhost:3000`.

## Endpoints

- `GET /health`
- `GET/POST/PUT/DELETE /hospedes/`
- `GET/POST/PUT/DELETE /quartos/`
- `GET/POST/PUT/DELETE /hospedagens/`

O banco SQLite é criado automaticamente em `backend/data/hotelaria.db`.
