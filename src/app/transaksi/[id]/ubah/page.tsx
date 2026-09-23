import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { TransactionForm } from "@/components/transactions/transaction-form";
import { findTransaction } from "@/lib/transactions";
import { requireUser } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Ubah Transaksi — PPK Expense Tracker",
};

type UbahTransaksiPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ redirectTo?: string | string[] }>;
};

function resolveRedirectTarget(value: string | string[] | undefined): string {
  const target = Array.isArray(value) ? value[0] : value;
  return target && target.startsWith("/transaksi") ? target : "/transaksi";
}

export default async function UbahTransaksiPage({ params, searchParams }: UbahTransaksiPageProps) {
  const { id } = await params;
  const { redirectTo } = await searchParams;
  const target = resolveRedirectTarget(redirectTo);

  // SRS-008: halaman ini cuma bisa diakses user yang sudah login.
  const user = await requireUser();

  // SRS-008: pencarian di-scoping ke user.id, transaksi orang lain dianggap tidak ada.
  const transaction = await findTransaction(user.id, id);

  if (!transaction) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-background px-6 py-12 text-foreground sm:px-10">
      <div className="mx-auto max-w-2xl">
        <h1 className="font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
          Ubah Transaksi
        </h1>
        <p className="mt-2 text-muted-foreground">
          Perbarui detail transaksi &ldquo;{transaction.description}&rdquo;, lalu simpan
          perubahannya.
        </p>

        <section className="mt-8 rounded-xl border bg-card p-6 text-card-foreground shadow-sm">
          <TransactionForm
            mode="update"
            transactionId={transaction.id}
            initialType={transaction.type}
            initialAmount={String(transaction.amount)}
            initialDescription={transaction.description}
            initialDate={transaction.transactionDate}
            redirectTo={target}
          />
        </section>
      </div>
    </main>
  );
}
