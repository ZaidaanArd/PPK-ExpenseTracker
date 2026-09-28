import { getCurrentUser } from "@/lib/auth";
import {
  currentBudgetMonth,
  getBudgetSummary,
  parseBudgetAmount,
  parseBudgetMonth,
  removeBudget,
  saveBudget,
} from "@/lib/budgets";

const privateHeaders = { "Cache-Control": "private, no-store" };

function json(data: unknown, status = 200) {
  return Response.json(data, { status, headers: privateHeaders });
}

export async function GET(request: Request) {
  const user = await getCurrentUser();
  if (!user) return json({ error: "Login dulu buat lihat anggaranmu." }, 401);

  const query = new URL(request.url).searchParams;
  const month = parseBudgetMonth(query.get("month") ?? currentBudgetMonth());
  if (!month) return json({ error: "Bulan harus pakai format YYYY-MM." }, 400);

  return json(await getBudgetSummary(user.id, month));
}

export async function PUT(request: Request) {
  const user = await getCurrentUser();
  if (!user) return json({ error: "Login dulu buat atur anggaranmu." }, 401);

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return json({ error: "Data anggaran tidak valid." }, 400);
  }
  if (!body || typeof body !== "object") return json({ error: "Data anggaran tidak valid." }, 400);

  const fields = body as Record<string, unknown>;
  const month = parseBudgetMonth(fields.month);
  const amount = parseBudgetAmount(fields.amount);
  if (!month) return json({ error: "Bulan harus pakai format YYYY-MM." }, 400);
  if (!amount) return json({ error: "Anggaran harus lebih dari nol, maksimal 13 digit dan 2 desimal." }, 400);

  return json(await saveBudget(user.id, month, amount));
}

export async function DELETE(request: Request) {
  const user = await getCurrentUser();
  if (!user) return json({ error: "Login dulu buat hapus anggaranmu." }, 401);

  const month = parseBudgetMonth(new URL(request.url).searchParams.get("month"));
  if (!month) return json({ error: "Bulan harus pakai format YYYY-MM." }, 400);

  return json(await removeBudget(user.id, month));
}
