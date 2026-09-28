"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { saveTransactionAction } from "@/app/transaksi/actions";
import { TransactionFields, type TransactionDraft } from "@/components/transactions/transaction-fields";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { TransactionType } from "@/lib/transactions";

export type TransactionFormResult = { error: string | null };

type TransactionFormProps = {
  mode: "create" | "update";
  transactionId?: string;
  initialType?: TransactionType;
  initialAmount?: string;
  initialDescription?: string;
  initialDate?: string;
  redirectTo?: string;
  /** SRS-010: kalau diisi, form kirim lewat fetch dan halaman nggak reload. */
  onSubmit?: (formData: FormData) => Promise<TransactionFormResult>;
};

function today() {
  return new Date().toISOString().slice(0, 10);
}

export function TransactionForm({
  mode,
  transactionId,
  initialType = "expense",
  initialAmount = "",
  initialDescription = "",
  initialDate,
  redirectTo = "/transaksi",
  onSubmit,
}: TransactionFormProps) {
  const [state, formAction, pending] = useActionState(saveTransactionAction, { error: null });
  const [draft, setDraft] = useState<TransactionDraft>({
    type: initialType,
    amount: initialAmount,
    description: initialDescription,
    transactionDate: initialDate ?? today(),
  });
  const [ajaxState, setAjaxState] = useState<TransactionFormResult>({ error: null });
  const [ajaxPending, setAjaxPending] = useState(false);

  const isAjax = Boolean(onSubmit);
  const isUpdate = mode === "update";
  const error = isAjax ? ajaxState.error : state.error;
  const isPending = isAjax ? ajaxPending : pending;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    if (!onSubmit) {
      return;
    }

    event.preventDefault();
    setAjaxPending(true);
    setAjaxState({ error: null });

    const result = await onSubmit(new FormData(event.currentTarget));

    setAjaxState(result);
    setAjaxPending(false);

    if (!result.error && !isUpdate) {
      setDraft({
        type: "expense",
        amount: "",
        description: "",
        transactionDate: today(),
      });
    }
  }

  return (
    <form
      action={isAjax ? undefined : formAction}
      onSubmit={handleSubmit}
      className="grid gap-4 sm:grid-cols-2"
    >
      {isUpdate ? <input type="hidden" name="id" value={transactionId} /> : null}
      <input type="hidden" name="redirectTo" value={redirectTo} />

      <TransactionFields
        idPrefix={isUpdate ? `ubah-${transactionId}` : "tambah"}
        value={draft}
        onChange={setDraft}
      />

      <div className="flex items-end gap-2 sm:col-span-2">
        <Button type="submit" disabled={isPending}>
          {isPending ? "Menyimpan…" : isUpdate ? "Simpan Perubahan" : "Tambah Transaksi"}
        </Button>
        {isUpdate ? (
          <Link href={redirectTo} className={cn(buttonVariants({ variant: "ghost" }))}>
            Batal
          </Link>
        ) : null}
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
  );
}
