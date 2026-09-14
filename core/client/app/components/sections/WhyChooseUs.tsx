import { EyeOff, Globe, Star, Video } from "lucide-react";
import Container from "@/app/components/ui/Container";
import SectionLabel from "@/app/components/ui/SectionLabel";
import Reveal from "@/app/components/ui/Reveal";

const ITEMS = [
  {
    icon: Globe,
    title: "Locales y Regionales",
    text: "Conocemos el mercado regional de varios países en los que tenemos operaciones, por lo que contamos con un entrenamiento hecho a tu medida.",
  },
  {
    icon: Video,
    title: "Entrenamiento Personalizado Virtual",
    text: "Nuestros procesos online están basados en técnicas de aprendizaje actuales y acompañamiento con coaching totalmente personalizado con un alto nivel de compromiso, convirtiéndonos en tu mejor costo estratégico.",
  },
  {
    icon: Star,
    title: "Calidad y Experiencia",
    text: "Ofrecemos servicios de alta calidad basado en nuestra experiencia en consultoría, generando el máximo valor en ti.",
  },
  {
    icon: EyeOff,
    title: "Mercado Laboral Oculto",
    text: "Sabemos que más del 60% de oportunidades laborales NUNCA se publican en bolsas de trabajo, redes sociales o avisos laborales en general. Nosotros te orientaremos a incrementar tu búsqueda hacia todo el mercado esperado.",
  },
];

export default function WhyChooseUs() {
  return (
    <section className="bg-ink py-20 text-white sm:py-28">
      <Container>
        <div className="mx-auto max-w-2xl text-center">
          <SectionLabel align="center">Nuestras ventajas</SectionLabel>
          <h2 className="mt-4 font-heading text-3xl font-bold sm:text-4xl">
            ¿Por qué elegirnos?
          </h2>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {ITEMS.map(({ icon: Icon, title, text }, i) => (
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
