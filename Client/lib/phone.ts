import { parsePhoneNumberFromString } from "libphonenumber-js/mobile";

export const PHONE_COUNTRY_PREFIX = "+7";

export type PhoneValidationResult =
  | { ok: true; e164: string }
  | { ok: false; message: string };

const MSG = {
  empty: "Введите номер телефона",
  incomplete: "Введите номер полностью: (999) 123-45-67",
  notMobile: "Укажите мобильный номер (начинается с 9)",
  fake: "Этот номер выглядит недействительным. Проверьте ввод.",
  invalid: "Такого мобильного номера не существует. Проверьте код и цифры.",
} as const;

const BLOCKED_NATIONAL = new Set([
  ...Array.from({ length: 10 }, (_, i) => String(i).repeat(10)),
  "1234567890",
  "0123456789",
  "0987654321",
  "9876543210",
  "1231231231",
  "1122334455",
]);

export function digitsOnly(value: string): string {
  return value.replace(/\D/g, "");
}

export function maskNationalPhoneInput(value: string): string {
  let digits = digitsOnly(value);
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

export function e164ToNationalDisplay(phone: string): string {
  const match = phone.match(/^\+7(\d{10})$/);
  if (!match) return "";
  return maskNationalPhoneInput(match[1]);
}

export function normalizePhone(input: string): string {
  const trimmed = input.trim();
  const digits = digitsOnly(trimmed);

  if (/^\+7\d{10}$/.test(trimmed)) return trimmed;
  if (digits.length === 11 && (digits.startsWith("7") || digits.startsWith("8"))) {
    return `+7${digits.slice(1)}`;
  }
  if (digits.length === 10) return `+7${digits}`;

  throw new Error(MSG.incomplete);
}

export function validateRussianMobile(input: string): PhoneValidationResult {
  let e164: string;
  try {
    e164 = normalizePhone(input);
  } catch {
    return { ok: false, message: MSG.incomplete };
  }

  const national = e164.slice(2);
  if (isObviouslyFakeNational(national)) {
    return { ok: false, message: MSG.fake };
  }

  const parsed = parsePhoneNumberFromString(e164, "RU");
  if (!parsed?.isValid()) {
    return { ok: false, message: MSG.invalid };
  }

  return { ok: true, e164: parsed.format("E.164") };
}

export function isValidRussianMobile(input: string): boolean {
  return validateRussianMobile(input).ok;
}

export function getPhoneFieldError(
  value: string,
  opts: { force?: boolean; blurred?: boolean } = {},
): string | null {
  const digits = digitsOnly(value);
  if (digits.length === 0) {
    return opts.force ? MSG.empty : null;
  }
  if (digits[0] !== "9") return MSG.notMobile;
  if (digits.length < 10) {
    return opts.force || opts.blurred ? MSG.incomplete : null;
  }
  const result = validateRussianMobile(value);
  return result.ok ? null : result.message;
}

export function formatPhoneDisplay(phone: string): string {
  const match = phone.match(/^\+7(\d{3})(\d{3})(\d{2})(\d{2})$/);
  if (!match) return phone;
  return `${PHONE_COUNTRY_PREFIX} (${match[1]}) ${match[2]}-${match[3]}-${match[4]}`;
}

function isObviouslyFakeNational(digits10: string): boolean {
  if (digits10.length !== 10) return true;
  if (BLOCKED_NATIONAL.has(digits10)) return true;
  if (/(\d)\1{6,}/.test(digits10)) return true;
  return longestMonotonicRun(digits10) >= 9;
}

function longestMonotonicRun(digits: string): number {
  let asc = 1;
  let desc = 1;
  let best = 1;
  for (let i = 1; i < digits.length; i++) {
    const delta = Number(digits[i]) - Number(digits[i - 1]);
    if (delta === 1) {
      asc += 1;
      desc = 1;
    } else if (delta === -1) {
      desc += 1;
      asc = 1;
    } else {
      asc = 1;
      desc = 1;
    }
    best = Math.max(best, asc, desc);
  }
  return best;
}
