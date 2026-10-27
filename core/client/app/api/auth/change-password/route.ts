import { NextRequest, NextResponse } from "next/server";
import { changePasswordSchema } from "@/app/lib/validations/user";
import { BACKEND_URL, getAuthToken, setAuthCookie, type AuthTokenResponse } from "@/app/lib/auth";
import { forwardedForHeader } from "@/app/lib/forwarded";

export async function POST(request: NextRequest) {
  const token = await getAuthToken();

  if (!token) {
    return NextResponse.json({ message: "No autenticado." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = changePasswordSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ message: "Revisa los datos del formulario." }, { status: 400 });
  }

  let backendResponse: Response;
  try {
    backendResponse = await fetch(`${BACKEND_URL}/api/auth/change-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        ...forwardedForHeader(request),
      },
      body: JSON.stringify({
        currentPassword: parsed.data.currentPassword,
        newPassword: parsed.data.newPassword,
      }),
    });
  } catch {
    return NextResponse.json(
      { message: "No pudimos conectar con el servidor. Intenta nuevamente." },
      { status: 503 },
    );
  }

  const data = await backendResponse.json().catch(() => null);

  if (!backendResponse.ok) {
    return NextResponse.json(
      { message: data?.message ?? "No se pudo cambiar la contraseña." },
      { status: backendResponse.status },
    );
  }

  // The change rotated the session, so the old cookie no longer works.
  await setAuthCookie(data as AuthTokenResponse);

  return NextResponse.json({ user: (data as AuthTokenResponse).user });
}
