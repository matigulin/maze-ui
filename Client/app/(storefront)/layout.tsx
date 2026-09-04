import { Suspense } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { StorefrontModals } from "@/components/StorefrontModals";
import { ScrollToTop } from "@/components/ScrollToTop";
import { RouteScrollReset } from "@/shared/ui/route-scroll-reset";
import { SmoothScroll } from "@/shared/ui/smooth-scroll";

export default function StorefrontLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SmoothScroll>
      <Header />
      <main className="flex-1 pt-[4.75rem] sm:pt-[5.5rem] md:pt-[5.75rem]">{children}</main>
      <Footer />
      <StorefrontModals />
      <Suspense fallback={null}>
        <RouteScrollReset />
      </Suspense>
      <ScrollToTop />
    </SmoothScroll>
  );
}
