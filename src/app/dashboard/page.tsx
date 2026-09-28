import Link from "next/link";
import { cookies } from "next/headers";
import { IconCirclePlus } from "@tabler/icons-react";
import { logout, setTheme } from "@/app/auth-actions";
import { requireUser } from "@/lib/auth";
import { DashboardOverview } from "@/components/dashboard/dashboard-overview";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Dashboard — PPK Expense Tracker",
};

export default async function DashboardPage() {
  const user = await requireUser();
  const theme = (await cookies()).get("ppk_theme")?.value === "dark" ? "dark" : "light";

  return (
    <main className="min-h-screen bg-background px-6 py-12 text-foreground sm:px-10">
      <div className="mx-auto max-w-5xl">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Halo, selamat datang kembali</p>
            <h1 className="mt-1 font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
              {user.name}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <Button render={<Link href="/transaksi#tambah" />}>
              <IconCirclePlus className="size-4" />
              Transaksi baru
            </Button>
            <form action={logout}>
              <button type="submit" className="rounded-lg border px-3 py-2 text-sm font-medium hover:bg-muted">
                Keluar
              </button>
            </form>
          </div>
        </header>

        {/* SRS-012: saldo, total, dan transaksi terbaru dimuat via AJAX. */}
        <DashboardOverview />

        <section className="mt-10 rounded-xl border bg-card p-6 text-card-foreground shadow-sm">
          <h2 className="font-heading text-lg font-semibold">Preferensi tampilan</h2>
          <p className="mt-1 text-sm text-muted-foreground">Tema disimpan di cookie browser.</p>
          <form action={setTheme} className="mt-4 flex flex-wrap items-center gap-3">
            <label htmlFor="theme" className="text-sm font-medium">Tema</label>
            <select id="theme" name="theme" defaultValue={theme} className="rounded-lg border bg-background px-3 py-2 text-sm">
              <option value="light">Terang</option>
              <option value="dark">Gelap</option>
            </select>
            <button type="submit" className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/80">
              Simpan
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}
