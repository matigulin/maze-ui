/** Обрезано до 18 с (до появления логотипа). ?v= — сброс кэша браузера */
export const HERO_VIDEO_SRC = "/media/hero-bg.mp4?v=18cut";

export const HERO_COPY = {
  badge: "Более 12 000 клиентов нашли свой путь",
  title: "MAZE",
  subtitle: "Найди свой путь в мире",
  subtitleAccent: "технологий",
  quickLinks: [
    { href: "/catalog", label: "Каталог" },
    { href: "/#features", label: "Преимущества" },
    { href: "/#reviews", label: "Отзывы" },
    { href: "/account", label: "Кабинет" },
  ] as const,
} as const;
