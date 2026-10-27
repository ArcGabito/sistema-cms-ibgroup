export interface Paged<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

export type SearchParams = Record<string, string | string[] | undefined>;

// First value of a search param, trimmed; undefined when absent or empty.
export function param(params: SearchParams, key: string): string | undefined {
  const raw = params[key];
  const value = (Array.isArray(raw) ? raw[0] : raw)?.trim();
  return value ? value : undefined;
}

export function pageParam(params: SearchParams): number {
  const page = Number(param(params, "page"));
  return Number.isInteger(page) && page > 0 ? page : 1;
}

// Builds "?a=1&b=2" from the defined entries, for backend list endpoints.
export function toQueryString(values: Record<string, string | number | undefined>): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(values)) {
    if (value !== undefined && value !== "") search.set(key, String(value));
  }
  const text = search.toString();
  return text ? `?${text}` : "";
}
