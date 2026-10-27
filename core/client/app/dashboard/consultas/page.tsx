import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/app/lib/auth";
import { getConsultas } from "@/app/lib/consultas";
import { pageParam, param, type SearchParams } from "@/app/lib/paging";
import ConsultasModule from "@/app/components/dashboard/ConsultasModule";
import PageHeader from "@/app/components/dashboard/ui/PageHeader";

export const metadata: Metadata = {
  title: "Consultas | Dashboard IBOutplacement",
};

export default async function DashboardConsultasPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const user = await getCurrentUser();

  if (user?.role !== "Admin") {
    redirect("/dashboard");
  }

  const params = await searchParams;
  const data = await getConsultas({
    page: pageParam(params),
    q: param(params, "q"),
    type: param(params, "type"),
  });

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Consultas"
        description="Mensajes recibidos desde los formularios de contacto del sitio."
      />
      <ConsultasModule data={data} />
    </div>
  );
}
