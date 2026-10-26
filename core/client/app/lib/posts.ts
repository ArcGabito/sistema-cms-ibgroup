import { connection } from "next/server";
import { getAuthToken, BACKEND_URL } from "@/app/lib/auth";

export interface Post {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  imageUrl: string | null;
  published: boolean;
  authorName: string;
  createdAt: string;
  updatedAt: string;
}

export async function getPosts(): Promise<Post[]> {
  const token = await getAuthToken();

  if (!token) {
    return [];
  }

  try {
    const response = await fetch(`${BACKEND_URL}/api/posts`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });

    if (!response.ok) {
      return [];
    }

    return (await response.json()) as Post[];
  } catch {
    return [];
  }
}

// Public: returns null for unknown slugs and for drafts (the backend never
// serves drafts on this endpoint).
export async function getPublishedPostBySlug(slug: string): Promise<Post | null> {
  try {
    const response = await fetch(`${BACKEND_URL}/api/posts/slug/${encodeURIComponent(slug)}`, {
      next: { revalidate: 60 },
    });

    if (!response.ok) {
      return null;
    }

    return (await response.json()) as Post;
  } catch {
    return null;
  }
}

// Public: no auth token — the backend returns only published posts to
// anonymous callers. Used by the public site (home, /blog).
//
// connection() keeps the calling pages out of the build-time prerender: the
// backend isn't reachable while the image is built, so a prerendered page
// would ship with an empty post list until its first revalidation. The pages
// now render per request, while the fetch itself stays in Next's data cache
// for 60s so the backend isn't hit on every visit.
export async function getPublishedPosts(): Promise<Post[]> {
  await connection();

  try {
    const response = await fetch(`${BACKEND_URL}/api/posts`, { next: { revalidate: 60 } });

    if (!response.ok) {
      return [];
    }

    return (await response.json()) as Post[];
  } catch {
    return [];
  }
}
