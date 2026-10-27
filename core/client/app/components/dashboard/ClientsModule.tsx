"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { sileo } from "sileo";
import { fetchConDespertar } from "@/app/lib/despertar";
import { Building2, Pencil, Plus, Trash2 } from "lucide-react";
import Button from "@/app/components/ui/Button";
import { TextField } from "@/app/components/forms/FormFields";
import EmptyState from "@/app/components/dashboard/ui/EmptyState";
import Modal from "@/app/components/dashboard/ui/Modal";
import { useConfirmDialog } from "@/app/components/dashboard/ui/ConfirmDialog";
import { Pagination, UrlSearch, UrlSelect } from "@/app/components/dashboard/ui/UrlState";
import type { Client, ClientFilters } from "@/app/lib/clients";
import type { Paged } from "@/app/lib/paging";
import { clientSchema, type ClientFormValues } from "@/app/lib/validations/client";

interface ClientsModuleProps {
  data: Paged<Client>;
  filters: ClientFilters;
}

const CONNECTION_ERROR = {
  title: "Error de conexión",
  description: "No pudimos conectar con el servidor. Intenta nuevamente.",
};

const contactName = (c: Client) => [c.firstName, c.lastName].filter(Boolean).join(" ");

export default function ClientsModule({ data, filters }: ClientsModuleProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [editing, setEditing] = useState<Client | "new" | null>(null);
  const { confirm, dialog } = useConfirmDialog();
  const filtered = ["q", "industry", "province"].some((key) => searchParams.get(key)) || data.page > 1;

  const onDelete = async (client: Client) => {
    const ok = await confirm({
      title: `¿Eliminar a ${client.companyName}?`,
      description: "Se eliminará el cliente y sus datos de contacto. Esta acción no se puede deshacer.",
    });
    if (!ok) return;

    try {
      const response = await fetchConDespertar(`/api/clients/${client.id}`, { method: "DELETE" });
      if (!response.ok) {
        const body = await response.json().catch(() => null);
        sileo.error({ title: "No se pudo eliminar", description: body?.message ?? "Inténtalo nuevamente." });
        return;
      }
      sileo.success({ title: "Cliente eliminado", description: client.companyName });
      router.refresh();
    } catch {
      sileo.error(CONNECTION_ERROR);
    }
  };

  return (
    <div className="rounded-lg border border-black/10 bg-white p-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-1 flex-col gap-3 sm:flex-row">
          <UrlSearch placeholder="Buscar por empresa, contacto, RUC o email..." className="w-full sm:max-w-sm" />
          <UrlSelect name="industry" options={filters.industries} allLabel="Todos los rubros" aria-label="Rubro" />
          <UrlSelect name="province" options={filters.provinces} allLabel="Todas las provincias" aria-label="Provincia" />
        </div>
        <Button type="button" onClick={() => setEditing("new")} className="px-5 py-2.5">
          <Plus className="h-4 w-4" /> Nuevo cliente
        </Button>
      </div>

      <div className="mt-5 overflow-x-auto">
        {data.items.length === 0 ? (
          <EmptyState
            icon={Building2}
            title={filtered ? "Sin resultados" : "Todavía no hay clientes"}
            description={filtered ? "Ajusta la búsqueda o los filtros." : "Crea el primero con el botón Nuevo cliente."}
          />
        ) : (
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-black/10 text-xs font-semibold tracking-wider text-ink/40 uppercase">
                <th className="pb-3">Empresa</th>
                <th className="pb-3">RUC</th>
                <th className="pb-3">Rubro</th>
                <th className="pb-3">Contacto</th>
                <th className="pb-3">Ubicación</th>
                <th className="pb-3" />
              </tr>
            </thead>
            <tbody>
              {data.items.map((c) => (
                <tr key={c.id} className="border-b border-black/5 align-top last:border-0 hover:bg-surface/60">
                  <td className="max-w-xs py-3">
                    <p className="truncate font-medium text-ink">{c.companyName}</p>
                    <p className="truncate text-xs text-ink/40">{c.legalName}</p>
                  </td>
                  <td className="py-3 whitespace-nowrap text-ink/70">{c.taxId ?? "—"}</td>
                  <td className="max-w-[12rem] truncate py-3 text-ink/70">{c.industry ?? "—"}</td>
                  <td className="max-w-[14rem] py-3">
                    <p className="truncate text-ink/80">{contactName(c) || "—"}</p>
                    {(c.email || c.jobTitle) && (
                      <p className="truncate text-xs text-ink/40">{c.email ?? c.jobTitle}</p>
                    )}
                  </td>
                  <td className="py-3 whitespace-nowrap text-ink/70">
                    {[c.district, c.province].filter(Boolean).join(", ") || "—"}
                  </td>
                  <td className="py-3">
                    <div className="flex justify-end gap-1">
                      <button
                        type="button"
                        title="Editar"
                        aria-label="Editar"
                        onClick={() => setEditing(c)}
                        className="flex h-8 w-8 items-center justify-center rounded-md text-ink/50 hover:bg-black/5 hover:text-ink"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        title="Eliminar"
                        aria-label="Eliminar"
                        onClick={() => onDelete(c)}
                        className="flex h-8 w-8 items-center justify-center rounded-md text-ink/50 hover:bg-black/5 hover:text-brand"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Pagination page={data.page} pageSize={data.pageSize} total={data.total} />

      {editing && (
        <Modal
          title={editing === "new" ? "Nuevo cliente" : `Editar ${editing.companyName}`}
          onClose={() => setEditing(null)}
          size="lg"
        >
          <ClientForm
            initial={editing === "new" ? undefined : editing}
            onSaved={() => {
              setEditing(null);
              router.refresh();
            }}
          />
        </Modal>
      )}
      {dialog}
    </div>
  );
}

function ClientForm({ initial, onSaved }: { initial?: Client; onSaved: () => void }) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ClientFormValues>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      companyName: initial?.companyName ?? "",
      legalName: initial?.legalName ?? "",
      industry: initial?.industry ?? "",
      taxId: initial?.taxId ?? "",
      firstName: initial?.firstName ?? "",
      lastName: initial?.lastName ?? "",
      jobTitle: initial?.jobTitle ?? "",
      email: initial?.email ?? "",
      phoneNumber: initial?.phoneNumber ?? "",
      website: initial?.website ?? "",
      address: initial?.address ?? "",
      district: initial?.district ?? "",
      province: initial?.province ?? "",
    },
  });

  const onSubmit = async (values: ClientFormValues) => {
    try {
      const response = await fetchConDespertar(initial ? `/api/clients/${initial.id}` : "/api/clients", {
        method: initial ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const body = await response.json().catch(() => null);

      if (!response.ok) {
        sileo.error({ title: "No se pudo guardar", description: body?.message ?? "Inténtalo nuevamente." });
        return;
      }

      sileo.success({ title: initial ? "Cliente actualizado" : "Cliente creado", description: values.companyName });
      onSaved();
    } catch {
      sileo.error(CONNECTION_ERROR);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
      <fieldset className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <legend className="mb-2 text-sm font-semibold text-ink">Empresa</legend>
        <TextField label="Nombre comercial" error={errors.companyName} {...register("companyName")} />
        <TextField label="Razón social" error={errors.legalName} {...register("legalName")} />
        <TextField label="RUC" inputMode="numeric" maxLength={11} error={errors.taxId} {...register("taxId")} />
        <TextField label="Rubro" error={errors.industry} {...register("industry")} />
        <TextField label="Sitio web" error={errors.website} {...register("website")} className="sm:col-span-2" />
      </fieldset>

      <fieldset className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <legend className="mb-2 text-sm font-semibold text-ink">Persona de contacto</legend>
        <TextField label="Nombres" error={errors.firstName} {...register("firstName")} />
        <TextField label="Apellidos" error={errors.lastName} {...register("lastName")} />
        <TextField label="Cargo" error={errors.jobTitle} {...register("jobTitle")} />
        <TextField label="Teléfono" error={errors.phoneNumber} {...register("phoneNumber")} />
        <TextField label="Email" type="email" error={errors.email} {...register("email")} className="sm:col-span-2" />
      </fieldset>

      <fieldset className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <legend className="mb-2 text-sm font-semibold text-ink">Ubicación</legend>
        <TextField label="Dirección" error={errors.address} {...register("address")} className="sm:col-span-2" />
        <TextField label="Distrito" error={errors.district} {...register("district")} />
        <TextField label="Provincia" error={errors.province} {...register("province")} />
      </fieldset>

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Guardando..." : "Guardar"}
      </Button>
    </form>
  );
}
