import { NextRequest, NextResponse } from "next/server";
import { loginSchema } from "@/app/lib/validations/auth";
import { BACKEND_URL, setAuthCookie, type AuthTokenResponse } from "@/app/lib/auth";
import { forwardedForHeader } from "@/app/lib/forwarded";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const parsed = loginSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ message: "Ingresa tu usuario y contraseña." }, { status: 400 });
  }

  let backendResponse: Response;
  try {
    backendResponse = await fetch(`${BACKEND_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...forwardedForHeader(request) },
      body: JSON.stringify({
        username: parsed.data.usuario,
        password: parsed.data.contrasena,
      }),
    });
  } catch {
    return NextResponse.json(
      { message: "No pudimos conectar con el servidor. Intenta nuevamente." },
      { status: 503 },
    );
  }

  if (backendResponse.status === 429) {
    return NextResponse.json(
      { message: "Demasiados intentos fallidos. Espera unos minutos antes de volver a intentarlo." },
      { status: 429 },
    );
  }

  // Azure answers 502/503/504 while the backend wakes up; relay them so the
  // form can tell "asleep" apart from "wrong password".
  if (backendResponse.status >= 502 && backendResponse.status <= 504) {
    return NextResponse.json(
      { message: "El servidor está iniciando. Intenta nuevamente en un momento." },
      { status: backendResponse.status },
    );
  }

  if (!backendResponse.ok) {
    return NextResponse.json(
      { message: "Usuario o contraseña incorrectos." },
      { status: backendResponse.status === 401 ? 401 : 502 },
    );
  }

  const data = (await backendResponse.json()) as AuthTokenResponse;
  await setAuthCookie(data);

  return NextResponse.json({ user: data.user });
}
