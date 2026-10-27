import type { MetadataRoute } from "next";
import { getPublishedPosts } from "@/app/lib/posts";
import { PUBLIC_ROUTES, SITE_URL } from "@/app/lib/site";

// getPublishedPosts() opts out of build-time prerendering, so the sitemap is
// built per request and always lists the posts that are published right now.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await getPublishedPosts();

  const pages: MetadataRoute.Sitemap = PUBLIC_ROUTES.map((route) => ({
    url: `${SITE_URL}${route === "/" ? "" : route}`,
    changeFrequency: route === "/blog" ? "weekly" : "monthly",
    priority: route === "/" ? 1 : 0.7,
  }));

  const postEntries: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${SITE_URL}/blog/${post.slug}`,
    lastModified: new Date(post.updatedAt),
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  return [...pages, ...postEntries];
}
