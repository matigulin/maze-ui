import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Форматирует цену в рублях: 129990 → «129 990 ₽» (неразрывные пробелы — ₽ не переносится) */
export function formatPrice(value: number) {
  const amount = new Intl.NumberFormat("ru-RU")
    .format(value)
    .replace(/\s/g, "\u00A0");
  return `${amount}\u00A0₽`;
}

/** Склонение: plural(2, ['товар','товара','товаров']) → 'товара' */
export function plural(n: number, forms: [string, string, string]) {
  const a = Math.abs(n) % 100;
  const b = a % 10;
  if (a > 10 && a < 20) return forms[2];
  if (b > 1 && b < 5) return forms[1];
  if (b === 1) return forms[0];
  return forms[2];
}
