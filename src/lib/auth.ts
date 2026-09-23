import { cookies } from "next/headers";
import { getDb } from "@/lib/db";

export const SESSION_COOKIE_NAME = "session_user_id";

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export type SessionUser = {
  id: string;
  name: string;
  email: string;
};

/**
 * Mengambil pengguna yang sedang login berdasarkan cookie session.
 * Kalau belum login atau cookienya nggak valid, balikin null.
 *
 * TODO(SRS-003): ganti dengan session asli dari modul Akun dan
 * Autentikasi (misalnya tabel sessions dengan token acak), biar
 * Dashboard tinggal pakai ulang tanpa perubahan.
 */
export async function getAuthUser(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const sessionUserId = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!sessionUserId || !UUID_PATTERN.test(sessionUserId)) {
    return null;
  }

  const result = await getDb().query<SessionUser>(
    "SELECT id, name, email FROM users WHERE id = $1",
    [sessionUserId],
  );

  return result.rows[0] ?? null;
}
