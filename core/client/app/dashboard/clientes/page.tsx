import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/app/lib/auth";
import { getClients } from "@/app/lib/clients";
import ClientsModule from "@/app/components/dashboard/ClientsModule";
import PageHeader from "@/app/components/dashboard/ui/PageHeader";

export const metadata: Metadata = {
  title: "Clientes | Dashboard IBOutplacement",
};

export default async function DashboardClientsPage() {
  const user = await getCurrentUser();

  if (user?.role !== "Admin") {
    redirect("/dashboard");
  }

  const clients = await getClients();

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Clientes"
        description="Consultas recibidas desde los formularios de contacto del sitio."
      />
      <ClientsModule initialClients={clients} />
    </div>
  );
}
