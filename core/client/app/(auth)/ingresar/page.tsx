import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import LoginForm from "@/app/components/forms/LoginForm";

export const metadata: Metadata = {
  title: "Ingresar | IBOutplacement",
  description: "Ingresa a tu panel de IBOutplacement con tu usuario y contraseña.",
};

// This is a demo system: when DEMO_USERNAME / DEMO_PASSWORD are set (in Vercel),
// the login form shows them as placeholders so visitors know how to get in.
// The page is prerendered, so changing them takes a redeploy.
const DEMO_USERNAME = process.env.DEMO_USERNAME?.trim() || undefined;
const DEMO_PASSWORD = process.env.DEMO_PASSWORD?.trim() || undefined;

export default function IngresarPage() {
  return (
    <div className="grid flex-1 grid-cols-1 lg:grid-cols-2">
      <div className="relative isolate hidden overflow-hidden bg-ink lg:flex lg:flex-col lg:justify-between lg:p-12">
        <Image
          src="https://picsum.photos/seed/ibout-ingresar/1200/1600"
          alt="Ejecutivos en un proceso de outplacement"
          fill
          sizes="50vw"
          className="object-cover opacity-30"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-ink/40 via-ink/70 to-ink" />

        <Link href="/" className="relative z-10 font-heading text-2xl font-bold tracking-tight">
          <span className="text-brand">IB</span>
          <span className="text-white">OUTPLACEMENT</span>
        </Link>

        <div className="relative z-10 max-w-md">
          <span className="mb-4 block h-1 w-12 bg-brand" />
          <h2 className="font-heading text-3xl font-bold text-white">
            Tu proceso de transición laboral, en un solo lugar
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-white/60">
            Desde tu panel puedes revisar el avance de tu programa, tus
            sesiones de coaching agendadas y los recursos que tu consultor
            comparte contigo.
          </p>
        </div>
      </div>

      <div className="flex flex-col justify-center bg-white px-6 py-16 sm:px-12 lg:px-20">
        <Link
          href="/"
          className="mb-10 inline-flex items-center gap-2 self-start text-xs font-semibold tracking-wide text-ink/50 uppercase hover:text-brand transition-colors lg:hidden"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Volver al sitio
        </Link>

        <div className="flex flex-1 items-center justify-center">
          <LoginForm demoUsername={DEMO_USERNAME} demoPassword={DEMO_PASSWORD} />
        </div>
      </div>
    </div>
  );
}
