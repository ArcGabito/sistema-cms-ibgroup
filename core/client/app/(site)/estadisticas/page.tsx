import type { Metadata } from "next";
import PageHero from "@/app/components/sections/PageHero";
import StatsCarousel from "@/app/components/sections/StatsCarousel";

export const metadata: Metadata = {
  title: "Estadísticas | IBOutplacement",
  description:
    "Resultados 2018-2025 de nuestros programas de outplacement en Perú: tiempo promedio de recolocación, activación de la red de contactos y mejora salarial y de puesto.",
};

export default function EstadisticasPage() {
  return (
    <>
      <PageHero
        eyebrow="Estadísticas"
        title="Resultados que respaldan nuestro programa"
        subtitle="Desde 2018 medimos el impacto real de nuestro acompañamiento: tiempo de recolocación, activación de la red de contactos y mejora salarial y de puesto de nuestros candidatos."
        image="/assets/hero-portada-sections.jpg"
      />
      <StatsCarousel />
    </>
  );
}
