const UNSPLASH_HOST = "images.unsplash.com";

function isUnsplashUrl(url: string): boolean {
  try {
    return new URL(url).hostname === UNSPLASH_HOST;
  } catch {
    return false;
  }
}

/** Seed-фото на Unsplash с части сетей недоступны — отдаём через wsrv.nl. */
export function resolveMediaUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  if (!isUnsplashUrl(url)) return url;

  const params = new URLSearchParams({
    url,
    w: "800",
    q: "80",
    output: "webp",
  });
  return `https://wsrv.nl/?${params.toString()}`;
}

export function resolveMediaUrls(urls: string[] | null | undefined): string[] {
  if (!urls?.length) return [];
  return urls
    .map((u) => resolveMediaUrl(u))
    .filter((u): u is string => Boolean(u));
}
