import Image from "next/image";
import Container from "@/app/components/ui/Container";
import SectionLabel from "@/app/components/ui/SectionLabel";
import Reveal from "@/app/components/ui/Reveal";
import type { CountryItem } from "@/app/lib/content";

export default function CountriesGrid({ countries }: { countries: CountryItem[] }) {
  return (
    <section className="py-20 sm:py-28">
      <Container>
        <div className="mx-auto max-w-2xl text-center">
          <SectionLabel align="center">Presencia regional</SectionLabel>
          <h2 className="mt-4 font-heading text-3xl font-bold text-ink sm:text-4xl">
            Operamos en {countries.length} países
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-ink/60">
            Contamos con equipos y consultores locales que conocen de cerca el
            mercado laboral de cada país donde operamos, para ofrecer un
            acompañamiento realmente adaptado a tu contexto.
          </p>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {countries.map(({ id, name, code, description }, i) => (
            <Reveal key={id} delay={i * 0.06}>
              <div className="flex h-full flex-col items-center gap-4 rounded-xl border border-black/5 p-6 text-center transition-shadow hover:shadow-lg">
                <span className="relative h-16 w-16 overflow-hidden rounded-full border border-black/10 shadow-sm">
                  <Image
                    src={`https://flagcdn.com/w160/${code}.png`}
                    alt={`Bandera de ${name}`}
                    fill
                    sizes="64px"
                    className="object-cover"
                  />
                </span>
                <div>
                  <p className="text-sm font-semibold tracking-wide text-ink uppercase">{name}</p>
                  <p className="mt-2 text-xs leading-relaxed text-ink/60">{description}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
