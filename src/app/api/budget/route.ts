import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import {
  BUDGET_AMOUNT_MAX,
  currentMonth,
  getBudgetOverview,
  isMonthFormat,
  upsertBudget,
} from "@/lib/budgets";

function unauthorized() {
  return NextResponse.json({ error: "Sesi kamu sudah berakhir. Login ulang dulu ya." }, { status: 401 });
}

function invalidMonth() {
  return NextResponse.json({ error: "Bulan tidak valid. Formatnya harus YYYY-MM." }, { status: 400 });
}

/**
 * SRS-016: endpoint AJAX buat lihat anggaran per bulan.
 * GET /api/budget?month=YYYY-MM
 */
export async function GET(request: Request) {
  const user = await getCurrentUser();

  if (!user) {
    return unauthorized();
  }

  const month = new URL(request.url).searchParams.get("month") ?? currentMonth();

  if (!isMonthFormat(month)) {
    return invalidMonth();
  }

  try {
    const overview = await getBudgetOverview(user.id, month);
    return NextResponse.json(overview);
  } catch {
    return NextResponse.json(
      { error: "Gagal ngambil data anggaran. Coba lagi sebentar ya." },
      { status: 500 },
    );
  }
}

/**
 * SRS-016: endpoint AJAX buat ngatur anggaran bulan terpilih.
 * PUT /api/budget { month: "YYYY-MM", amount: number }
 */
export async function PUT(request: Request) {
  const user = await getCurrentUser();

  if (!user) {
    return unauthorized();
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Body request harus berupa JSON." }, { status: 400 });
  }

  const month = typeof body === "object" && body !== null && "month" in body
    ? String((body as { month: unknown }).month ?? "")
    : "";
  const amount = typeof body === "object" && body !== null && "amount" in body
    ? Number((body as { amount: unknown }).amount)
    : Number.NaN;

  if (!isMonthFormat(month)) {
    return invalidMonth();
  }

  if (!Number.isFinite(amount) || amount <= 0) {
    return NextResponse.json({ error: "Nominal anggaran harus angka lebih besar dari nol." }, { status: 400 });
  }

  if (amount > BUDGET_AMOUNT_MAX) {
    return NextResponse.json(
      { error: "Nominal anggaran maksimal Rp9.999.999.999.999,99." },
      { status: 400 },
    );
  }

  try {
    // SRS-008: upsert di-scoping ke user.id, anggaran orang lain gak bisa disentuh.
    await upsertBudget(user.id, month, Math.round(amount * 100) / 100);
    const overview = await getBudgetOverview(user.id, month);
    return NextResponse.json(overview);
  } catch {
    return NextResponse.json(
      { error: "Gagal nyimpen anggaran. Coba lagi sebentar ya." },
      { status: 500 },
    );
  }
}
