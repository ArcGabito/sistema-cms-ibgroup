import { z } from "zod";
import { ROLES } from "@/app/lib/roles";

const password = z.string().min(8, "Mínimo 8 caracteres");

export const createUserSchema = z.object({
  username: z.string().min(3, "Mínimo 3 caracteres"),
  fullName: z.string().min(1, "Ingresa el nombre completo"),
  password,
  role: z.enum(ROLES, { message: "Selecciona un rol" }),
});

export type CreateUserFormValues = z.infer<typeof createUserSchema>;

export const updateUserSchema = z.object({
  fullName: z.string().trim().min(1, "Ingresa el nombre completo"),
  role: z.enum(ROLES, { message: "Selecciona un rol" }),
  isActive: z.boolean(),
});

export type UpdateUserFormValues = z.infer<typeof updateUserSchema>;

export const resetPasswordSchema = z.object({
  newPassword: password,
});

export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Ingresa tu contraseña actual"),
    newPassword: password,
    confirmPassword: z.string(),
  })
  .refine((v) => v.newPassword === v.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  })
  .refine((v) => v.newPassword !== v.currentPassword, {
    message: "Debe ser distinta de la actual",
    path: ["newPassword"],
  });

export type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>;
