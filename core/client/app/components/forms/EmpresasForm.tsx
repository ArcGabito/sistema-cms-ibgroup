"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { sileo } from "sileo";
import { SelectField, TextField, TextareaField } from "@/app/components/forms/FormFields";
import Button from "@/app/components/ui/Button";
import { empresasContactSchema, type EmpresasContactValues } from "@/app/lib/validations/contact";
import { COLLABORATORS_OPTIONS, SERVICE_OPTIONS } from "@/app/lib/form-options";

export default function EmpresasForm() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<EmpresasContactValues>({
    resolver: zodResolver(empresasContactSchema),
    defaultValues: { type: "Empresas" },
  });

  const onSubmit = async (data: EmpresasContactValues) => {
    try {
      const response = await fetch("/api/contact", {
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
        description: `Gracias, un asesor de IBOutplacement se contactará con ${data.empresa}.`,
      });
      reset({ type: "Empresas" });
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
      <TextField label="Empresa" placeholder="Razón social" error={errors.empresa} {...register("empresa")} />
      <TextField
        label="Persona de contacto"
        placeholder="Nombre y apellido"
        error={errors.contacto}
        {...register("contacto")}
      />

      <TextField label="Cargo" placeholder="Cargo en la empresa" error={errors.cargo} {...register("cargo")} />
      <SelectField
        label="N.º de colaboradores a desvincular"
        options={COLLABORATORS_OPTIONS}
        error={errors.colaboradores}
        {...register("colaboradores")}
      />

      <TextField
        label="Email corporativo"
        type="email"
        placeholder="correo@empresa.com"
        error={errors.email}
        {...register("email")}
      />
      <TextField
        label="Teléfono"
        type="tel"
        placeholder="+51 999 999 999"
        error={errors.telefono}
        {...register("telefono")}
      />

      <SelectField
        label="¿Qué servicio requieres?"
        options={SERVICE_OPTIONS}
        error={errors.servicio}
        className="md:col-span-2"
        {...register("servicio")}
      />

      <TextareaField
        label="Cuéntanos sobre tu proceso de transición laboral"
        placeholder="Describe brevemente tu necesidad"
        error={errors.mensaje}
        className="md:col-span-2"
        {...register("mensaje")}
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
