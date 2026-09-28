"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { TransactionFilterTabs } from "@/components/transactions/transaction-filter-tabs";
import {
  TransactionForm,
  type TransactionFormResult,
} from "@/components/transactions/transaction-form";
import {
  TransactionTable,
  type TransactionMutationResult,
} from "@/components/transactions/transaction-table";
import { formatCurrency } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { TransactionFilter, TransactionListPayload } from "@/lib/transactions";

const SAVE_FAILED_MESSAGE = "Gagal nyimpan transaksi. Coba lagi sebentar ya.";
const DELETE_FAILED_MESSAGE = "Gagal ngehapus transaksi. Coba lagi sebentar ya.";

type TransactionManagerProps = {
  userName: string;
  initialFilter: TransactionFilter;
  initialData: TransactionListPayload;
};

export function TransactionManager({
  userName,
  initialFilter,
  initialData,
}: TransactionManagerProps) {
  const router = useRouter();
  const [data, setData] = useState(initialData);

  const filterQuery = initialFilter === "all" ? "" : `?filter=${initialFilter}`;

  // SRS-010: semua perubahan transaksi lewat fetch, jadi halaman nggak reload.
  async function requestApi(
    url: string,
    init: RequestInit,
    fallback: string,
  ): Promise<{ error: string | null; data: TransactionListPayload | null }> {
    try {
      const response = await fetch(url, init);

      if (response.status === 401) {
        router.push("/login");
        return { error: null, data: null };
      }

      const payload = (await response.json().catch(() => null)) as
        | (Partial<TransactionListPayload> & { error?: string })
        | null;

      if (!response.ok) {
        return { error: payload?.error ?? fallback, data: null };
      }

      return { error: null, data: payload as TransactionListPayload };
    } catch {
      return { error: fallback, data: null };
    }
  }

  function buildBody(formData: FormData) {
    return JSON.stringify({
      type: formData.get("type"),
      amount: formData.get("amount"),
      description: formData.get("description"),
      transactionDate: formData.get("transactionDate"),
    });
  }

  async function handleCreate(formData: FormData): Promise<TransactionFormResult> {
    const result = await requestApi(
      `/api/transactions${filterQuery}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: buildBody(formData),
      },
      SAVE_FAILED_MESSAGE,
    );

    if (result.data) {
      setData(result.data);
    }

    return { error: result.error };
  }

  async function handleUpdate(id: string, formData: FormData): Promise<TransactionMutationResult> {
    const result = await requestApi(
      `/api/transactions/${id}${filterQuery}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: buildBody(formData),
      },
      SAVE_FAILED_MESSAGE,
    );

    if (result.data) {
      setData(result.data);
    }

    return { error: result.error };
  }

  async function handleDelete(id: string): Promise<TransactionMutationResult> {
    const result = await requestApi(
      `/api/transactions/${id}${filterQuery}`,
      { method: "DELETE" },
      DELETE_FAILED_MESSAGE,
    );

    if (result.data) {
      setData(result.data);
    }

    return { error: result.error };
  }

  return (
    <main className="min-h-screen bg-background px-6 py-12 text-foreground sm:px-10">
      <div className="mx-auto max-w-5xl">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <span className="inline-flex rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
              Halo, {userName}
            </span>
            <h1 className="mt-4 font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
              Transaksi
            </h1>
            <p className="mt-2 max-w-xl text-muted-foreground">
              Catat pemasukan dan pengeluaranmu di sini. Transaksimu cuma kelihatan sama kamu
              sendiri, tenang aja.
            </p>
          </div>
          <div className="text-left sm:text-right">
            <p className="text-sm text-muted-foreground">Saldo keseluruhan</p>
            <p
              className={cn(
                "font-heading text-2xl font-semibold",
                Number(data.summary.balance) < 0 ? "text-rose-600 dark:text-rose-400" : "text-foreground",
              )}
            >
              {formatCurrency(data.summary.balance)}
            </p>
          </div>
        </header>

        <section id="tambah" className="mt-8 rounded-xl border bg-card p-6 text-card-foreground shadow-sm">
          <h2 className="font-heading text-xl font-semibold">Tambah Transaksi</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Isi form di bawah buat nambahin transaksi baru, bisa pemasukan atau pengeluaran.
          </p>
          <div className="mt-5">
            <TransactionForm mode="create" onSubmit={handleCreate} />
          </div>
        </section>

        <section className="mt-10">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-heading text-xl font-semibold">Daftar Transaksi</h2>
            <TransactionFilterTabs active={initialFilter} counts={data.counts} />
          </div>

          {data.transactions.length === 0 ? (
            <div className="mt-4 rounded-xl border border-dashed bg-card p-10 text-center shadow-sm">
              <p className="text-muted-foreground">
                {initialFilter === "all"
                  ? "Belum ada transaksi nih. Mulai catat lewat form di atas ya."
                  : `Belum ada transaksi ${initialFilter === "income" ? "pemasukan" : "pengeluaran"} buat ditampilkan.`}
              </p>
            </div>
          ) : (
            <TransactionTable
              transactions={data.transactions}
              onUpdate={handleUpdate}
              onDelete={handleDelete}
            />
          )}
        </section>
      </div>
    </main>
  );
}
