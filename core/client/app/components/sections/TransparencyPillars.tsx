import Link from "next/link";
import { Eye, Lock, Scale, ShieldCheck } from "lucide-react";
import Container from "@/app/components/ui/Container";
import SectionLabel from "@/app/components/ui/SectionLabel";
import Reveal from "@/app/components/ui/Reveal";

const PILLARS = [
  {
    icon: Lock,
    title: "Confidencialidad",
    text: "Toda la información compartida durante tu proceso de outplacement se maneja bajo estrictos protocolos de confidencialidad, dentro y fuera de la organización.",
  },
  {
    icon: ShieldCheck,
    title: "Protección de datos personales",
    text: "Tratamos tus datos personales conforme a la Ley N.º 29733 de Protección de Datos Personales, con tu consentimiento informado en cada etapa del proceso.",
  },
  {
    icon: Scale,
    title: "Ética profesional",
    text: "Nuestros consultores y coaches se rigen por un código de ética que prioriza tu bienestar profesional por encima de cualquier otro interés comercial.",
  },
  {
    icon: Eye,
    title: "Resultados verificables",
    text: "Publicamos de forma pública nuestras estadísticas de resultados desde 2018, para que puedas evaluar objetivamente el desempeño de nuestros programas.",
    href: "/estadisticas",
  },
];

export default function TransparencyPillars() {
  return (
    <section className="py-20 sm:py-28">
      <Container>
        <div className="mx-auto max-w-2xl text-center">
          <SectionLabel align="center">Nuestro compromiso</SectionLabel>
          <h2 className="mt-4 font-heading text-3xl font-bold text-ink sm:text-4xl">
            Los principios que guían nuestro trabajo
          </h2>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {PILLARS.map(({ icon: Icon, title, text, href }, i) => (
            <Reveal key={title} delay={i * 0.08}>
              <div className="flex h-full flex-col items-center rounded-xl border border-black/5 p-6 text-center transition-shadow hover:shadow-lg">
                <span className="flex h-16 w-16 items-center justify-center rounded-full bg-ink text-white">
                  <Icon className="h-7 w-7" />
                </span>
                <h3 className="mt-5 text-sm font-semibold text-ink">{title}</h3>
                <p className="mt-3 flex-1 text-xs leading-relaxed text-ink/60">{text}</p>
                {href && (
                  <Link
                    href={href}
                    className="mt-4 text-xs font-semibold tracking-wide text-brand uppercase hover:text-brand-dark transition-colors"
                  >
                    Ver estadísticas →
                  </Link>
                )}
              </div>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
