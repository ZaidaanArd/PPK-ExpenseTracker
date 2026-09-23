# PPK-ExpenseTracker

Aplikasi web **Expense Tracker** untuk mencatat pemasukan dan pengeluaran pribadi menggunakan **Next.js** dan **PostgreSQL**.

## Menjalankan proyek

Prasyarat: Node.js 20.9 atau lebih baru, pnpm, dan PostgreSQL. Proyek memakai Next.js App Router, TypeScript, dan koneksi PostgreSQL melalui paket `pg`.

1. Jalankan `pnpm install` untuk memasang dependensi.
2. Buat database PostgreSQL bernama `ppk_expense_tracker`, misalnya dengan `psql -U postgres -c "CREATE DATABASE ppk_expense_tracker;"`.
3. Salin `.env.example` menjadi `.env.local`, lalu ganti `YOUR_PASSWORD` dengan password PostgreSQL lokal. Jika password mengandung karakter khusus, encode karakter tersebut dalam URL.
4. Jalankan `pnpm db:init` untuk membuat tabel `users` dan `transactions`.
5. Jalankan `pnpm dev`, lalu buka `http://localhost:3000`. Dashboard bisa diakses di `http://localhost:3000/dashboard`.

File `.env.local` tidak di-commit. Struktur tabel tersedia di `db/schema.sql`; koneksi database untuk kode aplikasi tersedia melalui `getDb()` di `src/lib/db.ts`.

## Dashboard (SRS-004)

Halaman `/dashboard` menampilkan nama pengguna, saldo saat ini, total pemasukan, total pengeluaran, dan daftar transaksi terbaru milik pengguna yang sedang login. Ringkasannya begini:

- Status login dibaca dari cookie `session_user_id` lewat `getAuthUser()` di `src/lib/auth.ts`. Modul Akun dan Autentikasi (SRS-003) tinggal menulis cookie yang sama saat login, jadi nggak perlu ubah apa-apa di Dashboard.
- Data ringkasan (saldo, total pemasukan, total pengeluaran) dan transaksi terbaru diambil lewat `src/lib/transactions.ts`, semuanya sudah terfilter berdasarkan `user_id` sesuai SRS-008.
- Format rupiah dan tanggal Indonesia ada di `src/lib/format.ts`.
- Kalau belum login, Dashboard nampilin kartu pengingat untuk login dulu.

## Fondasi UI

Antarmuka menggunakan [shadcn/ui preset `b228RDn6X2`](https://ui.shadcn.com/create?preset=b228RDn6X2) dengan gaya Nova, tema kuning, ikon Tabler, font Geist untuk teks, dan Raleway untuk judul. Konfigurasi komponen ada di `components.json`, sementara token warna dan tipografi ada di `src/app/globals.css`. Komponen baru dapat ditambahkan dengan `pnpm dlx shadcn@latest add <nama-komponen>`.

## Pembagian SRS

### Mochammad Yuda Tri Ananda — Akun dan Autentikasi

- **SRS-001: Register** — Pengguna dapat membuat akun dengan nama, email, dan password.
- **SRS-002: Login** — Pengguna dapat masuk menggunakan email dan password.
- **SRS-003: Session dan Authentication** — Sistem mempertahankan status login selama session berlaku dan melindungi halaman yang memerlukan autentikasi.
- **SRS-007: Cookies** — Sistem menyimpan minimal satu preferensi pengguna dalam cookie.
- **SRS-009: Logout** — Pengguna dapat mengakhiri session sehingga halaman terlindungi tidak dapat diakses sebelum login kembali.

### Muhammad Hafidh Zufar Dewantara Hafidh — Transaksi

- **SRS-005: Manajemen Transaksi** — Pengguna dapat menambahkan, melihat, mengubah, dan menghapus transaksi pemasukan maupun pengeluaran.
- **SRS-006: Filter Transaksi** — Pengguna dapat memfilter daftar transaksi berdasarkan jenis pemasukan atau pengeluaran.
- **SRS-008: Authorization** — Setiap transaksi terhubung dengan pemiliknya; pengguna hanya dapat mengakses dan mengelola transaksi miliknya sendiri.

### Nayla Husna — Dashboard

- **SRS-004: Dashboard** — Dashboard menampilkan nama pengguna, saldo saat ini, total pemasukan, total pengeluaran, dan daftar transaksi terbaru.

### Muhammad Zaidaan Ardiyansyah — Project Manager

Meninjau dan merge hasil commit/push dari ketiga programmer.
