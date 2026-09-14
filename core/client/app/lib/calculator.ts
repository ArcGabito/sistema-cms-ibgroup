export type Currency = "PEN" | "USD";

// Internal-only reference rate used to convert USD inputs to soles for the
// underlying calculation. Intentionally never shown in the UI.
const EXCHANGE_RATE_PEN_PER_USD = 3.75;

interface SalaryTier {
  maxSalary: number;
  base: number;
  successRate: number;
}

// Tiered pricing: a fixed advance per salary bracket plus a success-fee
// percentage on the target salary. Neither figure is rendered directly —
// only the derived results (savings, cost, net return, break-even) are.
const SALARY_TIERS: SalaryTier[] = [
  { maxSalary: 3000, base: 1200, successRate: 0.1 },
  { maxSalary: 6000, base: 2000, successRate: 0.12 },
  { maxSalary: 10000, base: 3200, successRate: 0.14 },
  { maxSalary: 20000, base: 5000, successRate: 0.16 },
  { maxSalary: Infinity, base: 8000, successRate: 0.18 },
];

function toPen(value: number, currency: Currency) {
  return currency === "USD" ? value * EXCHANGE_RATE_PEN_PER_USD : value;
}

function fromPen(value: number, currency: Currency) {
  return currency === "USD" ? value / EXCHANGE_RATE_PEN_PER_USD : value;
}

function getInvestmentInPen(targetSalaryPen: number) {
  const tier =
    SALARY_TIERS.find((t) => targetSalaryPen <= t.maxSalary) ??
    SALARY_TIERS[SALARY_TIERS.length - 1];
  return tier.base + tier.successRate * targetSalaryPen;
}

export interface CalculatorInput {
  targetSalary: number;
  monthsWithoutCoaching: number;
  monthsWithCoaching: number;
  currency: Currency;
}

export interface CalculatorResult {
  isValid: boolean;
  monthsSaved: number;
  savings: number;
  investment: number;
  netReturn: number;
  breakEvenMonths: number;
}

export function calculateOutplacementReturn({
  targetSalary,
  monthsWithoutCoaching,
  monthsWithCoaching,
  currency,
}: CalculatorInput): CalculatorResult {
  const isValid = targetSalary > 0 && monthsWithoutCoaching > 0 && monthsWithCoaching >= 0;

  if (!isValid) {
    return { isValid: false, monthsSaved: 0, savings: 0, investment: 0, netReturn: 0, breakEvenMonths: 0 };
  }

  const targetSalaryPen = toPen(targetSalary, currency);
  const investmentPen = getInvestmentInPen(targetSalaryPen);
  const monthsSaved = Math.max(0, monthsWithoutCoaching - monthsWithCoaching);
  const savingsPen = monthsSaved * targetSalaryPen;
  const netReturnPen = savingsPen - investmentPen;
  const breakEvenMonths = targetSalaryPen > 0 ? investmentPen / targetSalaryPen : 0;

  return {
    isValid: true,
    monthsSaved,
    savings: fromPen(savingsPen, currency),
    investment: fromPen(investmentPen, currency),
    netReturn: fromPen(netReturnPen, currency),
    breakEvenMonths,
  };
}

export function formatCurrency(value: number, currency: Currency) {
  return new Intl.NumberFormat("es-PE", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatMonths(months: number) {
  if (months <= 0) return "—";
  if (months < 1) return "Menos de 1 mes";
  const rounded = Math.round(months);
  return `${rounded} ${rounded === 1 ? "mes" : "meses"}`;
}
