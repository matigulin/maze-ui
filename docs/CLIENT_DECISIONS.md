# MAZE — Решения фронтенда (до кода)

> **Статус:** ✅ инженерные правила (финал перед scaffold)  
> **Версия:** 1.0 · июнь 2026  
> **Клиент:** Next.js 15 (browser only)  
> **Связанные документы:** [CLIENT_ARCHITECTURE.md](CLIENT_ARCHITECTURE.md) · [API_CONTRACT.md](API_CONTRACT.md) · [IMPLEMENTATION_DECISIONS.md](IMPLEMENTATION_DECISIONS.md)

Чеклист закрывает развилки, которые **нельзя решать в процессе scaffold** `Client/`.

---

## 1. Технологический стек

| Параметр | Решение |
|----------|---------|
| Framework | **Next.js 15** (App Router) |
| Язык | **TypeScript** (`strict: true`) |
| Node.js | **>= 20** |
| Стили | **Tailwind CSS** |
| UI kit | **shadcn/ui** — выборочно |
| Server state | **TanStack Query v5** |
| Client state | **Zustand** — узко (auth + UI) |
| Формы | **react-hook-form** · **zod** · **@hookform/resolvers** |
| Анимации | **Framer Motion** |
| Карусели | **Embla Carousel** · **embla-carousel-autoplay** |
| Иконки | **lucide-react** + inline SVG (логотип) |
| Утилиты классов | **clsx** · **tailwind-merge** |
| Медиа / шрифты | **next/image** · **next/font** |
| HTTP | **fetch** + thin API client (`lib/api`) |
| Линтер | **ESLint** · **eslint-config-next** |
| Unit-тесты | **Vitest** · **@testing-library/react** |
| E2E | **Playwright** — после сквозного функционала |

```
Client/ — Next.js 15 · TypeScript · App Router · Node >= 20
```

### Не используем (MVP)

| Инструмент | Причина |
|------------|---------|
| Redux / MobX | TanStack Query + узкий Zustand достаточно |
| Axios | `fetch` + свой client проще с cookies |
| Swiper | Embla легче и гибче |
| GSAP | Framer Motion закрывает интерфейсные анимации |
| Mock JSON как data layer | Данные с API с первого дня |
| JWT в localStorage / sessionStorage | Запрещено контрактом |

### Фаза polish (не в базовом scaffold)

| Пакет | Назначение |
|-------|------------|
| `three` · `@react-three/fiber` · `@react-three/drei` | Liquid gradient, 3D — lazy, `ssr: false` |
| Яндекс Maps / 2GIS SDK | Карта на `/contacts` / `/reviews` |
| Playwright | E2E smoke |

---

## 2. Границы ответственности

### TanStack Query — все данные с сервера

- Каталог, корзина, профиль, заказы, home, admin lists.
- **Единственный источник правды** для server state.
- После мутации — **только** `invalidateQueries` / `refetch` по query keys.  
  **Не** «ручной sync» в Zustand и не отдельные cart/catalog stores.

| Мутация | Invalidate |
|---------|------------|
| add/remove cart item | `['cart']` |
| checkout success | `['cart']`, `['me', 'orders']` |
| update profile | `['me']` |
| toggle favorite | `['me', 'favorites']` |
| admin save product | `['admin', 'products']`, `['catalog', ...]` |

Optimistic update — допустим **внутри** TanStack Query (`onMutate` / `setQueryData`), не в Zustand.

### Zustand — только auth и UI

| Store | Содержимое |
|-------|------------|
| `stores/auth.store.ts` | `accessToken`, snapshot user, staff session flags |
| `stores/ui.store.ts` | SMS modal, trade-in popup, splash dismissed, прочие UI flags |

**Запрещено:** `cart.store.ts`, `catalog.store.ts`, любые дубли server state.

### shadcn/ui — формы и управление

Dialog, Sheet, Tabs, Select, Checkbox, Form — checkout, профиль, manager, admin.

### brand-компоненты — витрина

Hero, splash, promo-секции, карточки в фирменном стиле — **не** дефолтный вид shadcn Card/Button.

### Правило выбора UI

| Ситуация | Слой |
|----------|------|
| Страница **продаёт** | `components/brand/` + `features/*/components` |
| Страница **собирает ввод** | `components/ui/` (shadcn) + RHF |
| Блок в **2+ features** | `components/patterns/` |
| WebGL / 3D | `components/effects/` (lazy) |

---

## 3. Интеграция с API

Полный контракт: **[API_CONTRACT.md](API_CONTRACT.md)**.

| Правило | Решение |
|---------|---------|
| Base URL | `NEXT_PUBLIC_API_URL` → `http://localhost:4000/api/v1` (dev) |
| Cookies | `credentials: 'include'` |
| CSRF | `X-Requested-With: maze-web` на POST/PATCH/DELETE |
| Access JWT | Только в **памяти** (Zustand) |
| Refresh | HttpOnly cookie → `POST /auth/refresh` |
| Гостевая корзина | Cookie `maze_guest` (sessionId) — автоматически |
| Ошибки UX | Только по **`error.code`**, не по HTTP-статуру |
| Словарь текстов | `lib/errors/` — `USER_MESSAGES[code]` |

### Refresh при 401

```
401 TOKEN_EXPIRED:
  1. POST /auth/refresh (credentials: include)
  2. сохранить access в auth store
  3. retry исходный запрос 1 раз
  4. снова 401 → logout UI
```

### Session restore

При mount приложения — тихий `POST /auth/refresh` для восстановления user-сессии (если refresh cookie валиден).

---

## 4. SEO (обязательная часть витрины)

| Правило | Решение |
|---------|---------|
| SEO-важные страницы | **SSR или ISR** — готовый HTML в первом ответе |
| TanStack Query на SEO-страницах | Интерактив, кэш, повторные запросы — **не** единственный источник контента для бота |
| Client-only SEO-страницы | **Запрещены** для catalog, PDP, CMS, contacts |

### SEO-важные маршруты

`/`, `/catalog`, `/catalog/[slug]`, `/product/[slug]`, `/cms/[slug]`, `/contacts`, `/reviews`

### Обязательные механизмы (MVP витрины)

- `generateMetadata()` — title, description, OG
- `app/sitemap.ts` — товары, категории, CMS
- `app/robots.ts`
- canonical URL
- Schema.org: `Product`, `BreadcrumbList`, `Organization` / `LocalBusiness`
- `next/image` + осмысленные `alt`

### Не SEO (client-heavy)

`/cart`, `/checkout`, `/profile/*`, `/manager/*`, `/admin/*`

### ISR

Для PDP и категорий при большом каталоге — `revalidate` (60–120 с), не обязательно SSG всего каталога.

---

## 5. Визуал и UX (бриф заказчика)

| Параметр | Решение |
|----------|---------|
| Палитра | Чёрный · белый · брендовый цвет (из brand-файлов) · градиенты точечно |
| Логотип | Тонкий SVG; перелив (idle или on scroll) — аккуратно |
| Прелоадер | Да: лабиринт (A) → wordmark «maze» |
| Стиль текста | Лаконично, по делу |
| Переходы секций | Чёрный ↔ белый, без пестроты |
| Карусели | Info strip 5 с, новинки, mixed grid |
| Hover | Увеличение promo-карточек; image→video — polish |
| Partner brands | Monochrome strip |
| 3D / WebGL | Только `components/effects/`, не в базовом MVP |

### Качество и производительность

| Правило | Решение |
|---------|---------|
| Framer, splash, liquid gradient | **Только** hero и главная в первой волне |
| PDP и каталог | Сдержанные анимации; приоритет LCP и SEO HTML |
| `prefers-reduced-motion` | Обязательно: отключать/упрощать тяжёлые анимации |

---

## 6. Бизнес-логика (фронт)

| Правило | Где |
|---------|-----|
| Цены на write-path **только с сервера** | checkout — клиент не отправляет цену |
| `Idempotency-Key` (uuid v4) на `POST /orders` | `features/checkout` |
| Наценки оплаты (+7% карта/QR, рассрочка +5000 ₽ + комплект аксессуаров) | UI-показ в checkout; **финал с API** |
| Заказ без онлайн-оплаты сразу | Оплата после согласования с менеджером |
| Доставка СПб / РФ / курьер / Яндекс | `features/delivery` + checkout |
| Доставка по городу от 500 ₽ | Отображение из settings / quote |
| Доставка РФ: 100% предоплата QR (+4%) — только для РФ | Copy в checkout |
| Editor's choice 8–12 товаров | Admin → `GET /home` |
| Specs по типам устройств | Тяжёлый CRUD в admin |
| Trade-in CTA | Popup на витрине (не блокирует MVP checkout) |
| `/used` | Redirect на Telegram-канал |
| Программа привилегий | «В разработке» — заглушка в ЛК |

---

## 7. Аутентификация и guards

| Зона | Механизм |
|------|----------|
| User `/profile/*` | Client guard в `(account)/layout` — middleware **не видит** access в memory |
| Staff `/manager/*`, `/admin/*` | Middleware по staff refresh cookie + `/staff/login` |
| SMS-auth | Dialog, не отдельный route |

---

## 8. shadcn/ui — scope

**Ставим:** Dialog, Sheet, Tabs, Select, Checkbox, Form, Table (admin/manager), Toast.

**Не используем для витрины:** дефолтные Card, Button как основной visual language главной.

Тема shadcn кастомизируется под brand tokens (чёрный / белый / бренд).

---

## 9. Env (Client)

| Переменная | Назначение |
|------------|------------|
| `NEXT_PUBLIC_API_URL` | API base |
| `NEXT_PUBLIC_SITE_URL` | canonical, OG |
| `NEXT_PUBLIC_YANDEX_MAPS_KEY` | Фаза polish — карта |

---

## 10. Roadmap реализации

| Шаг | Задача | Smoke |
|-----|--------|-------|
| 1 | scaffold `Client/` — Next, TS, Tailwind, ESLint, Vitest | `npm run dev` :3000 |
| 2 | `lib/api` + `lib/errors` + providers (QueryClient) | `GET /health/ready` |
| 3 | design tokens + layout (Header, Footer) + `brand/Logo` | shell рендерится |
| 4 | SEO base: metadata, robots, sitemap scaffold | `/robots.txt` |
| 5 | `features/auth` — SMS, refresh, auth store | login/logout |
| 6 | `features/home` + `features/content` — главная SSR | `GET /home` |
| 7 | `features/catalog` — catalog + PDP **SSR/ISR** + metadata | товар в HTML |
| 8 | `features/cart` | add/remove, sync API |
| 9 | `features/delivery` + `features/checkout` | quote + `POST /orders` |
| 10 | `features/profile` | `/me`, orders, addresses, favorites |
| 11 | CMS routes + redirects (`/delivery` → `/cms/delivery`) | SEO pages |
| 12 | `features/manager` | orders list + status |
| 13 | `features/admin` | CRUD catalog + content |
| 14 | Polish: splash, hero motion, mixed grid, Embla | визуал |
| 15 | Polish: liquid gradient, maps, 3D (опц.) | effects lazy |
| 16 | Playwright E2E | catalog → cart → order |

Smoke после каждого шага: Server `npm run dev` + Client `npm run dev` → сценарий этапа.

---

## Checklist «готово к scaffold»

- [x] Стек согласован
- [x] Границы Query / Zustand / shadcn / brand
- [x] Структура папок и features
- [x] Роутинг и redirects CMS
- [x] SEO: SSR/ISR для витрины
- [x] Бизнес-правила checkout и оплаты
- [x] manager vs admin
- [x] Правило мутаций через invalidate/refetch
- [ ] Brand-файлы (логотип, цвета) в репозитории
- [ ] **Следующий** — scaffold `Client/` (шаг 1)

---

## Следующий шаг (код)

1. Scaffold `Client/` по [CLIENT_ARCHITECTURE.md](CLIENT_ARCHITECTURE.md)  
2. `lib/api` + TanStack Query providers  
3. Layout + brand tokens  
4. Первая SSR-страница: главная или каталог
