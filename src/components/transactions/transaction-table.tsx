"use client";

import { useState } from "react";
import { IconCheck, IconPencil, IconTrash, IconX } from "@tabler/icons-react";
import {
  TransactionFields,
  type TransactionDraft,
} from "@/components/transactions/transaction-fields";
import { Button } from "@/components/ui/button";
import { formatRupiah, formatTanggal } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Transaction } from "@/lib/transactions";

export type TransactionMutationResult = { error: string | null };

type TransactionTableProps = {
  transactions: Transaction[];
  onUpdate: (id: string, formData: FormData) => Promise<TransactionMutationResult>;
  onDelete: (id: string) => Promise<TransactionMutationResult>;
};

function draftFromTransaction(transaction: Transaction): TransactionDraft {
  return {
    type: transaction.type,
    amount: String(transaction.amount),
    description: transaction.description,
    transactionDate: transaction.transactionDate,
  };
}

export function TransactionTable({ transactions, onUpdate, onDelete }: TransactionTableProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete(id: string) {
    if (!window.confirm("Hapus transaksi ini?")) {
      return;
    }

    setDeletingId(id);
    const result = await onDelete(id);
    setDeletingId(null);
    setError(result.error);
  }

  return (
    <div className="mt-4 overflow-hidden rounded-xl border bg-card shadow-sm">
      {error ? (
        <p
          role="alert"
          className="border-b border-destructive/40 bg-destructive/10 px-4 py-2 text-sm text-destructive"
        >
          {error}
        </p>
      ) : null}

      <div className="overflow-x-auto">
        <table className="w-full min-w-160 text-left text-sm">
          <thead className="border-b bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-medium">Tanggal</th>
              <th className="px-4 py-3 font-medium">Keterangan</th>
              <th className="px-4 py-3 font-medium">Jenis</th>
              <th className="px-4 py-3 text-right font-medium">Nominal</th>
              <th className="px-4 py-3 font-medium">
                <span className="sr-only">Aksi</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((transaction) =>
              editingId === transaction.id ? (
                <EditRow
                  key={transaction.id}
                  transaction={transaction}
                  onSave={onUpdate}
                  onClose={() => {
                    setEditingId(null);
                    setError(null);
                  }}
                />
              ) : (
                <tr key={transaction.id} className="border-b last:border-b-0">
                  <td className="px-4 py-3 whitespace-nowrap text-muted-foreground">
                    {formatTanggal(transaction.transactionDate)}
                  </td>
                  <td className="px-4 py-3 font-medium">{transaction.description}</td>
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        "inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold",
                        transaction.type === "income"
                          ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400"
                          : "bg-rose-500/15 text-rose-700 dark:text-rose-400",
                      )}
                    >
                      {transaction.type === "income" ? "Pemasukan" : "Pengeluaran"}
                    </span>
                  </td>
                  <td
                    className={cn(
                      "px-4 py-3 text-right font-semibold whitespace-nowrap",
                      transaction.type === "income"
                        ? "text-emerald-700 dark:text-emerald-400"
                        : "text-rose-700 dark:text-rose-400",
                    )}
                  >
                    {transaction.type === "income" ? "+" : "−"}{" "}
                    {formatRupiah(transaction.amount)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        aria-label={`Ubah transaksi ${transaction.description}`}
                        title="Ubah transaksi"
                        onClick={() => {
                          setError(null);
                          setEditingId(transaction.id);
                        }}
                      >
                        <IconPencil size={14} />
                      </Button>
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon-sm"
                        disabled={deletingId === transaction.id}
                        aria-label={`Hapus transaksi ${transaction.description}`}
                        title="Hapus transaksi"
                        onClick={() => handleDelete(transaction.id)}
                      >
                        <IconTrash size={14} />
                      </Button>
                    </div>
                  </td>
                </tr>
              ),
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function EditRow({
  transaction,
  onSave,
  onClose,
}: {
  transaction: Transaction;
  onSave: (id: string, formData: FormData) => Promise<TransactionMutationResult>;
  onClose: () => void;
}) {
  const [draft, setDraft] = useState<TransactionDraft>(draftFromTransaction(transaction));
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);

    const result = await onSave(transaction.id, new FormData(event.currentTarget));

    setPending(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    onClose();
  }

  return (
    <tr className="border-b bg-muted/30 last:border-b-0">
      <td colSpan={5} className="px-4 py-4">
        <form onSubmit={handleSubmit} className="grid gap-3 sm:grid-cols-2">
          <TransactionFields
            idPrefix={`ubah-${transaction.id}`}
            value={draft}
            onChange={setDraft}
          />

          <div className="flex items-center gap-2 sm:col-span-2">
            <Button type="submit" size="sm" disabled={pending}>
              <IconCheck size={14} />
              {pending ? "Menyimpan…" : "Simpan"}
            </Button>
            <Button type="button" variant="ghost" size="sm" onClick={onClose} disabled={pending}>
              <IconX size={14} />
              Batal
            </Button>
          </div>

          {error ? (
            <p
              role="alert"
              className="sm:col-span-2 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive"
            >
              {error}
            </p>
          ) : null}
        </form>
      </td>
    </tr>
  );
}
