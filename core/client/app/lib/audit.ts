import { getAuthToken, BACKEND_URL } from "@/app/lib/auth";
import { toQueryString, type Paged } from "@/app/lib/paging";
import type { AuditEntry, AuditFilters } from "@/app/lib/audit-labels";

export interface AuditQuery {
  page?: number;
  q?: string;
  entityType?: string;
  action?: string;
  username?: string;
}

async function authorizedGet<T>(path: string, fallback: T): Promise<T> {
  const token = await getAuthToken();
  if (!token) return fallback;

  try {
    const response = await fetch(`${BACKEND_URL}${path}`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    return response.ok ? ((await response.json()) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function getAuditEntries(query: AuditQuery = {}): Promise<Paged<AuditEntry>> {
  return authorizedGet(`/api/audit${toQueryString({ ...query })}`, { items: [], total: 0, page: 1, pageSize: 20 });
}

export function getAuditFilters(): Promise<AuditFilters> {
  return authorizedGet("/api/audit/filters", { entityTypes: [], usernames: [] });
}
