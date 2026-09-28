"use client";

import { useEffect, useState } from "react";
import { IconAlertTriangle, IconPigMoney } from "@tabler/icons-react";
import type { BudgetOverview, BudgetStatus } from "@/lib/budgets";
import { formatCurrency } from "@/lib/format";
import { cn } from "@/lib/utils";

const monthLabelFormatter = new Intl.DateTimeFormat("id-ID", {
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

function listMonths(): { value: string; label: string }[] {
  const now = new Date();
  const months: { value: string; label: string }[] = [];

  for (let offset = 0; offset < 12; offset += 1) {
    const date = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - offset, 1));
    const value = date.toISOString().slice(0, 7);
    months.push({ value, label: monthLabelFormatter.format(date) });
  }

  return months;
}

const STATUS_STYLES: Record<BudgetStatus, { badge: string; bar: string; label: string }> = {
  none: { badge: "bg-muted text-muted-foreground", bar: "bg-muted-foreground/30", label: "Belum diatur" },
  safe: { badge: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400", bar: "bg-emerald-500", label: "Aman" },
  warning: { badge: "bg-amber-500/15 text-amber-700 dark:text-amber-400", bar: "bg-amber-500", label: "Hampir habis" },
  exceeded: { badge: "bg-rose-500/15 text-rose-700 dark:text-rose-400", bar: "bg-rose-500", label: "Terlampaui" },
};

type BudgetState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ok"; data: BudgetOverview };

/** SRS-016: pilih & atur anggaran per bulan, SRS-015: indikator & alert pemakaian. */
export function BudgetPanel() {
  const months = listMonths();
  const [month, setMonth] = useState(months[0]?.value ?? new Date().toISOString().slice(0, 7));
  const [state, setState] = useState<BudgetState>({ status: "loading" });
  const [amount, setAmount] = useState("");
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      try {
        const response = await fetch(`/api/budget?month=${encodeURIComponent(month)}`, {
          cache: "no-store",
        });
        const body = await response.json();

        if (cancelled) return;

        if (!response.ok) {
          setState({ status: "error", message: body.error ?? "Gagal ngambil data anggaran." });
          return;
        }

        const data = body as BudgetOverview;
        setState({ status: "ok", data });
        setAmount(data.budget ?? "");
      } catch {
        if (!cancelled) {
          setState({ status: "error", message: "Koneksi bermasalah nih. Coba lagi ya." });
        }
      }
    }

    void run();

    return () => {
      cancelled = true;
    };
  }, [month, refreshKey]);

  function pickMonth(value: string) {
    setMonth(value);
    setState({ status: "loading" });
    setNotice(null);
    setFormError(null);
  }

  function retry() {
    setState({ status: "loading" });
    setFormError(null);
    setNotice(null);
    setRefreshKey((key) => key + 1);
  }

  async function saveBudget(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setFormError(null);
    setNotice(null);

    try {
      const response = await fetch("/api/budget", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ month, amount: Number(amount.replace(",", ".")) }),
      });
      const body = await response.json();

      if (!response.ok) {
        setFormError(body.error ?? "Gagal nyimpen anggaran.");
        return;
      }

      const data = body as BudgetOverview;
      setState({ status: "ok", data });
      setAmount(data.budget ?? "");
      setNotice("Anggaran berhasil disimpan!");
    } catch {
      setFormError("Koneksi bermasalah nih. Coba lagi ya.");
    } finally {
      setSaving(false);
    }
  }

  const inputClassName =
    "h-9 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

  return (
    <section className="mt-10 rounded-xl border bg-card p-6 text-card-foreground shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-heading text-lg font-semibold">Anggaran bulanan</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Pilih bulan, atur anggaran, dan pantau pemakaiannya di sini.
          </p>
        </div>
        <div className="grid gap-1.5">
          <label htmlFor="budget-month" className="text-sm font-medium">
            Pilih bulan
          </label>
          <select
            id="budget-month"
            value={month}
            onChange={(event) => pickMonth(event.target.value)}
            className={cn(inputClassName, "w-48")}
          >
            {months.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {state.status === "error" ? (
        <div
          role="alert"
          className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive"
        >
          <span>{state.message}</span>
          <button
            type="button"
            onClick={retry}
            className="rounded-lg bg-destructive px-3 py-1.5 text-sm font-semibold text-white hover:opacity-90"
          >
            Coba lagi
          </button>
        </div>
      ) : null}

      {notice ? (
        <p
          role="status"
          className="mt-4 rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-700 dark:text-emerald-400"
        >
          {notice}
        </p>
      ) : null}

      {formError ? (
        <p
          role="alert"
          className="mt-4 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive"
        >
          {formError}
        </p>
      ) : null}

      {state.status === "loading" ? (
        <div className="mt-5 grid gap-3" aria-busy="true" aria-live="polite">
          <div className="h-14 animate-pulse rounded-lg bg-muted" />
          <div className="h-3 animate-pulse rounded-lg bg-muted" />
          <div className="h-9 animate-pulse rounded-lg bg-muted" />
        </div>
      ) : null}

      {state.status === "ok" ? <BudgetIndicator overview={state.data} /> : null}

      {state.status === "ok" ? (
        <form onSubmit={saveBudget} className="mt-5 flex flex-wrap items-end gap-3 border-t pt-5">
          <div className="grid gap-1.5">
            <label htmlFor="budget-amount" className="text-sm font-medium">
              {state.data.budget === null ? "Atur anggaran (Rp)" : "Ubah anggaran (Rp)"}
            </label>
            <input
              id="budget-amount"
              type="number"
              inputMode="decimal"
              min="0.01"
              step="0.01"
              required
              placeholder="cth: 2000000"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              className={cn(inputClassName, "w-56")}
            />
          </div>
          <button
            type="submit"
            disabled={saving}
            className="h-9 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground hover:bg-primary/80 disabled:opacity-50"
          >
            {saving ? "Menyimpan…" : "Simpan anggaran"}
          </button>
        </form>
      ) : null}
    </section>
  );
}

function BudgetIndicator({ overview }: { overview: BudgetOverview }) {
  const style = STATUS_STYLES[overview.status];

  return (
    <div className="mt-5">
      {overview.status === "exceeded" ? (
        <div
          role="alert"
          className="mb-4 flex items-start gap-2 rounded-lg border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-700 dark:text-rose-400"
        >
          <IconAlertTriangle className="mt-0.5 size-4 shrink-0" />
          <span>{overview.message}</span>
        </div>
      ) : null}

      {overview.status === "warning" ? (
        <div
          role="alert"
          className="mb-4 flex items-start gap-2 rounded-lg border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-700 dark:text-amber-400"
        >
          <IconAlertTriangle className="mt-0.5 size-4 shrink-0" />
          <span>{overview.message}</span>
        </div>
      ) : null}

      {overview.status === "none" ? (
        <div className="mb-4 flex items-start gap-2 rounded-lg border border-dashed bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
          <IconPigMoney className="mt-0.5 size-4 shrink-0" />
          <span>{overview.message} Isi form di bawah buat mulai pantau ya.</span>
        </div>
      ) : null}

      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className={cn("inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold", style.badge)}>
          {style.label}
        </span>
        <span className="text-sm font-semibold">
          {formatCurrency(overview.spent)}
          {overview.budget !== null ? ` / ${formatCurrency(overview.budget)}` : ""} terpakai
        </span>
      </div>

      <div
        className="mt-2 h-3 overflow-hidden rounded-full bg-muted"
        role="progressbar"
        aria-label="Pemakaian anggaran"
        aria-valuenow={overview.percent}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className={cn("h-full rounded-full transition-all", style.bar)}
          style={{ width: `${Math.min(overview.percent, 100)}%` }}
        />
      </div>

      {overview.budget !== null ? (
        <p className="mt-2 text-xs text-muted-foreground">
          Terpakai {overview.percent}% · sisa{" "}
          <span
            className={cn(
              "font-semibold",
              Number(overview.remaining) < 0 ? "text-rose-600 dark:text-rose-400" : "text-emerald-600 dark:text-emerald-400",
            )}
          >
            {formatCurrency(overview.remaining ?? 0)}
          </span>
        </p>
      ) : null}
    </div>
  );
}

