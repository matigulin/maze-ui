import { Suspense } from "react";
import { AccountClient } from "@/components/account/AccountClient";

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
        <AccountClient initialTab={tab} />
      </Suspense>
    </div>
  );
}
