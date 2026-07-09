import { apiGet } from "@/lib/api";
import {
  CATEGORIES,
  FEATURES,
  BRANDS,
  STORE,
  reviews as mockReviews,
  type Review,
} from "@/lib/data";
import { shouldUseMocks } from "@/lib/mocks";

export type NavCategory = {
  slug: string;
  name: string;
  count: number;
  icon: string;
  tint: [string, string];
  imageUrl?: string | null;
};

export type UiFeature = {
  icon: string;
  emoji?: string;
  title: string;
  text: string;
};

export type StoreInfo = {
  phone: string;
  city: string;
  address: string;
  metro: string;
  hours: string;
  socials: string[];
};

export type SiteChrome = {
  categories: NavCategory[];
  store: StoreInfo;
  partnerBrands: string[];
};

type CategoryTreeItemDto = {
  slug: string;
  name: string;
  icon: string | null;
  image: string | null;
  children: Array<{ slug: string }>;
};

type ReviewDto = {
  id: string;
  name: string;
  text: string;
  source: string;
  rating: number;
};

type HomeAdvantageDto = {
  id: string;
  icon: string;
  title: string;
  desc: string;
};

type HomePartnerBrandDto = {
  name: string;
};

const CATEGORY_TINTS: Record<string, [string, string]> = {
  apple: ["#7dd3fc", "#a78bfa"],
  samsung: ["#60a5fa", "#22d3ee"],
  sony: ["#818cf8", "#38bdf8"],
  marshall: ["#fbbf24", "#f472b6"],
  dyson: ["#34d399", "#22d3ee"],
  harman: ["#c084fc", "#f472b6"],
  gaming: ["#60a5fa", "#818cf8"],
  accessories: ["#f472b6", "#a78bfa"],
  used: ["#34d399", "#4ade80"],
};

const CATEGORY_ICONS: Record<string, string> = {
  apple: "apple",
  samsung: "smartphone",
  sony: "gamepad",
  marshall: "speaker",
  dyson: "wind",
  harman: "audio",
  gaming: "console",
  accessories: "headphones",
  used: "recycle",
};

const REVIEW_HUES = ["#35e4f0", "#ff3d8b", "#8b5cf6", "#3b82f6", "#22d3ee", "#a78bfa"];

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

function mapCategory(dto: CategoryTreeItemDto): NavCategory {
  return {
    slug: dto.slug,
    name: dto.name,
    count: Math.max(dto.children.length, 1),
    icon: CATEGORY_ICONS[dto.slug] ?? "smartphone",
    tint: CATEGORY_TINTS[dto.slug] ?? ["#22d3ee", "#a78bfa"],
    imageUrl: dto.image,
  };
}

function formatPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 11 && digits.startsWith("7")) {
    return `+7 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7, 9)}-${digits.slice(9, 11)}`;
  }
  return phone;
}

export async function fetchSiteChrome(): Promise<SiteChrome> {
  if (shouldUseMocks()) {
    return {
      categories: CATEGORIES.map((c) => ({
        slug: c.slug,
        name: c.name,
        count: c.count,
        icon: c.icon,
        tint: c.tint as [string, string],
      })),
      store: STORE,
      partnerBrands: BRANDS,
    };
  }

  const [categories, settings, home] = await Promise.all([
    apiGet<CategoryTreeItemDto[]>("/catalog/categories"),
    apiGet<{
      phone: string;
      address: string;
      metro: string;
      workingHours: string;
    }>("/settings/public"),
    apiGet<{ partnerBrands: HomePartnerBrandDto[] }>("/home"),
  ]);

  const [city, ...addressParts] = settings.address.split(",").map((s) => s.trim());

  return {
    categories: categories.map(mapCategory),
    store: {
      phone: formatPhone(settings.phone),
      city: city || "Санкт-Петербург",
      address: addressParts.join(", ") || settings.address,
      metro: settings.metro,
      hours: settings.workingHours,
      socials: ["TG", "VK", "YT"],
    },
    partnerBrands: home.partnerBrands.map((b) => b.name),
  };
}

export async function fetchHomeFeatures(): Promise<UiFeature[]> {
  if (shouldUseMocks()) {
    return FEATURES.map((f) => ({
      icon: f.icon,
      title: f.title,
      text: f.text,
    }));
  }

  const home = await apiGet<{ advantages: HomeAdvantageDto[] }>("/home");
  return home.advantages.map((a) => ({
    icon: "star",
    emoji: a.icon,
    title: a.title,
    text: a.desc,
  }));
}

export async function fetchReviews(limit = 8): Promise<Review[]> {
  if (shouldUseMocks()) {
    return mockReviews;
  }

  const items = await apiGet<ReviewDto[]>("/reviews", { limit, page: 1 });
  return items.map((r, i) => ({
    name: r.name,
    initials: initials(r.name),
    text: r.text,
    rating: r.rating,
    product: r.source,
    hue: REVIEW_HUES[i % REVIEW_HUES.length],
  }));
}

export async function fetchPartnerBrands(): Promise<string[]> {
  if (shouldUseMocks()) return BRANDS;
  const home = await apiGet<{ partnerBrands: HomePartnerBrandDto[] }>("/home");
  return home.partnerBrands.map((b) => b.name);
}
