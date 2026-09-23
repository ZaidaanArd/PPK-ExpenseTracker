import Link from "next/link";
import { redirect } from "next/navigation";
import { register } from "@/app/auth-actions";
import { getCurrentUser } from "@/lib/auth";

export default async function RegisterPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  if (await getCurrentUser()) redirect("/dashboard");
  const { error } = await searchParams;
  return (
    <>
      <h1 className="font-heading text-3xl font-semibold">Bikin akun dulu</h1>
      <p className="mt-2 text-sm text-muted-foreground">Mulai atur keuanganmu di satu tempat.</p>
      {error && <p role="alert" className="mt-5 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{error === "exists" ? "Email ini sudah terdaftar. Coba masuk, ya." : "Cek lagi nama, email, dan password minimal 8 karakter."}</p>}
      <form action={register} className="mt-6 space-y-4">
        <div><label htmlFor="name" className="mb-1.5 block text-sm font-medium">Nama</label><input id="name" name="name" type="text" autoComplete="name" minLength={2} maxLength={100} required className="w-full rounded-lg border bg-background px-3 py-2 outline-ring focus-visible:outline-2" /></div>
        <div><label htmlFor="email" className="mb-1.5 block text-sm font-medium">Email</label><input id="email" name="email" type="email" autoComplete="email" required className="w-full rounded-lg border bg-background px-3 py-2 outline-ring focus-visible:outline-2" /></div>
        <div><label htmlFor="password" className="mb-1.5 block text-sm font-medium">Password</label><input id="password" name="password" type="password" autoComplete="new-password" minLength={8} required className="w-full rounded-lg border bg-background px-3 py-2 outline-ring focus-visible:outline-2" /><p className="mt-1 text-xs text-muted-foreground">Minimal 8 karakter.</p></div>
        <button type="submit" className="w-full rounded-lg bg-primary px-4 py-2.5 font-semibold text-primary-foreground hover:bg-primary/80">Daftar</button>
      </form>
      <p className="mt-5 text-center text-sm text-muted-foreground">Sudah punya akun? <Link href="/login" className="font-semibold text-foreground underline">Masuk</Link></p>
    </>
  );
}
