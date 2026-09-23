import Link from "next/link";
import type { TransactionFilter } from "@/lib/transactions";
import { cn } from "@/lib/utils";

const FILTER_OPTIONS: { value: TransactionFilter; label: string }[] = [
  { value: "all", label: "Semua" },
  { value: "income", label: "Pemasukan" },
  { value: "expense", label: "Pengeluaran" },
];

export function TransactionFilterTabs({
  active,
  counts,
}: {
  active: TransactionFilter;
  counts: Record<TransactionFilter, number>;
}) {
  return (
    <nav
      aria-label="Filter transaksi"
      className="inline-flex flex-wrap gap-1 rounded-lg border bg-muted/40 p-1"
    >
      {FILTER_OPTIONS.map((option) => (
        <Link
          key={option.value}
          href={option.value === "all" ? "/transaksi" : `/transaksi?filter=${option.value}`}
          aria-current={active === option.value ? "page" : undefined}
          className={cn(
            "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
            active === option.value
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          {option.label}
          <span className="ml-1.5 text-xs opacity-70">{counts[option.value]}</span>
        </Link>
      ))}
    </nav>
  );
}
