import { parsePhoneNumberFromString } from 'libphonenumber-js/mobile';
import { ValidationError } from './errors.js';

const BLOCKED_NATIONAL = new Set([
  ...Array.from({ length: 10 }, (_, i) => String(i).repeat(10)),
  '1234567890',
  '0123456789',
  '0987654321',
  '9876543210',
  '1231231231',
  '1122334455',
]);

function digitsOnly(value: string): string {
  return value.replace(/\D/g, '');
}

function toE164(input: string): string {
  const trimmed = input.trim();
  const digits = digitsOnly(trimmed);

  if (/^\+7\d{10}$/.test(trimmed)) return trimmed;
  if (digits.length === 11 && (digits.startsWith('7') || digits.startsWith('8'))) {
    return `+7${digits.slice(1)}`;
  }
  if (digits.length === 10) return `+7${digits}`;

  throw new ValidationError('Некорректный номер телефона');
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

export function normalizePhone(input: string): string {
  const e164 = toE164(input);
  const national = e164.slice(2);

  if (isObviouslyFakeNational(national)) {
    throw new ValidationError('Некорректный номер телефона');
  }

  const parsed = parsePhoneNumberFromString(e164, 'RU');
  if (!parsed?.isValid()) {
    throw new ValidationError('Некорректный номер телефона');
  }

  return parsed.format('E.164');
}

export function maskPhone(phone: string): string {
  if (phone.length < 6) return '***';
  return `${phone.slice(0, -4)}****`;
}
