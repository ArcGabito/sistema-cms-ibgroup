import type { ReactNode } from "react";

type Tone = "success" | "neutral" | "info" | "warning" | "brand";

const TONE_CLASSES: Record<Tone, string> = {
  success: "bg-green-100 text-green-700",
  neutral: "bg-black/5 text-ink/50",
  info: "bg-blue-100 text-blue-700",
  warning: "bg-amber-100 text-amber-700",
  brand: "bg-brand/10 text-brand",
};

export default function Badge({ tone = "neutral", children }: { tone?: Tone; children: ReactNode }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold whitespace-nowrap ${TONE_CLASSES[tone]}`}
    >
      {children}
    </span>
  );
}
