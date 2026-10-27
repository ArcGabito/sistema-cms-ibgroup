import { NextRequest } from "next/server";
import { proxyDownload } from "@/app/lib/download-proxy";

export async function GET(request: NextRequest) {
  return proxyDownload("/api/contact/export", request.nextUrl.searchParams, ["q", "type"]);
}
