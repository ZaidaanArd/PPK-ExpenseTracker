import Link from "next/link";
import { cookies } from "next/headers";
import {
  IconArrowDownRight,
  IconArrowUpRight,
  IconCirclePlus,
  IconWallet,
} from "@tabler/icons-react";
import { logout, setTheme } from "@/app/auth-actions";
import { requireUser } from "@/lib/auth";
import { getDashboardSummary, getLatestTransactions } from "@/lib/transactions";
import type { LatestTransaction } from "@/lib/transactions";
import { formatCurrency, formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Dashboard — PPK Expense Tracker",
};

export default async function DashboardPage() {
  const user = await requireUser();
  const theme = (await cookies()).get("ppk_theme")?.value === "dark" ? "dark" : "light";

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
          <div className="flex items-center gap-2">
            <Button render={<Link href="/transaksi#tambah" />}>
              <IconCirclePlus className="size-4" />
              Transaksi baru
            </Button>
            <form action={logout}>
              <button type="submit" className="rounded-lg border px-3 py-2 text-sm font-medium hover:bg-muted">
                Keluar
              </button>
            </form>
          </div>
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
            <Button variant="ghost" render={<Link href="/transaksi" />}>
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

        <section className="mt-10 rounded-xl border bg-card p-6 text-card-foreground shadow-sm">
          <h2 className="font-heading text-lg font-semibold">Preferensi tampilan</h2>
          <p className="mt-1 text-sm text-muted-foreground">Tema disimpan di cookie browser.</p>
          <form action={setTheme} className="mt-4 flex flex-wrap items-center gap-3">
            <label htmlFor="theme" className="text-sm font-medium">Tema</label>
            <select id="theme" name="theme" defaultValue={theme} className="rounded-lg border bg-background px-3 py-2 text-sm">
              <option value="light">Terang</option>
              <option value="dark">Gelap</option>
            </select>
            <button type="submit" className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/80">
              Simpan
            </button>
          </form>
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
