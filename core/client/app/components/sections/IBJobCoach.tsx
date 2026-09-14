import Container from "@/app/components/ui/Container";
import Button from "@/app/components/ui/Button";
import Reveal from "@/app/components/ui/Reveal";

export default function IBJobCoach() {
  return (
    <section className="bg-surface py-20 sm:py-28">
      <Container>
        <Reveal className="mx-auto max-w-2xl text-center">
          <h2 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl">
            <span className="text-ink">IBJOB</span>
            <span className="text-brand">COACH</span>
          </h2>
          <p className="mt-6 text-lg font-medium text-ink">
            ¿Quieres disponer de una herramienta potente para tu búsqueda de empleo?
          </p>
          <p className="mt-4 text-sm leading-relaxed text-ink/60">
            IBJOBCOACH es una plataforma de gestión virtual que te ayudará a
            efectuar tu transición de carrera y reinserción a un nuevo empleo
            con disposición de contenidos para que perfecciones tu perfil
            laboral y mejores tu visibilidad al mercado de empleos.
          </p>
          <div className="mt-8">
            <Button href="#contacto" variant="solid">
              Contáctanos para más información
            </Button>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
