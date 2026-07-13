/** Клиентская нормализация — зеркало Server/src/lib/phone.ts */
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
  return `+7 (${match[1]}) ${match[2]}-${match[3]}-${match[4]}`;
}
