"use client";

import { FileText, CheckCircle2, FileEdit, Users } from "lucide-react";
import BarChart from "@/app/components/charts/BarChart";
import type { AnalyticsSummary } from "@/app/lib/analytics";
import StatCard from "@/app/components/dashboard/ui/StatCard";

interface RealAnalyticsProps {
  summary: AnalyticsSummary;
}

export default function RealAnalytics({ summary }: RealAnalyticsProps) {
  const statCards = [
    { icon: FileText, label: "Posts totales", value: summary.totalPosts, tone: "brand" as const },
    { icon: CheckCircle2, label: "Publicados", value: summary.publishedPosts, tone: "success" as const },
    { icon: FileEdit, label: "Borradores", value: summary.draftPosts, tone: "warning" as const },
    { icon: Users, label: "Usuarios totales", value: summary.totalUsers },
  ];

  const chartData = summary.postsByMonth.map((m) => ({ year: m.month, value: m.count }));
  const maxCount = Math.max(1, ...summary.postsByMonth.map((m) => m.count));
  const yMax = Math.max(4, Math.ceil(maxCount / 2) * 2);
  const yStep = Math.max(1, Math.round(yMax / 4));

  const totalByRole = summary.usersByRole.reduce((sum, r) => sum + r.count, 0) || 1;

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {statCards.map((card) => (
          <StatCard key={card.label} {...card} />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]">
        <div className="rounded-lg border border-black/10 bg-white p-6">
          <h2 className="text-center font-heading text-base font-bold text-ink">Posts creados por mes</h2>
          <div className="mt-4">
            <BarChart data={chartData} yMax={yMax} yStep={yStep} formatValue={(v) => `${v}`} />
          </div>
        </div>

        <div className="rounded-lg border border-black/10 bg-white p-6">
          <h2 className="font-heading text-base font-bold text-ink">Usuarios por rol</h2>
          <div className="mt-6 flex flex-col gap-4">
            {summary.usersByRole.map((r) => (
              <div key={r.role}>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-ink/70">{r.role}</span>
                  <span className="font-semibold text-ink">{r.count}</span>
                </div>
                <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-surface">
                  <div
                    className="h-full rounded-full bg-brand"
                    style={{ width: `${(r.count / totalByRole) * 100}%` }}
                  />
                </div>
              </div>
            ))}
            {summary.usersByRole.length === 0 && (
              <p className="text-sm text-ink/40">Sin datos todavía.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
