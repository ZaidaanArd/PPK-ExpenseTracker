"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { parseTransactionFormData } from "@/lib/transaction-input";
import {
  createTransaction,
  deleteTransaction,
  isUuid,
  updateTransaction,
} from "@/lib/transactions";

export type SaveTransactionState = { error: string | null };

function resolveRedirectTarget(value: FormDataEntryValue | null): string {
  const target = typeof value === "string" ? value : "";
  return target.startsWith("/transaksi") ? target : "/transaksi";
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

  const parsed = parseTransactionFormData(formData);

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
