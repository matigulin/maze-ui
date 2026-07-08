import { CartClient } from "@/components/cart/CartClient";

export default function CartPage() {
  return (
    <div className="container-x py-10 md:py-14">
      <h1 className="mb-8 font-display text-4xl font-bold tracking-tight sm:text-5xl">
        Корзина
      </h1>
      <CartClient />
    </div>
  );
}
