"use client";

import { useMemo, useState } from "react";
import { sileo } from "sileo";
import { Contact2, Trash2 } from "lucide-react";
import type { ClientSubmission } from "@/app/lib/clients";
import Badge from "@/app/components/dashboard/ui/Badge";
import SearchInput from "@/app/components/dashboard/ui/SearchInput";
import EmptyState from "@/app/components/dashboard/ui/EmptyState";
import { useConfirmDialog } from "@/app/components/dashboard/ui/ConfirmDialog";

interface ClientsModuleProps {
  initialClients: ClientSubmission[];
}

type TypeFilter = "Todos" | "Personas" | "Empresas";

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

export default function ClientsModule({ initialClients }: ClientsModuleProps) {
  const [clients, setClients] = useState(initialClients);
  const [selectedId, setSelectedId] = useState<number | null>(initialClients[0]?.id ?? null);
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("Todos");
  const { confirm, dialog } = useConfirmDialog();

  const displayName = (c: ClientSubmission) =>
    c.type === "Empresas" ? (c.empresa ?? "—") : [c.nombres, c.apellidoPaterno].filter(Boolean).join(" ");

  const filteredClients = useMemo(() => {
    const q = query.trim().toLowerCase();
    return clients.filter((c) => {
      if (typeFilter !== "Todos" && c.type !== typeFilter) return false;
      if (!q) return true;
      return displayName(c).toLowerCase().includes(q) || c.email.toLowerCase().includes(q);
    });
  }, [clients, query, typeFilter]);

  const selected = clients.find((c) => c.id === selectedId) ?? null;

  const personasCount = clients.filter((c) => c.type === "Personas").length;
  const empresasCount = clients.filter((c) => c.type === "Empresas").length;

  const handleDelete = async (client: ClientSubmission, event?: React.MouseEvent) => {
    event?.stopPropagation();
    const label = displayName(client);

    const ok = await confirm({
      title: "¿Eliminar este contacto?",
      description: `Se eliminará la consulta de "${label}" de forma permanente. Esta acción no se puede deshacer.`,
    });
    if (!ok) return;

    try {
      const response = await fetch(`/api/clients/${client.id}`, { method: "DELETE" });

      if (!response.ok) {
        sileo.error({ title: "No se pudo eliminar", description: "Inténtalo nuevamente." });
        return;
      }

      setClients((prev) => prev.filter((c) => c.id !== client.id));
      if (selectedId === client.id) {
        setSelectedId(null);
      }
      sileo.success({ title: "Contacto eliminado", description: label });
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
          <div className="flex items-center gap-2">
            {(["Todos", "Personas", "Empresas"] as TypeFilter[]).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTypeFilter(t)}
                className={`rounded-full px-4 py-2 text-xs font-semibold tracking-wide uppercase transition-colors ${
                  typeFilter === t
                    ? "bg-ink text-white"
                    : "border border-ink/15 text-ink/60 hover:border-brand hover:text-brand"
                }`}
              >
                {t}
                {t === "Personas" && ` (${personasCount})`}
                {t === "Empresas" && ` (${empresasCount})`}
                {t === "Todos" && ` (${clients.length})`}
              </button>
            ))}
          </div>
          <SearchInput
            placeholder="Buscar por nombre o email..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full sm:w-64"
          />
        </div>

        <div className="mt-5 overflow-x-auto">
          {filteredClients.length === 0 ? (
            <EmptyState
              icon={Contact2}
              title={clients.length === 0 ? "Todavía no hay consultas" : "Sin resultados"}
              description={
                clients.length === 0
                  ? "Las consultas enviadas desde el sitio aparecerán aquí."
                  : "Ajusta la búsqueda o el filtro para ver otras consultas."
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
                {filteredClients.map((client) => (
                  <tr
                    key={client.id}
                    onClick={() => setSelectedId(client.id)}
                    className={`cursor-pointer border-b border-black/5 last:border-0 ${
                      selectedId === client.id ? "bg-surface" : "hover:bg-surface/60"
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
              Eliminar contacto
            </button>
          </div>
        ) : (
          <p className="mt-5 text-sm text-ink/40">Selecciona una consulta para ver el detalle.</p>
        )}
      </div>
    </div>
  );
}
