import { NextRequest } from "next/server";
import { proxyAuthenticated } from "@/app/lib/backend-proxy";

type Params = { params: Promise<{ id: string }> };

export async function PUT(request: NextRequest, { params }: Params) {
  const { id } = await params;
  const body = await request.json().catch(() => null);

  return proxyAuthenticated(
    `/api/clients/${encodeURIComponent(id)}`,
    { method: "PUT", body },
    "No se pudo actualizar el cliente.",
  );
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  const { id } = await params;

  return proxyAuthenticated(
    `/api/clients/${encodeURIComponent(id)}`,
    { method: "DELETE" },
    "No se pudo eliminar el cliente.",
  );
}
