import { NextResponse } from "next/server";
import { BACKEND_URL } from "@/app/lib/auth";

// Pinged by despertarServidor() until the backend and its database answer.
// Each ping is short: Azure keeps waking the container after we give up, and
// the client simply pings again.
export async function GET() {
  try {
    const response = await fetch(`${BACKEND_URL}/api/estado`, {
      cache: "no-store",
      signal: AbortSignal.timeout(10_000),
    });
    const data = await response.json().catch(() => null);

    if (response.ok && data?.listo) {
      return NextResponse.json({ listo: true });
    }
  } catch {
    // Still starting: fall through.
  }

  return NextResponse.json({ listo: false }, { status: 503 });
}
