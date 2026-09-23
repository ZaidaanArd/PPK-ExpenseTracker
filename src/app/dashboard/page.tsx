import { cookies } from "next/headers";
import { logout, setTheme } from "@/app/auth-actions";
import { requireUser } from "@/lib/auth";

export default async function DashboardPage() {
  const user = await requireUser();
  const theme = (await cookies()).get("ppk_theme")?.value === "dark" ? "dark" : "light";

  return (
    <main className="min-h-screen px-6 py-10 sm:px-10">
      <div className="mx-auto max-w-4xl">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <span className="rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">PPK Expense Tracker</span>
          <form action={logout}><button type="submit" className="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-muted">Keluar</button></form>
        </header>
        <section className="mt-12 rounded-2xl border bg-card p-8 shadow-sm">
          <p className="text-sm text-muted-foreground">Dashboard akun</p>
          <h1 className="mt-2 font-heading text-3xl font-semibold">Hai, {user.name} 👋</h1>
          <p className="mt-3 text-muted-foreground">Kamu masuk sebagai {user.email}. Halaman ini cuma bisa dibuka saat session masih aktif.</p>
          <div className="mt-8 border-t pt-6">
            <h2 className="font-heading text-lg font-semibold">Preferensi tampilan</h2>
            <p className="mt-1 text-sm text-muted-foreground">Pilihan tema disimpan di cookie selama satu tahun.</p>
            <form action={setTheme} className="mt-4 flex items-center gap-3">
              <label htmlFor="theme" className="text-sm font-medium">Tema</label>
              <select id="theme" name="theme" defaultValue={theme} className="rounded-lg border bg-background px-3 py-2 text-sm">
                <option value="light">Terang</option>
                <option value="dark">Gelap</option>
              </select>
              <button type="submit" className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/80">Simpan</button>
            </form>
          </div>
        </section>
      </div>
    </main>
  );
}
