import type { Metadata } from "next";
import PageHero from "@/app/components/sections/PageHero";
import ServicesDetail from "@/app/components/sections/ServicesDetail";
import Contact from "@/app/components/sections/Contact";

export const metadata: Metadata = {
  title: "Nuestros Servicios | IBOutplacement",
  description:
    "Programas de recolocación laboral personalizados, coaching de empleabilidad y talleres de desarrollo de habilidades blandas para personas y empresas en Perú.",
};

export default function ServiciosPage() {
  return (
    <>
      <PageHero
        eyebrow="Nuestros Servicios"
        title="Servicios de Outplacement en Perú"
        subtitle="En IBOutplacement ofrecemos servicios de outplacement diseñados para ayudar a personas y empresas en sus procesos de transición laboral. Contamos con programas de recolocación laboral personalizados, coaching de empleabilidad y talleres de desarrollo de habilidades blandas que garantizan un acompañamiento integral desde el primer día."
        image="/assets/hero-portada-sections.jpg"
      />
      <ServicesDetail />
      <Contact />
    </>
  );
}
