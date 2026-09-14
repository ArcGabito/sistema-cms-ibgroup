import Link from "next/link";
import { Briefcase, Camera, Mail, MapPin, Phone, PlaySquare, ThumbsUp, X as XIcon } from "lucide-react";
import Container from "@/app/components/ui/Container";

const RESOURCE_LINKS = [
  { label: "Preguntas Frecuentes", href: "/preguntas" },
  { label: "Blog de Desarrollo", href: "/blog" },
  { label: "Estadísticas de Resultados", href: "/estadisticas" },
];
const EXPLORE_LINKS = [
  { label: "Inicio", href: "/" },
  { label: "Nuestros Servicios", href: "/servicios" },
  { label: "Contáctanos", href: "/contactenos" },
  { label: "Aliados", href: "/aliados" },
  { label: "Panel", href: "/ingresar" },
];

const SOCIALS = [
  { icon: ThumbsUp, href: "https://www.facebook.com/IBOutplacementOficial/", label: "Facebook" },
  { icon: Camera, href: "https://www.instagram.com/iboutplacement/", label: "Instagram" },
  { icon: Briefcase, href: "https://www.linkedin.com/company/iboutplacement/", label: "LinkedIn" },
  { icon: XIcon, href: "https://x.com/ib_outplacement", label: "X (Twitter)" },
  { icon: PlaySquare, href: "https://www.youtube.com/channel/UC9NkcDwe6-P37cHXkn1XBcA", label: "YouTube" },
];

export default function Footer() {
  return (
    <footer id="footer" className="bg-ink text-white/70">
      <Container className="grid grid-cols-1 gap-x-8 gap-y-12 py-16 sm:grid-cols-2 lg:grid-cols-[0.85fr_0.85fr_1.3fr_0.85fr]">
        <div className="min-w-0">
          <h4 className="font-heading text-sm font-semibold tracking-wider text-white uppercase">
            Recursos
          </h4>
          <ul className="mt-5 space-y-3 text-sm">
            {RESOURCE_LINKS.map((link) => (
              <li key={link.label}>
                <Link href={link.href} className="hover:text-brand transition-colors">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="min-w-0">
          <h4 className="font-heading text-sm font-semibold tracking-wider text-white uppercase">
            Explorar
          </h4>
          <ul className="mt-5 space-y-3 text-sm">
            {EXPLORE_LINKS.map((link) => (
              <li key={link.label}>
                <Link href={link.href} className="hover:text-brand transition-colors">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="min-w-0 sm:col-span-2 lg:col-span-1">
          <h4 className="font-heading text-sm font-semibold tracking-wider text-white uppercase">
            Contáctanos
          </h4>
          <div className="mt-5 flex flex-col gap-3 text-sm">
            <p className="font-semibold text-white">IBCORP SAC</p>
            <p>RUC 20601399882</p>
            <a
              href="tel:+51902193633"
              className="flex min-w-0 items-center gap-2 hover:text-brand transition-colors"
            >
              <Phone className="h-4 w-4 shrink-0 text-brand" />
              902 193 633
            </a>
            <a
              href="mailto:cm.outplacement.coaching@corporacionibgroup.pe"
              className="flex min-w-0 items-start gap-2 hover:text-brand transition-colors"
            >
              <Mail className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
              <span className="min-w-0 break-all">
                cm.outplacement.coaching@corporacionibgroup.pe
              </span>
            </a>
            <p className="flex min-w-0 items-start gap-2">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
              Av. Circunvalación Club Golf los Incas, Torre 3, Oficina 602B,
              Santiago de Surco, Lima
            </p>
          </div>
        </div>

        <div className="min-w-0">
          <h4 className="font-heading text-sm font-semibold tracking-wider text-white uppercase">
            Síguenos
          </h4>
          <div className="mt-5 flex flex-nowrap gap-2.5">
            {SOCIALS.map(({ icon: Icon, href, label }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/15 hover:bg-brand hover:border-brand transition-colors"
              >
                <Icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>
      </Container>

      <div className="border-t border-white/10 py-6">
        <Container>
          <p className="text-center text-xs text-white/40">
            © {new Date().getFullYear()} IBCORP SAC. Todos los derechos reservados.
          </p>
        </Container>
      </div>
    </footer>
  );
}
