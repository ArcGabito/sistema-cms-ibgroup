import { Briefcase, Compass, HeartHandshake, User, Users } from "lucide-react";
import Container from "@/app/components/ui/Container";
import SectionLabel from "@/app/components/ui/SectionLabel";
import Reveal from "@/app/components/ui/Reveal";

const SERVICES = [
  {
    icon: User,
    title: "Programa de Outplacement para Personas en Perú",
    cta: "Más información",
  },
  {
    icon: Briefcase,
    title: "Consultoría de carrera profesional para Ejecutivos - Profesionales",
    cta: "Más información",
  },
  {
    icon: HeartHandshake,
    title: "Coaching en habilidades blandas para empleabilidad",
    cta: "Más información",
  },
  {
    icon: Compass,
    title: "Servicios integrales de transición laboral",
    cta: "Más información",
  },
  {
    icon: Users,
    title: "Nuestros Talleres de Desarrollo para ti",
    cta: "Contáctanos aquí",
  },
];

export default function Services() {
  return (
    <section id="servicios" className="bg-ink py-20 text-white sm:py-28">
      <Container>
        <div className="mx-auto max-w-3xl text-center">
          <SectionLabel align="center">Nuestros servicios</SectionLabel>
          <p className="mt-6 text-sm leading-relaxed text-white/60 sm:text-base">
            En <span className="font-semibold text-white">IBOutplacement</span>{" "}
            ofrecemos servicios de outplacement en Perú diseñados para ayudar
            a personas y empresas en sus procesos de{" "}
            <span className="font-semibold text-white">transición laboral</span>.
            Contamos con programas de recolocación laboral personalizados,
            coaching de empleabilidad y talleres de desarrollo de habilidades
            blandas que garantizan un acompañamiento integral desde el primer día.
          </p>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-5">
          {SERVICES.map(({ icon: Icon, title, cta }, i) => (
            <Reveal key={title} delay={i * 0.08}>
              <div className="flex h-full flex-col items-center rounded-xl border border-white/10 p-6 text-center">
                <span className="flex h-16 w-16 items-center justify-center rounded-full bg-white/5">
                  <Icon className="h-7 w-7 text-brand" />
                </span>
                <h3 className="mt-5 min-h-[3.5rem] text-sm font-semibold">{title}</h3>
                <a
                  href="#contacto"
                  className="mt-5 rounded-full bg-brand px-5 py-2 text-[11px] font-semibold tracking-wider text-white uppercase hover:bg-brand-dark transition-colors"
                >
                  {cta}
                </a>
              </div>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
