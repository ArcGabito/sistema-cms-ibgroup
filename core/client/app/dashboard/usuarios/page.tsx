import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/app/lib/auth";
import { getUsers } from "@/app/lib/users";
import UsersModule from "@/app/components/dashboard/UsersModule";
import PageHeader from "@/app/components/dashboard/ui/PageHeader";

export const metadata: Metadata = {
  title: "Usuarios | Dashboard IBOutplacement",
};

export default async function DashboardUsersPage() {
  const user = await getCurrentUser();

  if (user?.role !== "Admin") {
    redirect("/dashboard");
  }

  const users = await getUsers();

  return (
    <div className="flex flex-col gap-8">
      <PageHeader title="Usuarios" description="Crea y administra los usuarios con acceso al panel." />
      <UsersModule initialUsers={users} />
    </div>
  );
}
