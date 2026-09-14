import type { Metadata } from "next";
import AiDraftGenerator from "@/app/components/dashboard/AiDraftGenerator";
import PageHeader from "@/app/components/dashboard/ui/PageHeader";

export const metadata: Metadata = {
  title: "Automatización IA | Dashboard IBOutplacement",
};

export default function DashboardAutomatizacionIaPage() {
  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Automatización IA"
        description="Genera borradores de blog automáticamente con IA."
      />
      <AiDraftGenerator />
    </div>
  );
}
