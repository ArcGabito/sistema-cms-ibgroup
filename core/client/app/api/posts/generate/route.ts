import { NextRequest, NextResponse } from "next/server";
import { generateDraftSchema } from "@/app/lib/validations/post";
import { getAuthToken, BACKEND_URL } from "@/app/lib/auth";

export async function POST(request: NextRequest) {
  const token = await getAuthToken();

  if (!token) {
    return NextResponse.json({ message: "No autenticado." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = generateDraftSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ message: "Ingresa un tema válido." }, { status: 400 });
  }

  let backendResponse: Response;
  try {
    backendResponse = await fetch(`${BACKEND_URL}/api/posts/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ topic: parsed.data.topic }),
    });
  } catch {
    return NextResponse.json(
      { message: "No pudimos conectar con el servidor. Intenta nuevamente." },
      { status: 502 },
    );
  }

  const data = await backendResponse.json().catch(() => null);

  if (!backendResponse.ok) {
    return NextResponse.json(
      { message: data?.detail ?? data?.message ?? "No se pudo generar el borrador." },
      { status: backendResponse.status },
    );
  }

  return NextResponse.json(data, { status: 201 });
}
