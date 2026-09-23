import { getDb } from "@/lib/db";

export type TransactionType = "income" | "expense";

export type DashboardSummary = {
  balance: string;
  totalIncome: string;
  totalExpense: string;
};

export type LatestTransaction = {
  id: string;
  type: TransactionType;
  amount: string;
  description: string;
  transactionDate: string;
};

/**
 * Ringkasan keuangan satu pengguna: saldo, total pemasukan, dan total pengeluaran.
 * Semua nilai dikembalikan sebagai string supaya presisi NUMERIC dari PostgreSQL aman.
 */
export async function getDashboardSummary(userId: string): Promise<DashboardSummary> {
  const result = await getDb().query<{
    balance: string;
    total_income: string;
    total_expense: string;
  }>(
    `SELECT
       COALESCE(SUM(amount) FILTER (WHERE type = 'income'), 0)::text AS total_income,
       COALESCE(SUM(amount) FILTER (WHERE type = 'expense'), 0)::text AS total_expense,
       (
         COALESCE(SUM(amount) FILTER (WHERE type = 'income'), 0)
         - COALESCE(SUM(amount) FILTER (WHERE type = 'expense'), 0)
       )::text AS balance
     FROM transactions
     WHERE user_id = $1`,
    [userId],
  );

  const row = result.rows[0];

  return {
    balance: row?.balance ?? "0",
    totalIncome: row?.total_income ?? "0",
    totalExpense: row?.total_expense ?? "0",
  };
}

/**
 * Daftar transaksi terbaru milik satu pengguna, diurutkan dari yang paling baru.
 * Dipakai buat bagian "Transaksi terbaru" di Dashboard.
 */
export async function getLatestTransactions(
  userId: string,
  limit = 5,
): Promise<LatestTransaction[]> {
  const result = await getDb().query<{
    id: string;
    type: TransactionType;
    amount: string;
    description: string;
    transaction_date: string;
  }>(
    `SELECT id, type, amount, description, transaction_date::text
     FROM transactions
     WHERE user_id = $1
     ORDER BY transaction_date DESC, created_at DESC
     LIMIT $2`,
    [userId, limit],
  );

  return result.rows.map((row) => ({
    id: row.id,
    type: row.type,
    amount: row.amount,
    description: row.description,
    transactionDate: row.transaction_date,
  }));
}
