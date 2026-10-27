import { NextRequest } from "next/server";
import { proxyContentMutation } from "@/app/lib/content-proxy";

export async function PUT(request: NextRequest, { params }: { params: Promise<{ type: string }> }) {
  const { type } = await params;
  const body = await request.json().catch(() => null);

  return proxyContentMutation(type, "/order", { method: "PUT", body });
}
