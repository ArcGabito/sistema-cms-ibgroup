import type { Metadata } from "next";
import PageHero from "@/app/components/sections/PageHero";
import FaqAccordion from "@/app/components/sections/FaqAccordion";

export const metadata: Metadata = {
  title: "Preguntas Frecuentes | IBOutplacement",
  description:
    "Resolvemos las dudas más frecuentes sobre nuestros programas de outplacement en Perú: duración, costos, garantías y cómo funciona el acompañamiento.",
};

export default function PreguntasPage() {
  return (
    <>
      <PageHero
        eyebrow="Preguntas Frecuentes"
        title="Resolvemos tus dudas sobre el Outplacement"
        subtitle="Antes de comenzar tu proceso de transición laboral, conoce cómo funciona nuestro acompañamiento, qué incluye y qué puedes esperar de tu consultor de carrera."
        image="/assets/hero-portada-sections.jpg"
      />
      <FaqAccordion />
    </>
  );
}
