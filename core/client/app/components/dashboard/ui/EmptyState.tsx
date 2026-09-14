import type { ComponentType } from "react";

interface EmptyStateProps {
  icon: ComponentType<{ className?: string }>;
  title: string;
  description?: string;
}

export default function EmptyState({ icon: Icon, title, description }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-14 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-surface text-ink/30">
        <Icon className="h-5 w-5" />
      </span>
      <div>
        <p className="text-sm font-semibold text-ink/60">{title}</p>
        {description && <p className="mt-1 text-xs text-ink/40">{description}</p>}
      </div>
    </div>
  );
}
