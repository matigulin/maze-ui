import { apiGet, apiPostJson } from "@/lib/api";

export type DeliveryProvider =
  | "pickup"
  | "spb_courier"
  | "spb_yandex"
  | "rf_cdek"
  | "rf_yandex";

export type CheckoutPaymentMethod = "cash" | "card_qr" | "installment" | "invoice_b2b";

export type DeliveryQuoteDto = {
  quoteId: string;
  status: "ready" | "pending" | "failed";
  priceRub?: number;
  etaDays?: number;
  expiresAt?: string;
};

export type CreateOrderResponse = {
  orderId: string;
  orderNumber: string;
  status: string;
  totals: {
    subtotalRub: number;
    deliveryRub: number;
    paymentFeeRub: number;
    installmentFeeRub: number;
    totalRub: number;
  };
  pricingVersion: string;
};

const PROVIDER_BY_UI: Record<string, DeliveryProvider> = {
  pickup: "pickup",
  courier: "spb_courier",
  yandex: "spb_yandex",
  cdek: "rf_cdek",
};

const PAYMENT_BY_UI: Record<string, CheckoutPaymentMethod> = {
  cash: "cash",
  card: "card_qr",
};

export function mapUiDeliveryProvider(uiId: string): DeliveryProvider {
  return PROVIDER_BY_UI[uiId] ?? "pickup";
}

export function mapUiPaymentMethod(uiId: string): CheckoutPaymentMethod {
  return PAYMENT_BY_UI[uiId] ?? "cash";
}

export async function requestDeliveryQuote(input: {
  provider: DeliveryProvider;
  city: string;
  address?: { street?: string; house?: string; flat?: string };
  items: Array<{ variantId: string; quantity: number }>;
  accessToken?: string | null;
}): Promise<DeliveryQuoteDto> {
  const { accessToken, ...body } = input;
  return apiPostJson<DeliveryQuoteDto>("/delivery/quote", body, {
    accessToken,
  });
}

export async function getDeliveryQuote(
  quoteId: string,
  accessToken?: string | null,
): Promise<DeliveryQuoteDto> {
  return apiGet<DeliveryQuoteDto>(`/delivery/quote/${quoteId}`, undefined, {
    credentials: "include",
    accessToken,
  });
}

export async function waitForQuoteReady(
  quoteId: string,
  {
    timeoutMs = 12000,
    intervalMs = 400,
    accessToken,
  }: { timeoutMs?: number; intervalMs?: number; accessToken?: string | null } = {},
): Promise<DeliveryQuoteDto> {
  const started = Date.now();
  let last = await getDeliveryQuote(quoteId, accessToken);

  while (last.status === "pending" && Date.now() - started < timeoutMs) {
    await new Promise((r) => setTimeout(r, intervalMs));
    last = await getDeliveryQuote(quoteId, accessToken);
  }

  if (last.status !== "ready") {
    throw new Error(
      last.status === "failed"
        ? "Не удалось рассчитать доставку"
        : "Таймаут расчёта доставки",
    );
  }

  return last;
}

export async function createOrder(input: {
  customer: {
    phone: string;
    firstName: string;
    lastName: string;
    email?: string;
  };
  delivery: { quoteId: string; comment?: string };
  payment: { method: CheckoutPaymentMethod };
  comment?: string;
  accessToken?: string | null;
  /** Один ключ на intent — передавать тот же при retry. */
  idempotencyKey: string;
}): Promise<CreateOrderResponse> {
  const { accessToken, idempotencyKey, ...body } = input;
  return apiPostJson<CreateOrderResponse>("/orders", body, {
    accessToken,
    headers: {
      "Idempotency-Key": idempotencyKey,
    },
  });
}

export async function checkoutCart(opts: {
  deliveryUiId: string;
  paymentUiId: string;
  firstName: string;
  lastName: string;
  phone: string;
  items: Array<{ variantId: string; quantity: number }>;
  accessToken?: string | null;
  /** Город доставки клиента (для quote). */
  city?: string;
  /** Адрес доставки клиента (для quote; не нужен для pickup). */
  address?: { street?: string; house?: string; flat?: string };
  /**
   * Один ключ на checkout intent — создаёт UI и держит между retry.
   * Не генерировать внутри этой функции.
   */
  idempotencyKey: string;
}): Promise<CreateOrderResponse> {
  const provider = mapUiDeliveryProvider(opts.deliveryUiId);
  const city =
    opts.city?.trim() ||
    (provider === "rf_cdek" || provider === "rf_yandex"
      ? "Москва"
      : "Санкт-Петербург");
  const address =
    provider === "pickup"
      ? undefined
      : (opts.address ?? { street: "Невский пр.", house: "1" });

  const lastName = opts.lastName.trim();
  if (!lastName) {
    throw new Error("Укажите фамилию в профиле перед оформлением");
  }

  let quote = await requestDeliveryQuote({
    provider,
    city,
    address,
    items: opts.items,
    accessToken: opts.accessToken,
  });

  if (quote.status === "pending") {
    quote = await waitForQuoteReady(quote.quoteId, {
      accessToken: opts.accessToken,
    });
  } else if (quote.status === "failed") {
    throw new Error("Не удалось рассчитать доставку");
  }

  return createOrder({
    customer: {
      firstName: opts.firstName.trim(),
      lastName,
      phone: opts.phone.trim(),
    },
    delivery: { quoteId: quote.quoteId },
    payment: { method: mapUiPaymentMethod(opts.paymentUiId) },
    accessToken: opts.accessToken,
    idempotencyKey: opts.idempotencyKey,
  });
}
