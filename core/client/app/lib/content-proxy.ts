import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";
import { proxyAuthenticated } from "@/app/lib/backend-proxy";
import { contentTag, isContentType } from "@/app/lib/content";

// Validation lives in the backend; this only checks the content type, forwards
// the request and, when it succeeds, expires the site's cached copy so the
// change is visible on the next visit.
export async function proxyContentMutation(
  type: string,
  subPath: string,
  init: { method: string; body?: unknown },
): Promise<NextResponse> {
  if (!isContentType(type)) {
    return NextResponse.json({ message: "Tipo de contenido desconocido." }, { status: 404 });
  }

  const response = await proxyAuthenticated(
    `/api/content/${type}${subPath}`,
    init,
    "No se pudo guardar el contenido.",
  );

  if (response.ok) {
    revalidateTag(contentTag(type), { expire: 0 });
  }

  return response;
}
