import { z } from "zod";

const optional = z.string().trim();

export const clientSchema = z.object({
  companyName: z.string().trim().min(1, "Ingresa el nombre comercial"),
  legalName: z.string().trim().min(1, "Ingresa la razón social"),
  industry: optional,
  taxId: optional.refine((v) => v === "" || /^\d{11}$/.test(v), "El RUC tiene 11 dígitos"),
  firstName: optional,
  lastName: optional,
  jobTitle: optional,
  email: optional.refine((v) => v === "" || z.email().safeParse(v).success, "Email no válido"),
  phoneNumber: optional,
  website: optional.refine((v) => v === "" || /^https?:\/\//.test(v), "Empieza con http:// o https://"),
  address: optional,
  district: optional,
  province: optional,
});

export type ClientFormValues = z.infer<typeof clientSchema>;
