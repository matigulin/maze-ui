/** Реэкспорт из entity — единые labels для админки и ЛК. */
export {
  ORDER_STATUS_LABEL,
  TERMINAL_ORDER_STATUSES,
  orderStatusLabel,
  orderStatusColor,
  orderStatusStyle,
  orderStatusClassName,
  isActiveOrderStatus,
} from "@/entities/order";

export type { OrderStatus } from "@/entities/order";
