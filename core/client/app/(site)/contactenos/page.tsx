import type { Metadata } from "next";
import PageHero from "@/app/components/sections/PageHero";
import ContactInfo from "@/app/components/sections/ContactInfo";
import Contact from "@/app/components/sections/Contact";

export const metadata: Metadata = {
  title: "Contáctenos | IBOutplacement",
  description:
    "Escríbenos y un consultor de IBOutplacement se pondrá en contacto contigo para conocer tu caso y presentarte el programa de outplacement que mejor se ajuste a tus objetivos profesionales.",
};

export default function ContactenosPage() {
  return (
    <>
      <PageHero
        eyebrow="Contáctenos"
        title="Hablemos de tu transición laboral"
        subtitle="Escríbenos y un consultor de IBOutplacement se pondrá en contacto contigo a la brevedad para conocer tu caso y presentarte el programa que mejor se ajuste a tus objetivos profesionales."
        image="/assets/hero-portada-sections.jpg"
      />
      <ContactInfo />
      <Contact />
    </>
  );
}
