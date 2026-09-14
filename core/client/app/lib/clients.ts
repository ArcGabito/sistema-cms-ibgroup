import { getAuthToken, BACKEND_URL } from "@/app/lib/auth";

export interface ClientSubmission {
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

export async function getClients(): Promise<ClientSubmission[]> {
  const token = await getAuthToken();

  if (!token) {
    return [];
  }

  try {
    const response = await fetch(`${BACKEND_URL}/api/contact`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });

    if (!response.ok) {
      return [];
    }

    return (await response.json()) as ClientSubmission[];
  } catch {
    return [];
  }
}
