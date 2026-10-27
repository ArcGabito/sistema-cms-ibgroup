import { NextRequest, NextResponse } from "next/server";
import { updateUserSchema } from "@/app/lib/validations/user";
import { proxyAuthenticated } from "@/app/lib/backend-proxy";

type Params = { params: Promise<{ id: string }> };

export async function PUT(request: NextRequest, { params }: Params) {
  const { id } = await params;
  const body = await request.json().catch(() => null);
  const parsed = updateUserSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ message: "Revisa los datos del formulario." }, { status: 400 });
  }

  return proxyAuthenticated(
    `/api/users/${encodeURIComponent(id)}`,
    { method: "PUT", body: parsed.data },
    "No se pudo actualizar el usuario.",
  );
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  const { id } = await params;

  return proxyAuthenticated(
    `/api/users/${encodeURIComponent(id)}`,
    { method: "DELETE" },
    "No se pudo eliminar el usuario.",
  );
}
