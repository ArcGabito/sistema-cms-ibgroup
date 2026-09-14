"use client";

import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { sileo } from "sileo";
import { UserPlus, Users } from "lucide-react";
import Button from "@/app/components/ui/Button";
import { TextField, SelectField } from "@/app/components/forms/FormFields";
import { createUserSchema, type CreateUserFormValues } from "@/app/lib/validations/user";
import { ROLES } from "@/app/lib/roles";
import type { AdminUser } from "@/app/lib/users";
import Badge from "@/app/components/dashboard/ui/Badge";
import SearchInput from "@/app/components/dashboard/ui/SearchInput";
import EmptyState from "@/app/components/dashboard/ui/EmptyState";

interface UsersModuleProps {
  initialUsers: AdminUser[];
}

export default function UsersModule({ initialUsers }: UsersModuleProps) {
  const [users, setUsers] = useState(initialUsers);
  const [query, setQuery] = useState("");
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateUserFormValues>({ resolver: zodResolver(createUserSchema) });

  const filteredUsers = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return users;
    return users.filter(
      (u) => u.username.toLowerCase().includes(q) || u.fullName.toLowerCase().includes(q),
    );
  }, [users, query]);

  const onSubmit = async (values: CreateUserFormValues) => {
    try {
      const response = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        sileo.error({
          title: "No se pudo crear el usuario",
          description: data?.message ?? "Inténtalo nuevamente.",
        });
        return;
      }

      const created = data as AdminUser;
      setUsers((prev) => [...prev, created].sort((a, b) => a.username.localeCompare(b.username)));
      sileo.success({
        title: "Usuario creado",
        description: `${created.username} ahora tiene acceso al panel.`,
      });
      reset();
    } catch {
      sileo.error({
        title: "Error de conexión",
        description: "No pudimos conectar con el servidor. Intenta nuevamente.",
      });
    }
  };

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(320px,420px)_1fr]">
      <div className="rounded-lg border border-black/10 bg-white p-6">
        <h2 className="flex items-center gap-2 font-heading text-base font-bold text-ink">
          <UserPlus className="h-[18px] w-[18px]" />
          Nuevo usuario
        </h2>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-5 flex flex-col gap-4">
          <TextField label="Usuario" error={errors.username} autoComplete="off" {...register("username")} />
          <TextField
            label="Nombre completo"
            error={errors.fullName}
            autoComplete="off"
            {...register("fullName")}
          />
          <TextField
            label="Contraseña"
            type="password"
            error={errors.password}
            autoComplete="new-password"
            {...register("password")}
          />
          <SelectField label="Rol" error={errors.role} options={[...ROLES]} {...register("role")} />
          <Button type="submit" disabled={isSubmitting} className="mt-2">
            {isSubmitting ? "Creando..." : "Crear usuario"}
          </Button>
        </form>
      </div>

      <div className="rounded-lg border border-black/10 bg-white p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="font-heading text-base font-bold text-ink">
            Usuarios existentes
            <span className="ml-2 text-xs font-normal text-ink/40">
              {filteredUsers.length} de {users.length}
            </span>
          </h2>
          <SearchInput
            placeholder="Buscar por usuario o nombre..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full sm:w-64"
          />
        </div>

        <div className="mt-5 overflow-x-auto">
          {filteredUsers.length === 0 ? (
            <EmptyState
              icon={Users}
              title={users.length === 0 ? "Todavía no hay usuarios" : "Sin resultados"}
              description={
                users.length === 0
                  ? "Crea el primero desde el formulario."
                  : "Ajusta tu búsqueda para ver otros usuarios."
              }
            />
          ) : (
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-black/10 text-xs font-semibold tracking-wider text-ink/40 uppercase">
                  <th className="pb-3">Usuario</th>
                  <th className="pb-3">Nombre</th>
                  <th className="pb-3">Rol</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="border-b border-black/5 last:border-0 hover:bg-surface/60">
                    <td className="py-3 font-medium text-ink">{u.username}</td>
                    <td className="py-3 text-ink/70">{u.fullName}</td>
                    <td className="py-3">
                      <Badge tone={u.role === "Admin" ? "brand" : "info"}>{u.role}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
