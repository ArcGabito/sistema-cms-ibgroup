import { NextRequest, NextResponse } from "next/server";
import { employabilityTestSchema, type EmployabilityTestFormValues } from "@/app/lib/validations/employability-test";
import { TEST_QUESTION_KEYS } from "@/app/lib/employability-test-data";
import { BACKEND_URL } from "@/app/lib/auth";
import { forwardedForHeader } from "@/app/lib/forwarded";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const parsed = employabilityTestSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ message: "Revisa los datos del formulario." }, { status: 400 });
  }

  const data = parsed.data;
  const respuestas = Object.fromEntries(
    TEST_QUESTION_KEYS.map((key) => [key, data[key as keyof EmployabilityTestFormValues]]),
  );

  const payload = {
    nombres: data.nombres,
    apellidoPaterno: data.apellidoPaterno,
    apellidoMaterno: data.apellidoMaterno,
    email: data.email,
    telefono: data.telefono,
    tieneLinkedin: data.tieneLinkedin,
    pais: data.pais,
    departamento: data.departamento,
    edad: Number(data.edad),
    nivelProfesional: data.nivelProfesional,
    industria: data.industria,
    actualmenteTrabajando: data.actualmenteTrabajando,
    ultimoSalario: data.ultimoSalario,
    respuestas,
    autorizaDatos: data.autorizaDatos,
    deseaOrientacion: data.deseaOrientacion,
  };

  let backendResponse: Response;
  try {
    backendResponse = await fetch(`${BACKEND_URL}/api/employability-test`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...forwardedForHeader(request) },
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
      { message: responseData?.message ?? "No se pudo enviar el test." },
      { status: backendResponse.status },
    );
  }

  return NextResponse.json(responseData, { status: 201 });
}
