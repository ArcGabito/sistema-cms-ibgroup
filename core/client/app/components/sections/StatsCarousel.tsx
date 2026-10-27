"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Container from "@/app/components/ui/Container";
import SectionLabel from "@/app/components/ui/SectionLabel";
import Reveal from "@/app/components/ui/Reveal";
import BarChart from "@/app/components/charts/BarChart";
import GroupedBarChart from "@/app/components/charts/GroupedBarChart";
import type { StatChart } from "@/app/lib/content";

const formatMonths = (v: number) => v.toLocaleString("es-PE", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
const formatPercent = (v: number) => `${v}%`;

function renderChart(chart: StatChart) {
  if (chart.kind === "split") {
    return (
      <GroupedBarChart
        data={chart.points.map((p) => ({ year: p.year, first: p.value, second: p.secondValue ?? 0 }))}
        labels={[chart.seriesLabel ?? "", chart.secondSeriesLabel ?? ""]}
        yMax={100}
        yStep={20}
        formatValue={formatPercent}
      />
    );
  }

  if (chart.kind === "months") {
    // Keeps the original 0-12 scale unless a value outgrows it.
    const top = Math.max(12, Math.ceil(Math.max(...chart.points.map((p) => p.value)) / 2) * 2);
    return <BarChart data={chart.points} yMax={top} yStep={2} formatValue={formatMonths} />;
  }

  return (
    <BarChart data={chart.points} yMax={100} yStep={20} formatValue={formatPercent} formatTick={(v) => `${v}%`} />
  );
}

// "2018 - 2025" from the years present in the charts, when they're numeric.
function yearRange(charts: StatChart[]) {
  const years = charts.flatMap((c) => c.points.map((p) => Number(p.year))).filter(Number.isFinite);
  if (years.length === 0) return "";
  const min = Math.min(...years);
  const max = Math.max(...years);
  return min === max ? ` ${min}` : ` ${min} - ${max}`;
}

export default function StatsCarousel({ charts }: { charts: StatChart[] }) {
  const [index, setIndex] = useState(0);

  if (charts.length === 0) {
    return null;
  }

  const goTo = (target: number) => {
    const clamped = (target + charts.length) % charts.length;
    setIndex(clamped);
  };

  const slide = charts[Math.min(index, charts.length - 1)];

  return (
    <section className="py-20 sm:py-28">
      <Container>
        <div className="mx-auto max-w-2xl text-center">
          <SectionLabel align="center">Estadísticas</SectionLabel>
          <h2 className="mt-4 font-heading text-3xl font-bold text-ink sm:text-4xl">
            Estadísticas{yearRange(charts)}
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
              <div className="mt-6">{renderChart(slide)}</div>
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
            {charts.map((s, i) => (
              <button
                key={s.id}
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
