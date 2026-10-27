import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/app/lib/auth";
import { getClientFilters, getClients } from "@/app/lib/clients";
import { pageParam, param, type SearchParams } from "@/app/lib/paging";
import ClientsModule from "@/app/components/dashboard/ClientsModule";
import PageHeader from "@/app/components/dashboard/ui/PageHeader";

export const metadata: Metadata = {
  title: "Clientes | Dashboard IBOutplacement",
};

export default async function DashboardClientsPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const user = await getCurrentUser();

  if (user?.role !== "Admin") {
    redirect("/dashboard");
  }

  const params = await searchParams;
  const [data, filters] = await Promise.all([
    getClients({
      page: pageParam(params),
      q: param(params, "q"),
      industry: param(params, "industry"),
      province: param(params, "province"),
    }),
    getClientFilters(),
  ]);

  return (
    <div className="flex flex-col gap-8">
      <PageHeader title="Clientes" description={`Empresas clientes de IBGroup · ${data.total} registros`} />
      <ClientsModule data={data} filters={filters} />
    </div>
  );
}
