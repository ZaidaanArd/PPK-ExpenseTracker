# SRS Lanjutan — SRS-010 sampai SRS-016

Dokumen kerja periode lanjutan proyek PPK-ExpenseTracker. Pengembangan dilanjutkan di **proyek dan repositori yang sama** — dilarang keras membuat repositori baru karena berakibat pembatalan nilai pertemuan sebelumnya.

## User story

> Setelah melakukan *deployment* dan evaluasi aplikasi, pengembangan harus dilanjutkan menggunakan proyek dan repositori yang sama dengan penunjukan *Project Manager* (PM) baru serta pembagian tugas masing-masing anggota. Dilarang keras membuat repositori baru karena akan berakibat pada pembatalan nilai pada pertemuan sebelumnya. Pastikan penerapan AJAX sudah berjalan menyeluruh pada *dashboard*, manajemen transaksi, dan filter. Jika seluruh bagian tersebut sudah terimplementasi, tambahkan fitur *budget* (anggaran) bulanan yang memungkinkan pengguna menetapkan serta mengelola anggaran pengeluaran mereka sendiri secara privat berdasarkan transaksi pengeluaran. Fitur wajib yang harus dibangun mencakup *Set Budget* (pengaturan anggaran bulanan beserta *alert* jika terlampaui), *Budget Summary* (menampilkan total anggaran, total pengeluaran, dan sisa anggaran), *Budget Indicator* (menampilkan status penggunaan anggaran), serta *Monthly Budget* (fitur untuk memilih dan melihat anggaran berdasarkan bulan tertentu).

## Titik awal

Saat repo terakhir disinkronkan, fitur akun, transaksi, filter, dan dashboard sudah ada. Namun AJAX belum menyeluruh: data dashboard masih dimuat saat halaman dirender, sementara aksi transaksi masih melakukan redirect. Karena itu, penyempurnaan AJAX jadi syarat sebelum fitur budget dinyatakan selesai.

## Pembagian SRS

| ID | SRS lanjutan | PIC | Cakupan dan kriteria selesai |
|---|---|---|---|
| **SRS-010** | AJAX Manajemen Transaksi | **Jaidaan** | Tambah, ubah, dan hapus transaksi tanpa reload atau redirect halaman. Daftar transaksi dan saldo yang tampil langsung mengikuti perubahan. Error ditampilkan di halaman. |
| **SRS-011** | AJAX Filter Transaksi | **Jaidaan** | Pilihan semua, pemasukan, dan pengeluaran memperbarui daftar serta jumlah transaksi secara dinamis. Filter tetap sesuai setelah transaksi ditambah, diubah, atau dihapus. |
| **SRS-012** | AJAX Dashboard | **Nela** | Saldo, total pemasukan, total pengeluaran, dan transaksi terbaru dapat dimuat ulang secara dinamis. Data yang tampil mengikuti perubahan transaksi tanpa pengguna me-refresh halaman. |
| **SRS-013** | Set Budget | **Yuda** | Pengguna dapat menetapkan dan mengubah anggaran pengeluaran untuk bulan tertentu. Satu pengguna memiliki satu anggaran per bulan; hanya pemilik akun yang dapat membaca atau mengubahnya. |
| **SRS-014** | Budget Summary | **Yuda** | Sistem menghitung total anggaran, total **transaksi pengeluaran** pada bulan terpilih, dan sisa anggaran. Pemasukan tidak masuk hitungan pemakaian budget. |
| **SRS-015** | Budget Indicator & Alert | **Nela** | Tampilkan persentase dan status pemakaian budget. Jika pengeluaran **lebih besar** dari anggaran, tampilkan peringatan terlampaui dengan jelas. |
| **SRS-016** | Monthly Budget | **Nela** | Pengguna dapat memilih bulan dan melihat budget, pengeluaran, sisa, serta indikator untuk bulan tersebut. Pergantian bulan memperbarui tampilan tanpa reload. |

## Pembagian peran

| Peran | Penanggung jawab | Fokus |
|---|---|---|
| **Project Manager baru** | **Hafidh Zufar** | Menyepakati kontrak data, mengoordinasikan tiga branch kerja, review integrasi, memastikan AJAX menyeluruh, lalu mengevaluasi fitur budget dan deployment di repo yang sama. |
| **Developer 1** | **Yuda** | Skema, penyimpanan, otorisasi, perhitungan, API, dan pengaturan budget. |
| **Developer 2** | **Jaidaan** | Seluruh interaksi AJAX pada manajemen dan filter transaksi. |
| **Developer 3** | **Nela** | AJAX dashboard serta tampilan summary, indikator, alert, dan pemilih bulan budget. |

## Kontrak data budget

Disepakati di awal supaya ketiga developer bisa bekerja paralel:

- **Bulan** memakai format `YYYY-MM` (contoh: `2026-09`).
- **Data yang dikirim ke tampilan** mencakup:
  - `budget` — jumlah anggaran bulanan yang ditetapkan pengguna.
  - `spent` — total transaksi pengeluaran pada bulan terpilih (pemasukan tidak dihitung).
  - `remaining` — sisa anggaran, yaitu `budget - spent`.
  - `percentage` — persentase pemakaian anggaran.
  - `exceeded` — `true` jika pengeluaran **lebih besar** dari anggaran.
- **Satu pengguna memiliki satu anggaran per bulan**; menetapkan ulang berarti mengubah anggaran bulan tersebut.
- **Otorisasi**: hanya pemilik akun yang dapat membaca atau mengubah anggarannya sendiri.

Dengan kontrak ini, Yuda dapat membangun sumber datanya bersamaan dengan Nela membangun tampilannya, sementara Jaidaan fokus di area transaksi.

## Aturan kerja

- Setiap developer bekerja di branch masing-masing, commit dibuat atomik (satu commit satu maksud).
- Aksi transaksi (tambah, ubah, hapus) dan pergantian filter/bulan **tanpa reload atau redirect halaman**; error ditampilkan di halaman, bukan lewat redirect.
- Perubahan transaksi harus ikut memperbarui dashboard dan ringkasan budget secara dinamis.

## Checklist integrasi (PM)

- [ ] AJAX manajemen transaksi: tambah, ubah, hapus tanpa reload/redirect.
- [ ] AJAX filter: daftar dan jumlah transaksi terupdate dinamis, filter tetap sesuai setelah aksi transaksi.
- [ ] AJAX dashboard: saldo, total, dan transaksi terbaru ikut terupdate tanpa refresh.
- [ ] Set Budget: satu anggaran per bulan per pengguna, hanya pemilik yang bisa akses.
- [ ] Budget Summary: budget, spent, remaining sesuai bulan terpilih; pemasukan tidak dihitung.
- [ ] Budget Indicator & Alert: persentase, status, dan peringatan tampil jelas saat pengeluaran melebihi anggaran.
- [ ] Monthly Budget: pergantian bulan memperbarui tampilan tanpa reload.
- [ ] Verifikasi fitur budget terhadap bulan dan akun yang tepat.
