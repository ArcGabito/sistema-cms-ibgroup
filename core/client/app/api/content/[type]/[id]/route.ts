import { NextRequest } from "next/server";
import { proxyContentMutation } from "@/app/lib/content-proxy";

type Params = { params: Promise<{ type: string; id: string }> };

export async function PUT(request: NextRequest, { params }: Params) {
  const { type, id } = await params;
  const body = await request.json().catch(() => null);

  return proxyContentMutation(type, `/${encodeURIComponent(id)}`, { method: "PUT", body });
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  const { type, id } = await params;

  return proxyContentMutation(type, `/${encodeURIComponent(id)}`, { method: "DELETE" });
}
