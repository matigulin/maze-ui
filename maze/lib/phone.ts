/** Клиентская нормализация — зеркало Server/src/lib/phone.ts */
export const PHONE_COUNTRY_PREFIX = "+7";

/** Маска национальной части без кода страны: (999) 123-45-67 */
export function maskNationalPhoneInput(value: string): string {
  let digits = value.replace(/\D/g, "");
  if (digits.startsWith("7") || digits.startsWith("8")) {
    digits = digits.slice(1);
  }
  digits = digits.slice(0, 10);

  if (digits.length === 0) return "";

  const a = digits.slice(0, 3);
  const b = digits.slice(3, 6);
  const c = digits.slice(6, 8);
  const d = digits.slice(8, 10);

  if (digits.length <= 3) return `(${a}`;
  if (digits.length <= 6) return `(${a}) ${b}`;
  if (digits.length <= 8) return `(${a}) ${b}-${c}`;
  return `(${a}) ${b}-${c}-${d}`;
}

export function nationalPhoneToE164(nationalMasked: string): string {
  return normalizePhone(nationalMasked);
}

export function e164ToNationalDisplay(phone: string): string {
  const match = phone.match(/^\+7(\d{10})$/);
  if (!match) return "";
  return maskNationalPhoneInput(match[1]);
}

export function normalizePhone(input: string): string {
  const trimmed = input.trim();
  const digits = trimmed.replace(/\D/g, "");

  if (/^\+7\d{10}$/.test(trimmed)) {
    return trimmed;
  }

  if (digits.length === 11 && (digits.startsWith("7") || digits.startsWith("8"))) {
    return `+7${digits.slice(1)}`;
  }

  if (digits.length === 10) {
    return `+7${digits}`;
  }

  throw new Error("Некорректный номер телефона");
}

export function formatPhoneDisplay(phone: string): string {
  const match = phone.match(/^\+7(\d{3})(\d{3})(\d{2})(\d{2})$/);
  if (!match) return phone;
  return `${PHONE_COUNTRY_PREFIX} (${match[1]}) ${match[2]}-${match[3]}-${match[4]}`;
}
