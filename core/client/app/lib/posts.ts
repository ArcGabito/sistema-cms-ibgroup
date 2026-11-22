import { connection } from "next/server";
import { getAuthToken, BACKEND_URL } from "@/app/lib/auth";
import { POSTS_TAG, PUBLIC_CACHE_SECONDS } from "@/app/lib/public-cache";

export interface Post {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  imageUrl: string | null;
  published: boolean;
  authorName: string;
  authorId: number;
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
// serves drafts on this endpoint). connection() renders the article per request
// instead of caching the page: a not-found answer while the backend wakes up
// would otherwise stay cached for the whole window.
export async function getPublishedPostBySlug(slug: string): Promise<Post | null> {
  await connection();

  try {
    const response = await fetch(`${BACKEND_URL}/api/posts/slug/${encodeURIComponent(slug)}`, {
      next: { revalidate: PUBLIC_CACHE_SECONDS, tags: [POSTS_TAG] },
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
// (lib/public-cache.ts) so the backend isn't hit on every visit.
export async function getPublishedPosts(): Promise<Post[]> {
  await connection();

  try {
    const response = await fetch(`${BACKEND_URL}/api/posts`, {
      next: { revalidate: PUBLIC_CACHE_SECONDS, tags: [POSTS_TAG] },
    });

    if (!response.ok) {
      return [];
    }

    return (await response.json()) as Post[];
  } catch {
    return [];
  }
}
