"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { sileo } from "sileo";
import { fetchConDespertar } from "@/app/lib/despertar";
import { KeyRound } from "lucide-react";
import Button from "@/app/components/ui/Button";
import { TextField } from "@/app/components/forms/FormFields";
import { changePasswordSchema, type ChangePasswordFormValues } from "@/app/lib/validations/user";

export default function ChangePasswordForm() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ChangePasswordFormValues>({ resolver: zodResolver(changePasswordSchema) });

  const onSubmit = async (values: ChangePasswordFormValues) => {
    try {
      const response = await fetchConDespertar("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        sileo.error({
          title: "No se pudo cambiar la contraseña",
          description: data?.message ?? "Inténtalo nuevamente.",
        });
        return;
      }

      sileo.success({
        title: "Contraseña actualizada",
        description: "Se cerraron tus otras sesiones abiertas.",
      });
      reset();
      router.refresh();
    } catch {
      sileo.error({
        title: "Error de conexión",
        description: "No pudimos conectar con el servidor. Intenta nuevamente.",
      });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <TextField
        label="Contraseña actual"
        type="password"
        error={errors.currentPassword}
        autoComplete="current-password"
        {...register("currentPassword")}
      />
      <TextField
        label="Nueva contraseña"
        type="password"
        error={errors.newPassword}
        autoComplete="new-password"
        {...register("newPassword")}
      />
      <TextField
        label="Confirmar nueva contraseña"
        type="password"
        error={errors.confirmPassword}
        autoComplete="new-password"
        {...register("confirmPassword")}
      />
      <Button type="submit" disabled={isSubmitting} className="mt-2">
        <KeyRound className="h-4 w-4" />
        {isSubmitting ? "Guardando..." : "Cambiar contraseña"}
      </Button>
    </form>
  );
}
