"use client";

import { useRef, useState, type FormEvent } from "react";
import type { BudgetSummary } from "@/lib/budgets";
import { formatCurrency } from "@/lib/format";

type ApiError = { error: string };

async function readResponse(response: Response): Promise<BudgetSummary> {
  const result = (await response.json()) as BudgetSummary | ApiError;
  if (!response.ok) {
    throw new Error("error" in result ? result.error : "Gagal memuat anggaran. Coba lagi, ya.");
  }
  return result as BudgetSummary;
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border bg-card p-5 text-card-foreground shadow-sm">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-2 font-heading text-2xl font-semibold">{value}</p>
    </div>
  );
}

export function BudgetManager({ initialSummary }: { initialSummary: BudgetSummary }) {
  const [month, setMonth] = useState(initialSummary.month);
  const [summary, setSummary] = useState<BudgetSummary | null>(initialSummary);
  const [amount, setAmount] = useState(initialSummary.budget ?? "");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const requestId = useRef(0);

  async function changeMonth(nextMonth: string) {
    const currentRequest = ++requestId.current;
    setMonth(nextMonth);
    setSummary(null);
    setAmount("");
    setMessage("");
    setError("");

    try {
      const response = await fetch(`/api/budgets?month=${encodeURIComponent(nextMonth)}`, {
        cache: "no-store",
      });
      const data = await readResponse(response);
      if (currentRequest !== requestId.current) return;
      setSummary(data);
      setAmount(data.budget ?? "");
    } catch (cause) {
      if (currentRequest === requestId.current) {
        setError(cause instanceof Error ? cause.message : "Gagal memuat anggaran. Coba lagi, ya.");
      }
    }
  }

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!summary) return;
    setSaving(true);
    setMessage("");
    setError("");

    try {
      const response = await fetch("/api/budgets", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ month, amount }),
      });
      const data = await readResponse(response);
      setSummary(data);
      setAmount(data.budget ?? "");
      setMessage("Anggaran bulan ini berhasil disimpan.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Gagal menyimpan anggaran. Coba lagi, ya.");
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    if (!summary?.budget || !window.confirm("Hapus anggaran untuk bulan ini?")) return;
    setSaving(true);
    setMessage("");
    setError("");

    try {
      const response = await fetch(`/api/budgets?month=${encodeURIComponent(month)}`, {
        method: "DELETE",
      });
      const data = await readResponse(response);
      setSummary(data);
      setAmount("");
      setMessage("Anggaran bulan ini sudah dihapus.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Gagal menghapus anggaran. Coba lagi, ya.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mt-8 space-y-6">
      <section className="rounded-xl border bg-card p-6 text-card-foreground shadow-sm">
        <label htmlFor="budget-month" className="block text-sm font-medium">Bulan anggaran</label>
        <input
          id="budget-month"
          type="month"
          value={month}
          max="9998-12"
          disabled={saving}
          onChange={(event) => void changeMonth(event.target.value)}
          className="mt-2 rounded-lg border bg-background px-3 py-2 text-sm disabled:opacity-50"
        />
        <form onSubmit={save} className="mt-6 flex flex-wrap items-end gap-3">
          <div className="min-w-60 flex-1">
            <label htmlFor="budget-amount" className="block text-sm font-medium">Batas pengeluaran (Rp)</label>
            <input
              id="budget-amount"
              type="number"
              inputMode="decimal"
              min="0.01"
              max="9999999999999.99"
              step="0.01"
              required
              value={amount}
              disabled={!summary || saving}
              onChange={(event) => setAmount(event.target.value)}
              placeholder="Contoh: 1500000"
              className="mt-2 w-full rounded-lg border bg-background px-3 py-2 text-sm disabled:opacity-50"
            />
          </div>
          <button type="submit" disabled={!summary || saving} className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/80 disabled:opacity-50">
            {saving ? "Menyimpan…" : summary?.budget ? "Ubah anggaran" : "Simpan anggaran"}
          </button>
          {summary?.budget && (
            <button type="button" disabled={saving} onClick={() => void remove()} className="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-muted disabled:opacity-50">
              Hapus
            </button>
          )}
        </form>
        {message && <p role="status" className="mt-4 text-sm text-emerald-700 dark:text-emerald-400">{message}</p>}
        {error && <p role="alert" className="mt-4 text-sm text-destructive">{error}</p>}
      </section>

      {summary ? (
        <section aria-label={`Ringkasan anggaran ${summary.month}`} className="grid gap-4 md:grid-cols-3">
          <SummaryCard label="Total anggaran" value={summary.budget === null ? "Belum diatur" : formatCurrency(summary.budget)} />
          <SummaryCard label="Total pengeluaran" value={formatCurrency(summary.spent)} />
          <SummaryCard label="Sisa anggaran" value={summary.remaining === null ? "—" : formatCurrency(summary.remaining)} />
        </section>
      ) : (
        !error && <p role="status" className="text-sm text-muted-foreground">Memuat ringkasan anggaran…</p>
      )}
    </div>
  );
}
