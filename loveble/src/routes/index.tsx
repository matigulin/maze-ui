import { createFileRoute } from "@tanstack/react-router";
import "@/lib/fonts";
import { Splash } from "@/components/Splash";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Hero } from "@/components/sections/Hero";
import { InfoStrip } from "@/components/sections/InfoStrip";
import { Advantages } from "@/components/sections/Advantages";
import { TradeIn } from "@/components/sections/TradeIn";
import { EditorsChoice } from "@/components/sections/EditorsChoice";
import { MixedGrid } from "@/components/sections/MixedGrid";
import { NewArrivals } from "@/components/sections/NewArrivals";
import { Partners } from "@/components/sections/Partners";
import { ReviewsMap } from "@/components/sections/ReviewsMap";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "MAZE — премиальная техника в Санкт-Петербурге" },
      {
        name: "description",
        content:
          "Apple, Samsung, Dyson, PlayStation, Marshall. Оригинал, гарантия, trade-in и беспроцентная рассрочка. Шоурум на Чайковского, 56.",
      },
      { property: "og:title", content: "MAZE — найди свой путь в мире технологий" },
      {
        property: "og:description",
        content:
          "Премиальная электроника и сервис в Санкт-Петербурге. Доставка по всей России.",
      },
    ],
  }),
  component: Home,
});

function Home() {
  return (
    <div className="bg-white">
      <Splash />
      <Header />
      <main>
        <Hero />
        <InfoStrip />
        <Advantages />
        <TradeIn />
        <EditorsChoice />
        <MixedGrid />
        <NewArrivals />
        <Partners />
        <ReviewsMap />
      </main>
      <Footer />
    </div>
  );
}
