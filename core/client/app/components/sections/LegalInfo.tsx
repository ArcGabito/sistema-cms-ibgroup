import { Building2, ClipboardList, MessageSquareWarning, ScrollText } from "lucide-react";
import Container from "@/app/components/ui/Container";
import SectionLabel from "@/app/components/ui/SectionLabel";
import Reveal from "@/app/components/ui/Reveal";

const LEGAL_ITEMS = [
  {
    icon: Building2,
    title: "Identificación de la empresa",
    text: "IBCORP SAC, RUC 20601399882, con domicilio en Av. Circunvalación Club Golf los Incas, Torre 3, Oficina 602B, Santiago de Surco, Lima, Perú.",
  },
  {
    icon: ScrollText,
    title: "Política de tratamiento de datos personales",
    text: "Recopilamos y tratamos tus datos personales únicamente para fines vinculados a nuestros programas de outplacement y contacto comercial, con tu consentimiento previo y conforme a la Ley N.º 29733 y su reglamento. Puedes solicitar el acceso, rectificación, cancelación u oposición de tus datos escribiéndonos a nuestro correo de contacto.",
  },
  {
    icon: ClipboardList,
    title: "Términos y condiciones",
    text: "El uso de este sitio y la contratación de nuestros servicios se rigen por los términos y condiciones informados durante el proceso comercial. Los resultados de nuestros programas dependen de la ejecución, disciplina y compromiso de cada candidato, y las simulaciones o estimaciones publicadas son de carácter referencial.",
  },
  {
    icon: MessageSquareWarning,
    title: "Libro de reclamaciones",
    text: "Si tienes una queja o reclamo sobre nuestros servicios, puedes hacerlo llegar a través de nuestro correo de contacto o de forma presencial en nuestras oficinas. Todo reclamo es atendido y respondido dentro de los plazos que establece la normativa de protección al consumidor.",
  },
];

export default function LegalInfo() {
  return (
    <section className="bg-ink py-20 text-white sm:py-28">
      <Container>
        <div className="mx-auto max-w-2xl text-center">
          <SectionLabel align="center">Información legal</SectionLabel>
          <h2 className="mt-4 font-heading text-3xl font-bold sm:text-4xl">
            Transparencia corporativa
          </h2>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-8 sm:grid-cols-2">
          {LEGAL_ITEMS.map(({ icon: Icon, title, text }, i) => (
            <Reveal key={title} delay={i * 0.1}>
              <div className="flex h-full gap-4 rounded-xl border border-white/10 p-6">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/5">
                  <Icon className="h-5 w-5 text-brand" />
                </span>
                <div>
                  <h3 className="font-heading text-base font-semibold">{title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-white/60">{text}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
