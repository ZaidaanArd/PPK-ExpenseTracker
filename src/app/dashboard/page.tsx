import Link from "next/link";
import {
  IconArrowDownRight,
  IconArrowUpRight,
  IconCirclePlus,
  IconWallet,
} from "@tabler/icons-react";
import { getAuthUser } from "@/lib/auth";
import { getDashboardSummary, getLatestTransactions } from "@/lib/transactions";
import type { LatestTransaction } from "@/lib/transactions";
import { formatCurrency, formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Dashboard — PPK Expense Tracker",
};

export default async function DashboardPage() {
  const user = await getAuthUser();

  if (!user) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background px-6">
        <section className="w-full max-w-md rounded-xl border bg-card p-8 text-card-foreground shadow-sm">
          <h1 className="font-heading text-2xl font-semibold">Login dulu ya 👋</h1>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Dashboard cuma bisa dilihat setelah kamu masuk ke akun. Fitur login akan
            tersedia di SRS-002.
          </p>
          <Button className="mt-6 w-full" render={<Link href="/login" />}>
            Ke halaman login
          </Button>
        </section>
      </main>
    );
  }

  const [summary, latestTransactions] = await Promise.all([
    getDashboardSummary(user.id),
    getLatestTransactions(user.id),
  ]);

  return (
    <main className="min-h-screen bg-background px-6 py-12 text-foreground sm:px-10">
      <div className="mx-auto max-w-5xl">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Halo, selamat datang kembali</p>
            <h1 className="mt-1 font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
              {user.name}
            </h1>
          </div>
          <Button render={<Link href="/transactions/new" />}>
            <IconCirclePlus className="size-4" />
            Transaksi baru
          </Button>
        </header>

        <section className="mt-8 grid gap-4 lg:grid-cols-3">
          <div className="rounded-xl border bg-primary p-6 text-primary-foreground shadow-sm">
            <div className="flex items-center gap-2 text-sm opacity-90">
              <IconWallet className="size-4" />
              Saldo saat ini
            </div>
            <p className="mt-3 font-heading text-3xl font-semibold tracking-tight">
              {formatCurrency(summary.balance)}
            </p>
          </div>
          <SummaryCard
            label="Total pemasukan"
            value={summary.totalIncome}
            valueClassName="text-emerald-600"
          />
          <SummaryCard
            label="Total pengeluaran"
            value={summary.totalExpense}
            valueClassName="text-rose-600"
          />
        </section>

        <section className="mt-10">
          <div className="flex items-center justify-between">
            <h2 className="font-heading text-xl font-semibold">Transaksi terbaru</h2>
            <Button variant="ghost" render={<Link href="/transactions" />}>
              Lihat semua
            </Button>
          </div>
          {latestTransactions.length === 0 ? (
            <p className="mt-4 rounded-xl border border-dashed bg-card p-6 text-sm leading-6 text-muted-foreground">
              Belum ada transaksi nih. Yuk catat pemasukan atau pengeluaran pertamamu!
            </p>
          ) : (
            <ul className="mt-4 divide-y overflow-hidden rounded-xl border bg-card shadow-sm">
              {latestTransactions.map((transaction) => (
                <TransactionRow key={transaction.id} transaction={transaction} />
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
}

function SummaryCard({
  label,
  value,
  valueClassName,
}: {
  label: string;
  value: string;
  valueClassName?: string;
}) {
  return (
    <div className="rounded-xl border bg-card p-6 text-card-foreground shadow-sm">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className={cn("mt-3 font-heading text-2xl font-semibold tracking-tight", valueClassName)}>
        {formatCurrency(value)}
      </p>
    </div>
  );
}

function TransactionRow({ transaction }: { transaction: LatestTransaction }) {
  const isIncome = transaction.type === "income";

  return (
    <li className="flex items-center justify-between gap-4 p-4">
      <div className="flex items-center gap-3">
        <span
          className={cn(
            "flex size-9 shrink-0 items-center justify-center rounded-full",
            isIncome ? "bg-emerald-500/10 text-emerald-600" : "bg-rose-500/10 text-rose-600",
          )}
        >
          {isIncome ? (
            <IconArrowUpRight className="size-4" />
          ) : (
            <IconArrowDownRight className="size-4" />
          )}
        </span>
        <div>
          <p className="text-sm font-medium">{transaction.description}</p>
          <p className="text-xs text-muted-foreground">{formatDate(transaction.transactionDate)}</p>
        </div>
      </div>
      <p
        className={cn(
          "text-sm font-semibold",
          isIncome ? "text-emerald-600" : "text-rose-600",
        )}
      >
        {isIncome ? "+" : "−"} {formatCurrency(transaction.amount)}
      </p>
    </li>
  );
}
