/** Локально — API; на Vercel без внешнего бэка — моки из data.ts */
export function shouldUseMocks(): boolean {
  if (process.env.NEXT_PUBLIC_USE_MOCKS === "true") return true;
  const api =
    process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000/api/v1";
  return Boolean(process.env.VERCEL && api.includes("localhost"));
}
