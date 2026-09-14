"use client";

import { useMemo, useState } from "react";
import { Banknote, Calendar, RotateCcw, Scale, TrendingDown, TrendingUp, UserPlus, Wallet } from "lucide-react";
import Container from "@/app/components/ui/Container";
import Button from "@/app/components/ui/Button";
import Reveal from "@/app/components/ui/Reveal";
import {
  calculateOutplacementReturn,
  formatCurrency,
  formatMonths,
  type Currency,
} from "@/app/lib/calculator";

const CURRENCIES: { value: Currency; label: string }[] = [
  { value: "PEN", label: "Soles peruanos (S/)" },
  { value: "USD", label: "Dólares (US$)" },
];

const EXAMPLE = calculateOutplacementReturn({
  targetSalary: 6000,
  monthsWithoutCoaching: 6,
  monthsWithCoaching: 2,
  currency: "PEN",
});

export default function CalculatorTool() {
  const [currency, setCurrency] = useState<Currency>("PEN");
  const [targetSalary, setTargetSalary] = useState("");
  const [monthsWithout, setMonthsWithout] = useState("");
  const [monthsWith, setMonthsWith] = useState("");

  const result = useMemo(
    () =>
      calculateOutplacementReturn({
        targetSalary: parseFloat(targetSalary) || 0,
        monthsWithoutCoaching: parseFloat(monthsWithout) || 0,
        monthsWithCoaching: parseFloat(monthsWith) || 0,
        currency,
      }),
    [targetSalary, monthsWithout, monthsWith, currency]
  );

  const salaryLabel = currency === "PEN" ? "(S/)" : "(US$)";
  const salaryPlaceholder = currency === "PEN" ? "Ejemplo: 3500" : "Ejemplo: 950";

  const handleReset = () => {
    setTargetSalary("");
    setMonthsWithout("");
    setMonthsWith("");
  };

  return (
    <section className="py-20 sm:py-28">
      <Container className="max-w-4xl">
        <Reveal>
          <div className="flex justify-center">
            <div className="inline-flex gap-1 rounded-full border border-black/10 bg-surface p-1">
              {CURRENCIES.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => setCurrency(c.value)}
                  className={`rounded-full px-5 py-2 text-xs font-semibold tracking-wide uppercase transition-colors ${
                    currency === c.value
                      ? "bg-brand text-white"
                      : "text-ink/60 hover:text-brand"
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-8 rounded-2xl border border-black/5 bg-white p-6 shadow-sm sm:p-10">
            <h2 className="text-center font-heading text-2xl font-bold text-ink sm:text-3xl">
              ¿Cómo se justifica la inversión en nuestro servicio de Outplacement?
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-center text-sm leading-relaxed text-ink/60">
              Con un coach experto en empleabilidad puedes reducir el tiempo de
              búsqueda de empleo. Ingresa tus datos y te mostraremos los
              resultados en la moneda seleccionada.
            </p>

            <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-3">
              <div>
                <label className="mb-1.5 block text-[11px] font-semibold tracking-wider text-ink/50 uppercase">
                  ¿Cuál es tu sueldo objetivo? {salaryLabel}
                </label>
                <div className="relative">
                  <Banknote className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-ink/30" />
                  <input
                    type="number"
                    min="0"
                    inputMode="decimal"
                    value={targetSalary}
                    onChange={(e) => setTargetSalary(e.target.value)}
                    placeholder={salaryPlaceholder}
                    className="w-full rounded-md border border-black/10 bg-white py-2.5 pr-4 pl-10 text-sm text-ink outline-none transition-colors focus:border-brand"
                  />
                </div>
                <p className="mt-1.5 text-xs text-ink/40">Usaremos este valor para el cálculo.</p>
              </div>

              <div>
                <label className="mb-1.5 block text-[11px] font-semibold tracking-wider text-ink/50 uppercase">
                  Meses para conseguir empleo sin entrenamiento
                </label>
                <div className="relative">
                  <Calendar className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-ink/30" />
                  <input
                    type="number"
                    min="0"
                    inputMode="decimal"
                    value={monthsWithout}
                    onChange={(e) => setMonthsWithout(e.target.value)}
                    placeholder="Ejemplo: 6"
                    className="w-full rounded-md border border-black/10 bg-white py-2.5 pr-4 pl-10 text-sm text-ink outline-none transition-colors focus:border-brand"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-[11px] font-semibold tracking-wider text-ink/50 uppercase">
                  Tiempo estimado de éxito con nuestro entrenamiento
                </label>
                <div className="relative">
                  <Calendar className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-ink/30" />
                  <input
                    type="number"
                    min="0"
                    inputMode="decimal"
                    value={monthsWith}
                    onChange={(e) => setMonthsWith(e.target.value)}
                    placeholder="Ejemplo: 3"
                    className="w-full rounded-md border border-black/10 bg-white py-2.5 pr-4 pl-10 text-sm text-ink outline-none transition-colors focus:border-brand"
                  />
                </div>
              </div>
            </div>

            <div className="mt-10 rounded-xl border border-black/10 bg-surface p-6">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="rounded-lg border border-blue-200 bg-white p-4">
                  <p className="flex items-center gap-2 text-xs font-semibold tracking-wide text-blue-600 uppercase">
                    <Wallet className="h-4 w-4" />
                    Ahorro por meses ganados
                  </p>
                  <p className="mt-2 text-lg font-bold text-ink">
                    {result.isValid ? formatCurrency(result.savings, currency) : "—"}
                  </p>
                </div>
                <div className="rounded-lg border border-brand/30 bg-white p-4">
                  <p className="flex items-center gap-2 text-xs font-semibold tracking-wide text-brand uppercase">
                    <TrendingDown className="h-4 w-4" />
                    Costo total
                  </p>
                  <p className="mt-2 text-lg font-bold text-ink">
                    {result.isValid ? formatCurrency(result.investment, currency) : "—"}
                  </p>
                </div>
                <div className="rounded-lg border border-emerald-200 bg-white p-4">
                  <p className="flex items-center gap-2 text-xs font-semibold tracking-wide text-emerald-600 uppercase">
                    <TrendingUp className="h-4 w-4" />
                    Retorno neto
                  </p>
                  <p className="mt-2 text-lg font-bold text-ink">
                    {result.isValid ? formatCurrency(result.netReturn, currency) : "—"}
                  </p>
                </div>
              </div>

              <div className="mt-4 rounded-lg border border-amber-200 bg-white p-4">
                <p className="flex items-center gap-2 text-xs font-semibold tracking-wide text-amber-600 uppercase">
                  <Scale className="h-4 w-4" />
                  Punto de equilibrio
                </p>
                <p className="mt-2 text-lg font-bold text-ink">
                  {result.isValid ? formatMonths(result.breakEvenMonths) : "—"}
                </p>
                <p className="mt-1 text-xs text-ink/40">Meses necesarios</p>
              </div>

              <p className="mt-4 text-xs leading-relaxed text-ink/40">
                Modelo aplicado internamente (adelanto por tramo salarial +
                componente al éxito). No se exponen importes fijos ni la tasa
                de cambio.
              </p>
            </div>

            <div className="mt-8 flex justify-center">
              <Button variant="outline" onClick={handleReset}>
                <RotateCcw className="h-3.5 w-3.5" />
                Limpiar
              </Button>
            </div>

            <p className="mt-6 text-center text-xs text-ink/40">
              (*) Simulación referencial basada en los datos ingresados. No constituye oferta.
            </p>
            <p className="mx-auto mt-3 max-w-2xl text-center text-xs leading-relaxed text-ink/40">
              Nota: los resultados de esta simulación son referenciales,
              basados en promedios de mercado y ratios internos. El éxito de
              la reincorporación laboral depende directamente del nivel de
              ejecución, disciplina y compromiso del candidato durante su
              proceso de entrenamiento personalizado.
            </p>
          </div>
        </Reveal>

        <Reveal delay={0.1} className="mt-10 rounded-2xl bg-surface p-6 sm:p-10">
          <h3 className="font-heading text-xl font-bold text-ink sm:text-2xl">
            ¿Cómo se calcula el retorno de inversión en outplacement?
          </h3>
          <p className="mt-4 text-sm leading-relaxed text-ink/60">
            Imagina un profesional con un sueldo objetivo de{" "}
            <strong className="text-ink">S/ 6,000 mensuales</strong> que, por
            su cuenta, tardaría <strong className="text-ink">6 meses</strong>{" "}
            en conseguir empleo, pero con nuestro coaching lo logra en{" "}
            <strong className="text-ink">2 meses</strong>.
          </p>
          <ul className="mt-5 flex flex-col gap-2 text-sm text-ink/70">
            <li>
              <strong className="text-ink">Ahorro por meses ganados:</strong>{" "}
              {formatCurrency(EXAMPLE.savings, "PEN")} ({EXAMPLE.monthsSaved} meses × S/ 6,000)
            </li>
            <li>
              <strong className="text-ink">Inversión en outplacement:</strong>{" "}
              {formatCurrency(EXAMPLE.investment, "PEN")} (según tramo salarial)
            </li>
            <li>
              <strong className="text-ink">Retorno neto estimado:</strong>{" "}
              {formatCurrency(EXAMPLE.netReturn, "PEN")}
            </li>
            <li>
              <strong className="text-ink">Punto de equilibrio:</strong>{" "}
              {formatMonths(EXAMPLE.breakEvenMonths)}
            </li>
          </ul>
          <p className="mt-5 text-sm leading-relaxed text-ink/60">
            Este es un ejemplo ilustrativo. Tu resultado real dependerá de tu
            sueldo, sector y mercado laboral. Nuestro modelo combina un
            componente inicial y un porcentaje sobre tu primer sueldo,
            alineando nuestros incentivos con tu éxito.
          </p>
        </Reveal>

        <Reveal delay={0.15} className="mt-12 flex flex-col items-center text-center">
          <Button href="/contactenos" variant="solid">
            <UserPlus className="h-4 w-4" />
            Agenda tu Consulta Gratuita
          </Button>
          <p className="mt-3 text-xs text-ink/50">
            Te explicamos cómo maximizar tu empleabilidad sin compromiso.
          </p>
        </Reveal>
      </Container>
    </section>
  );
}
