"use client";

import { useSearchParams } from "next/navigation";
import { History } from "lucide-react";
import Badge from "@/app/components/dashboard/ui/Badge";
import EmptyState from "@/app/components/dashboard/ui/EmptyState";
import { Pagination, UrlSearch, UrlSelect } from "@/app/components/dashboard/ui/UrlState";
import {
  ACTION_LABELS,
  ENTITY_LABELS,
  type AuditAction,
  type AuditEntry,
  type AuditFilters,
} from "@/app/lib/audit-labels";
import type { Paged } from "@/app/lib/paging";

const ACTION_TONES: Record<AuditAction, "success" | "info" | "brand" | "neutral"> = {
  create: "success",
  update: "info",
  delete: "brand",
  export: "neutral",
};

function formatDate(value: string) {
  return new Date(value).toLocaleString("es-PE", { dateStyle: "medium", timeStyle: "short" });
}

export default function AuditModule({ data, filters }: { data: Paged<AuditEntry>; filters: AuditFilters }) {
  const searchParams = useSearchParams();
  const filtered = ["q", "entityType", "action", "username"].some((key) => searchParams.get(key)) || data.page > 1;

  return (
    <div className="rounded-lg border border-black/10 bg-white p-6">
      <div className="flex flex-col gap-3 lg:flex-row">
        <UrlSearch placeholder="Buscar por registro o usuario..." className="w-full lg:max-w-sm" />
        <UrlSelect
          name="entityType"
          allLabel="Todos los módulos"
          aria-label="Módulo"
          options={filters.entityTypes.map((t) => ({ value: t, label: ENTITY_LABELS[t] ?? t }))}
        />
        <UrlSelect
          name="action"
          allLabel="Todas las acciones"
          aria-label="Acción"
          options={Object.entries(ACTION_LABELS).map(([value, label]) => ({ value, label }))}
        />
        <UrlSelect name="username" allLabel="Todos los usuarios" aria-label="Usuario" options={filters.usernames} />
      </div>

      <div className="mt-5 overflow-x-auto">
        {data.items.length === 0 ? (
          <EmptyState
            icon={History}
            title={filtered ? "Sin resultados" : "Todavía no hay actividad"}
            description={
              filtered
                ? "Ajusta la búsqueda o los filtros."
                : "Aquí aparecerán los cambios que hagan los usuarios del panel."
            }
          />
        ) : (
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-black/10 text-xs font-semibold tracking-wider text-ink/40 uppercase">
                <th className="pb-3">Fecha</th>
                <th className="pb-3">Usuario</th>
                <th className="pb-3">Acción</th>
                <th className="pb-3">Módulo</th>
                <th className="pb-3">Registro</th>
                <th className="pb-3">Campos</th>
              </tr>
            </thead>
            <tbody>
              {data.items.map((entry) => (
                <tr key={entry.id} className="border-b border-black/5 align-top last:border-0">
                  <td className="py-3 whitespace-nowrap text-ink/50">{formatDate(entry.at)}</td>
                  <td className="py-3 font-medium text-ink">{entry.username}</td>
                  <td className="py-3">
                    <Badge tone={ACTION_TONES[entry.action] ?? "neutral"}>
                      {ACTION_LABELS[entry.action] ?? entry.action}
                    </Badge>
                  </td>
                  <td className="py-3 whitespace-nowrap text-ink/70">
                    {ENTITY_LABELS[entry.entityType] ?? entry.entityType}
                  </td>
                  <td className="max-w-xs py-3 text-ink/80">
                    <span className="line-clamp-2">{entry.label ?? "—"}</span>
                    {entry.entityId && <span className="text-xs text-ink/40">#{entry.entityId}</span>}
                  </td>
                  <td className="max-w-xs py-3 text-xs text-ink/50">{entry.details ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Pagination page={data.page} pageSize={data.pageSize} total={data.total} />
    </div>
  );
}
