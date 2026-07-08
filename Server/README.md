# MAZE API

Node.js backend — TypeScript, ESM, Fastify 5.

## Setup

```bash
cp .env.example .env
npm install
```

Requires PostgreSQL and Redis (see `.env.example`).

**Quick start with Docker:**

```bash
npm run infra:up          # postgres:5432 + redis:6379
npm run db:migrate
npm run db:seed           # dev data
npm run dev
```

Without Docker: install PostgreSQL 16+ and Redis locally, create DB `maze` / user `maze`.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Dev server with hot reload |
| `npm run build` | Compile to `dist/` |
| `npm start` | Run production build |
| `npm test` | Vitest |
| `npm run lint` | ESLint |
| `npm run db:migrate` | Sequelize migrations |
| `npm run db:seed` | Dev seeders (catalog + demo data from `src/data/`) |
| `npm run db:seed:prod-bootstrap` | Production: payment/delivery refs + site_settings only |

## API (step 5)

Base URL: `http://localhost:4000/api/v1`

| Method | Path | Description |
|--------|------|-------------|
| GET | `/health/live` | Liveness |
| GET | `/health/ready` | Readiness (PG + Redis) |
| GET | `/settings/public` | Store contacts & map |
| GET | `/home` | Homepage payload |
| GET | `/reviews` | Store reviews (paginated) |
| GET | `/cms/:slug` | CMS page |
| GET | `/catalog/categories` | Category tree |
| GET | `/catalog/products` | Product list + filters |
| GET | `/catalog/products/:slug` | Product card |
| POST | `/auth/sms/send` | Send OTP (anti-enumeration) |
| POST | `/auth/sms/verify` | Verify OTP → access + `maze_refresh` cookie |
| POST | `/auth/refresh` | Rotate refresh, new access |
| POST | `/auth/logout` | Revoke refresh session |
| POST | `/auth/staff/login` | Staff access + `maze_staff_refresh` |
| POST | `/auth/staff/logout` | Staff logout |

**Dev staff (after `db:seed`):** `manager@maze.ru` / `admin@maze.ru` — password `manager123`

Mutating requests require header `X-Requested-With: maze-web`.

| Method | Path | Description |
|--------|------|-------------|
| GET | `/cart` | Cart with enriched items |
| PUT | `/cart` | Replace all items |
| POST | `/cart/items` | Add / increment item |
| DELETE | `/cart/items/:variantId` | Remove line |
| DELETE | `/cart` | Clear cart |

Cart uses `maze_guest` cookie (auto-created) or Bearer user token.

| Method | Path | Description |
|--------|------|-------------|
| POST | `/delivery/quote` | Request delivery quote (async) |
| GET | `/delivery/quote/:quoteId` | Poll quote status |
| POST | `/orders` | Checkout (Idempotency-Key required) |
| GET | `/me/orders` | User orders (Bearer) |
| GET | `/me/orders/:id` | Order detail (Bearer) |
| GET | `/me` | User profile |
| PATCH | `/me` | Update profile |
| GET\|POST | `/me/addresses` | Addresses |
| PATCH\|DELETE | `/me/addresses/:id` | Address CRUD |
| GET\|POST | `/me/companies` | B2B companies |
| PATCH\|DELETE | `/me/companies/:id` | Company CRUD |
| GET | `/me/favorites` | Favorites list |
| POST\|DELETE | `/me/favorites/:productId` | Favorites mutate |
| PATCH | `/me/consents` | Marketing consents |
| GET | `/manager/orders` | Staff order list |
| GET | `/manager/orders/:id` | Staff order detail |
| PATCH | `/manager/orders/:id/status` | Status transition (`paid` → stock + outbox) |
| POST | `/manager/orders/:id/notes` | Manager note |
| PATCH | `/manager/orders/:id/assign` | Assign manager (admin) |
| PATCH | `/admin/site-settings` | Site settings (admin) |
| PUT | `/admin/editor-choice` | Editor's choice (admin) |
| PATCH | `/admin/products/:id/stock` | Stock update (admin) |
| CRUD | `/admin/categories` | Categories + brands |
| CRUD | `/admin/products` | Products |
| CRUD | `/admin/products/:id/variants` | Variants + stock |
| CRUD | `/admin/banners` | Homepage banners |
| CRUD | `/admin/info-slides` | Info slides |
| CRUD | `/admin/cms-pages` | CMS pages |
| POST | `/admin/uploads` | Image upload (max 5 MB, admin) |

## Docs

- [API_ENDPOINTS.md](./API_ENDPOINTS.md) — **полный справочник: метод, body, response**
- [BACKEND_ARCHITECTURE.md](../docs/BACKEND_ARCHITECTURE.md)
- [API_CONTRACT.md](../docs/API_CONTRACT.md)
- [IMPLEMENTATION_DECISIONS.md](../docs/IMPLEMENTATION_DECISIONS.md)

## Current status

- [x] Step 1–2: scaffold + base infra
- [x] Step 3: models + migrations (8 batches, 36 tables)
- [x] Step 4: seeders (7 files + `src/seeders/lib/`)
- [x] Step 5: health + public API (`/api/v1`)
- [x] Step 6: auth (SMS, refresh cookies, staff login, sms/outbox workers)
- [x] Step 8: cart (Redis, guest cookie, CRUD)
- [x] Step 9: delivery quote (async worker, 15 min TTL)
- [x] Step 10: checkout (`POST /orders`) + `GET /me/orders`
- [x] Step 11: `/me` profile, manager API, admin (site-settings, editor-choice, stock)
- [x] Step 12: full admin CRUD + stock cron worker (15 min)
