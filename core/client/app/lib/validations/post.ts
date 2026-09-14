import { z } from "zod";

export const postSchema = z.object({
  title: z.string().min(3, "Mínimo 3 caracteres"),
  excerpt: z.string().min(10, "Mínimo 10 caracteres").max(500, "Máximo 500 caracteres"),
  content: z.string().min(20, "Mínimo 20 caracteres"),
  imageUrl: z.union([z.url("URL inválida"), z.literal("")]).optional(),
  published: z.boolean(),
});

export type PostFormValues = z.infer<typeof postSchema>;

export const generateDraftSchema = z.object({
  topic: z.string().min(3, "Ingresa un tema de al menos 3 caracteres"),
});

export type GenerateDraftFormValues = z.infer<typeof generateDraftSchema>;
