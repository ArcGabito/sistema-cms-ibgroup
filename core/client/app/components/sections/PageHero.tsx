import Image from "next/image";
import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";
import Reveal from "@/app/components/ui/Reveal";

interface PageHeroProps {
  eyebrow: string;
  title: string;
  subtitle: string;
  image: string;
}

export default function PageHero({ eyebrow, title, subtitle, image }: PageHeroProps) {
  return (
    <section className="relative isolate flex min-h-[380px] items-center overflow-hidden bg-ink sm:min-h-[440px]">
      <Image src={image} alt={title} fill priority quality={60} sizes="100vw" className="object-cover opacity-35" />
      <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/85 to-ink/50" />

      <div className="relative z-10 mx-auto w-full max-w-7xl px-6 py-24 lg:px-10">
        <Reveal className="max-w-2xl">
          <nav className="mb-6 flex items-center gap-2 text-xs font-semibold tracking-wider text-white/50 uppercase">
            <Link href="/" className="flex items-center gap-1.5 hover:text-white transition-colors">
              <Home className="h-3.5 w-3.5" />
              Inicio
            </Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="text-brand">{eyebrow}</span>
          </nav>

          <div className="flex items-start gap-4">
            <span className="mt-2 h-14 w-1 shrink-0 bg-brand" />
            <h1 className="font-heading text-3xl leading-tight font-bold text-white sm:text-4xl lg:text-5xl">
              {title}
            </h1>
          </div>
          <p className="mt-6 max-w-xl text-sm leading-relaxed text-white/70 sm:text-base">
            {subtitle}
          </p>
        </Reveal>
      </div>
    </section>
  );
}
