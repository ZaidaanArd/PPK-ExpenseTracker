import { revalidatePath } from "next/cache";
import type { NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { parseTransactionInput } from "@/lib/transaction-input";
import { createTransaction, getTransactionList, normalizeFilter } from "@/lib/transactions";

const UNAUTHORIZED_MESSAGE = "Sesi kamu sudah berakhir. Login ulang dulu ya.";
const SAVE_FAILED_MESSAGE = "Gagal nyimpan transaksi. Coba lagi sebentar ya.";
const INVALID_BODY_MESSAGE = "Data transaksi tidak valid.";

function readFilter(request: NextRequest) {
  return normalizeFilter(request.nextUrl.searchParams.get("filter") ?? undefined);
}

/** SRS-010 & SRS-011: endpoint JSON buat aksi AJAX di halaman transaksi. */
export async function GET(request: NextRequest) {
  // SRS-008: cuma user yang login yang boleh baca transaksinya sendiri.
  const user = await getCurrentUser();

  if (!user) {
    return Response.json({ error: UNAUTHORIZED_MESSAGE }, { status: 401 });
  }

  return Response.json(await getTransactionList(user.id, readFilter(request)));
}

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();

  if (!user) {
    return Response.json({ error: UNAUTHORIZED_MESSAGE }, { status: 401 });
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return Response.json({ error: INVALID_BODY_MESSAGE }, { status: 400 });
  }

  const input = (body ?? {}) as Record<string, unknown>;
  const parsed = parseTransactionInput({
    type: input.type,
    amount: input.amount,
    description: input.description,
    transactionDate: input.transactionDate,
  });

  if (!parsed.ok) {
    return Response.json({ error: parsed.message }, { status: 400 });
  }

  try {
    // SRS-008: transaksi baru selalu jadi milik user dari session.
    await createTransaction(user.id, parsed.data);
  } catch {
    return Response.json({ error: SAVE_FAILED_MESSAGE }, { status: 500 });
  }

  revalidatePath("/transaksi");
  revalidatePath("/dashboard");

  return Response.json(await getTransactionList(user.id, readFilter(request)), { status: 201 });
}
