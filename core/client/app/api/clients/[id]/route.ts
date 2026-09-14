import { NextRequest, NextResponse } from "next/server";
import { getAuthToken, BACKEND_URL } from "@/app/lib/auth";

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const token = await getAuthToken();

  if (!token) {
    return NextResponse.json({ message: "No autenticado." }, { status: 401 });
  }

  let backendResponse: Response;
  try {
    backendResponse = await fetch(`${BACKEND_URL}/api/contact/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
  } catch {
    return NextResponse.json(
      { message: "No pudimos conectar con el servidor. Intenta nuevamente." },
      { status: 502 },
    );
  }

  if (!backendResponse.ok) {
    return NextResponse.json({ message: "No se pudo eliminar el contacto." }, { status: backendResponse.status });
  }

  return new NextResponse(null, { status: 204 });
}
