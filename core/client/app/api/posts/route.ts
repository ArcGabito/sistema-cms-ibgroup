import { NextRequest, NextResponse } from "next/server";
import { postSchema } from "@/app/lib/validations/post";
import { getAuthToken, BACKEND_URL } from "@/app/lib/auth";

export async function POST(request: NextRequest) {
  const token = await getAuthToken();

  if (!token) {
    return NextResponse.json({ message: "No autenticado." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = postSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ message: "Revisa los datos del formulario." }, { status: 400 });
  }

  let backendResponse: Response;
  try {
    backendResponse = await fetch(`${BACKEND_URL}/api/posts`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        title: parsed.data.title,
        excerpt: parsed.data.excerpt,
        content: parsed.data.content,
        imageUrl: parsed.data.imageUrl || null,
        published: parsed.data.published,
      }),
    });
  } catch {
    return NextResponse.json(
      { message: "No pudimos conectar con el servidor. Intenta nuevamente." },
      { status: 503 },
    );
  }

  const data = await backendResponse.json().catch(() => null);

  if (!backendResponse.ok) {
    return NextResponse.json(
      { message: data?.message ?? "No se pudo crear el post." },
      { status: backendResponse.status },
    );
  }

  return NextResponse.json(data, { status: 201 });
}
