"use client";

import { useEffect, useState } from "react";
import {
  IconArrowDownRight,
  IconArrowUpRight,
  IconRefresh,
} from "@tabler/icons-react";
import type { DashboardSummary, LatestTransaction } from "@/lib/transactions";
import { formatCurrency, formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";

type DashboardData = {
  summary: DashboardSummary;
  latestTransactions: LatestTransaction[];
  generatedAt: string;
};

const REFRESH_INTERVAL_MS = 30_000;

/** SRS-012: ringkasan dashboard diambil via AJAX ke /api/dashboard. */
export function DashboardOverview() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      try {
        const response = await fetch("/api/dashboard", { cache: "no-store" });
        const body = await response.json();

        if (cancelled) return;

        if (!response.ok) {
          setError(body.error ?? "Gagal ngambil data dashboard.");
          return;
        }

        setError(null);
        setData(body as DashboardData);
      } catch {
        if (!cancelled) setError("Koneksi bermasalah nih. Coba refresh lagi ya.");
      } finally {
        if (!cancelled) setRefreshing(false);
      }
    }

    void run();
    const interval = setInterval(() => {
      setRefreshing(true);
      void run();
    }, REFRESH_INTERVAL_MS);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [refreshKey]);

  function refresh() {
    setRefreshing(true);
    setRefreshKey((key) => key + 1);
  }

  if (error) {
    return (
      <div
        role="alert"
        className="mt-8 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-destructive/40 bg-destructive/10 p-6 text-sm text-destructive"
      >
        <p>{error}</p>
        <button
          type="button"
          onClick={refresh}
          className="rounded-lg bg-destructive px-3 py-2 text-sm font-semibold text-white hover:opacity-90"
        >
          Coba lagi
        </button>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="mt-8 grid gap-4 lg:grid-cols-3" aria-busy="true" aria-live="polite">
        <div className="h-28 animate-pulse rounded-xl bg-muted" />
        <div className="h-28 animate-pulse rounded-xl bg-muted" />
        <div className="h-28 animate-pulse rounded-xl bg-muted" />
        <div className="h-24 animate-pulse rounded-xl bg-muted lg:col-span-3" />
      </div>
    );
  }

  const { summary, latestTransactions, generatedAt } = data;

  return (
    <>
      <div className="mt-8 flex flex-wrap items-center justify-end gap-2">
        <p className="text-xs text-muted-foreground">
          Diperbarui otomatis tiap 30 detik ·{" "}
          <time dateTime={generatedAt}>
            {new Date(generatedAt).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
          </time>
        </p>
        <button
          type="button"
          onClick={refresh}
          disabled={refreshing}
          className="inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm font-medium hover:bg-muted disabled:opacity-50"
        >
          <IconRefresh className={cn("size-4", refreshing && "animate-spin")} />
          {refreshing ? "Nyegarkan…" : "Segarkan"}
        </button>
      </div>

      <section className="mt-4 grid gap-4 lg:grid-cols-3">
        <div className="rounded-xl border bg-primary p-6 text-primary-foreground shadow-sm">
          <div className="flex items-center gap-2 text-sm opacity-90">
            <IconArrowUpRight className="size-4" />
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
        <h2 className="font-heading text-xl font-semibold">Transaksi terbaru</h2>
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
    </>
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
