/** ISO YYYY-MM-DD → ДД.ММ.ГГГГ */
export function formatBirthDateDisplay(iso: string | null | undefined): string {
  if (!iso) return "";
  const match = iso.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!match) return iso;
  return maskBirthDateInput(`${match[3]}${match[2]}${match[1]}`);
}

/** Маска ввода: только цифры, авто-точки ДД.ММ.ГГГГ (макс. 8 цифр) */
export function maskBirthDateInput(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 8);
  const day = digits.slice(0, 2);
  const month = digits.slice(2, 4);
  const year = digits.slice(4, 8);

  if (digits.length <= 2) return day;
  if (digits.length <= 4) return `${day}.${month}`;
  return `${day}.${month}.${year}`;
}

/** ДД.ММ.ГГГГ → ISO YYYY-MM-DD; пустая строка → null */
export function parseBirthDateInput(input: string): string | null {
  const masked = maskBirthDateInput(input);
  if (!masked) return null;

  if (masked.length < 10) {
    throw new Error("Введите дату полностью: ДД.ММ.ГГГГ");
  }
  const match = masked.match(/^(\d{2})\.(\d{2})\.(\d{4})$/);
  if (!match) {
    throw new Error("Введите дату в формате ДД.ММ.ГГГГ");
  }
  const day = Number(match[1]);
  const month = Number(match[2]);
  const year = Number(match[3]);

  if (month < 1 || month > 12 || day < 1 || day > 31 || year < 1900 || year > 2100) {
    throw new Error("Некорректная дата рождения");
  }

  const date = new Date(year, month - 1, day);
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    throw new Error("Некорректная дата рождения");
  }

  return `${String(year).padStart(4, "0")}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}
