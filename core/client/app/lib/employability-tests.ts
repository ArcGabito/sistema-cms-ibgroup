import { getAuthToken, BACKEND_URL } from "@/app/lib/auth";

export interface EmployabilityTestSubmission {
  id: number;
  nombres: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  email: string;
  telefono: string;
  tieneLinkedin: string;
  pais: string;
  departamento: string;
  edad: number;
  nivelProfesional: string;
  industria: string;
  actualmenteTrabajando: string;
  ultimoSalario: string;
  respuestas: Record<string, string>;
  puntajeTotal: number;
  puntajePromedio: number;
  autorizaDatos: string;
  deseaOrientacion: string;
  createdAt: string;
}

export async function getEmployabilityTests(): Promise<EmployabilityTestSubmission[]> {
  const token = await getAuthToken();

  if (!token) {
    return [];
  }

  try {
    const response = await fetch(`${BACKEND_URL}/api/employability-test`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });

    if (!response.ok) {
      return [];
    }

    return (await response.json()) as EmployabilityTestSubmission[];
  } catch {
    return [];
  }
}
