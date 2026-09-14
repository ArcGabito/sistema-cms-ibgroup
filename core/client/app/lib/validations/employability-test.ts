import { z } from "zod";
import { TEST_QUESTION_KEYS } from "@/app/lib/employability-test-data";

const req = z.string().min(1, "Este campo es obligatorio");
const reqSelect = z.string().min(1, "Seleccione una opción");
const rating = z.string().min(1, "Seleccione una calificación");

const ratingFields = Object.fromEntries(TEST_QUESTION_KEYS.map((key) => [key, rating])) as Record<
  (typeof TEST_QUESTION_KEYS)[number],
  typeof rating
>;

export const employabilityTestSchema = z.object({
  nombres: req,
  apellidoPaterno: req,
  apellidoMaterno: req,
  email: z.email("Ingrese un correo válido"),
  tieneLinkedin: reqSelect,
  telefono: req,
  pais: reqSelect,
  departamento: reqSelect,
  edad: z
    .string()
    .min(1, "Este campo es obligatorio")
    .refine((v) => {
      const n = Number(v);
      return Number.isFinite(n) && n >= 18 && n <= 80;
    }, "La edad debe estar entre 18 y 80 años"),
  nivelProfesional: reqSelect,
  industria: reqSelect,
  actualmenteTrabajando: reqSelect,
  ultimoSalario: reqSelect,
  ...ratingFields,
  autorizaDatos: reqSelect,
  deseaOrientacion: reqSelect,
  aceptaTratamientoDatos: z.literal(true, {
    message: "Debes autorizar el tratamiento de tus datos para continuar.",
  }),
});

export type EmployabilityTestFormValues = z.infer<typeof employabilityTestSchema>;
