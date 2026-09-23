import { cookies } from "next/headers";
import { jwtVerify } from "jose";

export type SessionUser = {
  id: string;
  name: string;
  email: string;
};

/** Nama cookie session yang diset oleh fitur login (SRS-002). */
export const SESSION_COOKIE_NAME = "session";

function getSecretKey(): Uint8Array {
  const secret = process.env.AUTH_SECRET ?? process.env.JWT_SECRET;

  if (!secret) {
    throw new Error(
      "AUTH_SECRET belum diatur. Tambahkan AUTH_SECRET di .env.local berisi string acak minimal 32 karakter."
    );
  }

  return new TextEncoder().encode(secret);
}

/**
 * Membaca session pengguna dari cookie JWT yang diset oleh fitur login (SRS-002).
 * Token diharapkan membawa claims `sub` (id user), `name`, dan `email`.
 * Mengembalikan null kalau belum login atau token tidak valid.
 */
export async function getSessionUser(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  try {
    const { payload } = await jwtVerify(token, getSecretKey());

    const { sub, name, email } = payload;

    if (!sub || typeof name !== "string" || typeof email !== "string") {
      return null;
    }

    return { id: sub, name, email };
  } catch {
    return null;
  }
}
