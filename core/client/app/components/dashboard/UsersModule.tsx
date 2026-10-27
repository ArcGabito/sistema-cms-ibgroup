"use client";

import { useMemo, useState, type ReactNode } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { sileo } from "sileo";
import { KeyRound, Pencil, Trash2, UserPlus, Users, X } from "lucide-react";
import Button from "@/app/components/ui/Button";
import { TextField, SelectField } from "@/app/components/forms/FormFields";
import {
  createUserSchema,
  updateUserSchema,
  resetPasswordSchema,
  type CreateUserFormValues,
  type UpdateUserFormValues,
  type ResetPasswordFormValues,
} from "@/app/lib/validations/user";
import { ROLES } from "@/app/lib/roles";
import type { AdminUser } from "@/app/lib/users";
import Badge from "@/app/components/dashboard/ui/Badge";
import SearchInput from "@/app/components/dashboard/ui/SearchInput";
import EmptyState from "@/app/components/dashboard/ui/EmptyState";
import { useConfirmDialog } from "@/app/components/dashboard/ui/ConfirmDialog";

interface UsersModuleProps {
  initialUsers: AdminUser[];
  currentUserId: number;
}

type Dialog = { kind: "edit" | "password"; user: AdminUser } | null;

const CONNECTION_ERROR = {
  title: "Error de conexión",
  description: "No pudimos conectar con el servidor. Intenta nuevamente.",
};

function sortByUsername(users: AdminUser[]) {
  return [...users].sort((a, b) => a.username.localeCompare(b.username));
}

function StatusBadge({ user }: { user: AdminUser }) {
  if (!user.isActive) return <Badge tone="neutral">Inactivo</Badge>;
  if (user.lockoutEnd) return <Badge tone="warning">Bloqueado</Badge>;
  if (user.mustChangePassword) return <Badge tone="info">Debe cambiar clave</Badge>;
  return <Badge tone="success">Activo</Badge>;
}

export default function UsersModule({ initialUsers, currentUserId }: UsersModuleProps) {
  const [users, setUsers] = useState(initialUsers);
  const [query, setQuery] = useState("");
  const [dialog, setDialog] = useState<Dialog>(null);
  const { confirm, dialog: confirmDialog } = useConfirmDialog();
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

  const replaceUser = (updated: AdminUser) =>
    setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));

  const onCreate = async (values: CreateUserFormValues) => {
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
      setUsers((prev) => sortByUsername([...prev, created]));
      sileo.success({
        title: "Usuario creado",
        description: `${created.username} deberá cambiar la contraseña al ingresar.`,
      });
      reset();
    } catch {
      sileo.error(CONNECTION_ERROR);
    }
  };

  const onDelete = async (user: AdminUser) => {
    const ok = await confirm({
      title: `¿Eliminar a ${user.username}?`,
      description: "Perderá el acceso al panel. Esta acción no se puede deshacer.",
    });
    if (!ok) return;

    try {
      const response = await fetch(`/api/users/${user.id}`, { method: "DELETE" });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        sileo.error({
          title: "No se pudo eliminar",
          description: data?.message ?? "Inténtalo nuevamente.",
        });
        return;
      }

      setUsers((prev) => prev.filter((u) => u.id !== user.id));
      sileo.success({ title: "Usuario eliminado", description: `${user.username} ya no tiene acceso.` });
    } catch {
      sileo.error(CONNECTION_ERROR);
    }
  };

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(320px,420px)_1fr]">
      <div className="rounded-lg border border-black/10 bg-white p-6">
        <h2 className="flex items-center gap-2 font-heading text-base font-bold text-ink">
          <UserPlus className="h-[18px] w-[18px]" />
          Nuevo usuario
        </h2>

        <form onSubmit={handleSubmit(onCreate)} className="mt-5 flex flex-col gap-4">
          <TextField label="Usuario" error={errors.username} autoComplete="off" {...register("username")} />
          <TextField
            label="Nombre completo"
            error={errors.fullName}
            autoComplete="off"
            {...register("fullName")}
          />
          <TextField
            label="Contraseña temporal"
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
                  <th className="pb-3">Estado</th>
                  <th className="pb-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((u) => {
                  const isSelf = u.id === currentUserId;
                  return (
                    <tr key={u.id} className="border-b border-black/5 last:border-0 hover:bg-surface/60">
                      <td className="py-3 font-medium text-ink">
                        {u.username}
                        {isSelf && <span className="ml-2 text-xs font-normal text-ink/40">(tú)</span>}
                      </td>
                      <td className="py-3 text-ink/70">{u.fullName}</td>
                      <td className="py-3">
                        <Badge tone={u.role === "Admin" ? "brand" : "info"}>{u.role}</Badge>
                      </td>
                      <td className="py-3">
                        <StatusBadge user={u} />
                      </td>
                      <td className="py-3">
                        <div className="flex justify-end gap-1">
                          <IconButton label="Editar" onClick={() => setDialog({ kind: "edit", user: u })}>
                            <Pencil className="h-4 w-4" />
                          </IconButton>
                          {!isSelf && (
                            <>
                              <IconButton
                                label="Restablecer contraseña"
                                onClick={() => setDialog({ kind: "password", user: u })}
                              >
                                <KeyRound className="h-4 w-4" />
                              </IconButton>
                              <IconButton label="Eliminar" onClick={() => onDelete(u)}>
                                <Trash2 className="h-4 w-4" />
                              </IconButton>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {dialog?.kind === "edit" && (
        <EditUserDialog
          user={dialog.user}
          isSelf={dialog.user.id === currentUserId}
          onClose={() => setDialog(null)}
          onSaved={(updated) => {
            replaceUser(updated);
            setDialog(null);
          }}
        />
      )}
      {dialog?.kind === "password" && (
        <ResetPasswordDialog
          user={dialog.user}
          onClose={() => setDialog(null)}
          onSaved={(updated) => {
            replaceUser(updated);
            setDialog(null);
          }}
        />
      )}
      {confirmDialog}
    </div>
  );
}

function IconButton({ label, onClick, children }: { label: string; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      onClick={onClick}
      className="flex h-8 w-8 items-center justify-center rounded-md text-ink/50 transition-colors hover:bg-black/5 hover:text-ink"
    >
      {children}
    </button>
  );
}

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
        <div className="flex items-center justify-between">
          <h2 className="font-heading text-lg font-bold text-ink">{title}</h2>
          <button type="button" aria-label="Cerrar" onClick={onClose} className="text-ink/50 hover:text-ink">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="mt-5">{children}</div>
      </div>
    </div>
  );
}

interface DialogProps {
  user: AdminUser;
  onClose: () => void;
  onSaved: (user: AdminUser) => void;
}

function EditUserDialog({ user, isSelf, onClose, onSaved }: DialogProps & { isSelf: boolean }) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<UpdateUserFormValues>({
    resolver: zodResolver(updateUserSchema),
    defaultValues: {
      fullName: user.fullName,
      role: user.role as UpdateUserFormValues["role"],
      isActive: user.isActive,
    },
  });

  const onSubmit = async (values: UpdateUserFormValues) => {
    try {
      const response = await fetch(`/api/users/${user.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        sileo.error({ title: "No se pudo guardar", description: data?.message ?? "Inténtalo nuevamente." });
        return;
      }

      sileo.success({ title: "Usuario actualizado", description: `Se guardaron los cambios de ${user.username}.` });
      onSaved(data as AdminUser);
    } catch {
      sileo.error(CONNECTION_ERROR);
    }
  };

  return (
    <Modal title={`Editar ${user.username}`} onClose={onClose}>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <TextField label="Nombre completo" error={errors.fullName} {...register("fullName")} />
        {/* For your own user, role and status aren't rendered at all (disabled
            inputs would be left out of the submitted values); the form's
            default values are sent unchanged instead. */}
        {isSelf ? (
          <p className="text-xs text-ink/50">No puedes cambiar tu propio rol ni desactivarte.</p>
        ) : (
          <>
            <SelectField
              label="Rol"
              error={errors.role}
              options={[...ROLES]}
              defaultValue={user.role}
              {...register("role")}
            />
            <label className="flex items-center gap-2 text-sm text-ink">
              <input type="checkbox" className="h-4 w-4 accent-brand" {...register("isActive")} />
              Usuario activo
            </label>
            <p className="text-xs text-ink/50">Cambiar el rol o desactivarlo cierra sus sesiones abiertas.</p>
          </>
        )}
        <Button type="submit" disabled={isSubmitting} className="mt-2">
          {isSubmitting ? "Guardando..." : "Guardar cambios"}
        </Button>
      </form>
    </Modal>
  );
}

function ResetPasswordDialog({ user, onClose, onSaved }: DialogProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordFormValues>({ resolver: zodResolver(resetPasswordSchema) });

  const onSubmit = async (values: ResetPasswordFormValues) => {
    try {
      const response = await fetch(`/api/users/${user.id}/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        sileo.error({
          title: "No se pudo restablecer",
          description: data?.message ?? "Inténtalo nuevamente.",
        });
        return;
      }

      sileo.success({
        title: "Contraseña restablecida",
        description: `${user.username} deberá cambiarla al ingresar.`,
      });
      onSaved(data as AdminUser);
    } catch {
      sileo.error(CONNECTION_ERROR);
    }
  };

  return (
    <Modal title={`Restablecer contraseña de ${user.username}`} onClose={onClose}>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <TextField
          label="Contraseña temporal"
          type="password"
          error={errors.newPassword}
          autoComplete="new-password"
          {...register("newPassword")}
        />
        <p className="text-xs text-ink/50">
          Cierra sus sesiones abiertas y desbloquea la cuenta si estaba bloqueada.
        </p>
        <Button type="submit" disabled={isSubmitting} className="mt-2">
          {isSubmitting ? "Guardando..." : "Restablecer"}
        </Button>
      </form>
    </Modal>
  );
}
