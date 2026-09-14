import { Building2, GraduationCap, Handshake, Landmark } from "lucide-react";
import Container from "@/app/components/ui/Container";
import SectionLabel from "@/app/components/ui/SectionLabel";
import Reveal from "@/app/components/ui/Reveal";

const ALLIANCES = [
  {
    icon: Handshake,
    title: "Red regional de recolocación",
    text: "Colaboramos con consultoras y coaches locales en cada país donde operamos, para brindar un acompañamiento con conocimiento real del mercado laboral.",
  },
  {
    icon: Building2,
    title: "Empresas y áreas de RR.HH.",
    text: "Trabajamos junto a equipos de recursos humanos de empresas en procesos de reestructuración, para acompañar a sus colaboradores en la transición.",
  },
  {
    icon: GraduationCap,
    title: "Universidades y escuelas de negocio",
    text: "Sumamos contenido y espacios de formación en empleabilidad y desarrollo de carrera para comunidades académicas y egresados.",
  },
  {
    icon: Landmark,
    title: "Cámaras de comercio y gremios",
    text: "Participamos de espacios binacionales y gremiales vinculados al desarrollo del talento y la empleabilidad ejecutiva.",
  },
];

export default function AllianceTypes() {
  return (
    <section className="bg-ink py-20 text-white sm:py-28">
      <Container>
        <div className="mx-auto max-w-2xl text-center">
          <SectionLabel align="center">Nuestros aliados</SectionLabel>
          <h2 className="mt-4 font-heading text-3xl font-bold sm:text-4xl">
            Alianzas que amplían nuestro alcance
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-white/60">
            Construimos relaciones de largo plazo con organizaciones que
            comparten nuestro compromiso con la empleabilidad y el desarrollo
            profesional.
          </p>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {ALLIANCES.map(({ icon: Icon, title, text }, i) => (
            <Reveal key={title} delay={i * 0.1}>
              <div className="flex flex-col items-center text-center">
                <span className="flex h-16 w-16 items-center justify-center rounded-full border border-white/15">
                  <Icon className="h-7 w-7 text-brand" />
                </span>
                <h3 className="mt-6 font-heading text-base font-semibold">{title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-white/60">{text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
