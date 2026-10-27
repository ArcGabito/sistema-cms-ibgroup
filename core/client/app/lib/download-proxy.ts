import { NextResponse } from "next/server";
import { BACKEND_URL, getAuthToken } from "@/app/lib/auth";

// Streams a file the backend generates (CSV exports) to the browser as a
// download, forwarding only the query params the endpoint understands.
export async function proxyDownload(path: string, search: URLSearchParams, allowedParams: string[]) {
  const token = await getAuthToken();

  if (!token) {
    return NextResponse.json({ message: "No autenticado." }, { status: 401 });
  }

  const forwarded = new URLSearchParams();
  for (const key of allowedParams) {
    const value = search.get(key);
    if (value) forwarded.set(key, value);
  }
  const query = forwarded.toString();

  const upstream = await fetch(`${BACKEND_URL}${path}${query ? `?${query}` : ""}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  }).catch(() => null);

  if (!upstream) {
    return NextResponse.json({ message: "No pudimos conectar con el servidor." }, { status: 502 });
  }

  if (!upstream.ok || !upstream.body) {
    return NextResponse.json({ message: "No se pudo generar el archivo." }, { status: upstream.status });
  }

  return new Response(upstream.body, {
    headers: {
      "Content-Type": upstream.headers.get("Content-Type") ?? "text/csv; charset=utf-8",
      "Content-Disposition": upstream.headers.get("Content-Disposition") ?? "attachment",
      "Cache-Control": "no-store",
    },
  });
}
