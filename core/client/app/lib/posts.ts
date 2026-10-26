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

// Public: no auth token — the backend returns only published posts to
// anonymous callers. Used by the public site (home, /blog).
//
// Uses time-based revalidation instead of "no-store": a page whose main
// document is dynamically rendered gets a `Cache-Control: no-store` response
// header, which disqualifies it from the browser's back/forward cache and
// defeats Next's own data/full-route cache. Content here doesn't need to be
// instantaneous, so a short revalidation window is a better trade-off.
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

export async function getPublishedPosts(): Promise<Post[]> {
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
