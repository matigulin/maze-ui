/** Sequelize timestamp accessor — attribute is camelCase even with underscored columns. */
export function isoTimestamp(row: { get: (key: string) => unknown }, key: 'createdAt' | 'updatedAt'): string {
  const snake = key === 'createdAt' ? 'created_at' : 'updated_at';
  const value = row.get(key) ?? row.get(snake);
  if (value instanceof Date) return value.toISOString();
  if (typeof value === 'string' || typeof value === 'number') {
    const d = new Date(value);
    if (!Number.isNaN(d.getTime())) return d.toISOString();
  }
  return new Date(0).toISOString();
}

export function intAttr(row: { get: (key: string) => unknown }, key: string, fallback = 0): number {
  const value = row.get(key);
  if (typeof value === 'number') return value;
  if (typeof value === 'string' && value.trim() !== '') return Number(value);
  return fallback;
}
