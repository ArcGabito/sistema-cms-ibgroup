import type { Metadata } from "next";
import PageHero from "@/app/components/sections/PageHero";
import CalculatorTool from "@/app/components/sections/CalculatorTool";

export const metadata: Metadata = {
  title: "Calculadora de Retorno | IBOutplacement",
  description:
    "Calcula el retorno de invertir en nuestro programa de outplacement: ahorro por meses ganados, costo estimado, retorno neto y punto de equilibrio.",
};

export default function CalculadoraPage() {
  return (
    <>
      <PageHero
        eyebrow="Calculadora"
        title="Calcula el retorno de tu Outplacement"
        subtitle="Estima en segundos cuánto puedes ahorrar al reducir tu tiempo de búsqueda de empleo con acompañamiento profesional, y cómo se compara frente a la inversión en el programa."
        image="/assets/hero-portada-sections.jpg"
      />
      <CalculatorTool />
    </>
  );
}
