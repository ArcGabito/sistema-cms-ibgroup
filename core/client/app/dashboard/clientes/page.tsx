import type { Metadata } from "next";
import { getClients } from "@/app/lib/clients";
import ClientsModule from "@/app/components/dashboard/ClientsModule";
import PageHeader from "@/app/components/dashboard/ui/PageHeader";

export const metadata: Metadata = {
  title: "Clientes | Dashboard IBOutplacement",
};

export default async function DashboardClientsPage() {
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
