import { MessageCircle } from "lucide-react";

export default function FloatingContact() {
  return (
    <a
      href="https://wa.me/+51902193633"
      target="_blank"
      rel="noopener noreferrer"
      className="group fixed right-5 bottom-5 z-50 flex items-center gap-3 opacity-0 [animation:fade-in_0.5s_ease-out_1s_forwards] sm:right-8 sm:bottom-8"
      aria-label="Contacta a un asesor por WhatsApp"
    >
      <span className="hidden max-w-0 overflow-hidden rounded-full bg-ink py-3 pl-0 pr-0 text-xs font-semibold tracking-wide text-white uppercase whitespace-nowrap opacity-0 transition-all duration-300 group-hover:max-w-xs group-hover:px-5 group-hover:opacity-100 sm:block">
        Contacta a un asesor
      </span>

      <span className="relative flex h-14 w-14 shrink-0 items-center justify-center">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand opacity-60" />
        <span className="relative flex h-14 w-14 items-center justify-center rounded-full bg-brand text-white shadow-lg transition-transform group-hover:scale-105">
          <MessageCircle className="h-6 w-6" />
        </span>
      </span>
    </a>
  );
}
