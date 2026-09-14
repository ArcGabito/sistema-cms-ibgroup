"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { sileo } from "sileo";
import { Bot, Sparkles, PenLine, FileEdit, CheckCircle2 } from "lucide-react";
import Button from "@/app/components/ui/Button";
import { TextField } from "@/app/components/forms/FormFields";
import { generateDraftSchema, type GenerateDraftFormValues } from "@/app/lib/validations/post";
import type { Post } from "@/app/lib/posts";

const STEPS = [
  {
    icon: PenLine,
    title: "1. Describe un tema",
    description: "Escribe sobre qué debe tratar el artículo, con el mayor detalle posible.",
  },
  {
    icon: Sparkles,
    title: "2. La IA redacta el borrador",
    description: "Se genera un título, resumen y contenido, guardados sin publicar.",
  },
  {
    icon: FileEdit,
    title: "3. Revisa y publica",
    description: "Edita el borrador desde el módulo Blog y publícalo cuando esté listo.",
  },
];

export default function AiDraftGenerator() {
  const [lastDraft, setLastDraft] = useState<Post | null>(null);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<GenerateDraftFormValues>({ resolver: zodResolver(generateDraftSchema) });

  const onSubmit = async (values: GenerateDraftFormValues) => {
    try {
      const response = await fetch("/api/posts/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        sileo.error({
          title: "No se pudo generar el borrador",
          description: data?.message ?? "Inténtalo nuevamente.",
        });
        return;
      }

      const draft = data as Post;
      setLastDraft(draft);
      sileo.success({ title: "Borrador generado", description: draft.title });
      reset();
    } catch {
      sileo.error({
        title: "Error de conexión",
        description: "No pudimos conectar con el servidor. Intenta nuevamente.",
      });
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(320px,420px)_1fr]">
        <div className="rounded-lg border border-black/10 bg-white p-6">
          <h2 className="flex items-center gap-2 font-heading text-base font-bold text-ink">
            <Bot className="h-[18px] w-[18px]" />
            Generar borrador
          </h2>
          <p className="mt-2 text-sm text-ink/60">
            Describe un tema y la IA redactará un borrador de artículo. Se guarda como post sin
            publicar en el módulo Blog, donde puedes revisarlo, editarlo y publicarlo.
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="mt-5 flex flex-col gap-4">
            <TextField
              label="Tema"
              error={errors.topic}
              placeholder="Ej. Cómo prepararse para una entrevista por competencias"
              {...register("topic")}
            />
            <Button type="submit" disabled={isSubmitting} className="mt-2 gap-2">
              <Sparkles className="h-4 w-4" />
              {isSubmitting ? "Generando..." : "Generar borrador"}
            </Button>
          </form>
        </div>

        <div className="rounded-lg border border-black/10 bg-white p-6">
          <h2 className="font-heading text-base font-bold text-ink">Último borrador generado</h2>
          {lastDraft ? (
            <div className="mt-5 flex flex-col gap-3">
              <div className="flex items-start gap-3 rounded-lg border border-black/5 bg-surface p-4">
                <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-green-100 text-green-700">
                  <CheckCircle2 className="h-4 w-4" />
                </span>
                <div>
                  <h3 className="font-heading text-base font-bold text-ink">{lastDraft.title}</h3>
                  <p className="mt-1 text-sm text-ink/60">{lastDraft.excerpt}</p>
                </div>
              </div>
              <Link
                href="/dashboard/blog"
                className="inline-flex w-fit items-center gap-2 text-sm font-semibold text-brand hover:text-brand-dark"
              >
                Editar en el módulo Blog →
              </Link>
            </div>
          ) : (
            <p className="mt-5 text-sm text-ink/40">Todavía no has generado ningún borrador.</p>
          )}
        </div>
      </div>

      <div className="rounded-lg border border-black/10 bg-white p-6">
        <h2 className="font-heading text-base font-bold text-ink">Cómo funciona</h2>
        <div className="mt-5 grid grid-cols-1 gap-6 sm:grid-cols-3">
          {STEPS.map((step) => (
            <div key={step.title} className="flex flex-col gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand/10 text-brand">
                <step.icon className="h-4 w-4" />
              </span>
              <p className="font-heading text-sm font-bold text-ink">{step.title}</p>
              <p className="text-xs leading-relaxed text-ink/50">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
