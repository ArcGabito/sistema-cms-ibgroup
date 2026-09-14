import { z } from "zod";

export const loginSchema = z.object({
  usuario: z.string().min(1, "Ingresa tu usuario"),
  contrasena: z.string().min(1, "Ingresa tu contraseña"),
});

export type LoginFormValues = z.infer<typeof loginSchema>;
