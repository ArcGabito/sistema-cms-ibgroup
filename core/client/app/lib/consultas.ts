import { getAuthToken, BACKEND_URL } from "@/app/lib/auth";
import { toQueryString, type Paged } from "@/app/lib/paging";

// A lead: what a visitor sent through the site's contact forms.
export interface ContactSubmission {
  id: number;
  type: "Personas" | "Empresas";
  nombres: string | null;
  apellidoPaterno: string | null;
  apellidoMaterno: string | null;
  cargo: string | null;
  email: string;
  telefono: string;
  linkedin: string | null;
  trabajando: string | null;
  servicio: string | null;
  sector: string | null;
  rangoSalarial: string | null;
  pais: string | null;
  region: string | null;
  empresa: string | null;
  contacto: string | null;
  colaboradores: string | null;
  mensaje: string;
  createdAt: string;
}

export interface ConsultasPage extends Paged<ContactSubmission> {
  personasCount: number;
  empresasCount: number;
}

export interface ConsultasQuery {
  page?: number;
  pageSize?: number;
  q?: string;
  type?: string;
}

const EMPTY: ConsultasPage = { items: [], total: 0, page: 1, pageSize: 20, personasCount: 0, empresasCount: 0 };

export async function getConsultas(query: ConsultasQuery = {}): Promise<ConsultasPage> {
  const token = await getAuthToken();

  if (!token) {
    return EMPTY;
  }

  try {
    const response = await fetch(`${BACKEND_URL}/api/contact${toQueryString({ ...query })}`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });

    if (!response.ok) {
      return EMPTY;
    }

    return (await response.json()) as ConsultasPage;
  } catch {
    return EMPTY;
  }
}
