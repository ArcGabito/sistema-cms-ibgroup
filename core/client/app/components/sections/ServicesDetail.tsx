import Image from "next/image";
import { CheckCircle2 } from "lucide-react";
import Container from "@/app/components/ui/Container";
import Button from "@/app/components/ui/Button";
import Reveal from "@/app/components/ui/Reveal";
import type { ServiceItem } from "@/app/lib/content";
import { serviceIcon } from "@/app/lib/service-icons";

export default function ServicesDetail({ services }: { services: ServiceItem[] }) {
  return (
    <section className="py-20 sm:py-28">
      <Container>
        <div className="flex flex-col gap-20 sm:gap-28">
          {services.map(({ id, icon, title, description, features, ctaLabel, imageUrl }, i) => {
            const Icon = serviceIcon(icon);
            const reversed = i % 2 === 1;
            return (
              <div
                key={id}
                className={`grid grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-16 ${
                  reversed ? "lg:[&>*:first-child]:order-2" : ""
                }`}
              >
                <Reveal className="relative">
                  <div className="relative aspect-4/3 w-full overflow-hidden rounded-2xl">
                    <Image
                      src={imageUrl}
                      alt={title}
                      fill
                      sizes="(min-width: 1024px) 45vw, 100vw"
                      className="object-cover"
                    />
                  </div>
                  <span className="absolute -bottom-6 -left-6 flex h-20 w-20 items-center justify-center rounded-full bg-brand text-white shadow-lg">
                    <Icon className="h-9 w-9" />
                  </span>
                </Reveal>

                <Reveal delay={0.1}>
                  <h3 className="font-heading text-2xl font-bold text-ink sm:text-3xl">
                    {title}
                  </h3>
                  <p className="mt-5 text-sm leading-relaxed text-ink/60 sm:text-base">
                    {description}
                  </p>
                  <ul className="mt-6 flex flex-col gap-3">
                    {features.map((feature) => (
                      <li key={feature} className="flex items-start gap-3 text-sm text-ink/80">
                        <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-brand" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-8">
                    <Button href="/contactenos" variant="solid">
                      {ctaLabel}
                    </Button>
                  </div>
                </Reveal>
              </div>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
