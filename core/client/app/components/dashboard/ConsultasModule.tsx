"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { sileo } from "sileo";
import { Contact2, Trash2 } from "lucide-react";
import type { ConsultasPage, ContactSubmission } from "@/app/lib/consultas";
import Badge from "@/app/components/dashboard/ui/Badge";
import { Pagination, UrlSearch } from "@/app/components/dashboard/ui/UrlState";
import ExportButton from "@/app/components/dashboard/ui/ExportButton";
import EmptyState from "@/app/components/dashboard/ui/EmptyState";
import { useConfirmDialog } from "@/app/components/dashboard/ui/ConfirmDialog";

interface ConsultasModuleProps {
  data: ConsultasPage;
}

const TYPE_FILTERS = [
  { value: "", label: "Todos" },
  { value: "Personas", label: "Personas" },
  { value: "Empresas", label: "Empresas" },
] as const;

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-semibold tracking-wider text-ink/40 uppercase">{label}</p>
      <p className="mt-0.5 text-ink">{value}</p>
    </div>
  );
}

function formatDate(value: string) {
  return new Date(value).toLocaleString("es-PE", { dateStyle: "medium", timeStyle: "short" });
}

export default function ConsultasModule({ data }: ConsultasModuleProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const clients = data.items;
  const [selectedId, setSelectedId] = useState<number | null>(clients[0]?.id ?? null);
  const { confirm, dialog } = useConfirmDialog();

  const typeFilter = searchParams.get("type") ?? "";
  const hasQuery = Boolean(searchParams.get("q"));

  const displayName = (c: ContactSubmission) =>
    c.type === "Empresas" ? (c.empresa ?? "—") : [c.nombres, c.apellidoPaterno].filter(Boolean).join(" ");

  // Falls back to the first row when the selected one is no longer on this page.
  const selected = clients.find((c) => c.id === selectedId) ?? clients[0] ?? null;

  const typeHref = (value: string) => {
    const next = new URLSearchParams(searchParams.toString());
    if (value) next.set("type", value);
    else next.delete("type");
    next.delete("page");
    const query = next.toString();
    return query ? `/dashboard/consultas?${query}` : "/dashboard/consultas";
  };

  const countFor = (value: string) =>
    value === "Personas" ? data.personasCount : value === "Empresas" ? data.empresasCount : data.personasCount + data.empresasCount;

  const handleDelete = async (client: ContactSubmission, event?: React.MouseEvent) => {
    event?.stopPropagation();
    const label = displayName(client);

    const ok = await confirm({
      title: "¿Eliminar esta consulta?",
      description: `Se eliminará la consulta de "${label}" de forma permanente. Esta acción no se puede deshacer.`,
    });
    if (!ok) return;

    try {
      const response = await fetch(`/api/consultas/${client.id}`, { method: "DELETE" });

      if (!response.ok) {
        sileo.error({ title: "No se pudo eliminar", description: "Inténtalo nuevamente." });
        return;
      }

      // Reloads the current page from the server so totals and paging stay right.
      router.refresh();
      sileo.success({ title: "Consulta eliminada", description: label });
    } catch {
      sileo.error({
        title: "Error de conexión",
        description: "No pudimos conectar con el servidor. Intenta nuevamente.",
      });
    }
  };

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_380px]">
      {dialog}

      <div className="rounded-lg border border-black/10 bg-white p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            {TYPE_FILTERS.map((t) => (
              <Link
                key={t.label}
                href={typeHref(t.value)}
                scroll={false}
                className={`rounded-full px-4 py-2 text-xs font-semibold tracking-wide uppercase transition-colors ${
                  typeFilter === t.value
                    ? "bg-ink text-white"
                    : "border border-ink/15 text-ink/60 hover:border-brand hover:text-brand"
                }`}
              >
                {t.label} ({countFor(t.value)})
              </Link>
            ))}
          </div>
          <div className="flex w-full gap-2 sm:w-auto">
            <UrlSearch placeholder="Buscar por nombre, empresa, email o teléfono..." className="w-full sm:w-72" />
            {/* Exports what the current search and type filter show, across every page. */}
            <ExportButton href={`/api/consultas/export?${searchParams.toString()}`} />
          </div>
        </div>

        <div className="mt-5 overflow-x-auto">
          {clients.length === 0 ? (
            <EmptyState
              icon={Contact2}
              title={hasQuery || typeFilter || data.page > 1 ? "Sin resultados" : "Todavía no hay consultas"}
              description={
                hasQuery || typeFilter || data.page > 1
                  ? "Ajusta la búsqueda o el filtro para ver otras consultas."
                  : "Las consultas enviadas desde el sitio aparecerán aquí."
              }
            />
          ) : (
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-black/10 text-xs font-semibold tracking-wider text-ink/40 uppercase">
                  <th className="pb-3">Tipo</th>
                  <th className="pb-3">Nombre</th>
                  <th className="pb-3">Contacto</th>
                  <th className="pb-3">Servicio</th>
                  <th className="pb-3">Fecha</th>
                  <th className="pb-3" />
                </tr>
              </thead>
              <tbody>
                {clients.map((client) => (
                  <tr
                    key={client.id}
                    onClick={() => setSelectedId(client.id)}
                    className={`cursor-pointer border-b border-black/5 last:border-0 ${
                      selected?.id === client.id ? "bg-surface" : "hover:bg-surface/60"
                    }`}
                  >
                    <td className="py-3">
                      <Badge tone={client.type === "Empresas" ? "info" : "warning"}>
                        {client.type === "Empresas" ? "Empresa" : "Persona"}
                      </Badge>
                    </td>
                    <td className="max-w-xs truncate py-3 font-medium text-ink">{displayName(client)}</td>
                    <td className="py-3 text-ink/70">{client.email}</td>
                    <td className="py-3 text-ink/70">{client.servicio ?? "—"}</td>
                    <td className="py-3 whitespace-nowrap text-ink/50">
                      {new Date(client.createdAt).toLocaleDateString("es-PE")}
                    </td>
                    <td className="py-3">
                      <button
                        type="button"
                        aria-label="Eliminar"
                        onClick={(e) => handleDelete(client, e)}
                        className="text-ink/40 hover:text-brand"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        <Pagination page={data.page} pageSize={data.pageSize} total={data.total} />
      </div>

      <div className="rounded-lg border border-black/10 bg-white p-6">
        <h2 className="font-heading text-base font-bold text-ink">Detalle</h2>
        {selected ? (
          <div className="mt-5 flex flex-col gap-3 text-sm">
            <DetailRow
              label={selected.type === "Empresas" ? "Empresa" : "Nombre"}
              value={displayName(selected)}
            />
            {selected.type === "Empresas" && selected.contacto && (
              <DetailRow label="Persona de contacto" value={selected.contacto} />
            )}
            <DetailRow label="Email" value={selected.email} />
            <DetailRow label="Teléfono" value={selected.telefono} />
            {selected.cargo && <DetailRow label="Cargo" value={selected.cargo} />}
            {selected.servicio && <DetailRow label="Servicio" value={selected.servicio} />}
            {selected.type === "Personas" && selected.trabajando && (
              <DetailRow label="¿Trabajando actualmente?" value={selected.trabajando} />
            )}
            {selected.type === "Personas" && selected.sector && (
              <DetailRow label="Sector" value={selected.sector} />
            )}
            {selected.type === "Personas" && selected.rangoSalarial && (
              <DetailRow label="Rango salarial" value={selected.rangoSalarial} />
            )}
            {selected.type === "Personas" && (selected.pais || selected.region) && (
              <DetailRow
                label="Ubicación"
                value={[selected.region, selected.pais].filter(Boolean).join(", ")}
              />
            )}
            {selected.type === "Personas" && selected.linkedin && (
              <DetailRow label="LinkedIn" value={selected.linkedin} />
            )}
            {selected.type === "Empresas" && selected.colaboradores && (
              <DetailRow label="Colaboradores a desvincular" value={selected.colaboradores} />
            )}
            <div>
              <p className="text-xs font-semibold tracking-wider text-ink/40 uppercase">Mensaje</p>
              <p className="mt-1 leading-relaxed text-ink/70">{selected.mensaje}</p>
            </div>
            <p className="text-xs text-ink/40">Recibido el {formatDate(selected.createdAt)}</p>
            <button
              type="button"
              onClick={() => handleDelete(selected)}
              className="mt-2 inline-flex w-fit items-center gap-2 text-xs font-semibold text-brand hover:text-brand-dark"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Eliminar consulta
            </button>
          </div>
        ) : (
          <p className="mt-5 text-sm text-ink/40">Selecciona una consulta para ver el detalle.</p>
        )}
      </div>
    </div>
  );
}
