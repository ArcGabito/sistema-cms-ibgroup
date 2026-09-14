import { z } from "zod";

const required = z.string().min(1, "Este campo es obligatorio");
const requiredSelect = z.string().min(1, "Seleccione una opción");
const email = z.email("Ingrese un correo válido");

export const personasContactSchema = z.object({
  type: z.literal("Personas"),
  nombres: required,
  apellidoPaterno: required,
  apellidoMaterno: required,
  cargo: required,
  email,
  telefono: required,
  linkedin: z.string().optional(),
  trabajando: requiredSelect,
  servicio: requiredSelect,
  sector: requiredSelect,
  rangoSalarial: requiredSelect,
  pais: requiredSelect,
  region: requiredSelect,
  consulta: required,
});

export type PersonasContactValues = z.infer<typeof personasContactSchema>;

export const empresasContactSchema = z.object({
  type: z.literal("Empresas"),
  empresa: required,
  contacto: required,
  cargo: required,
  email,
  telefono: required,
  colaboradores: requiredSelect,
  servicio: requiredSelect,
  mensaje: required,
});

export type EmpresasContactValues = z.infer<typeof empresasContactSchema>;

export const contactSubmissionSchema = z.discriminatedUnion("type", [
  personasContactSchema,
  empresasContactSchema,
]);
