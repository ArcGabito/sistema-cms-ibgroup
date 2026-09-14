import { Briefcase, Camera, Mail, Phone, PlaySquare, ThumbsUp, X as XIcon } from "lucide-react";
import Container from "@/app/components/ui/Container";

const SOCIALS = [
  { icon: ThumbsUp, href: "https://www.facebook.com/IBOutplacementOficial/", label: "Facebook" },
  { icon: Camera, href: "https://www.instagram.com/iboutplacement/", label: "Instagram" },
  { icon: Briefcase, href: "https://www.linkedin.com/company/iboutplacement/", label: "LinkedIn" },
  { icon: XIcon, href: "https://x.com/ib_outplacement", label: "X (Twitter)" },
  { icon: PlaySquare, href: "https://www.youtube.com/channel/UC9NkcDwe6-P37cHXkn1XBcA", label: "YouTube" },
];

export default function TopBar() {
  return (
    <div className="hidden bg-ink text-white/80 lg:block">
      <Container className="flex items-center justify-between py-2 text-xs">
        <div className="flex items-center gap-6">
          <a
            href="mailto:cm.outplacement.coaching@corporacionibgroup.pe"
            className="flex items-center gap-2 hover:text-white transition-colors"
          >
            <Mail className="h-3.5 w-3.5 text-brand" />
            cm.outplacement.coaching@corporacionibgroup.pe
          </a>
          <a
            href="tel:+51902193633"
            className="flex items-center gap-2 hover:text-white transition-colors"
          >
            <Phone className="h-3.5 w-3.5 text-brand" />
            902 193 633
          </a>
        </div>
        <div className="flex items-center gap-4">
          <a
            href="/test-empleabilidad"
            className="font-semibold tracking-wide text-white/90 hover:text-brand transition-colors"
          >
            Test de Empleabilidad Laboral
          </a>
          <span className="h-4 w-px bg-white/20" />
          <div className="flex items-center gap-3">
            {SOCIALS.map(({ icon: Icon, href, label }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className="text-white/70 hover:text-brand transition-colors"
              >
                <Icon className="h-3.5 w-3.5" />
              </a>
            ))}
          </div>
        </div>
      </Container>
    </div>
  );
}
