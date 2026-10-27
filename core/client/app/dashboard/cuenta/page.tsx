import type { Metadata } from "next";
import { getCurrentUser } from "@/app/lib/auth";
import PageHeader from "@/app/components/dashboard/ui/PageHeader";
import ChangePasswordForm from "@/app/components/dashboard/ChangePasswordForm";
import Badge from "@/app/components/dashboard/ui/Badge";

export const metadata: Metadata = {
  title: "Mi cuenta | Dashboard IBOutplacement",
};

export default async function DashboardAccountPage() {
  const user = await getCurrentUser();

  return (
    <div className="flex flex-col gap-8">
      <PageHeader title="Mi cuenta" description="Tus datos de acceso al panel." />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <section className="rounded-lg border border-black/10 bg-white p-6">
          <h2 className="font-heading text-base font-bold text-ink">Datos</h2>
          <dl className="mt-5 flex flex-col gap-4 text-sm">
            <div>
              <dt className="text-[11px] font-semibold tracking-wider text-ink/50 uppercase">Usuario</dt>
              <dd className="mt-1 text-ink">{user?.username}</dd>
            </div>
            <div>
              <dt className="text-[11px] font-semibold tracking-wider text-ink/50 uppercase">Nombre</dt>
              <dd className="mt-1 text-ink">{user?.fullName}</dd>
            </div>
            <div>
              <dt className="text-[11px] font-semibold tracking-wider text-ink/50 uppercase">Rol</dt>
              <dd className="mt-1">
                <Badge tone={user?.role === "Admin" ? "brand" : "info"}>{user?.role}</Badge>
              </dd>
            </div>
          </dl>
        </section>

        <section className="rounded-lg border border-black/10 bg-white p-6">
          <h2 className="font-heading text-base font-bold text-ink">Cambiar contraseña</h2>
          <p className="mt-1 text-xs text-ink/50">Al cambiarla se cierran tus otras sesiones.</p>
          <div className="mt-5">
            <ChangePasswordForm />
          </div>
        </section>
      </div>
    </div>
  );
}
