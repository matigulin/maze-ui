import { Suspense } from "react";
import { AccountCabinet } from "@/widgets/account-cabinet";

type Tab = "profile" | "orders" | "wishlist" | "addresses" | "company";
const VALID: Tab[] = ["profile", "orders", "wishlist", "addresses", "company"];

export default async function AccountPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const sp = await searchParams;
  const tab = VALID.includes(sp.tab as Tab) ? (sp.tab as Tab) : "profile";

  return (
    <div className="container-x py-10 md:py-14">
      <Suspense
        fallback={
          <div className="glass rounded-3xl p-10 text-sm text-muted">
            Загружаем личный кабинет…
          </div>
        }
      >
        <AccountCabinet initialTab={tab} />
      </Suspense>
    </div>
  );
}
