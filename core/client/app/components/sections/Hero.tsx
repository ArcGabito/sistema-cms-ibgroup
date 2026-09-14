import Image from "next/image";
import Container from "@/app/components/ui/Container";
import Button from "@/app/components/ui/Button";
import Reveal from "@/app/components/ui/Reveal";

const FEATURE_CARDS = [
  {
    image: "/assets/hero-block-1.jpg",
    title: "Outplacement",
    text: "El mejor empleo en el menor tiempo posible.",
    highlight: true,
  },
  {
    image: "/assets/hero-block-2.jpg",
    title: "Coaching",
    text: "Optimiza la búsqueda de empleo y desarrolla habilidades blandas.",
    highlight: false,
  },
];

export default function Hero() {
  return (
    <section id="hero" className="relative">
      <div className="relative isolate flex min-h-160 items-center overflow-hidden bg-ink">
        <Image
          src="/assets/hero-portada.jpg"
          alt="Ejecutivos en un proceso de outplacement"
          fill
          priority
          quality={75}
          sizes="100vw"
          className="object-cover opacity-45"
        />
        <div className="absolute inset-0 bg-linear-to-r from-ink via-ink/85 to-ink/40" />

        <Container className="relative z-10 py-28">
          <Reveal className="max-w-2xl">
            <div className="flex items-start gap-4">
              <span className="mt-2 h-16 w-1 shrink-0 bg-brand" />
              <h1 className="font-heading text-3xl leading-tight font-bold text-white sm:text-4xl lg:text-5xl">
                Outplacement en Perú para Ejecutivos y Profesionales en
                Transición Laboral
              </h1>
            </div>
            <p className="mt-6 max-w-xl text-sm leading-relaxed text-white/70 sm:text-base">
              Nuestros programas de outplacement en Perú para ejecutivos y
              profesionales en transición laboral incluyen sesiones de
              coaching de empleabilidad, entrenamiento para entrevistas y
              acompañamiento personalizado en la transición de carrera
              profesional.
            </p>
            <div className="mt-10">
              <Button href="#contacto" variant="solid">
                Ver Programas Outplacement
              </Button>
            </div>
          </Reveal>
        </Container>
      </div>

      <Container className="relative z-20 -mt-16 sm:-mt-20">
        <div className="grid grid-cols-1 overflow-hidden rounded-2xl shadow-xl sm:grid-cols-2">
          {FEATURE_CARDS.map((card, i) => (
            <Reveal
              key={card.title}
              delay={i * 0.15}
              className={`relative flex min-h-55 items-end p-8 ${
                card.highlight ? "bg-brand" : "bg-ink"
              }`}
            >
              <Image
                src={card.image}
                alt={card.title}
                fill
                sizes="(min-width: 640px) 50vw, 100vw"
                className="object-cover opacity-25"
              />
              <div className="relative z-10">
                <p className="font-heading text-lg font-semibold tracking-wide text-white uppercase sm:text-xl">
                  {card.title}
                </p>
                <p className="mt-2 max-w-sm text-xs leading-relaxed text-white/80 uppercase sm:text-sm">
                  {card.text}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
