import type { Metadata } from "next";
import PageHero from "@/app/components/sections/PageHero";
import BlogGrid from "@/app/components/sections/BlogGrid";
import { getPublishedPosts } from "@/app/lib/posts";

export const metadata: Metadata = {
  title: "Blog | IBOutplacement",
  description:
    "Artículos sobre empleabilidad, transición laboral, marca personal y desarrollo de carrera para ejecutivos y profesionales en búsqueda de su próxima oportunidad.",
};

export default async function BlogPage() {
  const posts = await getPublishedPosts();

  return (
    <>
      <PageHero
        eyebrow="Blog"
        title="Blog de Empleabilidad y Carrera"
        subtitle="Artículos y recursos sobre transición laboral, marca personal, entrevistas y desarrollo de carrera, pensados para ejecutivos y profesionales en búsqueda de su próxima oportunidad."
        image="/assets/hero-portada-sections.jpg"
      />
      <BlogGrid posts={posts} />
    </>
  );
}
