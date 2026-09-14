import type { Metadata } from "next";
import EmployabilityTestForm from "@/app/components/forms/EmployabilityTestForm";

export const metadata: Metadata = {
  title: "Test de Empleabilidad Ejecutiva - Profesional | IBOutplacement",
  description:
    "Evalúa tu nivel de empleabilidad como ejecutivo o profesional y recibe un diagnóstico con recomendaciones según tu perfil, industria y nivel profesional.",
};

export default function TestEmpleabilidadPage() {
  return (
    <div>
      <div className="mx-auto max-w-4xl px-6 pt-16 pb-4 text-center sm:pt-20">
        <h1 className="font-heading text-xl font-bold tracking-tight text-ink uppercase sm:text-2xl">
          Test de Empleabilidad Ejecutiva - Profesional – IBOutplacement (2026)
        </h1>
        <p className="mx-auto mt-4 max-w-3xl text-sm leading-relaxed text-ink/60">
          ¡Bienvenido/a! Este test profesional te permitirá conocer tu nivel actual de empleabilidad como
          Ejecutivo - Profesional o profesional calificado en el mercado laboral. Tu diagnóstico se
          enviará por correo con recomendaciones específicas según tu perfil, industria y nivel
          profesional. Completarlo toma entre 7 y 10 minutos.
        </p>
        <p className="mt-6 text-xs font-semibold tracking-wider text-brand uppercase">Sección 1 de 5</p>
      </div>
      <EmployabilityTestForm />
    </div>
  );
}
