import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getDashboardSummary, getLatestTransactions } from "@/lib/transactions";

/**
 * SRS-012: endpoint AJAX buat dashboard (saldo, total pemasukan,
 * total pengeluaran, dan transaksi terbaru).
 * GET /api/dashboard
 */
export async function GET() {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json(
      { error: "Sesi kamu sudah berakhir. Login ulang dulu ya." },
      { status: 401 },
    );
  }

  try {
    const [summary, latestTransactions] = await Promise.all([
      getDashboardSummary(user.id),
      getLatestTransactions(user.id),
    ]);

    return NextResponse.json({
      summary,
      latestTransactions,
      generatedAt: new Date().toISOString(),
    });
  } catch {
    return NextResponse.json(
      { error: "Gagal ngambil data dashboard. Coba lagi sebentar ya." },
      { status: 500 },
    );
  }
}
