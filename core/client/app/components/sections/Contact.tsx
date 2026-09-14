"use client";

import { useState } from "react";
import Container from "@/app/components/ui/Container";
import SectionLabel from "@/app/components/ui/SectionLabel";
import PersonasForm from "@/app/components/forms/PersonasForm";
import EmpresasForm from "@/app/components/forms/EmpresasForm";

type Tab = "personas" | "empresas";

export default function Contact() {
  const [tab, setTab] = useState<Tab>("personas");

  return (
    <section id="contacto" className="bg-surface py-20 sm:py-28">
      <Container>
        <div className="mx-auto max-w-2xl text-center">
          <SectionLabel align="center">Contáctanos</SectionLabel>
          <h2 className="mt-4 font-heading text-3xl font-bold text-ink sm:text-4xl">
            Comienza tu proceso de transición laboral
          </h2>
        </div>

        <div className="mx-auto mt-10 flex max-w-md items-center justify-center gap-3">
          {(["personas", "empresas"] as Tab[]).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={`flex-1 rounded-full px-6 py-3 text-xs font-semibold tracking-[0.15em] uppercase transition-colors ${
                tab === t
                  ? "bg-brand text-white"
                  : "border border-ink/15 bg-white text-ink/60 hover:border-brand hover:text-brand"
              }`}
            >
              Contacto {t}
            </button>
          ))}
        </div>

        <div className="mx-auto mt-12 max-w-4xl rounded-2xl border border-black/5 bg-white p-6 shadow-sm sm:p-10">
          <div key={tab} className="[animation:fade-in_0.3s_ease-out]">
            {tab === "personas" ? <PersonasForm /> : <EmpresasForm />}
          </div>
        </div>
      </Container>
    </section>
  );
}
