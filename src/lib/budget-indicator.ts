export type BudgetStatus = "none" | "safe" | "warning" | "exceeded";

export type BudgetIndicatorInfo = {
  percent: number;
  status: BudgetStatus;
  message: string;
};

type BudgetSummaryLike = {
  budget: string | null;
  spent: string;
};

/** SRS-015: turunan persentase, status, dan pesan pemakaian anggaran buat tampilan. */
export function budgetIndicator(summary: BudgetSummaryLike): BudgetIndicatorInfo {
  const budgetValue = Number(summary.budget);
  const spentValue = Number(summary.spent);

  if (summary.budget === null || !Number.isFinite(budgetValue) || budgetValue <= 0) {
    return {
      percent: 0,
      status: "none",
      message: "Anggaran bulan ini belum diatur nih.",
    };
  }

  const percent = Math.min(Math.round((spentValue / budgetValue) * 100), 999);

  if (percent > 100) {
    return {
      percent,
      status: "exceeded",
      message: "Anggaran bulan ini sudah terlampaui! Coba ditahan dulu deh.",
    };
  }

  if (percent >= 80) {
    return {
      percent,
      status: "warning",
      message: "Anggaran hampir habis, mulai dijaga pengeluarannya ya!",
    };
  }

  return {
    percent,
    status: "safe",
    message: "Pemakaian anggaran masih aman, lanjut dipantau aja ya.",
  };
}
