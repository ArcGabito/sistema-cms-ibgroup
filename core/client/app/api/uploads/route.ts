import { NextRequest, NextResponse } from "next/server";
import { BACKEND_URL, getAuthToken } from "@/app/lib/auth";

// Forwards the dashboard's image upload to the backend, which checks the
// file's real type and size and stores it.
export async function POST(request: NextRequest) {
  const token = await getAuthToken();

  if (!token) {
    return NextResponse.json({ message: "No autenticado." }, { status: 401 });
  }

  const form = await request.formData().catch(() => null);
  const file = form?.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ message: "Selecciona una imagen." }, { status: 400 });
  }

  const upstream = new FormData();
  upstream.set("file", file, file.name);

  let backendResponse: Response;
  try {
    backendResponse = await fetch(`${BACKEND_URL}/api/uploads`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: upstream,
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
      { message: data?.message ?? "No se pudo subir la imagen." },
      { status: backendResponse.status },
    );
  }

  return NextResponse.json(data, { status: 201 });
}
