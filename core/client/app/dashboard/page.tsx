import type { Metadata } from "next";
import Link from "next/link";
import {
  FileText,
  CheckCircle2,
  Inbox,
  Users,
  Newspaper,
  LayoutGrid,
  Building2,
  BarChart3,
  Bot,
  ClipboardList,
  ArrowRight,
} from "lucide-react";
import { getCurrentUser } from "@/app/lib/auth";
import { getAnalyticsSummary } from "@/app/lib/analytics";
import { getConsultas } from "@/app/lib/consultas";
import { getEmployabilityTests } from "@/app/lib/employability-tests";
import PageHeader from "@/app/components/dashboard/ui/PageHeader";
import StatCard from "@/app/components/dashboard/ui/StatCard";

export const metadata: Metadata = {
  title: "Inicio | Dashboard IBOutplacement",
};

const MODULES = [
  {
    label: "Blog",
    href: "/dashboard/blog",
    icon: Newspaper,
    description: "Crea, edita y publica los artículos del blog.",
  },
  {
    label: "Contenido",
    href: "/dashboard/contenido",
    icon: LayoutGrid,
    description: "Servicios, preguntas frecuentes, estadísticas y países del sitio.",
  },
  {
    label: "Consultas",
    href: "/dashboard/consultas",
    icon: Inbox,
    description: "Revisa las consultas recibidas desde el sitio.",
    adminOnly: true,
  },
  {
    label: "Clientes",
    href: "/dashboard/clientes",
    icon: Building2,
    description: "Empresas clientes: búsqueda, filtros y edición.",
    adminOnly: true,
  },
  {
    label: "Test",
    href: "/dashboard/test",
    icon: ClipboardList,
    description: "Visualiza y gestiona los tests de empleabilidad recibidos.",
    adminOnly: true,
  },
  {
    label: "Analíticas",
    href: "/dashboard/analiticas",
    icon: BarChart3,
    description: "Métricas en tiempo real de contenido y usuarios.",
  },
  {
    label: "Automatización IA",
    href: "/dashboard/automatizacion-ia",
    icon: Bot,
    description: "Genera borradores de blog automáticamente.",
  },
  {
    label: "Usuarios",
    href: "/dashboard/usuarios",
    icon: Users,
    description: "Administra quién tiene acceso al panel.",
    adminOnly: true,
  },
];

export default async function DashboardHomePage() {
  const user = await getCurrentUser();
  const isAdmin = user?.role === "Admin";

  // Submissions hold visitors' personal data, so only admins can read them.
  // Only the total is needed here, so ask for a one-row page.
  const [summary, consultas, tests] = await Promise.all([
    getAnalyticsSummary(),
    isAdmin ? getConsultas({ pageSize: 1 }) : null,
    isAdmin ? getEmployabilityTests() : null,
  ]);

  const modules = MODULES.filter((m) => !m.adminOnly || isAdmin);

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title={`Hola, ${user?.fullName ?? ""}`}
        description="Resumen general de tu cuenta y accesos rápidos a cada módulo."
      />

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard icon={FileText} label="Posts totales" value={summary?.totalPosts ?? "—"} tone="brand" />
        <StatCard
          icon={CheckCircle2}
          label="Publicados"
          value={summary?.publishedPosts ?? "—"}
          tone="success"
        />
        {consultas && (
          <StatCard icon={Inbox} label="Consultas recibidas" value={consultas.total} tone="warning" />
        )}
        {tests && <StatCard icon={ClipboardList} label="Tests recibidos" value={tests.length} tone="brand" />}
        <StatCard icon={Users} label="Usuarios del panel" value={summary?.totalUsers ?? "—"} />
      </section>

      <section>
        <p className="mb-4 text-xs font-semibold tracking-wider text-ink/40 uppercase">Módulos</p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {modules.map((mod) => (
            <Link
              key={mod.href}
              href={mod.href}
              className="group flex flex-col gap-3 rounded-lg border border-black/10 bg-white p-5 transition-colors hover:border-brand/30"
            >
              <div className="flex items-center justify-between">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-surface text-ink/60 transition-colors group-hover:bg-brand/10 group-hover:text-brand">
                  <mod.icon className="h-5 w-5" />
                </span>
                <ArrowRight className="h-4 w-4 text-ink/20 transition-all group-hover:translate-x-0.5 group-hover:text-brand" />
              </div>
              <div>
                <p className="font-heading text-sm font-bold text-ink">{mod.label}</p>
                <p className="mt-1 text-xs leading-relaxed text-ink/50">{mod.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
