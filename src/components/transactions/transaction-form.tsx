"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { saveTransactionAction } from "@/app/transaksi/actions";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type TransactionType = "income" | "expense";

type TransactionFormProps = {
  mode: "create" | "update";
  transactionId?: string;
  initialType?: TransactionType;
  initialAmount?: string;
  initialDescription?: string;
  initialDate?: string;
  redirectTo?: string;
};

const inputClassName =
  "h-9 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

export function TransactionForm({
  mode,
  transactionId,
  initialType = "expense",
  initialAmount = "",
  initialDescription = "",
  initialDate,
  redirectTo = "/transaksi",
}: TransactionFormProps) {
  const [state, formAction, pending] = useActionState(saveTransactionAction, { error: null });
  const [type, setType] = useState<TransactionType>(initialType);
  const [amount, setAmount] = useState(initialAmount);
  const [description, setDescription] = useState(initialDescription);
  const [transactionDate, setTransactionDate] = useState(
    initialDate ?? new Date().toISOString().slice(0, 10),
  );

  const isUpdate = mode === "update";

  return (
    <form action={formAction} className="grid gap-4 sm:grid-cols-2">
      {isUpdate ? <input type="hidden" name="id" value={transactionId} /> : null}
      <input type="hidden" name="redirectTo" value={redirectTo} />

      <div className="grid gap-1.5">
        <label htmlFor="type" className="text-sm font-medium">
          Jenis transaksi
        </label>
        <select
          id="type"
          name="type"
          required
          value={type}
          onChange={(event) => setType(event.target.value as TransactionType)}
          className={inputClassName}
        >
          <option value="expense">Pengeluaran</option>
          <option value="income">Pemasukan</option>
        </select>
      </div>

      <div className="grid gap-1.5">
        <label htmlFor="amount" className="text-sm font-medium">
          Nominal
        </label>
        <input
          id="amount"
          name="amount"
          type="number"
          inputMode="decimal"
          min="0.01"
          step="0.01"
          required
          placeholder="cth: 25000"
          value={amount}
          onChange={(event) => setAmount(event.target.value)}
          className={inputClassName}
        />
      </div>

      <div className="grid gap-1.5 sm:col-span-2">
        <label htmlFor="description" className="text-sm font-medium">
          Keterangan
        </label>
        <input
          id="description"
          name="description"
          type="text"
          required
          maxLength={200}
          placeholder="cth: Makan siang kantin"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          className={inputClassName}
        />
      </div>

      <div className="grid gap-1.5">
        <label htmlFor="transactionDate" className="text-sm font-medium">
          Tanggal
        </label>
        <input
          id="transactionDate"
          name="transactionDate"
          type="date"
          required
          value={transactionDate}
          onChange={(event) => setTransactionDate(event.target.value)}
          className={inputClassName}
        />
      </div>

      <div className="flex items-end gap-2 sm:col-span-2">
        <Button type="submit" disabled={pending}>
          {pending ? "Menyimpan…" : isUpdate ? "Simpan Perubahan" : "Tambah Transaksi"}
        </Button>
        <Link href={redirectTo} className={cn(buttonVariants({ variant: "ghost" }))}>
          Batal
        </Link>
      </div>

      {state.error ? (
        <p
          role="alert"
          className="sm:col-span-2 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive"
        >
          {state.error}
        </p>
      ) : null}
    </form>
  );
}
