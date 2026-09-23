"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import {
  createTransaction,
  deleteTransaction,
  isUuid,
  updateTransaction,
  type NewTransactionInput,
  type TransactionType,
} from "@/lib/transactions";

export type SaveTransactionState = { error: string | null };

/** Batas nominal sesuai precision kolom NUMERIC(15, 2). */
const AMOUNT_MAX = 9999999999999.99;
const DESCRIPTION_MAX = 200;

function resolveRedirectTarget(value: FormDataEntryValue | null): string {
  const target = typeof value === "string" ? value : "";
  return target.startsWith("/transaksi") ? target : "/transaksi";
}

type ParsedTransaction =
  | { ok: true; data: NewTransactionInput }
  | { ok: false; message: string };

function parseTransactionInput(formData: FormData): ParsedTransaction {
  const type = String(formData.get("type") ?? "");

  if (type !== "income" && type !== "expense") {
    return { ok: false, message: "Jenis transaksi harus dipilih: pemasukan atau pengeluaran." };
  }

  const amountRaw = String(formData.get("amount") ?? "").trim().replace(",", ".");
  const amount = Number(amountRaw);

  if (!amountRaw || !Number.isFinite(amount) || amount <= 0) {
    return { ok: false, message: "Nominal harus berupa angka lebih besar dari nol." };
  }

  if (amount > AMOUNT_MAX) {
    return { ok: false, message: "Nominal maksimal Rp9.999.999.999.999,99." };
  }

  const description = String(formData.get("description") ?? "").trim();

  if (!description) {
    return { ok: false, message: "Keterangan transaksi tidak boleh kosong." };
  }

  if (description.length > DESCRIPTION_MAX) {
    return { ok: false, message: `Keterangan transaksi maksimal ${DESCRIPTION_MAX} karakter.` };
  }

  const transactionDate = String(formData.get("transactionDate") ?? "").trim();

  const parsedDate = new Date(`${transactionDate}T00:00:00Z`);
  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(transactionDate) ||
    Number.isNaN(parsedDate.getTime()) ||
    parsedDate.toISOString().slice(0, 10) !== transactionDate
  ) {
    return { ok: false, message: "Tanggal transaksi tidak valid." };
  }

  return {
    ok: true,
    data: {
      type: type as TransactionType,
      amount: Math.round(amount * 100) / 100,
      description,
      transactionDate,
    },
  };
}

const NOT_OWNED_MESSAGE = "Transaksi tidak ditemukan atau bukan milikmu.";

export async function saveTransactionAction(
  _prevState: SaveTransactionState,
  formData: FormData,
): Promise<SaveTransactionState> {
  // SRS-008: cuma user yang sudah login yang boleh nyimpan transaksi.
  const user = await getCurrentUser();

  if (!user) {
    return { error: "Sesi kamu sudah berakhir. Login ulang dulu ya." };
  }

  const parsed = parseTransactionInput(formData);

  if (!parsed.ok) {
    return { error: parsed.message };
  }

  const idRaw = String(formData.get("id") ?? "").trim();
  const isUpdate = idRaw.length > 0;

  if (isUpdate && !isUuid(idRaw)) {
    return { error: NOT_OWNED_MESSAGE };
  }

  try {
    if (isUpdate) {
      // SRS-008: update di-scoping ke user.id, jadi transaksi orang lain tidak bisa diubah.
      const updated = await updateTransaction(user.id, idRaw, parsed.data);

      if (!updated) {
        return { error: NOT_OWNED_MESSAGE };
      }
    } else {
      await createTransaction(user.id, parsed.data);
    }
  } catch {
    return { error: "Gagal nyimpan transaksi. Coba lagi sebentar ya." };
  }

  revalidatePath("/transaksi");
  redirect(resolveRedirectTarget(formData.get("redirectTo")));
}

export async function deleteTransactionAction(formData: FormData): Promise<void> {
  // SRS-008: cuma user yang sudah login yang boleh ngehapus transaksinya sendiri.
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const id = String(formData.get("id") ?? "").trim();

  if (isUuid(id)) {
    try {
      // SRS-008: delete di-scoping ke user.id, jadi transaksi orang lain aman.
      await deleteTransaction(user.id, id);
    } catch {
      // Kalau database gagal, tetap balikin pengguna ke daftar transaksi.
    }
  }

  revalidatePath("/transaksi");
  redirect(resolveRedirectTarget(formData.get("redirectTo")));
}
