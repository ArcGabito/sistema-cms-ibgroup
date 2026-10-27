"use client";

import { useMemo, useState } from "react";
import { sileo } from "sileo";
import { fetchConDespertar } from "@/app/lib/despertar";
import { ClipboardList, Trash2 } from "lucide-react";
import type { EmployabilityTestSubmission } from "@/app/lib/employability-tests";
import { TEST_BLOCKS } from "@/app/lib/employability-test-data";
import Badge from "@/app/components/dashboard/ui/Badge";
import SearchInput from "@/app/components/dashboard/ui/SearchInput";
import ExportButton from "@/app/components/dashboard/ui/ExportButton";
import EmptyState from "@/app/components/dashboard/ui/EmptyState";
import { useConfirmDialog } from "@/app/components/dashboard/ui/ConfirmDialog";

interface TestModuleProps {
  initialSubmissions: EmployabilityTestSubmission[];
}

function DetailRow({ label, value }: { label: string; value: string | number }) {
  return (
    <div>
      <p className="text-xs font-semibold tracking-wider text-ink/40 uppercase">{label}</p>
      <p className="mt-0.5 text-ink">{value}</p>
    </div>
  );
}

function formatDate(value: string) {
  return new Date(value).toLocaleString("es-PE", { dateStyle: "medium", timeStyle: "short" });
}

function scoreTone(average: number): "success" | "warning" | "brand" {
  if (average >= 4) return "success";
  if (average >= 2.5) return "warning";
  return "brand";
}

const displayName = (s: EmployabilityTestSubmission) =>
  [s.nombres, s.apellidoPaterno, s.apellidoMaterno].filter(Boolean).join(" ");

export default function TestModule({ initialSubmissions }: TestModuleProps) {
  const [submissions, setSubmissions] = useState(initialSubmissions);
  const [selectedId, setSelectedId] = useState<number | null>(initialSubmissions[0]?.id ?? null);
  const [query, setQuery] = useState("");
  const { confirm, dialog } = useConfirmDialog();

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return submissions;
    return submissions.filter(
      (s) => displayName(s).toLowerCase().includes(q) || s.email.toLowerCase().includes(q),
    );
  }, [submissions, query]);

  const selected = submissions.find((s) => s.id === selectedId) ?? null;

  const handleDelete = async (submission: EmployabilityTestSubmission, event?: React.MouseEvent) => {
    event?.stopPropagation();
    const label = displayName(submission);

    const ok = await confirm({
      title: "¿Eliminar este test?",
      description: `Se eliminará el test de "${label}" de forma permanente. Esta acción no se puede deshacer.`,
    });
    if (!ok) return;

    try {
      const response = await fetchConDespertar(`/api/employability-test/${submission.id}`, { method: "DELETE" });

      if (!response.ok) {
        sileo.error({ title: "No se pudo eliminar", description: "Inténtalo nuevamente." });
        return;
      }

      setSubmissions((prev) => prev.filter((s) => s.id !== submission.id));
      if (selectedId === submission.id) {
        setSelectedId(null);
      }
      sileo.success({ title: "Test eliminado", description: label });
    } catch {
      sileo.error({
        title: "Error de conexión",
        description: "No pudimos conectar con el servidor. Intenta nuevamente.",
      });
    }
  };

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_420px]">
      {dialog}

      <div className="rounded-lg border border-black/10 bg-white p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="font-heading text-base font-bold text-ink">
            Tests recibidos
            <span className="ml-2 text-xs font-normal text-ink/40">
              {filtered.length} de {submissions.length}
            </span>
          </h2>
          <div className="flex w-full gap-2 sm:w-auto">
            <SearchInput
              placeholder="Buscar por nombre o email..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full sm:w-64"
            />
            <ExportButton href="/api/tests/export" />
          </div>
        </div>

        <div className="mt-5 overflow-x-auto">
          {filtered.length === 0 ? (
            <EmptyState
              icon={ClipboardList}
              title={submissions.length === 0 ? "Todavía no hay tests" : "Sin resultados"}
              description={
                submissions.length === 0
                  ? "Los tests completados desde el sitio aparecerán aquí."
                  : "Ajusta tu búsqueda para ver otros tests."
              }
            />
          ) : (
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-black/10 text-xs font-semibold tracking-wider text-ink/40 uppercase">
                  <th className="pb-3">Nombre</th>
                  <th className="pb-3">Nivel</th>
                  <th className="pb-3">Puntaje</th>
                  <th className="pb-3">Fecha</th>
                  <th className="pb-3" />
                </tr>
              </thead>
              <tbody>
                {filtered.map((s) => (
                  <tr
                    key={s.id}
                    onClick={() => setSelectedId(s.id)}
                    className={`cursor-pointer border-b border-black/5 last:border-0 ${
                      selectedId === s.id ? "bg-surface" : "hover:bg-surface/60"
                    }`}
                  >
                    <td className="max-w-xs py-3">
                      <p className="truncate font-medium text-ink">{displayName(s)}</p>
                      <p className="truncate text-xs text-ink/40">{s.email}</p>
                    </td>
                    <td className="py-3 text-ink/70">{s.nivelProfesional}</td>
                    <td className="py-3">
                      <Badge tone={scoreTone(s.puntajePromedio)}>{s.puntajePromedio.toFixed(2)} / 5</Badge>
                    </td>
                    <td className="py-3 whitespace-nowrap text-ink/50">
                      {new Date(s.createdAt).toLocaleDateString("es-PE")}
                    </td>
                    <td className="py-3">
                      <button
                        type="button"
                        aria-label="Eliminar"
                        onClick={(e) => handleDelete(s, e)}
                        className="text-ink/40 hover:text-brand"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <div className="rounded-lg border border-black/10 bg-white p-6">
        <h2 className="font-heading text-base font-bold text-ink">Detalle</h2>
        {selected ? (
          <div className="mt-5 flex flex-col gap-5 text-sm">
            <div className="rounded-lg border border-black/5 bg-surface p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="font-heading text-base font-bold text-ink">{displayName(selected)}</p>
                <Badge tone={scoreTone(selected.puntajePromedio)}>
                  {selected.puntajePromedio.toFixed(2)} / 5
                </Badge>
              </div>
              <p className="mt-1 text-xs text-ink/50">Puntaje total: {selected.puntajeTotal} / 160</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <DetailRow label="Email" value={selected.email} />
              <DetailRow label="Teléfono" value={selected.telefono} />
              <DetailRow label="Edad" value={selected.edad} />
              <DetailRow label="Nivel profesional" value={selected.nivelProfesional} />
              <DetailRow label="Industria" value={selected.industria} />
              <DetailRow label="¿Trabajando?" value={selected.actualmenteTrabajando} />
              <DetailRow label="Último salario" value={selected.ultimoSalario} />
              <DetailRow label="LinkedIn" value={selected.tieneLinkedin} />
              <DetailRow
                label="Ubicación"
                value={[selected.departamento, selected.pais].filter(Boolean).join(", ")}
              />
              <DetailRow label="Autoriza datos" value={selected.autorizaDatos} />
              <DetailRow label="Desea orientación" value={selected.deseaOrientacion} />
            </div>

            <div className="flex flex-col gap-4 border-t border-black/5 pt-4">
              <p className="text-xs font-semibold tracking-wider text-ink/40 uppercase">Respuestas del test</p>
              {TEST_BLOCKS.map((block) => (
                <div key={block.id}>
                  <p className="rounded-md bg-blue-50 px-3 py-1.5 text-xs font-bold tracking-wide text-blue-900 uppercase">
                    {block.label}
                  </p>
                  <div className="mt-2 flex flex-col gap-1.5">
                    {block.questions.map((q) => (
                      <div key={q.key} className="flex items-start justify-between gap-3 text-xs">
                        <span className="text-ink/60">{q.text}</span>
                        <span className="shrink-0 font-semibold text-ink">
                          {selected.respuestas[q.key] ?? "—"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <p className="text-xs text-ink/40">Recibido el {formatDate(selected.createdAt)}</p>

            <button
              type="button"
              onClick={() => handleDelete(selected)}
              className="inline-flex w-fit items-center gap-2 text-xs font-semibold text-brand hover:text-brand-dark"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Eliminar test
            </button>
          </div>
        ) : (
          <p className="mt-5 text-sm text-ink/40">Selecciona un test para ver el detalle.</p>
        )}
      </div>
    </div>
  );
}
