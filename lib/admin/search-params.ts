export const ADMIN_PAGE_SIZE = 25;

export function parseAdminPage(raw: string | string[] | undefined): number {
  const value = Array.isArray(raw) ? raw[0] : raw;
  const n = Number(value ?? "1");
  if (!Number.isFinite(n) || n < 1) return 1;
  return Math.floor(n);
}

export function parseAdminQuery(raw: string | string[] | undefined): string {
  const value = Array.isArray(raw) ? raw[0] : raw;
  return (value ?? "").trim();
}

export function parseAdminStatus(
  raw: string | string[] | undefined,
  allowed?: string[],
): string | null {
  const value = (Array.isArray(raw) ? raw[0] : raw)?.trim().toLowerCase() ?? "";
  if (!value || value === "all") return null;
  if (allowed && !allowed.includes(value)) return null;
  return value;
}

export function pageRange(page: number, pageSize = ADMIN_PAGE_SIZE) {
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  return { from, to };
}
