import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-background px-6 py-16 text-foreground sm:px-10">
      <div className="mx-auto max-w-5xl">
        <span className="inline-flex rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
          PPK Expense Tracker
        </span>
        <h1 className="mt-8 max-w-2xl font-heading text-4xl font-semibold tracking-tight sm:text-5xl">
          Kelola keuangan pribadi dengan lebih terstruktur.
        </h1>
        <p className="mt-5 max-w-2xl text-lg text-muted-foreground">
          Fondasi Next.js, PostgreSQL, dan shadcn/ui sudah disiapkan. Fitur aplikasi akan dikembangkan sesuai pembagian SRS.
        </p>
        <div className="mt-12 grid gap-4 md:grid-cols-3">
          <section className="rounded-xl border bg-card p-6 text-card-foreground shadow-sm">
            <h2 className="font-heading text-xl font-semibold">Akun</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Register, login, session, cookies, dan logout.
            </p>
          </section>
          <section className="rounded-xl border bg-card p-6 text-card-foreground shadow-sm">
            <h2 className="font-heading text-xl font-semibold">Transaksi</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Pemasukan, pengeluaran, filter, dan otorisasi.
            </p>
          </section>
          <Link
            href="/dashboard"
            className="rounded-xl border bg-card p-6 text-card-foreground shadow-sm transition-colors hover:bg-muted"
          >
            <h2 className="font-heading text-xl font-semibold">Dashboard</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Saldo, ringkasan keuangan, dan transaksi terbaru.
            </p>
          </Link>
        </div>
      </div>
    </main>
  );
}
