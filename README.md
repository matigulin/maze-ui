# MAZE — интернет-магазин техники

Next.js фронтенд + Fastify API бэкенд в одном репозитории.

- Фронт — корень репо (Next.js 16)
- Бэк — `Server/` (Fastify 5, PostgreSQL, Redis)
- Документация — `docs/`

## Локальный запуск

### Сервер (API)

```bash
cd Server
npm install
cp .env.example .env
npm run db:migrate
npm run db:seed
npm run dev
```

API: `http://localhost:4000/api/v1`

### Клиент (сайт)

```bash
npm install
cp .env.example .env.local
npm run dev
```

Сайт: `http://localhost:3000`

## Vercel

Импортируй репозиторий на [vercel.com](https://vercel.com/new) — **Root Directory оставь пустым** (корень репо).

В **Settings → Deployment Protection** выключи **Vercel Authentication** для Production, иначе сайт будет закрыт.

На Vercel без API сайт работает на моках.

## Структура

```
app/ components/ lib/   # Next.js
Server/                 # API
docs/                   # контракты
design-system/          # дизайн-система
```
