"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Container from "@/app/components/ui/Container";
import SectionLabel from "@/app/components/ui/SectionLabel";
import Reveal from "@/app/components/ui/Reveal";
import BarChart from "@/app/components/charts/BarChart";
import GroupedBarChart from "@/app/components/charts/GroupedBarChart";
import {
  MEJORO_PUESTO,
  MEJORO_SUELDO,
  RECOLOCACION_MESES,
  RECOLOCADOS_RED_CONTACTOS,
  TRABAJAN_NO_TRABAJAN,
} from "@/app/lib/stats-data";

const formatMonths = (v: number) => v.toLocaleString("es-PE", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
const formatPercent = (v: number) => `${v}%`;

const SLIDES = [
  {
    title: "Meses promedio de recolocación",
    description: "Tiempo promedio, en meses, que toma a nuestros candidatos conseguir una nueva posición.",
    render: () => (
      <BarChart data={RECOLOCACION_MESES} yMax={12} yStep={2} formatValue={formatMonths} />
    ),
  },
  {
    title: "Recolocados por red de contactos",
    description: "Porcentaje de candidatos que logró su nueva posición activando su red de contactos.",
    render: () => (
      <BarChart data={RECOLOCADOS_RED_CONTACTOS} yMax={100} yStep={20} formatValue={formatPercent} formatTick={(v) => `${v}%`} />
    ),
  },
  {
    title: "Mejoró o igualó sueldo anterior",
    description: "Porcentaje de candidatos que se recolocó con una compensación igual o superior a la anterior.",
    render: () => (
      <BarChart data={MEJORO_SUELDO} yMax={100} yStep={20} formatValue={formatPercent} formatTick={(v) => `${v}%`} />
    ),
  },
  {
    title: "Mejoró o igualó puesto anterior",
    description: "Porcentaje de candidatos que se recolocó en un nivel de puesto igual o superior al anterior.",
    render: () => (
      <BarChart data={MEJORO_PUESTO} yMax={100} yStep={20} formatValue={formatPercent} formatTick={(v) => `${v}%`} />
    ),
  },
  {
    title: "Clientes que contratan nuestro servicio: trabajan o no trabajan",
    description: "Distribución de candidatos que iniciaron su proceso de outplacement estando o no empleados.",
    render: () => (
      <GroupedBarChart data={TRABAJAN_NO_TRABAJAN} yMax={100} yStep={20} formatValue={formatPercent} />
    ),
  },
];

export default function StatsCarousel() {
  const [index, setIndex] = useState(0);

  const goTo = (target: number) => {
    const clamped = (target + SLIDES.length) % SLIDES.length;
    setIndex(clamped);
  };

  const slide = SLIDES[index];

  return (
    <section className="py-20 sm:py-28">
      <Container>
        <div className="mx-auto max-w-2xl text-center">
          <SectionLabel align="center">Estadísticas</SectionLabel>
          <h2 className="mt-4 font-heading text-3xl font-bold text-ink sm:text-4xl">
            Estadísticas 2018 - 2025
          </h2>
        </div>

        <Reveal className="relative mx-auto mt-14 max-w-3xl">
          <button
            type="button"
            aria-label="Estadística anterior"
            onClick={() => goTo(index - 1)}
            className="absolute top-1/2 left-0 z-10 hidden h-11 w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-ink/15 bg-white text-ink shadow-sm transition-colors hover:bg-ink hover:text-white sm:flex"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            aria-label="Siguiente estadística"
            onClick={() => goTo(index + 1)}
            className="absolute top-1/2 right-0 z-10 hidden h-11 w-11 translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-ink/15 bg-white text-ink shadow-sm transition-colors hover:bg-ink hover:text-white sm:flex"
          >
            <ChevronRight className="h-5 w-5" />
          </button>

          <div className="overflow-hidden rounded-2xl border border-black/5 bg-white p-6 shadow-sm sm:p-10">
            <div key={index} className="[animation:fade-in_0.3s_ease-out]">
              <h3 className="text-center font-heading text-lg font-bold text-ink sm:text-xl">
                {slide.title}
              </h3>
              <p className="mx-auto mt-2 max-w-lg text-center text-xs leading-relaxed text-ink/50">
                {slide.description}
              </p>
              <div className="mt-6">{slide.render()}</div>
            </div>
          </div>

          <div className="mt-8 flex items-center justify-center gap-3 sm:hidden">
            <button
              type="button"
              aria-label="Estadística anterior"
              onClick={() => goTo(index - 1)}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-ink/15 text-ink hover:bg-ink hover:text-white transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              aria-label="Siguiente estadística"
              onClick={() => goTo(index + 1)}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-ink/15 text-ink hover:bg-ink hover:text-white transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          <div className="mt-6 flex justify-center gap-2">
            {SLIDES.map((s, i) => (
              <button
                key={s.title}
                type="button"
                aria-label={`Ir a ${s.title}`}
                onClick={() => goTo(i)}
                className={`h-2 rounded-full transition-all ${
                  index === i ? "w-6 bg-brand" : "w-2 bg-ink/20"
                }`}
              />
            ))}
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
