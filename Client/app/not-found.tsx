import type { Metadata } from "next";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { ScrollToTop } from "@/components/ScrollToTop";
import { StorefrontModals } from "@/components/StorefrontModals";
import { NotFoundMaze } from "@/features/not-found-maze";
import { SmoothScroll } from "@/shared/ui/smooth-scroll";

export const metadata: Metadata = {
  title: "404 — Страница не найдена",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <SmoothScroll>
      <Header />
      <main className="flex-1">
        <NotFoundMaze />
      </main>
      <Footer />
      <StorefrontModals />
      <ScrollToTop />
    </SmoothScroll>
  );
}
