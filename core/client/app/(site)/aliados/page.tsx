import type { Metadata } from "next";
import PageHero from "@/app/components/sections/PageHero";
import CountriesGrid from "@/app/components/sections/CountriesGrid";
import AllianceTypes from "@/app/components/sections/AllianceTypes";
import CTASection from "@/app/components/sections/CTASection";

export const metadata: Metadata = {
  title: "Aliados | IBOutplacement",
  description:
    "Conoce nuestra presencia regional en 9 países y las alianzas estratégicas que amplían nuestro alcance en programas de outplacement y empleabilidad.",
};

export default function AliadosPage() {
  return (
    <>
      <PageHero
        eyebrow="Aliados"
        title="Presencia regional y alianzas estratégicas"
        subtitle="Operamos en 9 países de la mano de consultores locales, empresas, universidades y gremios que comparten nuestro compromiso con la empleabilidad."
        image="/assets/hero-portada-sections.jpg"
      />
      <CountriesGrid />
      <AllianceTypes />
      <CTASection
        title="¿Tu organización quiere aliarse con nosotros?"
        text="Si representas una empresa, universidad, gremio o consultora interesada en construir una alianza estratégica en torno a la empleabilidad y el desarrollo de carrera, conversemos."
        buttonLabel="Conversemos"
      />
    </>
  );
}
