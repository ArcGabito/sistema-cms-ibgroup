import type { ComponentType } from "react";

type Tone = "default" | "brand" | "success" | "warning";

interface StatCardProps {
  icon: ComponentType<{ className?: string }>;
  label: string;
  value: string | number;
  tone?: Tone;
}

const TONE_CLASSES: Record<Tone, string> = {
  default: "bg-surface text-ink/50",
  brand: "bg-brand/10 text-brand",
  success: "bg-green-100 text-green-700",
  warning: "bg-amber-100 text-amber-700",
};

export default function StatCard({ icon: Icon, label, value, tone = "default" }: StatCardProps) {
  return (
    <div className="flex items-center gap-4 rounded-lg border border-black/10 bg-white p-5">
      <span
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${TONE_CLASSES[tone]}`}
      >
        <Icon className="h-5 w-5" />
      </span>
      <div className="min-w-0">
        <p className="text-2xl font-bold text-ink">{value}</p>
        <p className="truncate text-xs font-semibold tracking-wider text-ink/40 uppercase">{label}</p>
      </div>
    </div>
  );
}
