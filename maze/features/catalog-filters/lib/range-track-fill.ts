/** Диаметр thumb у `.maze-range-input` — должен совпадать с CSS. */
export const RANGE_THUMB_PX = 18;

/**
 * Ширина заливки до центра thumb.
 * Нативный range двигает центр как: p * (W − T) + T/2.
 */
export function rangeFillWidth(
  value: number,
  max: number,
  thumbPx = RANGE_THUMB_PX,
): string {
  const p = max > 0 ? Math.min(1, Math.max(0, value / max)) : 0;
  return `calc(${p} * (100% - ${thumbPx}px) + ${thumbPx / 2}px)`;
}
