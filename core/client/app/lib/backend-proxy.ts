import { NextResponse } from "next/server";
import { getAuthToken, BACKEND_URL } from "@/app/lib/auth";

// Forwards an authenticated dashboard request to the backend and relays its
// status and message, so the backend stays the single source of validation
// and permission errors.
export async function proxyAuthenticated(
  path: string,
  init: { method: string; body?: unknown },
  fallbackMessage: string,
): Promise<NextResponse> {
  const token = await getAuthToken();

  if (!token) {
    return NextResponse.json({ message: "No autenticado." }, { status: 401 });
  }

  let backendResponse: Response;
  try {
    backendResponse = await fetch(`${BACKEND_URL}${path}`, {
      method: init.method,
      headers: {
        Authorization: `Bearer ${token}`,
        ...(init.body !== undefined ? { "Content-Type": "application/json" } : {}),
      },
      body: init.body !== undefined ? JSON.stringify(init.body) : undefined,
    });
  } catch {
    return NextResponse.json(
      { message: "No pudimos conectar con el servidor. Intenta nuevamente." },
      { status: 503 },
    );
  }

  if (backendResponse.status === 204) {
    return new NextResponse(null, { status: 204 });
  }

  const data = await backendResponse.json().catch(() => null);

  if (!backendResponse.ok) {
    return NextResponse.json(
      { message: data?.message ?? fallbackMessage },
      { status: backendResponse.status },
    );
  }

  return NextResponse.json(data, { status: backendResponse.status });
}
