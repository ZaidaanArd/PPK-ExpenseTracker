import { getDb } from "@/lib/db";

export type TransactionType = "income" | "expense";

export type TransactionFilter = TransactionType | "all";

export type Transaction = {
  id: string;
  type: TransactionType;
  amount: number;
  description: string;
  /** Tanggal transaksi dalam format YYYY-MM-DD. */
  transactionDate: string;
  /** ISO timestamp kapan transaksi dibuat. */
  createdAt: string;
};

export type NewTransactionInput = {
  type: TransactionType;
  amount: number;
  description: string;
  transactionDate: string;
};

type TransactionRow = {
  id: string;
  type: string;
  amount: string;
  description: string;
  transaction_date: string;
  created_at: Date | string;
};

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isUuid(value: string): boolean {
  return UUID_REGEX.test(value);
}

export function normalizeFilter(value: string | string[] | undefined): TransactionFilter {
  return value === "income" || value === "expense" ? value : "all";
}

const SELECT_COLUMNS = [
  "id",
  "type",
  "amount",
  "description",
  "to_char(transaction_date, 'YYYY-MM-DD') AS transaction_date",
  "created_at",
].join(", ");

function mapRow(row: TransactionRow): Transaction {
  return {
    id: row.id,
    type: row.type === "expense" ? "expense" : "income",
    amount: Number(row.amount),
    description: row.description,
    transactionDate: String(row.transaction_date).slice(0, 10),
    createdAt: new Date(row.created_at).toISOString(),
  };
}

export async function listTransactions(
  userId: string,
  filter: TransactionFilter = "all",
): Promise<Transaction[]> {
  // SRS-008: query selalu ter-scope ke user_id pemiliknya.
  const params: unknown[] = [userId];
  let whereClause = "user_id = $1";

  if (filter !== "all") {
    params.push(filter);
    whereClause += ` AND type = $${params.length}`;
  }

  const { rows } = await getDb().query<TransactionRow>(
    `SELECT ${SELECT_COLUMNS} FROM transactions WHERE ${whereClause} ORDER BY transaction_date DESC, created_at DESC`,
    params,
  );

  return rows.map(mapRow);
}

export async function findTransaction(userId: string, id: string): Promise<Transaction | null> {
  if (!isUuid(id)) {
    return null;
  }

  const { rows } = await getDb().query<TransactionRow>(
    `SELECT ${SELECT_COLUMNS} FROM transactions WHERE id = $1 AND user_id = $2 LIMIT 1`,
    [id, userId],
  );

  return rows[0] ? mapRow(rows[0]) : null;
}

export async function createTransaction(
  userId: string,
  input: NewTransactionInput,
): Promise<Transaction> {
  const { rows } = await getDb().query<TransactionRow>(
    `INSERT INTO transactions (user_id, type, amount, description, transaction_date)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING ${SELECT_COLUMNS}`,
    [userId, input.type, input.amount.toFixed(2), input.description, input.transactionDate],
  );

  return mapRow(rows[0]);
}

export async function updateTransaction(
  userId: string,
  id: string,
  input: NewTransactionInput,
): Promise<Transaction | null> {
  if (!isUuid(id)) {
    return null;
  }

  const { rows } = await getDb().query<TransactionRow>(
    `UPDATE transactions
     SET type = $1, amount = $2, description = $3, transaction_date = $4
     WHERE id = $5 AND user_id = $6
     RETURNING ${SELECT_COLUMNS}`,
    [input.type, input.amount.toFixed(2), input.description, input.transactionDate, id, userId],
  );

  return rows[0] ? mapRow(rows[0]) : null;
}

export async function deleteTransaction(userId: string, id: string): Promise<boolean> {
  if (!isUuid(id)) {
    return false;
  }

  const { rowCount } = await getDb().query(
    "DELETE FROM transactions WHERE id = $1 AND user_id = $2",
    [id, userId],
  );

  return (rowCount ?? 0) > 0;
}
