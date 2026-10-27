import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/app/lib/auth";
import { getAuditEntries, getAuditFilters } from "@/app/lib/audit";
import { pageParam, param, type SearchParams } from "@/app/lib/paging";
import AuditModule from "@/app/components/dashboard/AuditModule";
import PageHeader from "@/app/components/dashboard/ui/PageHeader";

export const metadata: Metadata = {
  title: "Auditoría | Dashboard IBOutplacement",
};

export default async function DashboardAuditPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const user = await getCurrentUser();

  if (user?.role !== "Admin") {
    redirect("/dashboard");
  }

  const params = await searchParams;
  const [data, filters] = await Promise.all([
    getAuditEntries({
      page: pageParam(params),
      q: param(params, "q"),
      entityType: param(params, "entityType"),
      action: param(params, "action"),
      username: param(params, "username"),
    }),
    getAuditFilters(),
  ]);

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Auditoría"
        description="Quién creó, editó, eliminó o exportó cada cosa en el panel. Solo se guardan los nombres de los campos, nunca sus valores."
      />
      <AuditModule data={data} filters={filters} />
    </div>
  );
}
