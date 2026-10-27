import { NextRequest } from "next/server";
import { BACKEND_URL } from "@/app/lib/auth";

// Serves uploaded images from the site's own origin, so pages and next/image
// can use "/uploads/<name>" without exposing the backend publicly. Stored
// names are random and never reused, so the response can be cached for good.
export async function GET(_request: NextRequest, { params }: { params: Promise<{ name: string }> }) {
  const { name } = await params;

  const upstream = await fetch(`${BACKEND_URL}/uploads/${encodeURIComponent(name)}`, { cache: "no-store" }).catch(
    () => null,
  );

  if (!upstream?.ok || !upstream.body) {
    return new Response("Not found", { status: upstream?.status === 404 ? 404 : 502 });
  }

  return new Response(upstream.body, {
    headers: {
      "Content-Type": upstream.headers.get("Content-Type") ?? "application/octet-stream",
      "Cache-Control": "public, max-age=31536000, immutable",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
