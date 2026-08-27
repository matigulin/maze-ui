/** Скролл окна — логотип, «Наверх», сброс при навигации. */

export function getWindowScrollY(): number {
  if (typeof window === "undefined") return 0;
  return (
    window.scrollY ||
    document.documentElement.scrollTop ||
    document.body.scrollTop ||
    0
  );
}

export function scrollWindowToTop(behavior: ScrollBehavior = "smooth"): void {
  if (typeof window === "undefined") return;
  window.scrollTo({ top: 0, left: 0, behavior });
}

/** Мгновенный сброс при смене роута — без «долистывания» со старой страницы. */
export function resetWindowScroll(): void {
  scrollWindowToTop("auto");
}
