"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { sileo } from "sileo";
import { fetchConDespertar } from "@/app/lib/despertar";
import { SelectField, TextField, TextareaField } from "@/app/components/forms/FormFields";
import Button from "@/app/components/ui/Button";
import { personasContactSchema, type PersonasContactValues } from "@/app/lib/validations/contact";
import {
  COUNTRY_OPTIONS,
  REGION_OPTIONS,
  SALARY_RANGE_OPTIONS,
  SECTOR_OPTIONS,
  SERVICE_OPTIONS,
  YES_NO_OPTIONS,
} from "@/app/lib/form-options";

export default function PersonasForm() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<PersonasContactValues>({
    resolver: zodResolver(personasContactSchema),
    defaultValues: { type: "Personas" },
  });

  const onSubmit = async (data: PersonasContactValues) => {
    try {
      const response = await fetchConDespertar("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json().catch(() => null);

      if (!response.ok) {
        sileo.error({
          title: "No se pudo enviar tu consulta",
          description: result?.message ?? "Inténtalo nuevamente.",
        });
        return;
      }

      sileo.success({
        title: "¡Consulta enviada!",
        description: `Gracias ${data.nombres}, nos pondremos en contacto contigo muy pronto.`,
      });
      reset({ type: "Personas" });
    } catch {
      sileo.error({
        title: "Error de conexión",
        description: "No pudimos conectar con el servidor. Intenta nuevamente.",
      });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 gap-5 md:grid-cols-2">
      <input type="hidden" {...register("type")} />
      <TextField
        label="Nombres"
        placeholder="Ingrese sus nombres"
        error={errors.nombres}
        {...register("nombres")}
      />
      <SelectField
        label="¿Actualmente estás trabajando?"
        options={YES_NO_OPTIONS}
        error={errors.trabajando}
        {...register("trabajando")}
      />

      <TextField
        label="Apellido paterno"
        placeholder="Apellido paterno"
        error={errors.apellidoPaterno}
        {...register("apellidoPaterno")}
      />
      <SelectField
        label="¿Qué servicio requieres?"
        options={SERVICE_OPTIONS}
        error={errors.servicio}
        {...register("servicio")}
      />

      <TextField
        label="Apellido materno"
        placeholder="Apellido materno"
        error={errors.apellidoMaterno}
        {...register("apellidoMaterno")}
      />
      <SelectField
        label="Sector de la última empresa donde labora o ha laborado"
        options={SECTOR_OPTIONS}
        error={errors.sector}
        {...register("sector")}
      />

      <TextField
        label="Cargo"
        placeholder="Cargo actual o último cargo"
        error={errors.cargo}
        {...register("cargo")}
      />
      <SelectField
        label="¿Cuál es tu rango salarial? (USD)"
        options={SALARY_RANGE_OPTIONS}
        error={errors.rangoSalarial}
        {...register("rangoSalarial")}
      />

      <TextField
        label="Email"
        type="email"
        placeholder="correo@ejemplo.com"
        error={errors.email}
        {...register("email")}
      />
      <SelectField label="País" options={COUNTRY_OPTIONS} error={errors.pais} {...register("pais")} />

      <TextField
        label="Teléfono"
        type="tel"
        placeholder="+51 999 999 999"
        error={errors.telefono}
        {...register("telefono")}
      />
      <SelectField
        label="Región / Departamento"
        options={REGION_OPTIONS}
        error={errors.region}
        {...register("region")}
      />

      <TextField
        label="¿Tienes perfil de LinkedIn?"
        placeholder="Enlace a tu perfil de LinkedIn"
        error={errors.linkedin}
        {...register("linkedin")}
      />
      <div />

      <TextareaField
        label="Escriba su consulta"
        placeholder="Cuéntanos brevemente tu situación actual"
        error={errors.consulta}
        className="md:col-span-2"
        {...register("consulta")}
      />

      <div className="md:col-span-2">
        <p className="mb-5 text-xs leading-relaxed text-ink/50">
          Al hacer clic en enviar, usted manifiesta su consentimiento para que
          Corporación IBGROUP realice el tratamiento de sus datos personales,
          conforme a las{" "}
          <a href="#" className="font-medium text-brand hover:underline">
            Condiciones y Términos
          </a>{" "}
          detallados en la sección Política de Tratamiento de Datos Personales.
        </p>
        <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
          {isSubmitting ? "Enviando..." : "Enviar"}
        </Button>
      </div>
    </form>
  );
}
