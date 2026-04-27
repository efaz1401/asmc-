import "server-only";

/**
 * Payroll calculation, in halalas (1 SAR = 100 halalas) to avoid float
 * rounding. All inputs are integers; the encrypted DB fields hold the same
 * integers as decimal strings.
 */

export type AllowanceLine = { label: string; amount: number };
export type DeductionLine = { label: string; amount: number };

export interface PayrollInputs {
  baseSalary: number; // monthly base, in halalas
  workingDays: number; // expected days in the month, e.g. 26
  daysPresent: number;
  daysAbsent: number;
  overtimeMinutes: number;
  /** SAR-per-hour overtime rate × 100 (i.e. halalas per hour). */
  overtimeRatePerHour: number;
  allowances: AllowanceLine[];
  deductions: DeductionLine[];
}

export interface PayrollResult {
  baseEarned: number;
  allowancesTotal: number;
  overtimePay: number;
  deductionsTotal: number;
  gross: number;
  net: number;
}

export function computePayroll(input: PayrollInputs): PayrollResult {
  const {
    baseSalary,
    workingDays,
    daysPresent,
    overtimeMinutes,
    overtimeRatePerHour,
    allowances,
    deductions,
  } = input;

  const days = Math.max(1, workingDays);
  const present = Math.max(0, Math.min(daysPresent, days));
  const baseEarned = Math.round((baseSalary * present) / days);

  const allowancesTotal = allowances.reduce((s, a) => s + Math.max(0, a.amount), 0);
  const overtimePay = Math.round((overtimeMinutes / 60) * overtimeRatePerHour);
  const deductionsTotal = deductions.reduce((s, d) => s + Math.max(0, d.amount), 0);

  const gross = baseEarned + allowancesTotal + overtimePay;
  const net = Math.max(0, gross - deductionsTotal);
  return {
    baseEarned,
    allowancesTotal,
    overtimePay,
    deductionsTotal,
    gross,
    net,
  };
}

/** Pretty-print halalas as "1,234.56 SAR". */
export function formatSar(halalas: number): string {
  const sign = halalas < 0 ? "-" : "";
  const abs = Math.abs(halalas);
  const sar = Math.floor(abs / 100);
  const cents = abs % 100;
  const sarStr = sar.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return `${sign}${sarStr}.${cents.toString().padStart(2, "0")} SAR`;
}

/** Parse "1234.56" into halalas (123456). */
export function parseSar(input: string): number {
  const cleaned = input.replace(/[, ]+/g, "").trim();
  if (!/^-?\d+(\.\d{1,2})?$/.test(cleaned)) {
    throw new Error(`Invalid amount: ${input}`);
  }
  const [whole, frac = ""] = cleaned.split(".");
  const cents = (frac + "00").slice(0, 2);
  return Number(whole) * 100 + (Number(whole) < 0 ? -Number(cents) : Number(cents));
}
