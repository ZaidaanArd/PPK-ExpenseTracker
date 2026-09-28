"use client";

import Link from "next/link";
import type { TransactionFilter } from "@/lib/transactions";
import { cn } from "@/lib/utils";

const FILTER_OPTIONS: { value: TransactionFilter; label: string }[] = [
  { value: "all", label: "Semua" },
  { value: "income", label: "Pemasukan" },
  { value: "expense", label: "Pengeluaran" },
];

function filterHref(filter: TransactionFilter) {
  return filter === "all" ? "/transaksi" : `/transaksi?filter=${filter}`;
}

export function TransactionFilterTabs({
  active,
  counts,
  onSelect,
}: {
  active: TransactionFilter;
  counts: Record<TransactionFilter, number>;
  onSelect: (filter: TransactionFilter) => void;
}) {
  return (
    <nav
      aria-label="Filter transaksi"
      className="inline-flex flex-wrap gap-1 rounded-lg border bg-muted/40 p-1"
    >
      {FILTER_OPTIONS.map((option) => (
        <Link
          key={option.value}
          href={filterHref(option.value)}
          aria-current={active === option.value ? "page" : undefined}
          onClick={(event) => {
            if (
              event.metaKey ||
              event.ctrlKey ||
              event.shiftKey ||
              event.altKey ||
              event.button !== 0
            ) {
              return;
            }

            // SRS-011: klik filter diambil alih dan datanya di-fetch, jadi nggak reload.
            event.preventDefault();
            onSelect(option.value);
          }}
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
