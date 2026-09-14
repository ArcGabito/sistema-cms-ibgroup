"use client";

import { useState } from "react";
import type { YearGroupValue } from "@/app/lib/stats-data";

interface GroupedBarChartProps {
  data: YearGroupValue[];
  yMax: number;
  yStep: number;
  formatValue: (value: number) => string;
}

const VIEW_W = 640;
const VIEW_H = 340;
const MARGIN = { top: 20, right: 16, bottom: 32, left: 40 };
const PLOT_W = VIEW_W - MARGIN.left - MARGIN.right;
const PLOT_H = VIEW_H - MARGIN.top - MARGIN.bottom;
const GAP = 2;
const INSIDE_LABEL_MIN_HEIGHT = 28;

const SERIES = [
  { key: "trabajan" as const, label: "Trabajan", color: "#2a78d6", colorHover: "#1c5cab" },
  { key: "noTrabajan" as const, label: "No trabajan", color: "#d21f2e", colorHover: "#a3141f" },
];

export default function GroupedBarChart({ data, yMax, yStep, formatValue }: GroupedBarChartProps) {
  const [hovered, setHovered] = useState<number | null>(null);

  const ticks = [];
  for (let t = 0; t <= yMax; t += yStep) ticks.push(t);

  const slotWidth = PLOT_W / data.length;
  const groupWidth = Math.min(56, slotWidth * 0.65);
  const barWidth = (groupWidth - GAP) / 2;
  const baselineY = MARGIN.top + PLOT_H;

  const valueToY = (value: number) => MARGIN.top + PLOT_H - (value / yMax) * PLOT_H;

  const hoveredRow = hovered !== null ? data[hovered] : null;
  const hoveredX = hovered !== null ? MARGIN.left + hovered * slotWidth + slotWidth / 2 : 0;
  const hoveredTopY =
    hoveredRow ? valueToY(Math.max(hoveredRow.trabajan, hoveredRow.noTrabajan)) : 0;

  return (
    <div className="relative w-full">
      <div className="mb-4 flex items-center justify-center gap-6">
        {SERIES.map((s) => (
          <div key={s.key} className="flex items-center gap-2 text-xs font-medium text-ink/70">
            <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: s.color }} />
            {s.label}
          </div>
        ))}
      </div>

      <svg viewBox={`0 0 ${VIEW_W} ${VIEW_H}`} className="w-full" role="img" aria-label="Gráfico de barras agrupadas">
        {ticks.map((t) => {
          const y = valueToY(t);
          return (
            <g key={t}>
              <line x1={MARGIN.left} x2={VIEW_W - MARGIN.right} y1={y} y2={y} stroke="#e1e0d9" strokeWidth={1} />
              <text x={MARGIN.left - 10} y={y} textAnchor="end" dominantBaseline="middle" className="fill-ink/40 text-[10px]">
                {t}%
              </text>
            </g>
          );
        })}
        <line x1={MARGIN.left} x2={MARGIN.left} y1={MARGIN.top} y2={baselineY} stroke="#c3c2b7" strokeWidth={1} />
        <line x1={MARGIN.left} x2={VIEW_W - MARGIN.right} y1={baselineY} y2={baselineY} stroke="#c3c2b7" strokeWidth={1} />

        {data.map((d, i) => {
          const groupX = MARGIN.left + i * slotWidth + (slotWidth - groupWidth) / 2;
          const isHovered = hovered === i;

          return (
            <g
              key={d.year}
              tabIndex={0}
              role="img"
              aria-label={`${d.year}: trabajan ${formatValue(d.trabajan)}, no trabajan ${formatValue(d.noTrabajan)}`}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
              onFocus={() => setHovered(i)}
              onBlur={() => setHovered(null)}
              className="cursor-pointer outline-none"
            >
              {SERIES.map((s, si) => {
                const value = d[s.key];
                const barHeight = (value / yMax) * PLOT_H;
                const barTop = baselineY - barHeight;
                const x = groupX + si * (barWidth + GAP);
                const insideLabel = barHeight >= INSIDE_LABEL_MIN_HEIGHT;
                const fill = isHovered ? s.colorHover : s.color;

                return (
                  <g key={s.key}>
                    <rect x={x} y={barTop} width={barWidth} height={Math.max(barHeight, 2)} rx={4} ry={4} fill={fill} />
                    {barHeight > 4 && <rect x={x} y={baselineY - 4} width={barWidth} height={4} fill={fill} />}
                    {insideLabel ? (
                      <text x={x + barWidth / 2} y={barTop + 14} textAnchor="middle" className="fill-white text-[9px] font-semibold">
                        {formatValue(value)}
                      </text>
                    ) : (
                      <text x={x + barWidth / 2} y={barTop - 5} textAnchor="middle" className="fill-ink text-[9px] font-semibold">
                        {formatValue(value)}
                      </text>
                    )}
                  </g>
                );
              })}

              <text x={groupX + groupWidth / 2} y={baselineY + 18} textAnchor="middle" className="fill-ink/60 text-[11px] font-medium">
                {d.year}
              </text>
            </g>
          );
        })}
      </svg>

      {hoveredRow && (
        <div
          className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full rounded-lg bg-ink px-3 py-2 text-xs whitespace-nowrap text-white shadow-lg"
          style={{
            left: `${(hoveredX / VIEW_W) * 100}%`,
            top: `${((hoveredTopY - 10) / VIEW_H) * 100}%`,
          }}
        >
          <p className="font-semibold">{hoveredRow.year}</p>
          <p>Trabajan: {formatValue(hoveredRow.trabajan)}</p>
          <p>No trabajan: {formatValue(hoveredRow.noTrabajan)}</p>
        </div>
      )}
    </div>
  );
}
