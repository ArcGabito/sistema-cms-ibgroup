import Image from "next/image";
import Link from "next/link";
import Container from "@/app/components/ui/Container";
import SectionLabel from "@/app/components/ui/SectionLabel";
import Reveal from "@/app/components/ui/Reveal";
import type { CountryItem } from "@/app/lib/content";

export default function Countries({ countries }: { countries: CountryItem[] }) {
  return (
    <section id="paises" className="py-20 sm:py-24">
      <Container>
        <div className="mx-auto max-w-xl text-center">
          <SectionLabel align="center">Presencia regional</SectionLabel>
          <h2 className="mt-4 font-heading text-2xl font-bold text-ink sm:text-3xl">
            Estamos presentes en los siguientes países
          </h2>
        </div>

        <div className="mt-12 flex flex-wrap items-center justify-center gap-12">
          {countries.map(({ id, name, code }, i) => (
            <Reveal key={id} delay={i * 0.1} className="flex flex-col items-center gap-3">
              <span className="relative h-20 w-20 overflow-hidden rounded-full border border-black/10 shadow-sm">
                <Image
                  src={`https://flagcdn.com/w160/${code}.png`}
                  alt={`Bandera de ${name}`}
                  fill
                  sizes="80px"
                  className="object-cover"
                />
              </span>
              <p className="text-sm font-semibold tracking-wide text-ink uppercase">{name}</p>
            </Reveal>
          ))}
        </div>

        <div className="mt-10 text-center">
          <Link
            href="/aliados"
            className="text-xs font-semibold tracking-wider text-brand uppercase hover:text-brand-dark transition-colors"
          >
            Conoce más sobre nuestros aliados →
          </Link>
        </div>
      </Container>
    </section>
  );
}
