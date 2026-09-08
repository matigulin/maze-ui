/** Обрезано до 18 с (до появления логотипа). ?v= — сброс кэша браузера */
export const HERO_VIDEO_SRC = "/media/hero-bg.mp4?v=18cut";

/** Секция hero на главной — якорь для прозрачного навбара над видео. */
export const HERO_SECTION_ID = "home-hero";

/** Высота зоны fixed-header: когда низ hero уходит выше — включаем solid pill. */
export const HERO_NAV_SOLID_OFFSET_PX = 80;

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
