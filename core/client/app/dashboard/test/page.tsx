import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/app/lib/auth";
import { getEmployabilityTests } from "@/app/lib/employability-tests";
import TestModule from "@/app/components/dashboard/TestModule";
import PageHeader from "@/app/components/dashboard/ui/PageHeader";

export const metadata: Metadata = {
  title: "Test de Empleabilidad | Dashboard IBOutplacement",
};

export default async function DashboardTestPage() {
  const user = await getCurrentUser();

  if (user?.role !== "Admin") {
    redirect("/dashboard");
  }

  const submissions = await getEmployabilityTests();

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Test de Empleabilidad"
        description="Resultados enviados por los usuarios desde /test-empleabilidad."
      />
      <TestModule initialSubmissions={submissions} />
    </div>
  );
}
