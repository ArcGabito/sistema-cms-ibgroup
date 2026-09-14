import { redirect } from "next/navigation";
import { getCurrentUser } from "@/app/lib/auth";
import Sidebar from "@/app/components/dashboard/Sidebar";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/ingresar");
  }

  return (
    <div className="min-h-screen bg-surface">
      <Sidebar user={user} />
      <main className="lg:pl-64">
        <div className="px-4 py-8 sm:px-6 lg:px-10 lg:py-10">{children}</div>
      </main>
    </div>
  );
}
