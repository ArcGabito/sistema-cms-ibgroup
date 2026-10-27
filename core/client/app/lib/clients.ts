import { getAuthToken, BACKEND_URL } from "@/app/lib/auth";
import { toQueryString, type Paged } from "@/app/lib/paging";

// A client company (not a lead from the contact forms).
export interface Client {
  id: number;
  companyName: string;
  legalName: string;
  industry: string | null;
  firstName: string | null;
  lastName: string | null;
  jobTitle: string | null;
  taxId: string | null;
  phoneNumber: string | null;
  email: string | null;
  website: string | null;
  address: string | null;
  district: string | null;
  province: string | null;
  createdAt: string;
}

export interface ClientFilters {
  industries: string[];
  provinces: string[];
}

export interface ClientsQuery {
  page?: number;
  pageSize?: number;
  q?: string;
  industry?: string;
  province?: string;
}

async function authorizedGet<T>(path: string, fallback: T): Promise<T> {
  const token = await getAuthToken();

  if (!token) {
    return fallback;
  }

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

export function getClients(query: ClientsQuery = {}): Promise<Paged<Client>> {
  return authorizedGet(`/api/clients${toQueryString({ ...query })}`, {
    items: [],
    total: 0,
    page: 1,
    pageSize: 20,
  });
}

export function getClientFilters(): Promise<ClientFilters> {
  return authorizedGet("/api/clients/filters", { industries: [], provinces: [] });
}
