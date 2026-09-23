import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-muted/40 px-4 py-12">
      <div className="w-full max-w-md">
        <Link href="/" className="mb-6 block text-center text-sm font-semibold text-primary-foreground">
          PPK Expense Tracker
        </Link>
        <div className="rounded-2xl border bg-card p-7 text-card-foreground shadow-sm">{children}</div>
      </div>
    </main>
  );
}
