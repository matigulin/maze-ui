# MAZE API — справочник эндпоинтов

> Актуально по коду в `Server/src/routes/`.  
> **Base URL (dev):** `http://localhost:4000`  
> **API prefix:** `/api/v1`  
> **Health:** без префикса `/api/v1`  
> **Uploads (static):** `GET /uploads/{filename}`

---

## Общие правила

### Формат ответа

**Успех:**
```json
{
  "data": { },
  "requestId": "uuid",
  "meta": { "page": 1, "limit": 24, "total": 100 }
}
```
`meta` — только у списков с пагинацией.

**Ошибка:**
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Human readable",
    "details": []
  },
  "requestId": "uuid"
}
```

### Заголовки

| Header | Когда | Описание |
|--------|-------|----------|
| `Content-Type: application/json` | POST/PATCH/PUT (кроме upload) | Обязателен |
| `Authorization: Bearer <accessToken>` | User / Staff / Admin | Access JWT (~15 мин) |
| `X-Requested-With: maze-web` | POST, PATCH, PUT, DELETE | CSRF (обязателен на mutating) |
| `Idempotency-Key: <uuid>` | `POST /api/v1/orders` | Обязателен |
| `Cookie` | auth, cart, checkout | `credentials: 'include'` |

### Cookies

| Cookie | Назначение |
|--------|------------|
| `maze_guest` | sessionId гостя (корзина в Redis) |
| `maze_refresh` | user refresh (path `/api/v1/auth`) |
| `maze_staff_refresh` | staff refresh (path `/api/v1/auth/staff`) |

### Пагинация

Query: `page` (≥1, default 1), `limit` (1–48, default 24).

### Auth-уровни

| Уровень | Как |
|---------|-----|
| Public | без auth |
| Guest/User cart | cookie `maze_guest` и/или Bearer user |
| User | Bearer user (`type: user`) |
| Staff | Bearer staff (`role: manager \| admin`) |
| Admin | Bearer staff (`role: admin`) |

---

## Health

### `GET /health/live`

Liveness. Auth не нужен.

**Response 200 — `data`:**
```json
{ "status": "ok" }
```

---

### `GET /health/ready`

Readiness: PostgreSQL + Redis.

**Response 200 — `data` (всё ok):**
```json
{ "status": "ready", "postgres": true, "redis": true }
```

**Response 503 — `data` (что-то недоступно):**
```json
{ "status": "not_ready", "postgres": false, "redis": true }
```

---

## Public — `/api/v1`

Auth не требуется.

### `GET /settings/public`

Контакты магазина.

**Response 200 — `data`:**
```json
{
  "storeName": "MAZE",
  "address": "г. Санкт-Петербург, ...",
  "phone": "+79959114984",
  "email": "info@maze.ru",
  "metro": "Чернышевская",
  "workingHours": "11:30 – 20:30",
  "socialLinks": {
    "telegram": "https://t.me/...",
    "vk": "https://vk.com/...",
    "youtube": "https://youtube.com/...",
    "telegramUsed": "https://t.me/..."
  },
  "mapCoordinates": { "lat": 59.946528, "lng": 30.365317 }
}
```

---

### `GET /home`

Payload главной страницы.

**Response 200 — `data`:**
```json
{
  "editorChoice": [ /* ProductListItem[] */ ],
  "banners": [
    {
      "id": "uuid",
      "title": "string",
      "subtitle": "string | null",
      "image": "url",
      "link": "string",
      "size": "large"
    }
  ],
  "infoSlides": [
    { "id": "uuid", "icon": "string", "title": "string", "desc": "string" }
  ],
  "advantages": [
    { "id": "uuid", "icon": "string", "title": "string", "desc": "string" }
  ],
  "partnerBrands": [
    {
      "id": "uuid",
      "name": "string",
      "logo": "url",
      "categorySlug": "string | null",
      "link": "string | null"
    }
  ]
}
```

**ProductListItem** (editorChoice, favorites, catalog list):
```json
{
  "id": "uuid",
  "slug": "iphone-16-pro",
  "title": "string",
  "brandName": "Apple",
  "brandSlug": "apple",
  "subcategorySlug": "iphone",
  "priceFrom": 129990,
  "oldPriceFrom": 139990,
  "mainImageUrl": "url | null",
  "inStock": true,
  "badges": ["new"]
}
```

---

### `GET /reviews?page&limit`

**Query:** `page`, `limit` (default 24).

**Response 200 — `data`:**
```json
[
  {
    "id": "uuid",
    "name": "Автор",
    "text": "string",
    "source": "yandex",
    "rating": 5
  }
]
```
+ `meta: { page, limit, total }`

---

### `GET /cms/:slug`

**Params:** `slug` — slug CMS-страницы.

**Response 200 — `data`:**
```json
{
  "slug": "delivery",
  "title": "Доставка",
  "content": "HTML/Markdown",
  "metaDescription": "string | null"
}
```

**404** — страница не найдена или не опубликована.

---

### `GET /catalog/categories`

Дерево категорий (только `is_active: true`).

**Response 200 — `data`:**
```json
[
  {
    "id": "uuid",
    "slug": "apple",
    "name": "Apple",
    "isBrand": true,
    "brandLogoUrl": "string | null",
    "icon": "🍎",
    "image": "url | null",
    "description": "string | null",
    "externalLink": "string | null",
    "children": [
      {
        "id": "uuid",
        "slug": "iphone",
        "name": "iPhone",
        "icon": "📱",
        "image": "url | null"
      }
    ]
  }
]
```

---

### `GET /catalog/products?…`

**Query (все опциональны):**

| Param | Тип | Описание |
|-------|-----|----------|
| `category` | string | slug подкатегории |
| `brand` | string | slug бренда |
| `priceMin` | number | ≥ 0 |
| `priceMax` | number | ≥ 0 |
| `memory` | string | фильтр по памяти |
| `color` | string | фильтр по цвету |
| `inStock` | `true` \| `false` | |
| `sort` | `price_asc` \| `price_desc` \| `newest` | |
| `page`, `limit` | number | пагинация |

**Response 200 — `data`:** массив `ProductListItem` + `meta`.

---

### `GET /catalog/products/:slug`

**Params:** `slug` товара.

**Response 200 — `data`:**
```json
{
  "id": "uuid",
  "slug": "iphone-16-pro",
  "title": "string",
  "brandName": "Apple",
  "brandSlug": "apple",
  "subcategorySlug": "iphone",
  "deviceType": "smartphone",
  "description": "string | null",
  "images": ["url1", "url2"],
  "features": [
    { "title": "string", "description": "string", "icon": "url | null" }
  ],
  "specifications": {
    "Экран": { "Диагональ": "6.3\"" }
  },
  "variants": [
    {
      "id": "uuid",
      "sku": "string",
      "memory": "256 ГБ",
      "color": "Natural Titanium",
      "colorHex": "#8F8A81",
      "price": 129990,
      "oldPrice": 139990,
      "inStock": true,
      "quantityAvailable": 5
    }
  ],
  "badges": ["new"],
  "rating": 4.8,
  "reviewsCount": 12,
  "inStock": true
}
```

**404** — товар не найден / не опубликован.

---

## Auth — `/api/v1/auth`

Mutating: `X-Requested-With: maze-web`.

### `POST /sms/send`

Отправка OTP. Anti-enumeration — всегда один ответ.

**Body:**
```json
{ "phone": "+79161234567" }
```
`phone`: 10–20 символов, нормализуется в `+7XXXXXXXXXX`.

**Response 200 — `data`:**
```json
{ "message": "Если номер корректен, код отправлен" }
```

**Cookie:** не ставит.  
**Dev:** код OTP в логах sms-worker.

---

### `POST /sms/verify`

Вход в ЛК. Merge гостевой корзины → user.

**Body:**
```json
{
  "phone": "+79161234567",
  "code": "123456"
}
```
`code`: ровно 6 цифр.

**Response 200 — `data`:**
```json
{
  "accessToken": "jwt",
  "expiresIn": 900,
  "user": {
    "id": "uuid",
    "phone": "+79161234567",
    "firstName": "Иван | null",
    "lastName": "Петров | null"
  }
}
```

**Set-Cookie:** `maze_refresh` (HttpOnly, 7 дней).

**Errors:** `401` неверный код, `429` rate limit.

---

### `POST /refresh`

Ротация refresh-токена.

**Cookie:** `maze_refresh` (обязателен).

**Body:** пустой `{}` или без body.

**Response 200 — `data`:**
```json
{
  "accessToken": "jwt",
  "expiresIn": 900
}
```

**Set-Cookie:** новый `maze_refresh`.  
**401** — нет/невалидный refresh.

---

### `POST /logout`

**Cookie:** `maze_refresh` (если есть — revoke).

**Response 200 — `data`:**
```json
{ "ok": true }
```

**Clear-Cookie:** `maze_refresh`.

---

## Staff Auth — `/api/v1/auth/staff`

### `POST /login`

**Body:**
```json
{
  "email": "manager@maze.ru",
  "password": "manager123"
}
```
`password`: 8–128 символов.

**Response 200 — `data`:**
```json
{
  "accessToken": "jwt",
  "expiresIn": 900,
  "staff": {
    "id": "uuid",
    "role": "manager | admin",
    "email": "manager@maze.ru",
    "firstName": "string | null",
    "lastName": "string | null"
  }
}
```

**Set-Cookie:** `maze_staff_refresh`.

---

### `POST /logout`

**Cookie:** `maze_staff_refresh`.

**Response 200 — `data`:**
```json
{ "ok": true }
```

---

## Cart — `/api/v1/cart`

**Auth:** cookie `maze_guest` и/или Bearer user.  
При первом визите ставится `maze_guest`.  
Mutating: `X-Requested-With: maze-web`.

**Лимиты:** max 30 позиций, max 10 шт. на variant.

### `GET /`

**Response 200 — `data`:**
```json
{
  "items": [
    {
      "variantId": "uuid",
      "productId": "uuid",
      "slug": "iphone-16-pro",
      "title": "iPhone 16 Pro",
      "variantLabel": "256 ГБ / Natural Titanium",
      "quantity": 1,
      "unitPrice": 129990,
      "lineTotal": 129990,
      "maxQuantity": 5,
      "inStock": true
    }
  ],
  "summary": {
    "itemsCount": 1,
    "subtotalRub": 129990,
    "limits": { "maxLines": 30, "maxQtyPerLine": 10 }
  }
}
```

---

### `PUT /`

Полная замена корзины.

**Body:**
```json
{
  "items": [
    { "variantId": "uuid", "quantity": 2 }
  ]
}
```
max 30 items, quantity 1–10.

**Response 200:** тот же формат, что `GET /`.

---

### `POST /items`

Добавить / увеличить количество.

**Body:**
```json
{ "variantId": "uuid", "quantity": 1 }
```

**Response 200:** CartDto.

---

### `DELETE /items/:variantId`

**Params:** `variantId` (uuid).

**Response 200:** CartDto.

---

### `DELETE /`

Очистить корзину.

**Response 200:** пустая CartDto.

---

## Delivery — `/api/v1/delivery`

Требует cart owner (guest cookie / user token).

### `POST /quote`

Расчёт доставки (async worker).

**Body:**
```json
{
  "provider": "pickup | spb_courier | spb_yandex | rf_cdek | rf_yandex",
  "city": "Санкт-Петербург",
  "address": {
    "street": "Невский пр.",
    "house": "1",
    "flat": "10",
    "postalCode": "190000"
  },
  "items": [
    { "variantId": "uuid", "quantity": 1 }
  ]
}
```
`address` опционален. `items`: 1–30 позиций.

**Response 200 — `data`:**
```json
{
  "quoteId": "uuid",
  "status": "pending | ready | failed",
  "priceRub": 590,
  "etaDays": 2,
  "expiresAt": "2026-06-23T18:00:00.000Z"
}
```
`priceRub`, `etaDays`, `expiresAt` — когда `status: ready`.  
TTL quote: **15 минут**.

---

### `GET /quote/:quoteId`

Poll статуса quote. Quote привязан к cart owner.

**Params:** `quoteId` (uuid).

**Response 200:** тот же `QuoteResponseDto`.

**404** — quote не найден / чужой owner.

---

## Orders — `/api/v1/orders`

### `POST /`

Checkout. **201 Created.**

**Headers:** `Idempotency-Key` (uuid), `X-Requested-With`.  
**Auth:** guest cookie и/или Bearer user.

**Body:**
```json
{
  "customer": {
    "phone": "+79161234567",
    "firstName": "Иван",
    "lastName": "Петров",
    "email": "ivan@example.com"
  },
  "delivery": {
    "quoteId": "uuid",
    "comment": "Позвонить за час"
  },
  "payment": {
    "method": "cash | card_qr | installment | invoice_b2b"
  },
  "installmentBundle": {
    "accessoryVariantIds": ["uuid", "uuid"]
  },
  "companyId": null,
  "comment": "Комментарий к заказу"
}
```
`email`, `installmentBundle`, `companyId`, `comment` — опциональны.  
Цены **не передаются** — сервер считает сам.

**Response 201 — `data`:**
```json
{
  "orderId": "uuid",
  "orderNumber": "MZ-10482",
  "status": "pending",
  "totals": {
    "subtotalRub": 129990,
    "deliveryRub": 590,
    "paymentFeeRub": 0,
    "installmentFeeRub": 0,
    "totalRub": 130580
  },
  "pricingVersion": "v1.2026-06"
}
```

Повтор с тем же `Idempotency-Key` → **тот же 201**.

**Errors:** `409 ORDER_OUT_OF_STOCK`, `409 QUOTE_EXPIRED`, `409 QUOTE_INVALID`, `409 IDEMPOTENCY_CONFLICT`.

---

## User — `/api/v1/me`

**Auth:** Bearer user (`X-Requested-With` на mutating).

### `GET /`

**Response 200 — `data`:**
```json
{
  "id": "uuid",
  "phone": "+79161234567",
  "firstName": "string | null",
  "lastName": "string | null",
  "middleName": "string | null",
  "email": "string | null",
  "gender": "male | female | null",
  "birthDate": "1990-01-01 | null",
  "subscribeEmail": false,
  "subscribeSms": false
}
```

---

### `PATCH /`

**Body (все поля опциональны):**
```json
{
  "firstName": "Иван",
  "lastName": "Петров",
  "email": "ivan@example.com",
  "subscribeEmail": true,
  "subscribeSms": false
}
```

**Response 200:** обновлённый профиль (как `GET /`).  
При смене подписок → запись в `user_consents`.

---

### `GET /addresses`

**Response 200 — `data`:** массив Address.

### `POST /addresses`

**Body:**
```json
{
  "type": "home | work",
  "city": "Санкт-Петербург",
  "street": "Невский пр.",
  "house": "1",
  "flat": "10",
  "building": "А",
  "floor": "3",
  "isDefault": true
}
```
`flat` в API = `apartment` в БД. `building`, `floor`, `flat`, `isDefault` опциональны.

**Response 200 — `data` — Address:**
```json
{
  "id": "uuid",
  "type": "home",
  "city": "string",
  "street": "string",
  "house": "string",
  "building": "string | null",
  "apartment": "string | null",
  "floor": "string | null",
  "isDefault": true
}
```

---

### `PATCH /addresses/:id`

**Body:** partial Address body (как POST).

**Response 200:** Address.

---

### `DELETE /addresses/:id`

**Response 200 — `data`:**
```json
{ "ok": true }
```

---

### `GET /companies`

**Response 200 — `data`:** массив Company.

### `POST /companies`

**Body:**
```json
{
  "name": "ООО Рога",
  "inn": "7812345678",
  "kpp": "781201001",
  "address": "юр. адрес"
}
```

**Response 200 — `data` — Company:**
```json
{
  "id": "uuid",
  "name": "string",
  "inn": "string",
  "kpp": "string | null",
  "address": "string"
}
```

---

### `PATCH /companies/:id` · `DELETE /companies/:id`

PATCH — partial body, returns Company.  
DELETE — `{ "ok": true }`.

---

### `GET /favorites`

**Response 200 — `data`:** массив `ProductListItem`.

---

### `POST /favorites/:productId`

**Params:** `productId` (uuid, published product).

**Response 200 — `data`:**
```json
{ "ok": true }
```

---

### `DELETE /favorites/:productId`

**Response 200 — `data`:**
```json
{ "ok": true }
```

**404** — не в избранном.

---

### `PATCH /consents`

**Body:**
```json
{
  "subscribeEmail": true,
  "subscribeSms": false,
  "source": "profile"
}
```

**Response 200:** профиль (как `GET /`).

---

### `GET /orders?page&limit`

**Response 200 — `data`:**
```json
[
  {
    "id": "uuid",
    "orderNumber": "MZ-10482",
    "status": "pending",
    "totalRub": 130580,
    "itemsCount": 2,
    "createdAt": "2026-06-23T12:00:00.000Z"
  }
]
```
+ `meta`. Только заказы текущего user (IDOR-safe).

---

### `GET /orders/:id`

**Response 200 — `data`:**
```json
{
  "id": "uuid",
  "orderNumber": "MZ-10482",
  "status": "pending",
  "customer": {
    "firstName": "Иван",
    "lastName": "Петров",
    "phone": "+79161234567",
    "email": "ivan@example.com | null"
  },
  "totals": {
    "subtotalRub": 129990,
    "deliveryRub": 590,
    "paymentFeeRub": 0,
    "installmentFeeRub": 0,
    "totalRub": 130580
  },
  "delivery": {
    "type": "spb_courier",
    "city": "Санкт-Петербург",
    "street": "Невский пр.",
    "house": "1",
    "apartment": "10 | null",
    "requiresPrepay": false
  },
  "payment": {
    "methodCode": "cash",
    "methodName": "Наличные",
    "isPaid": false
  },
  "items": [
    {
      "id": "uuid",
      "name": "iPhone 16 Pro",
      "image": "url",
      "color": "Natural Titanium | null",
      "memory": "256 ГБ | null",
      "unitPrice": 129990,
      "quantity": 1,
      "lineTotal": 129990
    }
  ],
  "comment": "string | null",
  "pricingVersion": "v1.2026-06",
  "createdAt": "2026-06-23T12:00:00.000Z"
}
```

**404** — чужой или несуществующий заказ.

---

## Manager — `/api/v1/manager`

**Auth:** Bearer staff (`manager` или `admin`).

### `GET /orders?status&page&limit&assignedTo`

**Query:**

| Param | Default | Описание |
|-------|---------|----------|
| `status` | — | фильтр по статусу |
| `assignedTo` | `me` | `me` — только назначенные мне; `all` — все заказы |
| `page`, `limit` | 1, 24 | пагинация |

**Response 200 — `data`:**
```json
[
  {
    "id": "uuid",
    "orderNumber": "MZ-10482",
    "status": "pending",
    "totalRub": 130580,
    "itemsCount": 2,
    "customer": {
      "firstName": "Иван",
      "lastName": "Петров",
      "phone": "+79161234567"
    },
    "assignedManagerId": "uuid | null",
    "createdAt": "2026-06-23T12:00:00.000Z"
  }
]
```
+ `meta`.

---

### `GET /orders/:id`

**Response 200 — `data`:** UserOrderDetail **+**:
```json
{
  "userId": "uuid | null",
  "assignedManagerId": "uuid | null",
  "notes": [
    {
      "id": "uuid",
      "staffUserId": "uuid",
      "text": "string",
      "createdAt": "ISO"
    }
  ],
  "statusHistory": [
    {
      "id": "uuid",
      "fromStatus": "pending | null",
      "toStatus": "confirmed",
      "staffUserId": "uuid | null",
      "note": "string | null",
      "createdAt": "ISO"
    }
  ]
}
```

---

### `PATCH /orders/:id/status`

**Body:**
```json
{
  "status": "confirmed | awaiting_payment | paid | shipping | delivered | cancelled",
  "comment": "опциональный комментарий"
}
```

При **`paid`**: списание stock + outbox `order.paid` + `payment.isPaid = true`.  
При **`cancelled`** (из не-paid): снятие резерва stock.

**Response 200:** полный ManagerOrderDetail.

---

### `POST /orders/:id/notes`

**Body:**
```json
{ "text": "Согласовали доставку на пятницу" }
```

**Response 200 — `data`:**
```json
{
  "id": "uuid",
  "staffUserId": "uuid",
  "text": "string",
  "createdAt": "ISO"
}
```

---

### `PATCH /orders/:id/assign`

**Auth:** admin only.

**Body:**
```json
{ "managerId": "uuid" }
```

**Response 200 — `data`:**
```json
{
  "orderId": "uuid",
  "assignedManagerId": "uuid"
}
```

---

## Admin — `/api/v1/admin`

**Auth:** Bearer staff `role: admin`.  
Mutating: `X-Requested-With`.  
После mutate — инвалидация Redis-кэша каталога/главной.

### `PATCH /site-settings`

**Body:** произвольный JSON-patch поверх `site_settings.public`:
```json
{
  "phone": "+79959114984",
  "address": "г. Санкт-Петербург, ...",
  "hours": "11:30 – 20:30"
}
```

**Response 200 — `data`:** `PublicSettings` (как `/settings/public`).

---

### `PUT /editor-choice`

**Body:**
```json
{
  "productIds": ["uuid", "..."]
}
```
8–12 uuid опубликованных товаров.

**Response 200 — `data`:**
```json
{ "productIds": ["uuid", "..."] }
```

---

### Categories — `/admin/categories`

| Method | Path | Body / Query | Response `data` |
|--------|------|--------------|-----------------|
| GET | `/` | `?includeDeleted=true` | массив CategoryAdmin |
| GET | `/:id` | `?includeDeleted=true` | CategoryAdmin |
| POST | `/` | CategoryBody | CategoryAdmin |
| PATCH | `/:id` | partial CategoryBody | CategoryAdmin |
| DELETE | `/:id` | — | `{ "ok": true }` |
| POST | `/:id/restore` | — | CategoryAdmin |

**CategoryBody:**
```json
{
  "slug": "apple",
  "name": "Apple",
  "parentId": "uuid | null",
  "isBrand": true,
  "brandLogoUrl": "string | null",
  "icon": "🍎",
  "image": "url | null",
  "description": "string | null",
  "externalLink": "url | null",
  "sortOrder": 0,
  "isActive": true
}
```

**CategoryAdmin** = CategoryBody fields + `id`, `createdAt`, `updatedAt`.

---

### Products — `/admin/products`

| Method | Path | Body / Query | Response |
|--------|------|--------------|----------|
| GET | `/` | `?page&limit&search` | ProductAdminSummary[] + meta |
| GET | `/:id` | `?includeDeleted=true` | ProductAdminDetail |
| POST | `/` | ProductBody | ProductAdminSummary |
| PATCH | `/:id` | partial ProductBody | ProductAdminSummary |
| DELETE | `/:id` | — | `{ "ok": true }` |
| POST | `/:id/restore` | — | ProductAdminSummary |
| PATCH | `/:id/stock` | `{ "quantity": 10 }` | `{ productId, quantity, variantCount }` |

**ProductBody:**
```json
{
  "slug": "iphone-16-pro",
  "name": "iPhone 16 Pro",
  "categoryId": "uuid",
  "subcategoryId": "uuid",
  "deviceType": "smartphone",
  "description": "string | null",
  "basePrice": 129990,
  "oldPrice": 139990,
  "badgeType": "new | null",
  "badgeText": "string | null",
  "isPublished": true
}
```

**ProductAdminDetail** = summary + `description`, `images[]`, `features[]`, `variants[]`, `specifications[]`.

---

### Variants — `/admin/products/:productId/variants`

| Method | Path | Body | Response |
|--------|------|------|----------|
| GET | `/` | — | VariantAdmin[] |
| POST | `/` | VariantBody | VariantAdmin |
| PATCH | `/:variantId` | partial VariantBody | VariantAdmin |
| DELETE | `/:variantId` | — | `{ "ok": true }` |
| POST | `/:variantId/restore` | — | VariantAdmin |

**VariantBody:**
```json
{
  "sku": "iphone-16-pro-256-natural",
  "colorName": "Natural Titanium",
  "colorHex": "#8F8A81",
  "memory": "256 ГБ",
  "price": 129990,
  "isAvailable": true,
  "quantity": 5
}
```

**VariantAdmin:**
```json
{
  "id": "uuid",
  "productId": "uuid",
  "sku": "string",
  "colorName": "string",
  "colorHex": "#RRGGBB",
  "memory": "string | null",
  "price": 129990,
  "isAvailable": true,
  "quantity": 5,
  "reservedQuantity": 0,
  "quantityAvailable": 5
}
```

---

### Banners — `/admin/banners`

CRUD: GET list, GET `/:id`, POST, PATCH `/:id`, DELETE `/:id`.

**Body:**
```json
{
  "title": "string",
  "subtitle": "string | null",
  "imageUrl": "https://...",
  "link": "/catalog",
  "size": "large",
  "sortOrder": 0,
  "isActive": true
}
```

**Response item:**
```json
{
  "id": "uuid",
  "title": "string",
  "subtitle": "string | null",
  "imageUrl": "url",
  "link": "string",
  "size": "large",
  "sortOrder": 0,
  "isActive": true,
  "createdAt": "ISO",
  "updatedAt": "ISO"
}
```

---

### Info slides — `/admin/info-slides`

CRUD аналогично banners.

**Body:**
```json
{
  "icon": "🚚",
  "title": "string",
  "description": "string",
  "sortOrder": 0,
  "isActive": true
}
```

---

### CMS pages — `/admin/cms-pages`

CRUD аналогично.

**Body:**
```json
{
  "slug": "delivery",
  "title": "Доставка",
  "content": "HTML",
  "metaDescription": "string | null",
  "isPublished": true
}
```

---

### `POST /uploads`

**Content-Type:** `multipart/form-data`, поле `file`.  
**Limits:** jpeg/png/webp, max 5 MB.  
**CSRF:** `X-Requested-With: maze-web`.

**Response 200 — `data`:**
```json
{
  "url": "http://localhost:4000/uploads/uuid.jpg",
  "filename": "uuid.jpg"
}
```

---

## Статусы заказов

| Статус | Кто ставит | Описание |
|--------|------------|----------|
| `pending` | checkout | Создан на сайте |
| `confirmed` | manager | Согласован |
| `awaiting_payment` | manager | Ждёт оплаты |
| `paid` | manager | Оплачен, stock списан |
| `shipping` | manager | В доставке |
| `delivered` | manager | Доставлен |
| `cancelled` | manager / cron | Отменён, резерв снят |

---

## Коды ошибок (основные)

| code | HTTP | Когда |
|------|------|-------|
| `VALIDATION_ERROR` | 400 | Zod / бизнес-валидация |
| `UNAUTHORIZED` | 401 | нет/неверный Bearer или refresh |
| `FORBIDDEN` | 403 | нет прав / не admin |
| `CSRF_VALIDATION_FAILED` | 403 | нет `X-Requested-With` |
| `NOT_FOUND` | 404 | ресурс не найден |
| `ORDER_OUT_OF_STOCK` | 409 | нет на складе |
| `QUOTE_EXPIRED` | 409 | quote истёк (>15 мин) |
| `QUOTE_INVALID` | 409 | quote не совпадает с корзиной |
| `CART_LIMIT_EXCEEDED` | 409 | лимит корзины |
| `DUPLICATE_RESOURCE` | 409 | slug/sku занят |
| `RATE_LIMIT_EXCEEDED` | 429 | rate limit |
| `INTERNAL_ERROR` | 500 | неожиданная ошибка |

---

## Сводная таблица

| Method | Path | Auth |
|--------|------|------|
| GET | `/health/live` | — |
| GET | `/health/ready` | — |
| GET | `/uploads/*` | — |
| GET | `/api/v1/settings/public` | — |
| GET | `/api/v1/home` | — |
| GET | `/api/v1/reviews` | — |
| GET | `/api/v1/cms/:slug` | — |
| GET | `/api/v1/catalog/categories` | — |
| GET | `/api/v1/catalog/products` | — |
| GET | `/api/v1/catalog/products/:slug` | — |
| POST | `/api/v1/auth/sms/send` | — |
| POST | `/api/v1/auth/sms/verify` | — |
| POST | `/api/v1/auth/refresh` | cookie |
| POST | `/api/v1/auth/logout` | cookie |
| POST | `/api/v1/auth/staff/login` | — |
| POST | `/api/v1/auth/staff/logout` | cookie |
| GET/PUT/POST/DELETE | `/api/v1/cart/*` | guest/user |
| POST/GET | `/api/v1/delivery/quote/*` | guest/user |
| POST | `/api/v1/orders` | guest/user |
| GET/PATCH | `/api/v1/me` | user |
| CRUD | `/api/v1/me/addresses/*` | user |
| CRUD | `/api/v1/me/companies/*` | user |
| GET/POST/DELETE | `/api/v1/me/favorites/*` | user |
| PATCH | `/api/v1/me/consents` | user |
| GET | `/api/v1/me/orders/*` | user |
| GET/PATCH/POST | `/api/v1/manager/orders/*` | staff |
| PATCH | `/api/v1/manager/orders/:id/assign` | admin |
| CRUD | `/api/v1/admin/*` | admin |
