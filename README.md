# MAZE — интернет-магазин техники

Next.js фронтенд + Fastify API в одном репозитории.

| Часть | Папка |
|-------|-------|
| Сайт (Next.js) | `Client/` |
| API (Fastify) | `Server/` |
| Документация | `docs/` |

## Локальный запуск

**Сервер:**
```bash
cd Server && npm install && npm run dev
```

**Клиент:**
```bash
cd Client && npm install && cp .env.example .env.local && npm run dev
```

- Сайт: http://localhost:3000
- API: http://localhost:4000/api/v1

## Vercel (публичная ссылка)

1. Import `matigulin/maze-ui` на vercel.com
2. **Root Directory → `Client`**
3. **Settings → Deployment Protection** → выключи **Vercel Authentication** для Production
4. Deploy

Ссылка: https://maze-ui.vercel.app

## GitHub

https://github.com/matigulin/maze-ui
