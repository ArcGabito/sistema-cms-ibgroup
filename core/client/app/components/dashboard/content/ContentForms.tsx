"use client";

import { useFieldArray, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Trash2 } from "lucide-react";
import Button from "@/app/components/ui/Button";
import { TextField, TextareaField } from "@/app/components/forms/FormFields";
import type { CountryItem, FaqItem, ServiceItem, StatChart } from "@/app/lib/content";
import { SERVICE_ICONS } from "@/app/lib/service-icons";
import {
  countrySchema,
  faqSchema,
  serviceSchema,
  statSchema,
  type CountryFormValues,
  type FaqFormValues,
  type ServiceFormValues,
  type StatFormValues,
} from "@/app/lib/validations/content";

// Every form gets the item being edited (or nothing, for a new one) and
// submits the request body the backend expects for that content type.
export interface ContentFormProps<T> {
  initial?: T;
  onSubmit: (payload: object) => Promise<void>;
}

const labelClass = "mb-1.5 block text-[11px] font-semibold tracking-wider text-ink/50 uppercase";
const inputClass =
  "w-full rounded-md border border-black/10 bg-white px-3 py-2 text-sm text-ink outline-none transition-colors focus:border-brand";

function VisibleField(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="flex items-center gap-2 text-sm text-ink">
      <input type="checkbox" className="h-4 w-4 accent-brand" {...props} />
      Visible en el sitio
    </label>
  );
}

function SubmitButton({ isSubmitting }: { isSubmitting: boolean }) {
  return (
    <Button type="submit" disabled={isSubmitting} className="mt-2">
      {isSubmitting ? "Guardando..." : "Guardar"}
    </Button>
  );
}

export function ServiceForm({ initial, onSubmit }: ContentFormProps<ServiceItem>) {
  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ServiceFormValues>({
    resolver: zodResolver(serviceSchema),
    defaultValues: {
      title: initial?.title ?? "",
      description: initial?.description ?? "",
      features: (initial?.features ?? [""]).map((value) => ({ value })),
      ctaLabel: initial?.ctaLabel ?? "Más información",
      imageUrl: initial?.imageUrl ?? "/assets/service-1.jpg",
      icon: initial?.icon ?? "user",
      isVisible: initial?.isVisible ?? true,
    },
  });
  const features = useFieldArray({ control, name: "features" });

  const submit = (v: ServiceFormValues) =>
    onSubmit({ ...v, features: v.features.map((f) => f.value).filter((f) => f.trim()) });

  return (
    <form onSubmit={handleSubmit(submit)} className="flex flex-col gap-4">
      <TextField label="Título" error={errors.title} {...register("title")} />
      <TextareaField label="Descripción" error={errors.description} {...register("description")} />

      <div>
        <span className={labelClass}>Características</span>
        <div className="flex flex-col gap-2">
          {features.fields.map((field, i) => (
            <div key={field.id} className="flex gap-2">
              <input className={inputClass} {...register(`features.${i}.value`)} />
              <button
                type="button"
                aria-label="Quitar característica"
                onClick={() => features.remove(i)}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-ink/40 hover:bg-black/5 hover:text-ink"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
        {errors.features?.message && <p className="mt-1 text-xs text-brand">{errors.features.message}</p>}
        {features.fields.length < 10 && (
          <button
            type="button"
            onClick={() => features.append({ value: "" })}
            className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-brand hover:text-brand-dark"
          >
            <Plus className="h-3.5 w-3.5" /> Agregar característica
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <TextField label="Texto del botón" error={errors.ctaLabel} {...register("ctaLabel")} />
        <div>
          <label className={labelClass}>Ícono</label>
          <select className={`${inputClass} cursor-pointer py-2.5`} {...register("icon")}>
            {Object.entries(SERVICE_ICONS).map(([key, { label }]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </div>
      <TextField
        label="Imagen (/assets/... o URL https)"
        error={errors.imageUrl}
        {...register("imageUrl")}
      />
      <VisibleField {...register("isVisible")} />
      <SubmitButton isSubmitting={isSubmitting} />
    </form>
  );
}

export function FaqForm({ initial, onSubmit }: ContentFormProps<FaqItem>) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FaqFormValues>({
    resolver: zodResolver(faqSchema),
    defaultValues: {
      question: initial?.question ?? "",
      answer: initial?.answer ?? "",
      isVisible: initial?.isVisible ?? true,
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <TextField label="Pregunta" error={errors.question} {...register("question")} />
      <TextareaField label="Respuesta" rows={6} error={errors.answer} {...register("answer")} />
      <VisibleField {...register("isVisible")} />
      <SubmitButton isSubmitting={isSubmitting} />
    </form>
  );
}

export function CountryForm({ initial, onSubmit }: ContentFormProps<CountryItem>) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CountryFormValues>({
    resolver: zodResolver(countrySchema),
    defaultValues: {
      name: initial?.name ?? "",
      code: initial?.code ?? "",
      description: initial?.description ?? "",
      isVisible: initial?.isVisible ?? true,
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-[1fr_140px]">
        <TextField label="Nombre" error={errors.name} {...register("name")} />
        <TextField label="Código ISO" maxLength={2} error={errors.code} {...register("code")} />
      </div>
      <TextareaField label="Descripción" error={errors.description} {...register("description")} />
      <VisibleField {...register("isVisible")} />
      <SubmitButton isSubmitting={isSubmitting} />
    </form>
  );
}

const KIND_LABELS: Record<StatFormValues["kind"], string> = {
  percent: "Porcentaje (una serie)",
  months: "Meses (una serie)",
  split: "Porcentaje comparativo (dos series)",
};

const toNumber = (v: unknown) => (v === "" || v === null || v === undefined ? null : Number(v));

export function StatForm({ initial, onSubmit }: ContentFormProps<StatChart>) {
  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<StatFormValues>({
    resolver: zodResolver(statSchema),
    defaultValues: {
      title: initial?.title ?? "",
      description: initial?.description ?? "",
      kind: initial?.kind ?? "percent",
      seriesLabel: initial?.seriesLabel ?? "",
      secondSeriesLabel: initial?.secondSeriesLabel ?? "",
      points: initial?.points ?? [{ year: String(new Date().getFullYear()), value: 0, secondValue: null }],
      isVisible: initial?.isVisible ?? true,
    },
  });
  const points = useFieldArray({ control, name: "points" });
  const isSplit = useWatch({ control, name: "kind" }) === "split";

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <TextField label="Título" error={errors.title} {...register("title")} />
      <TextareaField label="Descripción" rows={2} error={errors.description} {...register("description")} />

      <div>
        <label className={labelClass}>Tipo de gráfico</label>
        <select className={`${inputClass} cursor-pointer py-2.5`} {...register("kind")}>
          {Object.entries(KIND_LABELS).map(([key, label]) => (
            <option key={key} value={key}>
              {label}
            </option>
          ))}
        </select>
      </div>

      {isSplit && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <TextField label="Serie 1 (azul)" error={errors.seriesLabel} {...register("seriesLabel")} />
          <TextField label="Serie 2 (roja)" error={errors.secondSeriesLabel} {...register("secondSeriesLabel")} />
        </div>
      )}

      <div>
        <span className={labelClass}>Valores</span>
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="text-[11px] font-semibold tracking-wider text-ink/40 uppercase">
              <th className="pb-2 font-semibold">Año</th>
              <th className="pb-2 font-semibold">{isSplit ? "Serie 1" : "Valor"}</th>
              {isSplit && <th className="pb-2 font-semibold">Serie 2</th>}
              <th className="w-9" />
            </tr>
          </thead>
          <tbody>
            {points.fields.map((field, i) => {
              const rowErrors = errors.points?.[i];
              return (
                <tr key={field.id} className="align-top">
                  <td className="pr-2 pb-2">
                    <input className={inputClass} {...register(`points.${i}.year`)} />
                    {rowErrors?.year && <p className="mt-1 text-xs text-brand">{rowErrors.year.message}</p>}
                  </td>
                  <td className="pr-2 pb-2">
                    <input
                      type="number"
                      step="0.1"
                      className={inputClass}
                      {...register(`points.${i}.value`, { setValueAs: toNumber })}
                    />
                    {rowErrors?.value && <p className="mt-1 text-xs text-brand">{rowErrors.value.message}</p>}
                  </td>
                  {isSplit && (
                    <td className="pr-2 pb-2">
                      <input
                        type="number"
                        step="0.1"
                        className={inputClass}
                        {...register(`points.${i}.secondValue`, { setValueAs: toNumber })}
                      />
                      {rowErrors?.secondValue && (
                        <p className="mt-1 text-xs text-brand">{rowErrors.secondValue.message}</p>
                      )}
                    </td>
                  )}
                  <td className="pb-2">
                    <button
                      type="button"
                      aria-label="Quitar valor"
                      onClick={() => points.remove(i)}
                      className="flex h-9 w-9 items-center justify-center rounded-md text-ink/40 hover:bg-black/5 hover:text-ink"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {errors.points?.message && <p className="mt-1 text-xs text-brand">{errors.points.message}</p>}
        {points.fields.length < 20 && (
          <button
            type="button"
            onClick={() => points.append({ year: "", value: 0, secondValue: isSplit ? 0 : null })}
            className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-brand hover:text-brand-dark"
          >
            <Plus className="h-3.5 w-3.5" /> Agregar año
          </button>
        )}
      </div>

      <VisibleField {...register("isVisible")} />
      <SubmitButton isSubmitting={isSubmitting} />
    </form>
  );
}
