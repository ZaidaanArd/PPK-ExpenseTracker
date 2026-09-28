import "server-only";

import { and, eq } from "drizzle-orm";
import { monthlyBudgets } from "@/db/schema";
import { getDb, getOrm } from "@/lib/db";

export type BudgetSummary = {
  month: string;
  budget: string | null;
  spent: string;
  remaining: string | null;
  percentage: number | null;
  exceeded: boolean;
};

export function currentBudgetMonth(): string {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Jakarta",
    year: "numeric",
    month: "2-digit",
  }).formatToParts(new Date());
  const year = parts.find((part) => part.type === "year")?.value;
  const month = parts.find((part) => part.type === "month")?.value;
  return `${year}-${month}`;
}

export function parseBudgetMonth(value: unknown): string | null {
  if (typeof value !== "string" || !/^\d{4}-(0[1-9]|1[0-2])$/.test(value)) return null;
  const year = Number(value.slice(0, 4));
  return year >= 1 && year <= 9998 ? value : null;
}

export function parseBudgetAmount(value: unknown): string | null {
  if (typeof value !== "string" && typeof value !== "number") return null;
  const raw = String(value).trim();
  if (!/^\d{1,13}(\.\d{1,2})?$/.test(raw)) return null;
  const [whole, fraction = ""] = raw.split(".");
  const normalizedWhole = whole.replace(/^0+(?=\d)/, "");
  if (normalizedWhole === "0" && (!fraction || /^0+$/.test(fraction))) return null;
  return `${normalizedWhole}.${fraction.padEnd(2, "0")}`;
}

function monthBounds(month: string) {
  const year = Number(month.slice(0, 4));
  const monthNumber = Number(month.slice(5, 7));
  const nextYear = monthNumber === 12 ? year + 1 : year;
  const nextMonth = monthNumber === 12 ? 1 : monthNumber + 1;
  return {
    start: `${month}-01`,
    end: `${String(nextYear).padStart(4, "0")}-${String(nextMonth).padStart(2, "0")}-01`,
  };
}

export async function getBudgetSummary(userId: string, month: string): Promise<BudgetSummary> {
  const { start, end } = monthBounds(month);
  const { rows } = await getDb().query<{
    budget: string | null;
    spent: string;
    remaining: string | null;
    percentage: string | null;
    exceeded: boolean;
  }>(
    `WITH expense AS (
       SELECT COALESCE(SUM(amount), 0) AS spent
       FROM transactions
       WHERE user_id = $1 AND type = 'expense'
         AND transaction_date >= $2::date AND transaction_date < $3::date
     ), budget AS (
       SELECT amount FROM monthly_budgets WHERE user_id = $1 AND month = $2::date
     )
     SELECT budget.amount::text AS budget,
            expense.spent::text AS spent,
            (budget.amount - expense.spent)::text AS remaining,
            ROUND(expense.spent / budget.amount * 100, 2)::text AS percentage,
            COALESCE(expense.spent > budget.amount, false) AS exceeded
     FROM expense LEFT JOIN budget ON true`,
    [userId, start, end],
  );
  const row = rows[0];
  return {
    month,
    budget: row.budget,
    spent: row.spent,
    remaining: row.remaining,
    percentage: row.percentage === null ? null : Number(row.percentage),
    exceeded: row.exceeded,
  };
}

export async function saveBudget(userId: string, month: string, amount: string) {
  await getOrm().insert(monthlyBudgets).values({
    userId,
    month: `${month}-01`,
    amount,
  }).onConflictDoUpdate({
    target: [monthlyBudgets.userId, monthlyBudgets.month],
    set: { amount, updatedAt: new Date() },
  });
  return getBudgetSummary(userId, month);
}

export async function removeBudget(userId: string, month: string) {
  await getOrm().delete(monthlyBudgets).where(and(
    eq(monthlyBudgets.userId, userId),
    eq(monthlyBudgets.month, `${month}-01`),
  ));
  return getBudgetSummary(userId, month);
}
