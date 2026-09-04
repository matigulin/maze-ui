import { Suspense } from "react";
import { OrdersListPage } from "@/components/admin/AdminOrdersPages";

export default function Page() {
  return (
    <Suspense fallback={<p className="text-sm text-muted">Загрузка…</p>}>
      <OrdersListPage />
    </Suspense>
  );
}
