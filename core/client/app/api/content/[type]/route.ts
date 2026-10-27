import { NextRequest } from "next/server";
import { proxyContentMutation } from "@/app/lib/content-proxy";

export async function POST(request: NextRequest, { params }: { params: Promise<{ type: string }> }) {
  const { type } = await params;
  const body = await request.json().catch(() => null);

  return proxyContentMutation(type, "", { method: "POST", body });
}
