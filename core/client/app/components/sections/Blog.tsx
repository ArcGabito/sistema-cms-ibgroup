"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Container from "@/app/components/ui/Container";
import SectionLabel from "@/app/components/ui/SectionLabel";
import Reveal from "@/app/components/ui/Reveal";
import type { Post } from "@/app/lib/posts";

const FALLBACK_IMAGE = "https://picsum.photos/seed/ibout-blog-fallback/640/420";

interface BlogProps {
  posts: Post[];
}

export default function Blog({ posts }: BlogProps) {
  const POSTS = posts;

  const scrollerRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLElement | null)[]>([]);
  const [active, setActive] = useState(0);
  // Number of reachable scroll positions minus 1 — several cards are visible
  // at once (1-3 depending on breakpoint), so the scroller can't move past
  // its max scrollLeft. Using POSTS.length for the dots would leave trailing
  // dots pointing at a position the browser has already clamped to.
  const [maxIndex, setMaxIndex] = useState(0);

  const getStep = () => {
    const card = cardRefs.current[0];
    const scroller = scrollerRef.current;
    if (!card || !scroller) return 0;
    const gap = parseFloat(getComputedStyle(scroller).columnGap || "0");
    return card.offsetWidth + gap;
  };

  const scrollToIndex = (index: number) => {
    const el = scrollerRef.current;
    if (!el) return;
    const clamped = Math.max(0, Math.min(index, maxIndex));
    el.scrollTo({ left: clamped * getStep(), behavior: "smooth" });
    setActive(clamped);
  };

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;

    const getMaxIndex = () => {
      const step = getStep();
      if (!step) return 0;
      return Math.max(0, Math.round((el.scrollWidth - el.clientWidth) / step));
    };

    const recomputeMaxIndex = () => setMaxIndex(getMaxIndex());

    recomputeMaxIndex();

    const resizeObserver = new ResizeObserver(recomputeMaxIndex);
    resizeObserver.observe(el);

    let frame: number;
    const handleScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const step = getStep();
        if (!step) return;
        const index = Math.round(el.scrollLeft / step);
        setActive(Math.max(0, Math.min(index, getMaxIndex())));
      });
    };

    el.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      resizeObserver.disconnect();
      el.removeEventListener("scroll", handleScroll);
      cancelAnimationFrame(frame);
    };
  }, [POSTS.length]);

  if (POSTS.length === 0) {
    return null;
  }

  const isFirst = active === 0;
  const isLast = active === maxIndex;

  return (
    <section id="blog" className="bg-surface py-20 sm:py-28">
      <Container>
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-[320px_minmax(0,1fr)]">
          <Reveal>
            <SectionLabel>Blog</SectionLabel>
            <h2 className="mt-4 font-heading text-3xl font-bold text-ink">
              Últimas publicaciones de blog
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-ink/60">
              Contenido especializado sobre empleabilidad, transición laboral y
              desarrollo de carrera, pensado para ejecutivos y profesionales
              en búsqueda de su próxima oportunidad.
            </p>
            <div className="mt-8 flex items-center gap-3">
              <button
                type="button"
                aria-label="Anterior"
                disabled={isFirst}
                onClick={() => scrollToIndex(active - 1)}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-ink/15 text-ink transition-colors hover:bg-ink hover:text-white disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-ink"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                aria-label="Siguiente"
                disabled={isLast}
                onClick={() => scrollToIndex(active + 1)}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-ink/15 text-ink transition-colors hover:bg-ink hover:text-white disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-ink"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
            <Link
              href="/blog"
              className="mt-6 inline-block text-xs font-semibold tracking-wider text-brand uppercase hover:text-brand-dark transition-colors"
            >
              Ver todas las publicaciones →
            </Link>
          </Reveal>

          <div className="min-w-0">
            <div
              ref={scrollerRef}
              className="flex snap-x snap-mandatory gap-6 overflow-x-auto pb-2 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
            >
              {POSTS.map((post, i) => (
                <Reveal
                  key={post.id}
                  delay={i * 0.1}
                  className="w-[85%] shrink-0 snap-start sm:w-[45%] lg:w-[31%]"
                >
                  <article
                    ref={(node) => {
                      cardRefs.current[i] = node;
                    }}
                    className="flex h-full flex-col overflow-hidden rounded-xl bg-white shadow-sm"
                  >
                    <div className="relative h-44 w-full">
                      <Image
                        src={post.imageUrl ?? FALLBACK_IMAGE}
                        alt={post.title}
                        fill
                        sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 85vw"
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

            <div className="mt-6 flex justify-center gap-2">
              {Array.from({ length: maxIndex + 1 }).map((_, i) => (
                <button
                  key={i}
                  type="button"
                  aria-label={`Ir a la publicación ${i + 1}`}
                  onClick={() => scrollToIndex(i)}
                  className={`h-2 rounded-full transition-all ${
                    active === i ? "w-6 bg-brand" : "w-2 bg-ink/20"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
