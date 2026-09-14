"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ChevronDown, Menu, X } from "lucide-react";
import Container from "@/app/components/ui/Container";

const NAV_LINKS = [
  { label: "Inicio", href: "/" },
  { label: "Servicios", href: "/servicios" },
  { label: "Preguntas", href: "/preguntas" },
  { label: "Blog", href: "/blog" },
];

const RESOURCE_LINKS = [
  { label: "Calculadora", href: "/calculadora" },
  { label: "Estadísticas", href: "/estadisticas" },
  { label: "Transparencia", href: "/transparencia" },
  { label: "Aliados", href: "/aliados" },
  { label: "Test de Empleabilidad", href: "/test-empleabilidad" },
];

const CONTACT_LINK = { label: "Contáctenos", href: "/contactenos" };

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [mobileResourcesOpen, setMobileResourcesOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const linkClass =
    "rounded-full px-4 py-2 text-xs font-semibold tracking-wide text-ink/70 uppercase hover:text-brand transition-colors";

  return (
    <header className="sticky top-0 z-50 border-b border-black/5 bg-white/95 backdrop-blur">
      <Container className="flex items-center justify-between py-4">
        <Link href="/" className="shrink-0 font-heading text-2xl font-bold tracking-tight">
          <span className="text-brand">IB</span>
          <span className="text-ink">OUTPLACEMENT</span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {NAV_LINKS.map((link) => (
            <Link key={link.label} href={link.href} className={linkClass}>
              {link.label}
            </Link>
          ))}

          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setDropdownOpen((v) => !v)}
              className={`flex items-center gap-1 ${linkClass}`}
              aria-expanded={dropdownOpen}
            >
              Recursos
              <ChevronDown
                className={`h-3.5 w-3.5 transition-transform ${dropdownOpen ? "rotate-180" : ""}`}
              />
            </button>

            <div
              className={`absolute top-full left-1/2 z-50 mt-3 w-56 -translate-x-1/2 overflow-hidden rounded-xl border border-black/5 bg-white py-2 shadow-lg transition-all duration-150 ${
                dropdownOpen
                  ? "visible translate-y-0 opacity-100"
                  : "invisible translate-y-2 opacity-0"
              }`}
            >
              {RESOURCE_LINKS.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  onClick={() => setDropdownOpen(false)}
                  className="block px-5 py-2.5 text-xs font-semibold tracking-wide text-ink/70 uppercase hover:bg-surface hover:text-brand transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          <Link
            href={CONTACT_LINK.href}
            className="rounded-full bg-brand px-4 py-2 text-xs font-semibold tracking-wide text-white uppercase hover:bg-brand-dark transition-colors"
          >
            {CONTACT_LINK.label}
          </Link>
        </nav>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="text-ink lg:hidden"
          aria-label="Abrir menú"
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </Container>

      {open && (
        <div className="border-t border-black/5 bg-white lg:hidden">
          <Container className="flex flex-col gap-1 py-4">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-full px-4 py-3 text-center text-xs font-semibold tracking-wide text-ink/70 uppercase hover:bg-surface"
              >
                {link.label}
              </Link>
            ))}

            <button
              type="button"
              onClick={() => setMobileResourcesOpen((v) => !v)}
              className="flex items-center justify-center gap-1 rounded-full px-4 py-3 text-center text-xs font-semibold tracking-wide text-ink/70 uppercase hover:bg-surface"
              aria-expanded={mobileResourcesOpen}
            >
              Recursos
              <ChevronDown
                className={`h-3.5 w-3.5 transition-transform ${mobileResourcesOpen ? "rotate-180" : ""}`}
              />
            </button>

            <div
              className={`grid overflow-hidden pl-4 transition-all duration-200 ${
                mobileResourcesOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
              }`}
            >
              <div className="flex flex-col gap-1 overflow-hidden">
                {RESOURCE_LINKS.map((link) => (
                  <Link
                    key={link.label}
                    href={link.href}
                    onClick={() => {
                      setOpen(false);
                      setMobileResourcesOpen(false);
                    }}
                    className="rounded-full px-4 py-2.5 text-center text-xs font-semibold tracking-wide text-ink/60 uppercase hover:bg-surface"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>

            <Link
              href={CONTACT_LINK.href}
              onClick={() => setOpen(false)}
              className="mt-2 rounded-full bg-brand px-4 py-3 text-center text-xs font-semibold tracking-wide text-white uppercase"
            >
              {CONTACT_LINK.label}
            </Link>
          </Container>
        </div>
      )}
    </header>
  );
}
