import { getDb } from "@/lib/db";

export type BudgetStatus = "none" | "safe" | "warning" | "exceeded";

export type BudgetOverview = {
  month: string;
  /** Nominal anggaran, null kalau belum diatur. */
  budget: string | null;
  /** Total pengeluaran pada bulan terpilih. */
  spent: string;
  /** Sisa anggaran, null kalau anggaran belum diatur. */
  remaining: string | null;
  /** Persentase pemakaian anggaran (0-999), 0 kalau belum diatur. */
  percent: number;
  status: BudgetStatus;
  message: string;
};

const MONTH_REGEX = /^\d{4}-(0[1-9]|1[0-2])$/;

/** Batas nominal sesuai precision kolom NUMERIC(15, 2). */
export const BUDGET_AMOUNT_MAX = 9999999999999.99;

export function isMonthFormat(value: string): boolean {
  return MONTH_REGEX.test(value);
}

export function currentMonth(): string {
  return new Date().toISOString().slice(0, 7);
}

function budgetStatus(
  budget: string,
  spent: string,
): { status: Exclude<BudgetStatus, "none">; percent: number } {
  const budgetValue = Number(budget);
  const spentValue = Number(spent);
  const percent = budgetValue > 0
    ? Math.min(Math.round((spentValue / budgetValue) * 100), 999)
    : 0;

  if (percent > 100) return { status: "exceeded", percent };
  if (percent >= 80) return { status: "warning", percent };
  return { status: "safe", percent };
}

export async function getMonthlyExpense(userId: string, month: string): Promise<string> {
  const { rows } = await getDb().query<{ total: string }>(
    `SELECT COALESCE(SUM(amount), 0)::text AS total
     FROM transactions
     WHERE user_id = $1 AND type = 'expense' AND to_char(transaction_date, 'YYYY-MM') = $2`,
    [userId, month],
  );

  return rows[0]?.total ?? "0";
}

export async function getBudget(userId: string, month: string): Promise<string | null> {
  const { rows } = await getDb().query<{ amount: string }>(
    "SELECT amount::text FROM budgets WHERE user_id = $1 AND month = $2",
    [userId, month],
  );

  return rows[0]?.amount ?? null;
}

export async function upsertBudget(userId: string, month: string, amount: number): Promise<void> {
  await getDb().query(
    `INSERT INTO budgets (user_id, month, amount)
     VALUES ($1, $2, $3)
     ON CONFLICT (user_id, month)
     DO UPDATE SET amount = $3, updated_at = NOW()`,
    [userId, month, amount.toFixed(2)],
  );
}

export async function getBudgetOverview(userId: string, month: string): Promise<BudgetOverview> {
  const [budget, spent] = await Promise.all([
    getBudget(userId, month),
    getMonthlyExpense(userId, month),
  ]);

  // SRS-015: indikator pemakaian dan peringatan anggaran terlampaui.
  if (budget === null) {
    return {
      month,
      budget: null,
      spent,
      remaining: null,
      percent: 0,
      status: "none",
      message: "Anggaran bulan ini belum diatur nih.",
    };
  }

  const { status, percent } = budgetStatus(budget, spent);
  const remainingValue = Number(budget) - Number(spent);

  const messages: Record<Exclude<BudgetStatus, "none">, string> = {
    safe: "Pemakaian anggaran masih aman, lanjut dipantau aja ya.",
    warning: "Anggaran hampir habis, mulai dijaga pengeluarannya ya!",
    exceeded: "Anggaran bulan ini sudah terlampaui! Coba ditahan dulu deh.",
  };

  return {
    month,
    budget,
    spent,
    remaining: remainingValue.toFixed(2),
    percent,
    status,
    message: messages[status],
  };
}
