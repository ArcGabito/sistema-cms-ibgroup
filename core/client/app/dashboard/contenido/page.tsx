import type { Metadata } from "next";
import PageHeader from "@/app/components/dashboard/ui/PageHeader";
import ContentModule from "@/app/components/dashboard/content/ContentModule";
import { getAllContent } from "@/app/lib/content";

export const metadata: Metadata = {
  title: "Contenido del sitio | Dashboard IBOutplacement",
};

export default async function DashboardContentPage() {
  const [services, faqs, countries, stats] = await Promise.all([
    getAllContent("services"),
    getAllContent("faqs"),
    getAllContent("countries"),
    getAllContent("stats"),
  ]);

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Contenido del sitio"
        description="Edita, ordena u oculta los servicios, preguntas frecuentes, estadísticas y países que se muestran en el sitio."
      />
      <ContentModule initial={{ services, faqs, countries, stats }} />
    </div>
  );
}
