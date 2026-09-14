import { NextRequest, NextResponse } from "next/server";
import { contactSubmissionSchema } from "@/app/lib/validations/contact";
import { BACKEND_URL } from "@/app/lib/auth";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const parsed = contactSubmissionSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ message: "Revisa los datos del formulario." }, { status: 400 });
  }

  const data = parsed.data;
  const payload =
    data.type === "Personas"
      ? {
          type: "Personas",
          nombres: data.nombres,
          apellidoPaterno: data.apellidoPaterno,
          apellidoMaterno: data.apellidoMaterno,
          cargo: data.cargo,
          email: data.email,
          telefono: data.telefono,
          linkedin: data.linkedin || null,
          trabajando: data.trabajando,
          servicio: data.servicio,
          sector: data.sector,
          rangoSalarial: data.rangoSalarial,
          pais: data.pais,
          region: data.region,
          mensaje: data.consulta,
        }
      : {
          type: "Empresas",
          empresa: data.empresa,
          contacto: data.contacto,
          cargo: data.cargo,
          email: data.email,
          telefono: data.telefono,
          servicio: data.servicio,
          colaboradores: data.colaboradores,
          mensaje: data.mensaje,
        };

  let backendResponse: Response;
  try {
    backendResponse = await fetch(`${BACKEND_URL}/api/contact`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch {
    return NextResponse.json(
      { message: "No pudimos conectar con el servidor. Intenta nuevamente." },
      { status: 502 },
    );
  }

  const responseData = await backendResponse.json().catch(() => null);

  if (!backendResponse.ok) {
    return NextResponse.json(
      { message: responseData?.message ?? "No se pudo enviar tu consulta." },
      { status: backendResponse.status },
    );
  }

  return NextResponse.json(responseData, { status: 201 });
}
