import { NextRequest } from "next/server";
import { proxyAuthenticated } from "@/app/lib/backend-proxy";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);

  return proxyAuthenticated("/api/clients", { method: "POST", body }, "No se pudo crear el cliente.");
}
