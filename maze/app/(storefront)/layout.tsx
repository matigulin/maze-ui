import { Background } from "@/components/Background";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { StorefrontModals } from "@/components/StorefrontModals";

export default function StorefrontLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Background />
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
      <StorefrontModals />
    </>
  );
}
