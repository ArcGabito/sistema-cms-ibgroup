import type { Metadata } from "next";
import PageHero from "@/app/components/sections/PageHero";
import TransparencyPillars from "@/app/components/sections/TransparencyPillars";
import LegalInfo from "@/app/components/sections/LegalInfo";
import CTASection from "@/app/components/sections/CTASection";

export const metadata: Metadata = {
  title: "Transparencia | IBOutplacement",
  description:
    "Nuestro compromiso con la confidencialidad, la protección de datos personales, la ética profesional y los resultados verificables de nuestros programas de outplacement.",
};

export default function TransparenciaPage() {
  return (
    <>
      <PageHero
        eyebrow="Transparencia"
        title="Transparencia y buenas prácticas"
        subtitle="Creemos que la confianza se construye con hechos: así tratamos tus datos, así medimos nuestros resultados y así puedes hacernos llegar tus consultas o reclamos."
        image="/assets/hero-portada-sections.jpg"
      />
      <TransparencyPillars />
      <LegalInfo />
      <CTASection
        title="¿Tienes preguntas sobre nuestras políticas?"
        text="Si necesitas más información sobre el tratamiento de tus datos personales, nuestros términos o cómo presentar un reclamo, escríbenos y te responderemos a la brevedad."
        buttonLabel="Escríbenos"
      />
    </>
  );
}
