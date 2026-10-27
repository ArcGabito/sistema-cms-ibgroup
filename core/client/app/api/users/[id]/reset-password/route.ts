import { NextRequest, NextResponse } from "next/server";
import { resetPasswordSchema } from "@/app/lib/validations/user";
import { proxyAuthenticated } from "@/app/lib/backend-proxy";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json().catch(() => null);
  const parsed = resetPasswordSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ message: "La contraseña debe tener al menos 8 caracteres." }, { status: 400 });
  }

  return proxyAuthenticated(
    `/api/users/${encodeURIComponent(id)}/reset-password`,
    { method: "POST", body: parsed.data },
    "No se pudo restablecer la contraseña.",
  );
}
