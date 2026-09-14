import { Award, GraduationCap, HelpCircle, TrendingUp, Users } from "lucide-react";
import Container from "@/app/components/ui/Container";
import SectionLabel from "@/app/components/ui/SectionLabel";
import Reveal from "@/app/components/ui/Reveal";

const ITEMS = [
  {
    icon: Users,
    title: "¿Quiénes somos?",
  },
  {
    icon: HelpCircle,
    title: "¿Qué es el Outplacement en Perú?",
  },
  {
    icon: TrendingUp,
    title: "Oportunidades laborales en el mercado peruano",
  },
  {
    icon: Award,
    title: "Beneficios del Outplacement",
  },
  {
    icon: GraduationCap,
    title: "Coaching de empleabilidad profesional",
  },
];

export default function AboutUs() {
  return (
    <section id="nosotros" className="py-20 sm:py-28">
      <Container>
        <div className="mx-auto max-w-2xl text-center">
          <SectionLabel align="center">Nosotros</SectionLabel>
          <h2 className="mt-4 font-heading text-3xl font-bold text-ink sm:text-4xl">
            Todo lo que debes saber sobre el Outplacement
          </h2>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-5">
          {ITEMS.map(({ icon: Icon, title }, i) => (
            <Reveal key={title} delay={i * 0.08}>
              <div className="flex h-full flex-col items-center rounded-xl border border-black/5 p-6 text-center transition-shadow hover:shadow-lg">
                <span className="flex h-16 w-16 items-center justify-center rounded-full bg-ink text-white">
                  <Icon className="h-7 w-7" />
                </span>
                <h3 className="mt-5 min-h-[3rem] text-sm font-semibold text-ink">{title}</h3>
                <a
                  href="#"
                  className="mt-5 rounded-full bg-brand px-5 py-2 text-[11px] font-semibold tracking-wider text-white uppercase hover:bg-brand-dark transition-colors"
                >
                  Seguir leyendo
                </a>
              </div>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
