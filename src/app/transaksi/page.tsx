import type { Metadata } from "next";
import { TransactionManager } from "@/components/transactions/transaction-manager";
import { requireUser } from "@/lib/auth";
import { getTransactionList, normalizeFilter } from "@/lib/transactions";

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

  const initialData = await getTransactionList(user.id, activeFilter);

  return (
    <TransactionManager
      userName={user.name}
      initialFilter={activeFilter}
      initialData={initialData}
    />
  );
}
