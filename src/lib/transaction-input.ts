import type { NewTransactionInput, TransactionType } from "@/lib/transactions";

/** Batas nominal sesuai precision kolom NUMERIC(15, 2). */
export const AMOUNT_MAX = 9999999999999.99;
export const DESCRIPTION_MAX = 200;

export type ParsedTransaction =
  | { ok: true; data: NewTransactionInput }
  | { ok: false; message: string };

export type TransactionInputPayload = {
  type: unknown;
  amount: unknown;
  description: unknown;
  transactionDate: unknown;
};

export function parseTransactionInput(input: TransactionInputPayload): ParsedTransaction {
  const type = String(input.type ?? "");

  if (type !== "income" && type !== "expense") {
    return { ok: false, message: "Jenis transaksi harus dipilih: pemasukan atau pengeluaran." };
  }

  const amountRaw = String(input.amount ?? "").trim().replace(",", ".");
  const amount = Number(amountRaw);

  if (!amountRaw || !Number.isFinite(amount) || amount <= 0) {
    return { ok: false, message: "Nominal harus berupa angka lebih besar dari nol." };
  }

  if (amount > AMOUNT_MAX) {
    return { ok: false, message: "Nominal maksimal Rp9.999.999.999.999,99." };
  }

  const description = String(input.description ?? "").trim();

  if (!description) {
    return { ok: false, message: "Keterangan transaksi tidak boleh kosong." };
  }

  if (description.length > DESCRIPTION_MAX) {
    return { ok: false, message: `Keterangan transaksi maksimal ${DESCRIPTION_MAX} karakter.` };
  }

  const transactionDate = String(input.transactionDate ?? "").trim();

  const parsedDate = new Date(`${transactionDate}T00:00:00Z`);
  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(transactionDate) ||
    Number.isNaN(parsedDate.getTime()) ||
    parsedDate.toISOString().slice(0, 10) !== transactionDate
  ) {
    return { ok: false, message: "Tanggal transaksi tidak valid." };
  }

  return {
    ok: true,
    data: {
      type: type as TransactionType,
      amount: Math.round(amount * 100) / 100,
      description,
      transactionDate,
    },
  };
}

export function parseTransactionFormData(formData: FormData): ParsedTransaction {
  return parseTransactionInput({
    type: formData.get("type"),
    amount: formData.get("amount"),
    description: formData.get("description"),
    transactionDate: formData.get("transactionDate"),
  });
}
