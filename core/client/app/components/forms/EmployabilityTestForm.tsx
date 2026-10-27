"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { sileo } from "sileo";
import { fetchConDespertar } from "@/app/lib/despertar";
import { useRouter } from "next/navigation";
import Container from "@/app/components/ui/Container";
import Button from "@/app/components/ui/Button";
import { TextField, SelectField } from "@/app/components/forms/FormFields";
import {
  employabilityTestSchema,
  type EmployabilityTestFormValues,
} from "@/app/lib/validations/employability-test";
import { TEST_BLOCKS, NIVEL_PROFESIONAL_OPTIONS } from "@/app/lib/employability-test-data";
import {
  YES_NO_OPTIONS,
  SECTOR_OPTIONS,
  SALARY_RANGE_OPTIONS,
  COUNTRY_OPTIONS,
  REGION_OPTIONS,
} from "@/app/lib/form-options";

const RATING_OPTIONS = ["1", "2", "3", "4", "5"];

export default function EmployabilityTestForm() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<EmployabilityTestFormValues>({ resolver: zodResolver(employabilityTestSchema) });

  const onSubmit = async (values: EmployabilityTestFormValues) => {
    try {
      const response = await fetchConDespertar("/api/employability-test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        sileo.error({
          title: "No se pudo enviar el test",
          description: data?.message ?? "Inténtalo nuevamente.",
        });
        return;
      }

      sileo.success({
        title: "¡Test enviado!",
        description: `Gracias ${values.nombres}, nuestro equipo revisará tus resultados y te contactará con tu diagnóstico.`,
      });
      router.push("/");
    } catch {
      sileo.error({
        title: "Error de conexión",
        description: "No pudimos conectar con el servidor. Intenta nuevamente.",
      });
    }
  };

  return (
    <section className="py-12 sm:py-16">
      <Container className="max-w-4xl">
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-8">
          <div className="rounded-2xl border border-black/5 bg-white p-6 shadow-sm sm:p-10">
            <h2 className="font-heading text-xl font-bold text-ink">
              1. Datos Personales del Ejecutivo - Profesional
            </h2>
            <p className="mt-1 text-sm text-ink/50">Lea las preguntas e indique sus datos.</p>

            <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2">
              <TextField label="Nombres*" error={errors.nombres} {...register("nombres")} />
              <TextField
                label="Apellido paterno*"
                error={errors.apellidoPaterno}
                {...register("apellidoPaterno")}
              />
              <TextField
                label="Apellido materno*"
                error={errors.apellidoMaterno}
                {...register("apellidoMaterno")}
              />
              <TextField
                label="Correo electrónico*"
                type="email"
                error={errors.email}
                {...register("email")}
              />
              <TextField
                label="Teléfono / WhatsApp* (colocar el prefijo de su número)"
                type="tel"
                error={errors.telefono}
                {...register("telefono")}
              />
              <SelectField
                label="¿Tienes perfil de LinkedIn?"
                options={YES_NO_OPTIONS}
                error={errors.tieneLinkedin}
                {...register("tieneLinkedin")}
              />
              <SelectField label="País" options={COUNTRY_OPTIONS} error={errors.pais} {...register("pais")} />
              <SelectField
                label="Departamento"
                options={REGION_OPTIONS}
                placeholder="Seleccione país primero..."
                error={errors.departamento}
                {...register("departamento")}
              />
              <TextField
                label="Edad*"
                type="number"
                min={18}
                max={80}
                error={errors.edad}
                {...register("edad")}
              />
              <SelectField
                label="Nivel profesional*"
                options={NIVEL_PROFESIONAL_OPTIONS}
                error={errors.nivelProfesional}
                {...register("nivelProfesional")}
              />
              <SelectField
                label="¿En qué industria trabajas o has trabajado más tiempo?*"
                options={SECTOR_OPTIONS}
                error={errors.industria}
                {...register("industria")}
              />
              <SelectField
                label="¿Actualmente te encuentras trabajando?*"
                options={YES_NO_OPTIONS}
                error={errors.actualmenteTrabajando}
                {...register("actualmenteTrabajando")}
              />
              <SelectField
                label="¿Cuál es (o fue) tu último salario mensual?*"
                options={SALARY_RANGE_OPTIONS}
                error={errors.ultimoSalario}
                {...register("ultimoSalario")}
              />
            </div>
          </div>

          <div className="rounded-2xl border border-black/5 bg-white p-6 shadow-sm sm:p-10">
            <h2 className="font-heading text-xl font-bold text-ink">2. Test (A1–G32)</h2>
            <p className="mt-1 text-sm text-ink/50">
              Lea los enunciados detenidamente y luego marque. Marca de 1 al 5 según su situación real
              actual: 1 = Muy bajo / 5 = Muy alto.
            </p>

            <div className="mt-6 flex flex-col gap-8">
              {TEST_BLOCKS.map((block) => (
                <div key={block.id}>
                  <div className="rounded-md bg-blue-50 px-4 py-2 text-xs font-bold tracking-wider text-blue-900 uppercase">
                    {block.label}
                  </div>
                  <div className="mt-4 grid grid-cols-1 gap-5 md:grid-cols-2">
                    {block.questions.map((q) => (
                      <SelectField
                        key={q.key}
                        label={`${q.key.replace("q", "")}. ${q.text}`}
                        options={RATING_OPTIONS}
                        placeholder="—"
                        error={errors[q.key as keyof EmployabilityTestFormValues]}
                        {...register(q.key as keyof EmployabilityTestFormValues)}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-black/5 bg-white p-6 shadow-sm sm:p-10">
            <h2 className="font-heading text-xl font-bold text-ink">3. Autorización y Orientación</h2>
            <p className="mt-1 text-sm text-ink/50">
              Complete esta sección para autorizar el tratamiento de sus datos.
            </p>

            <div className="mt-6 flex flex-col gap-5">
              <SelectField
                label="Autorizo el uso de mis datos para elaborar mi diagnóstico de empleabilidad y para que me contacten con fines de orientación profesional. Podré solicitar eliminación o actualización escribiendo a crm.outplacement.coaching@corporacionibgroup.pe"
                options={YES_NO_OPTIONS}
                error={errors.autorizaDatos}
                {...register("autorizaDatos")}
              />
              <SelectField
                label="¿Desea una Orientación Ejecutiva - Profesional Gratuita de 10-15 minutos para analizar su resultado?"
                options={YES_NO_OPTIONS}
                error={errors.deseaOrientacion}
                {...register("deseaOrientacion")}
              />
            </div>
          </div>

          <div className="flex flex-col items-start gap-6">
            <label className="flex items-start gap-3 text-xs leading-relaxed text-ink/60">
              <input
                type="checkbox"
                className="mt-0.5 h-4 w-4 shrink-0 rounded border-black/20 text-brand"
                {...register("aceptaTratamientoDatos")}
              />
              <span>
                Autorizo el uso de mis datos para elaborar mi diagnóstico de empleabilidad y que me
                contacten con fines de orientación profesional, conforme a la Política de Tratamiento de
                Datos. Podré solicitar la eliminación o actualización de mis datos escribiendo a{" "}
                <a
                  href="mailto:crm.outplacement.coaching@corporacionibgroup.pe"
                  className="font-medium text-brand hover:underline"
                >
                  crm.outplacement.coaching@corporacionibgroup.pe
                </a>
              </span>
            </label>
            {errors.aceptaTratamientoDatos && (
              <p className="-mt-4 text-xs text-brand">{errors.aceptaTratamientoDatos.message}</p>
            )}

            <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
              {isSubmitting ? "Enviando..." : "Enviar Test"}
            </Button>
          </div>
        </form>
      </Container>
    </section>
  );
}
