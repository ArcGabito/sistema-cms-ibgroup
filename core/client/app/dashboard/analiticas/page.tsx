import type { Metadata } from "next";
import { getAnalyticsSummary } from "@/app/lib/analytics";
import RealAnalytics from "@/app/components/dashboard/RealAnalytics";
import PageHeader from "@/app/components/dashboard/ui/PageHeader";

export const metadata: Metadata = {
  title: "Analíticas | Dashboard IBOutplacement",
};

export default async function DashboardAnaliticasPage() {
  const summary = await getAnalyticsSummary();

  return (
    <div className="flex flex-col gap-8">
      <PageHeader title="Analíticas" description="Métricas en tiempo real del sistema." />

      {summary ? (
        <RealAnalytics summary={summary} />
      ) : (
        <p className="text-sm text-ink/50">No se pudo cargar la información de analíticas.</p>
      )}
    </div>
  );
}
