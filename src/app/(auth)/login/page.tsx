import Link from "next/link";
import { redirect } from "next/navigation";
import { login } from "@/app/auth-actions";
import { getCurrentUser } from "@/lib/auth";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  if (await getCurrentUser()) redirect("/dashboard");
  const { error } = await searchParams;
  return (
    <>
      <h1 className="font-heading text-3xl font-semibold">Masuk dulu, yuk</h1>
      <p className="mt-2 text-sm text-muted-foreground">Lanjut catat dan pantau keuanganmu.</p>
      {error === "invalid" && <p role="alert" className="mt-5 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">Email atau password salah.</p>}
      <form action={login} className="mt-6 space-y-4">
        <div><label htmlFor="email" className="mb-1.5 block text-sm font-medium">Email</label><input id="email" name="email" type="email" autoComplete="email" required className="w-full rounded-lg border bg-background px-3 py-2 outline-ring focus-visible:outline-2" /></div>
        <div><label htmlFor="password" className="mb-1.5 block text-sm font-medium">Password</label><input id="password" name="password" type="password" autoComplete="current-password" required className="w-full rounded-lg border bg-background px-3 py-2 outline-ring focus-visible:outline-2" /></div>
        <button type="submit" className="w-full rounded-lg bg-primary px-4 py-2.5 font-semibold text-primary-foreground hover:bg-primary/80">Masuk</button>
      </form>
      <p className="mt-5 text-center text-sm text-muted-foreground">Belum punya akun? <Link href="/register" className="font-semibold text-foreground underline">Daftar</Link></p>
    </>
  );
}
