import { redirect } from "next/navigation";
import { getCurrentUser } from "@/app/lib/auth";
import Sidebar from "@/app/components/dashboard/Sidebar";
import ChangePasswordForm from "@/app/components/dashboard/ChangePasswordForm";
import LogoutButton from "@/app/components/dashboard/LogoutButton";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/ingresar");
  }

  // The backend rejects every other dashboard call until this is done, so
  // show only the password form instead of pages that would load empty.
  if (user.mustChangePassword) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface px-4 py-10">
        <div className="w-full max-w-md rounded-lg border border-black/10 bg-white p-6 sm:p-8">
          <h1 className="font-heading text-xl font-bold text-ink">Cambia tu contraseña</h1>
          <p className="mt-2 text-sm text-ink/60">
            Hola, {user.fullName}. Tu contraseña fue asignada por un administrador; elige una nueva
            para continuar al panel.
          </p>
          <div className="mt-6">
            <ChangePasswordForm />
          </div>
          <div className="mt-6 border-t border-black/10 pt-4">
            <LogoutButton />
          </div>
        </div>
      </div>
    );
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
