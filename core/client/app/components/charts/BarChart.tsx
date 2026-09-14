"use client";

import { useState } from "react";

interface BarChartProps {
  data: { year: string; value: number }[];
  yMax: number;
  yStep: number;
  formatValue: (value: number) => string;
  formatTick?: (value: number) => string;
  color?: string;
  colorHover?: string;
}

const VIEW_W = 640;
const VIEW_H = 340;
const MARGIN = { top: 20, right: 16, bottom: 32, left: 40 };
const PLOT_W = VIEW_W - MARGIN.left - MARGIN.right;
const PLOT_H = VIEW_H - MARGIN.top - MARGIN.bottom;
const INSIDE_LABEL_MIN_HEIGHT = 28;

export default function BarChart({
  data,
  yMax,
  yStep,
  formatValue,
  formatTick,
  color = "#d21f2e",
  colorHover = "#a3141f",
}: BarChartProps) {
  const [hovered, setHovered] = useState<number | null>(null);

  const ticks = [];
  for (let t = 0; t <= yMax; t += yStep) ticks.push(t);

  const slotWidth = PLOT_W / data.length;
  const barWidth = Math.min(24, slotWidth * 0.55);
  const baselineY = MARGIN.top + PLOT_H;

  const valueToY = (value: number) => MARGIN.top + PLOT_H - (value / yMax) * PLOT_H;

  const hoveredBar = hovered !== null ? data[hovered] : null;
  const hoveredX = hovered !== null ? MARGIN.left + hovered * slotWidth + slotWidth / 2 : 0;
  const hoveredY = hoveredBar ? valueToY(hoveredBar.value) : 0;

  return (
    <div className="relative w-full">
      <svg viewBox={`0 0 ${VIEW_W} ${VIEW_H}`} className="w-full" role="img" aria-label="Gráfico de barras">
        {ticks.map((t) => {
          const y = valueToY(t);
          return (
            <g key={t}>
              <line
                x1={MARGIN.left}
                x2={VIEW_W - MARGIN.right}
                y1={y}
                y2={y}
                stroke="#e1e0d9"
                strokeWidth={1}
              />
              <text x={MARGIN.left - 10} y={y} textAnchor="end" dominantBaseline="middle" className="fill-ink/40 text-[10px]">
                {formatTick ? formatTick(t) : t}
              </text>
            </g>
          );
        })}
        <line
          x1={MARGIN.left}
          x2={MARGIN.left}
          y1={MARGIN.top}
          y2={baselineY}
          stroke="#c3c2b7"
          strokeWidth={1}
        />
        <line
          x1={MARGIN.left}
          x2={VIEW_W - MARGIN.right}
          y1={baselineY}
          y2={baselineY}
          stroke="#c3c2b7"
          strokeWidth={1}
        />

        {data.map((d, i) => {
          const barHeight = (d.value / yMax) * PLOT_H;
          const barTop = baselineY - barHeight;
          const x = MARGIN.left + i * slotWidth + (slotWidth - barWidth) / 2;
          const isHovered = hovered === i;
          const insideLabel = barHeight >= INSIDE_LABEL_MIN_HEIGHT;

          return (
            <g
              key={d.year}
              tabIndex={0}
              role="img"
              aria-label={`${d.year}: ${formatValue(d.value)}`}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
              onFocus={() => setHovered(i)}
              onBlur={() => setHovered(null)}
              className="cursor-pointer outline-none"
            >
              <rect
                x={x}
                y={barTop}
                width={barWidth}
                height={Math.max(barHeight, 2)}
                rx={4}
                ry={4}
                fill={isHovered ? colorHover : color}
              />
              {barHeight > 4 && (
                <rect x={x} y={baselineY - 4} width={barWidth} height={4} fill={isHovered ? colorHover : color} />
              )}

              {insideLabel ? (
                <text
                  x={x + barWidth / 2}
                  y={barTop + 16}
                  textAnchor="middle"
                  className="fill-white text-[11px] font-semibold"
                >
                  {formatValue(d.value)}
                </text>
              ) : (
                <text
                  x={x + barWidth / 2}
                  y={barTop - 6}
                  textAnchor="middle"
                  className="fill-ink text-[11px] font-semibold"
                >
                  {formatValue(d.value)}
                </text>
              )}

              <text
                x={x + barWidth / 2}
                y={baselineY + 18}
                textAnchor="middle"
                className="fill-ink/60 text-[11px] font-medium"
              >
                {d.year}
              </text>
            </g>
          );
        })}
      </svg>

      {hoveredBar && (
        <div
          className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full rounded-lg bg-ink px-3 py-1.5 text-xs whitespace-nowrap text-white shadow-lg"
          style={{
            left: `${(hoveredX / VIEW_W) * 100}%`,
            top: `${((hoveredY - 10) / VIEW_H) * 100}%`,
          }}
        >
          <span className="font-semibold">{hoveredBar.year}:</span> {formatValue(hoveredBar.value)}
        </div>
      )}
    </div>
  );
}
