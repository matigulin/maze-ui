/** @deprecated Импортируй из `@/features/checkout` */
export {
  checkoutCart,
  createOrder,
  requestDeliveryQuote,
  getDeliveryQuote,
  waitForQuoteReady,
  mapUiDeliveryProvider,
  mapUiPaymentMethod,
} from "@/features/checkout";
export type {
  DeliveryProvider,
  CheckoutPaymentMethod,
  DeliveryQuoteDto,
  CreateOrderResponse,
} from "@/features/checkout";
