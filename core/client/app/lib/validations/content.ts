import { z } from "zod";

const required = (message: string) => z.string().trim().min(1, message);

export const serviceSchema = z.object({
  title: required("Ingresa el título"),
  description: required("Ingresa la descripción"),
  features: z.array(z.object({ value: z.string() })).max(10, "Máximo 10 características"),
  ctaLabel: z.string().trim(),
  imageUrl: z
    .string()
    .trim()
    .refine(
      (v) => v.startsWith("/assets/") || v.startsWith("/uploads/") || v.startsWith("https://"),
      "Sube una imagen, o usa /assets/... o una URL https",
    ),
  icon: required("Elige un ícono"),
  isVisible: z.boolean(),
});

export type ServiceFormValues = z.infer<typeof serviceSchema>;

export const faqSchema = z.object({
  question: required("Ingresa la pregunta"),
  answer: required("Ingresa la respuesta"),
  isVisible: z.boolean(),
});

export type FaqFormValues = z.infer<typeof faqSchema>;

export const countrySchema = z.object({
  name: required("Ingresa el nombre"),
  code: z
    .string()
    .trim()
    .regex(/^[A-Za-z]{2}$/, "Código ISO de 2 letras (ej. pe)"),
  description: required("Ingresa la descripción"),
  isVisible: z.boolean(),
});

export type CountryFormValues = z.infer<typeof countrySchema>;

const number = z.number({ message: "Ingresa un número" }).min(0, "No puede ser negativo");

export const statSchema = z
  .object({
    title: required("Ingresa el título"),
    description: required("Ingresa la descripción"),
    kind: z.enum(["months", "percent", "split"]),
    seriesLabel: z.string().trim(),
    secondSeriesLabel: z.string().trim(),
    points: z
      .array(z.object({ year: required("Año"), value: number, secondValue: number.nullable() }))
      .min(1, "Agrega al menos un valor")
      .max(20, "Máximo 20 valores"),
    isVisible: z.boolean(),
  })
  .superRefine((v, ctx) => {
    if (v.kind !== "months") {
      v.points.forEach((p, i) => {
        if (p.value > 100) ctx.addIssue({ code: "custom", message: "Máx. 100", path: ["points", i, "value"] });
        if ((p.secondValue ?? 0) > 100)
          ctx.addIssue({ code: "custom", message: "Máx. 100", path: ["points", i, "secondValue"] });
      });
    }
    if (v.kind === "split") {
      if (!v.seriesLabel) ctx.addIssue({ code: "custom", message: "Nombre de la serie", path: ["seriesLabel"] });
      if (!v.secondSeriesLabel)
        ctx.addIssue({ code: "custom", message: "Nombre de la serie", path: ["secondSeriesLabel"] });
      v.points.forEach((p, i) => {
        if (p.secondValue === null)
          ctx.addIssue({ code: "custom", message: "Requerido", path: ["points", i, "secondValue"] });
      });
    }
  });

export type StatFormValues = z.infer<typeof statSchema>;
