import Link from "next/link";
import type { Metadata } from "next";
import { BudgetManager } from "@/components/budgets/budget-manager";
import { requireUser } from "@/lib/auth";
import { currentBudgetMonth, getBudgetSummary } from "@/lib/budgets";

export const metadata: Metadata = {
  title: "Anggaran Bulanan — PPK Expense Tracker",
};

export default async function AnggaranPage() {
  const user = await requireUser();
  const summary = await getBudgetSummary(user.id, currentBudgetMonth());

  return (
    <main className="min-h-screen bg-background px-6 py-12 text-foreground sm:px-10">
      <div className="mx-auto max-w-5xl">
        <Link href="/dashboard" className="text-sm font-medium text-muted-foreground underline-offset-4 hover:text-foreground hover:underline">
          ← Kembali ke dashboard
        </Link>
        <div className="mt-8">
          <span className="inline-flex rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
            Anggaran pribadi
          </span>
          <h1 className="mt-4 font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
            Atur anggaran bulanan
          </h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            Tentukan batas pengeluaran untuk setiap bulan. Cuma kamu yang bisa lihat dan ubah anggaranmu.
          </p>
        </div>
        <BudgetManager initialSummary={summary} />
      </div>
    </main>
  );
}
