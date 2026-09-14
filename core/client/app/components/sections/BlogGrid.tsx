"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Container from "@/app/components/ui/Container";
import Reveal from "@/app/components/ui/Reveal";
import type { Post } from "@/app/lib/posts";

const POSTS_PER_PAGE = 6;
const FALLBACK_IMAGE = "https://picsum.photos/seed/ibout-blog-fallback/640/420";

interface BlogGridProps {
  posts: Post[];
}

export default function BlogGrid({ posts }: BlogGridProps) {
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(posts.length / POSTS_PER_PAGE));

  const goToPage = (target: number) => {
    const clamped = Math.max(1, Math.min(target, totalPages));
    setPage(clamped);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const start = (page - 1) * POSTS_PER_PAGE;
  const visiblePosts = posts.slice(start, start + POSTS_PER_PAGE);
  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

  if (posts.length === 0) {
    return (
      <section className="py-20 sm:py-28">
        <Container>
          <p className="text-center text-sm text-ink/50">
            Todavía no hay publicaciones disponibles.
          </p>
        </Container>
      </section>
    );
  }

  return (
    <section className="py-20 sm:py-28">
      <Container>
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {visiblePosts.map((post, i) => (
            <Reveal key={post.id} delay={i * 0.08}>
              <article className="flex h-full flex-col overflow-hidden rounded-xl bg-white shadow-sm">
                <div className="relative h-48 w-full">
                  <Image
                    src={post.imageUrl ?? FALLBACK_IMAGE}
                    alt={post.title}
                    fill
                    sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 90vw"
                    className="object-cover"
                  />
                </div>
                <div className="flex flex-1 flex-col p-6">
                  <h3 className="text-sm font-semibold text-ink">{post.title}</h3>
                  <p className="mt-3 flex-1 text-xs leading-relaxed text-ink/60">
                    {post.excerpt}
                  </p>
                  <a
                    href="#"
                    className="mt-5 inline-block w-fit rounded-full bg-brand px-5 py-2 text-[11px] font-semibold tracking-wider text-white uppercase hover:bg-brand-dark transition-colors"
                  >
                    Continuar leyendo
                  </a>
                </div>
              </article>
            </Reveal>
          ))}
        </div>

        <nav
          aria-label="Paginación de publicaciones"
          className="mt-14 flex items-center justify-center gap-2"
        >
          <button
            type="button"
            aria-label="Página anterior"
            disabled={page === 1}
            onClick={() => goToPage(page - 1)}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-ink/15 text-ink transition-colors hover:bg-ink hover:text-white disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-ink"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          {pageNumbers.map((n) => (
            <button
              key={n}
              type="button"
              aria-current={page === n ? "page" : undefined}
              onClick={() => goToPage(n)}
              className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold transition-colors ${
                page === n
                  ? "bg-brand text-white"
                  : "border border-ink/15 text-ink/70 hover:border-brand hover:text-brand"
              }`}
            >
              {n}
            </button>
          ))}

          <button
            type="button"
            aria-label="Página siguiente"
            disabled={page === totalPages}
            onClick={() => goToPage(page + 1)}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-ink/15 text-ink transition-colors hover:bg-ink hover:text-white disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-ink"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </nav>
      </Container>
    </section>
  );
}
