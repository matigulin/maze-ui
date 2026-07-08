# MAZE — интернет-магазин техники

Тренировочный проект MAZE: Next.js фронтенд + Fastify API бэкенд.

- Фронт: `maze/` — Next.js 16, Liquid Glass UI
- Бэк: `Server/` — Fastify 5, PostgreSQL, Redis
- Документация: `docs/`

Демо фронта (только моки): [test-ui-aw6f.vercel.app](https://test-ui-aw6f.vercel.app/)

## Быстрый старт

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

PostgreSQL и Redis должны быть запущены (локально или `npm run infra:up` с Docker).

### Клиент (сайт)

```bash
cd maze
npm install
cp .env.example .env.local
npm run dev
```

Сайт: `http://localhost:3000`

## Vercel (только фронт)

В настройках проекта Vercel укажи **Root Directory**: `maze`.

Без отдельного бэкенда страницы с API не загрузят данные — нужен деплой `Server/` или `NEXT_PUBLIC_API_BASE_URL` на живой API.

## Структура

```
maze/           # Next.js приложение
Server/         # Fastify API
docs/           # контракты и архитектура
design-system/  # дизайн-система
```

Учебный проект. Товары и цены — демо-данные.
