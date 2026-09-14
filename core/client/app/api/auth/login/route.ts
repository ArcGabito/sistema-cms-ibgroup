import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { loginSchema } from "@/app/lib/validations/auth";
import { AUTH_COOKIE, BACKEND_URL } from "@/app/lib/auth";

interface BackendLoginResponse {
  token: string;
  expiresAt: string;
  user: {
    id: number;
    username: string;
    fullName: string;
    role: string;
  };
}

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
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: parsed.data.usuario,
        password: parsed.data.contrasena,
      }),
    });
  } catch {
    return NextResponse.json(
      { message: "No pudimos conectar con el servidor. Intenta nuevamente." },
      { status: 502 },
    );
  }

  if (!backendResponse.ok) {
    return NextResponse.json(
      { message: "Usuario o contraseña incorrectos." },
      { status: backendResponse.status === 401 ? 401 : 502 },
    );
  }

  const data = (await backendResponse.json()) as BackendLoginResponse;

  const cookieStore = await cookies();
  cookieStore.set(AUTH_COOKIE, data.token, {
    httpOnly: true,
    // Only mark the cookie secure once this app is actually served over HTTPS
    // (e.g. behind a TLS-terminating reverse proxy) — set COOKIE_SECURE=true then.
    secure: process.env.COOKIE_SECURE === "true",
    sameSite: "lax",
    path: "/",
    expires: new Date(data.expiresAt),
  });

  return NextResponse.json({ user: data.user });
}
