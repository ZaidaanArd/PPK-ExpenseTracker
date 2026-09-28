# PPK-ExpenseTracker

Aplikasi web **Expense Tracker** untuk mencatat pemasukan dan pengeluaran pribadi menggunakan **Next.js** dan **PostgreSQL**.

## Menjalankan proyek

Prasyarat: Node.js 20.9 atau lebih baru, pnpm, dan PostgreSQL. Proyek memakai Next.js App Router, TypeScript, PostgreSQL, dan Drizzle ORM.

1. Jalankan `pnpm install` untuk memasang dependensi.
2. Buat database PostgreSQL bernama `ppk_expense_tracker`, misalnya dengan `psql -U postgres -c "CREATE DATABASE ppk_expense_tracker;"`.
3. Salin `.env.example` menjadi `.env.local`, lalu ganti `YOUR_PASSWORD` dengan password PostgreSQL lokal. Jika password mengandung karakter khusus, encode karakter tersebut dalam URL.
4. Jalankan `pnpm db:init` untuk membuat tabel `users`, `sessions`, dan `transactions`.
5. Jalankan `pnpm dev`, lalu buka `http://localhost:3000`.

File `.env.local` tidak di-commit. Struktur tabel untuk setup awal ada di `db/schema.sql`, dengan model Drizzle yang sesuai di `src/db/schema.ts`. `getDb()` menyediakan koneksi `pg` dan `getOrm()` menyediakan query Drizzle.

## Akun dan autentikasi

Pengguna dapat daftar di `/register`, masuk di `/login`, lalu membuka `/dashboard`. Password disimpan sebagai hash scrypt. Session tersimpan di tabel `sessions`; browser menyimpan token acak dalam cookie HttpOnly. Dashboard memeriksa session di server setiap kali dibuka. Tombol **Keluar** menghapus session dari database dan cookie browser. Di dashboard, pilihan tema terang atau gelap disimpan dalam cookie preferensi selama satu tahun.

## Transaksi dan dashboard

Halaman `/transaksi` menyediakan form tambah, daftar, filter pemasukan/pengeluaran, tombol ubah, dan tombol hapus. Setiap pembacaan dan perubahan transaksi dibatasi dengan ID pengguna dari session database. Dashboard menampilkan saldo, total pemasukan, total pengeluaran, serta lima transaksi terbaru. Tautan **Transaksi baru** menuju form tambah di `/transaksi#tambah`.

## Fondasi UI

Antarmuka menggunakan [shadcn/ui preset `b228RDn6X2`](https://ui.shadcn.com/create?preset=b228RDn6X2) dengan gaya Nova, tema kuning, ikon Tabler, font Geist untuk teks, dan Raleway untuk judul. Konfigurasi komponen ada di `components.json`, sementara token warna dan tipografi ada di `src/app/globals.css`. Komponen baru dapat ditambahkan dengan `pnpm dlx shadcn@latest add <nama-komponen>`.

## Pembagian SRS

### Periode pertama — SRS-001 sampai SRS-009

#### Mochammad Yuda Tri Ananda — Akun dan Autentikasi

- **SRS-001: Register** — Pengguna dapat membuat akun dengan nama, email, dan password.
- **SRS-002: Login** — Pengguna dapat masuk menggunakan email dan password.
- **SRS-003: Session dan Authentication** — Sistem mempertahankan status login selama session berlaku dan melindungi halaman yang memerlukan autentikasi.
- **SRS-007: Cookies** — Sistem menyimpan minimal satu preferensi pengguna dalam cookie.
- **SRS-009: Logout** — Pengguna dapat mengakhiri session sehingga halaman terlindungi tidak dapat diakses sebelum login kembali.

#### Muhammad Hafidh Zufar Dewantara Hafidh — Transaksi

- **SRS-005: Manajemen Transaksi** — Pengguna dapat menambahkan, melihat, mengubah, dan menghapus transaksi pemasukan maupun pengeluaran.
- **SRS-006: Filter Transaksi** — Pengguna dapat memfilter daftar transaksi berdasarkan jenis pemasukan atau pengeluaran.
- **SRS-008: Authorization** — Setiap transaksi terhubung dengan pemiliknya; pengguna hanya dapat mengakses dan mengelola transaksi miliknya sendiri.

#### Nayla Husna — Dashboard

- **SRS-004: Dashboard** — Dashboard menampilkan nama pengguna, saldo saat ini, total pemasukan, total pengeluaran, dan daftar transaksi terbaru.

#### Muhammad Zaidaan Ardiyansyah — Project Manager periode pertama

Meninjau dan merge hasil commit/push dari ketiga programmer.

### Periode lanjutan — SRS-010 sampai SRS-016

Setelah *deployment* dan evaluasi aplikasi, pengembangan dilanjutkan di **proyek dan repositori yang sama** — dilarang keras membuat repositori baru karena berakibat pembatalan nilai pertemuan sebelumnya. **Project Manager baru: Muhammad Hafidh Zufar**, dengan tiga developer: **Muchammad Yuda Tri Ananda**, **Jaidaan**, dan **Nela**.

Sebelum fitur budget dinyatakan selesai, penerapan **AJAX** harus berjalan menyeluruh pada dashboard, manajemen transaksi, dan filter. Saat repo terakhir disinkronkan, data dashboard masih dimuat saat halaman dirender dan aksi transaksi masih melakukan redirect, jadi dua bagian itu disempurnakan lebih dulu. Setelah itu, ditambahkan fitur **budget (anggaran) bulanan** yang memungkinkan pengguna menetapkan serta mengelola anggaran pengeluaran mereka secara privat berdasarkan transaksi pengeluaran, mencakup **Set Budget** (pengaturan anggaran bulanan beserta *alert* jika terlampaui), **Budget Summary** (total anggaran, total pengeluaran, dan sisa anggaran), **Budget Indicator** (status penggunaan anggaran), dan **Monthly Budget** (memilih dan melihat anggaran berdasarkan bulan tertentu).

| ID | SRS lanjutan | PIC | Cakupan dan kriteria selesai |
|---|---|---|---|
| **SRS-010** | AJAX Manajemen Transaksi | **Jaidaan** | Tambah, ubah, dan hapus transaksi tanpa reload atau redirect halaman. Daftar transaksi dan saldo yang tampil langsung mengikuti perubahan. Error ditampilkan di halaman. |
| **SRS-011** | AJAX Filter Transaksi | **Jaidaan** | Pilihan semua, pemasukan, dan pengeluaran memperbarui daftar serta jumlah transaksi secara dinamis. Filter tetap sesuai setelah transaksi ditambah, diubah, atau dihapus. |
| **SRS-012** | AJAX Dashboard | **Nela** | Saldo, total pemasukan, total pengeluaran, dan transaksi terbaru dapat dimuat ulang secara dinamis. Data yang tampil mengikuti perubahan transaksi tanpa pengguna me-refresh halaman. |
| **SRS-013** | Set Budget | **Yuda** | Pengguna dapat menetapkan dan mengubah anggaran pengeluaran untuk bulan tertentu. Satu pengguna memiliki satu anggaran per bulan; hanya pemilik akun yang dapat membaca atau mengubahnya. |
| **SRS-014** | Budget Summary | **Yuda** | Sistem menghitung total anggaran, total **transaksi pengeluaran** pada bulan terpilih, dan sisa anggaran. Pemasukan tidak masuk hitungan pemakaian budget. |
| **SRS-015** | Budget Indicator & Alert | **Nela** | Tampilkan persentase dan status pemakaian budget. Jika pengeluaran **lebih besar** dari anggaran, tampilkan peringatan terlampaui dengan jelas. |
| **SRS-016** | Monthly Budget | **Nela** | Pengguna dapat memilih bulan dan melihat budget, pengeluaran, sisa, serta indikator untuk bulan tersebut. Pergantian bulan memperbarui tampilan tanpa reload. |

| Peran | Penanggung jawab | Fokus |
|---|---|---|
| **Project Manager baru** | **Muhammad Hafidh Zufar** | Menyepakati kontrak data, mengoordinasikan tiga branch kerja, review integrasi, memastikan AJAX menyeluruh, lalu mengevaluasi fitur budget dan deployment di repo yang sama. |
| **Developer 1** | **Muchammad Yuda Tri Ananda** | Skema, penyimpanan, otorisasi, perhitungan, API, dan pengaturan budget. |
| **Developer 2** | **Jaidaan** | Seluruh interaksi AJAX pada manajemen dan filter transaksi. |
| **Developer 3** | **Nela** | AJAX dashboard serta tampilan summary, indikator, alert, dan pemilih bulan budget. |

Supaya ketiganya bisa bekerja paralel, kontrak budget disepakati di awal: bulan memakai format `YYYY-MM`; data yang dikirim ke tampilan mencakup `budget`, `spent`, `remaining`, `percentage`, dan `exceeded`. Yuda dapat membangun sumber datanya bersamaan dengan Nela membangun tampilannya, sementara Jaidaan fokus di area transaksi. Detail lengkap ada di [`docs/srs-lanjutan.md`](docs/srs-lanjutan.md).
