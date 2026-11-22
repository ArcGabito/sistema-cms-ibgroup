import type { Metadata } from "next";
import PageHeader from "@/app/components/dashboard/ui/PageHeader";
import ContentModule from "@/app/components/dashboard/content/ContentModule";
import { getAllContent } from "@/app/lib/content";
import { getCurrentUser } from "@/app/lib/auth";

export const metadata: Metadata = {
  title: "Contenido del sitio | Dashboard IBOutplacement",
};

export default async function DashboardContentPage() {
  const [services, faqs, countries, stats, user] = await Promise.all([
    getAllContent("services"),
    getAllContent("faqs"),
    getAllContent("countries"),
    getAllContent("stats"),
    getCurrentUser(),
  ]);

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Contenido del sitio"
        description="Edita, ordena u oculta los servicios, preguntas frecuentes, estadísticas y países que se muestran en el sitio."
      />
      <ContentModule initial={{ services, faqs, countries, stats }} readOnly={user?.isDemo === true} />
    </div>
  );
}
