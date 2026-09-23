"use server";

import { eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { users } from "@/db/schema";
import { createSession, deleteSession, hashPassword, verifyPassword } from "@/lib/auth";
import { getOrm } from "@/lib/db";

function field(data: FormData, key: string) {
  const value = data.get(key);
  return typeof value === "string" ? value.trim() : "";
}

export async function register(formData: FormData) {
  const name = field(formData, "name");
  const email = field(formData, "email").toLowerCase();
  const password = field(formData, "password");
  if (name.length < 2 || name.length > 100 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || password.length < 8) {
    redirect("/register?error=invalid");
  }

  const existing = await getOrm().select({ id: users.id }).from(users).where(eq(users.email, email)).limit(1);
  if (existing.length) redirect("/register?error=exists");

  let userId: string;
  try {
    const [user] = await getOrm().insert(users).values({ name, email, passwordHash: await hashPassword(password) }).returning({ id: users.id });
    userId = user.id;
  } catch (error) {
    if (typeof error === "object" && error !== null && "code" in error && error.code === "23505") {
      redirect("/register?error=exists");
    }
    throw error;
  }
  await createSession(userId);
  redirect("/dashboard");
}

export async function login(formData: FormData) {
  const email = field(formData, "email").toLowerCase();
  const password = field(formData, "password");
  const [user] = await getOrm().select({ id: users.id, passwordHash: users.passwordHash }).from(users).where(eq(users.email, email)).limit(1);
  if (!user || !(await verifyPassword(password, user.passwordHash))) redirect("/login?error=invalid");
  await createSession(user.id);
  redirect("/dashboard");
}

export async function logout() {
  await deleteSession();
  redirect("/login");
}

export async function setTheme(formData: FormData) {
  const theme = field(formData, "theme") === "dark" ? "dark" : "light";
  (await cookies()).set("ppk_theme", theme, {
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 365,
  });
  redirect("/dashboard");
}
