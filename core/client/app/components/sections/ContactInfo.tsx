import { Clock, Mail, MapPin, Phone } from "lucide-react";
import Container from "@/app/components/ui/Container";
import Reveal from "@/app/components/ui/Reveal";

const INFO_ITEMS = [
  {
    icon: Mail,
    label: "Escríbenos",
    value: "cm.outplacement.coaching@corporacionibgroup.pe",
    href: "mailto:cm.outplacement.coaching@corporacionibgroup.pe",
  },
  {
    icon: Phone,
    label: "Llámanos",
    value: "902 193 633",
    href: "tel:+51902193633",
  },
  {
    icon: MapPin,
    label: "Visítanos",
    value:
      "Av. Circunvalación Club Golf los Incas, Torre 3, Oficina 602B, Santiago de Surco, Lima",
  },
  {
    icon: Clock,
    label: "Horario de atención",
    value: "Lunes a viernes, 9:00 am - 6:00 pm",
  },
];

export default function ContactInfo() {
  return (
    <section className="border-b border-black/5 py-16">
      <Container>
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {INFO_ITEMS.map(({ icon: Icon, label, value, href }, i) => {
            const content = (
              <>
                <span className="flex h-14 w-14 items-center justify-center rounded-full bg-surface">
                  <Icon className="h-6 w-6 text-brand" />
                </span>
                <p className="mt-4 text-xs font-semibold tracking-wider text-ink/50 uppercase">
                  {label}
                </p>
                <p className="mt-2 max-w-[16rem] text-sm leading-relaxed break-words text-ink transition-colors group-hover:text-brand">
                  {value}
                </p>
              </>
            );

            return (
              <Reveal key={label} delay={i * 0.08} className="flex flex-col items-center text-center">
                {href ? (
                  <a href={href} className="group flex flex-col items-center">
                    {content}
                  </a>
                ) : (
                  content
                )}
              </Reveal>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
