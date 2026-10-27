import { NextRequest } from "next/server";
import { proxyAuthenticated } from "@/app/lib/backend-proxy";

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return proxyAuthenticated(
    `/api/contact/${encodeURIComponent(id)}`,
    { method: "DELETE" },
    "No se pudo eliminar la consulta.",
  );
}
