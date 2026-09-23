import Link from "next/link";
import type { Metadata } from "next";
import { IconPencil } from "@tabler/icons-react";
import { DeleteTransactionButton } from "@/components/transactions/delete-transaction-button";
import { TransactionFilterTabs } from "@/components/transactions/transaction-filter-tabs";
import { TransactionForm } from "@/components/transactions/transaction-form";
import { buttonVariants } from "@/components/ui/button";
import { formatCurrency, formatRupiah, formatTanggal } from "@/lib/format";
import { requireUser } from "@/lib/auth";
import {
  getDashboardSummary,
  listTransactions,
  normalizeFilter,
  type TransactionFilter,
} from "@/lib/transactions";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Transaksi — PPK Expense Tracker",
};

type TransaksiPageProps = {
  searchParams: Promise<{ filter?: string | string[] }>;
};

export default async function TransaksiPage({ searchParams }: TransaksiPageProps) {
  const { filter } = await searchParams;
  const activeFilter = normalizeFilter(filter);

  // SRS-008: halaman ini cuma bisa diakses user yang sudah login.
  const user = await requireUser();

  const allTransactions = await listTransactions(user.id);
  const transactions =
    activeFilter === "all"
      ? allTransactions
      : allTransactions.filter((transaction) => transaction.type === activeFilter);

  const counts: Record<TransactionFilter, number> = {
    all: allTransactions.length,
    income: allTransactions.filter((transaction) => transaction.type === "income").length,
    expense: allTransactions.filter((transaction) => transaction.type === "expense").length,
  };

  const { balance } = await getDashboardSummary(user.id);

  const currentPath = activeFilter === "all" ? "/transaksi" : `/transaksi?filter=${activeFilter}`;

  return (
    <main className="min-h-screen bg-background px-6 py-12 text-foreground sm:px-10">
      <div className="mx-auto max-w-5xl">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <span className="inline-flex rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
              Halo, {user.name}
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
                Number(balance) < 0 ? "text-rose-600 dark:text-rose-400" : "text-foreground",
              )}
            >
              {formatCurrency(balance)}
            </p>
          </div>
        </header>

        <section id="tambah" className="mt-8 rounded-xl border bg-card p-6 text-card-foreground shadow-sm">
          <h2 className="font-heading text-xl font-semibold">Tambah Transaksi</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Isi form di bawah buat nambahin transaksi baru, bisa pemasukan atau pengeluaran.
          </p>
          <div className="mt-5">
            <TransactionForm mode="create" redirectTo={currentPath} />
          </div>
        </section>

        <section className="mt-10">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-heading text-xl font-semibold">Daftar Transaksi</h2>
            <TransactionFilterTabs active={activeFilter} counts={counts} />
          </div>

          {transactions.length === 0 ? (
            <div className="mt-4 rounded-xl border border-dashed bg-card p-10 text-center shadow-sm">
              <p className="text-muted-foreground">
                {activeFilter === "all"
                  ? "Belum ada transaksi nih. Mulai catat lewat form di atas ya."
                  : `Belum ada transaksi ${activeFilter === "income" ? "pemasukan" : "pengeluaran"} buat ditampilkan.`}
              </p>
            </div>
          ) : (
            <div className="mt-4 overflow-x-auto rounded-xl border bg-card shadow-sm">
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
                  {transactions.map((transaction) => (
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
                          <Link
                            href={`/transaksi/${transaction.id}/ubah?redirectTo=${encodeURIComponent(currentPath)}`}
                            aria-label={`Ubah transaksi ${transaction.description}`}
                            title="Ubah transaksi"
                            className={cn(buttonVariants({ variant: "ghost", size: "icon-sm" }))}
                          >
                            <IconPencil size={14} />
                          </Link>
                          <DeleteTransactionButton id={transaction.id} redirectTo={currentPath} />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

      </div>
    </main>
  );
}
