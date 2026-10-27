import type { Metadata } from "next";
import { cache } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import PageHero from "@/app/components/sections/PageHero";
import Container from "@/app/components/ui/Container";
import Markdown from "@/app/components/ui/Markdown";
import { getPublishedPostBySlug } from "@/app/lib/posts";

const FALLBACK_IMAGE = "/assets/hero-portada-sections.jpg";

interface BlogPostPageProps {
  params: Promise<{ slug: string }>;
}

// generateMetadata and the page both need the post; cache() keeps it to one
// backend call per request.
const getPost = cache(getPublishedPostBySlug);

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);

  if (!post) {
    return { title: "Publicación no encontrada | IBOutplacement" };
  }

  return {
    title: `${post.title} | Blog IBOutplacement`,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: "article",
      publishedTime: post.createdAt,
      images: post.imageUrl ? [post.imageUrl] : undefined,
    },
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = await getPost(slug);

  if (!post) {
    notFound();
  }

  const publishedAt = new Date(post.createdAt).toLocaleDateString("es-PE", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <>
      <PageHero
        eyebrow="Blog"
        title={post.title}
        subtitle={post.excerpt}
        image={post.imageUrl ?? FALLBACK_IMAGE}
      />

      <section className="py-16 sm:py-24">
        <Container>
          <article className="mx-auto max-w-3xl">
            <p className="text-xs font-semibold tracking-wider text-ink/40 uppercase">
              {publishedAt} · {post.authorName}
            </p>

            {/* Content is Markdown; older posts are plain paragraphs, which Markdown renders the same. */}
            <div className="mt-8 text-base leading-relaxed text-ink/80">
              <Markdown>{post.content}</Markdown>
            </div>

            <Link
              href="/blog"
              className="mt-12 inline-flex items-center gap-2 rounded-full border border-ink/15 px-5 py-2 text-[11px] font-semibold tracking-wider text-ink uppercase transition-colors hover:border-brand hover:text-brand"
            >
              <ArrowLeft className="h-4 w-4" />
              Volver al blog
            </Link>
          </article>
        </Container>
      </section>
    </>
  );
}
