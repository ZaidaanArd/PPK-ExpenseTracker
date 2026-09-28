"use client";

import type { TransactionType } from "@/lib/transactions";

export const inputClassName =
  "h-9 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

export type TransactionDraft = {
  type: TransactionType;
  amount: string;
  description: string;
  transactionDate: string;
};

export function TransactionFields({
  idPrefix,
  value,
  onChange,
}: {
  idPrefix: string;
  value: TransactionDraft;
  onChange: (next: TransactionDraft) => void;
}) {
  return (
    <>
      <div className="grid gap-1.5">
        <label htmlFor={`${idPrefix}-type`} className="text-sm font-medium">
          Jenis transaksi
        </label>
        <select
          id={`${idPrefix}-type`}
          name="type"
          required
          value={value.type}
          onChange={(event) => onChange({ ...value, type: event.target.value as TransactionType })}
          className={inputClassName}
        >
          <option value="expense">Pengeluaran</option>
          <option value="income">Pemasukan</option>
        </select>
      </div>

      <div className="grid gap-1.5">
        <label htmlFor={`${idPrefix}-amount`} className="text-sm font-medium">
          Nominal
        </label>
        <input
          id={`${idPrefix}-amount`}
          name="amount"
          type="number"
          inputMode="decimal"
          min="0.01"
          step="0.01"
          required
          placeholder="cth: 25000"
          value={value.amount}
          onChange={(event) => onChange({ ...value, amount: event.target.value })}
          className={inputClassName}
        />
      </div>

      <div className="grid gap-1.5 sm:col-span-2">
        <label htmlFor={`${idPrefix}-description`} className="text-sm font-medium">
          Keterangan
        </label>
        <input
          id={`${idPrefix}-description`}
          name="description"
          type="text"
          required
          maxLength={200}
          placeholder="cth: Makan siang kantin"
          value={value.description}
          onChange={(event) => onChange({ ...value, description: event.target.value })}
          className={inputClassName}
        />
      </div>

      <div className="grid gap-1.5">
        <label htmlFor={`${idPrefix}-date`} className="text-sm font-medium">
          Tanggal
        </label>
        <input
          id={`${idPrefix}-date`}
          name="transactionDate"
          type="date"
          required
          value={value.transactionDate}
          onChange={(event) => onChange({ ...value, transactionDate: event.target.value })}
          className={inputClassName}
        />
      </div>
    </>
  );
}
