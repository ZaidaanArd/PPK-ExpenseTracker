import { revalidatePath } from "next/cache";
import type { NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { parseTransactionInput } from "@/lib/transaction-input";
import {
  deleteTransaction,
  getTransactionList,
  isUuid,
  normalizeFilter,
  updateTransaction,
} from "@/lib/transactions";

const UNAUTHORIZED_MESSAGE = "Sesi kamu sudah berakhir. Login ulang dulu ya.";
const NOT_OWNED_MESSAGE = "Transaksi tidak ditemukan atau bukan milikmu.";
const INVALID_BODY_MESSAGE = "Data transaksi tidak valid.";
const SAVE_FAILED_MESSAGE = "Gagal nyimpan transaksi. Coba lagi sebentar ya.";
const DELETE_FAILED_MESSAGE = "Gagal ngehapus transaksi. Coba lagi sebentar ya.";

type TransactionRouteContext = { params: Promise<{ id: string }> };

function readFilter(request: NextRequest) {
  return normalizeFilter(request.nextUrl.searchParams.get("filter") ?? undefined);
}

/** SRS-010: ubah transaksi tanpa reload, tetap ter-scope ke pemiliknya (SRS-008). */
export async function PUT(request: NextRequest, { params }: TransactionRouteContext) {
  const user = await getCurrentUser();

  if (!user) {
    return Response.json({ error: UNAUTHORIZED_MESSAGE }, { status: 401 });
  }

  const { id } = await params;

  if (!isUuid(id)) {
    return Response.json({ error: NOT_OWNED_MESSAGE }, { status: 404 });
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
    const updated = await updateTransaction(user.id, id, parsed.data);

    if (!updated) {
      return Response.json({ error: NOT_OWNED_MESSAGE }, { status: 404 });
    }
  } catch {
    return Response.json({ error: SAVE_FAILED_MESSAGE }, { status: 500 });
  }

  revalidatePath("/transaksi");
  revalidatePath("/dashboard");

  return Response.json(await getTransactionList(user.id, readFilter(request)));
}

/** SRS-010: hapus transaksi tanpa reload, tetap ter-scope ke pemiliknya (SRS-008). */
export async function DELETE(request: NextRequest, { params }: TransactionRouteContext) {
  const user = await getCurrentUser();

  if (!user) {
    return Response.json({ error: UNAUTHORIZED_MESSAGE }, { status: 401 });
  }

  const { id } = await params;

  if (!isUuid(id)) {
    return Response.json({ error: NOT_OWNED_MESSAGE }, { status: 404 });
  }

  try {
    const deleted = await deleteTransaction(user.id, id);

    if (!deleted) {
      return Response.json({ error: NOT_OWNED_MESSAGE }, { status: 404 });
    }
  } catch {
    return Response.json({ error: DELETE_FAILED_MESSAGE }, { status: 500 });
  }

  revalidatePath("/transaksi");
  revalidatePath("/dashboard");

  return Response.json(await getTransactionList(user.id, readFilter(request)));
}
