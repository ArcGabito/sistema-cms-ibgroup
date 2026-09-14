import { z } from "zod";
import { ROLES } from "@/app/lib/roles";

export const createUserSchema = z.object({
  username: z.string().min(3, "Mínimo 3 caracteres"),
  fullName: z.string().min(1, "Ingresa el nombre completo"),
  password: z.string().min(8, "Mínimo 8 caracteres"),
  role: z.enum(ROLES, { message: "Selecciona un rol" }),
});

export type CreateUserFormValues = z.infer<typeof createUserSchema>;
