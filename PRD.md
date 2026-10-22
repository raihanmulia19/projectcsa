# Product Requirements Document (PRD)
**Project Name:** Sistem Informasi Produksi CSA  
**Date:** Oktober 2026

## 1. Pendahuluan
Modul Laporan Produksi adalah bagian dari sistem informasi Project CSA yang berfokus pada rekapitulasi, pencatatan, serta visualisasi data produksi kelapa sawit atau komoditas terkait (seperti kategori Inti CSA, Agrinas, dan Brondol). Sistem ini dirancang untuk memudahkan administrator dalam melacak tonase harian, harga jual per kilogram, dan menghitung total pendapatan secara otomatis.

## 2. Tujuan & Sasaran
*   **Efisiensi Pendataan:** Menyederhanakan proses input data produksi harian.
*   **Transparansi & Akurasi:** Menyediakan perhitungan otomatis (Harga x Tonase) untuk mencegah human error.
*   **Visualisasi Kinerja:** Menyajikan grafik tren tonase (berat) untuk memonitor perkembangan produksi dengan mudah.
*   **Keamanan Data:** Menyediakan fitur "Lock" (Kunci Data) pada bulan tertentu untuk mencegah perubahan data yang sudah tutup buku.
*   **Pelaporan yang Mudah:** Menyediakan kapabilitas Export ke PDF dan Import data massal dari Excel.

## 3. Fitur Utama
### A. Dashboard & Visualisasi Data
*   **Area Chart Tren Berat:** Grafik interaktif yang menampilkan pergerakan tonase produksi berdasarkan rentang waktu yang dipilih, dilengkapi tooltip untuk detail tiap titik data.

### B. Manajemen Kategori & Filter
*   **Tab Kategori:** Filter cepat untuk beralih antara data produksi Inti CSA, Agrinas, dan Brondol.
*   **Filter Waktu:** Filter dropdown untuk menyaring data berdasarkan Bulan, Tahun, dan Minggu Ke-.

### C. Operasional Data (CRUD & Auto-hitung)
*   **Input Data Laporan:** Form modal untuk memasukkan data baru (Tanggal, Harga/Kg, Tonase) dengan fitur auto-calculate untuk Total.
*   **Edit & Hapus Data:** Opsi untuk memperbarui data yang salah input atau menghapusnya.
*   **Validasi Data:** Validasi input untuk memastikan nominal harga dan tonase berformat angka yang benar.

### D. Fitur Kunci Data (Data Lock)
Mencegah manipulasi data (Edit, Hapus, Tambah, Import) pada periode bulan yang sudah dikunci oleh sistem.

### E. Ekspor & Impor (Laporan)
*   **Import Excel:** Mengunggah file Excel berisi rekap produksi. Sistem dapat mendeteksi sheet bulan yang sesuai dan memetakan kolom (tanggal, harga, tonase) secara otomatis.
*   **Export PDF:** Membuat laporan PDF lengkap dengan kop surat perusahaan. Mendukung 3 tipe laporan:
    *   Harian: Rincian hari per hari.
    *   Mingguan: Rincian rekap per minggu.
    *   Bulanan: Rincian total per bulan.

### F. Pencadangan Data (Auto Backup ke Google Drive Pribadi)
*   **Pencadangan Tanpa Beban Hosting:** Mencadangkan database secara otomatis langsung ke Google Drive pribadi pengguna melalui integrasi OAuth 2.0 (`google/apiclient`).
*   **Zero Local Storage Usage:** File arsip `.zip` di server lokal langsung dihapus segera setelah terunggah ke Google Drive sehingga kapasitas hosting Rumahweb tetap hemat (0 byte terpakai).
*   **Jadwal Otomatis & Pembersihan Berkala:** Otomatis berjalan setiap hari pukul 02:00 WIB melalui Laravel Scheduler, serta membersihkan file cadangan di Google Drive yang berusia lebih dari 7 hari.
*   **Pemicu Instan (On-Demand):** Tombol "Backup ke Drive" di halaman Super Admin Audit Log untuk memicu pencadangan manual kapan saja dengan konfirmasi SweetAlert.

## 4. Roles & Manajemen Hak Akses
Sistem ini mendukung pengelolaan Role-Based Access Control (RBAC) dengan pemisahan tugas dan wewenang sebagai berikut:

### A. Super Admin
Role tertinggi yang memiliki akses penuh ke seluruh fitur di dalam sistem, serta memiliki kontrol khusus terhadap konfigurasi inti aplikasi.
**Fitur Khusus (Pengaturan):**
*   **Master Data & Konfigurasi:** Mengelola parameter referensi dan setting aplikasi.
*   **Pengaturan Akun:** Manajemen User (Create, Read, Update, Delete) dan fitur Reset Password untuk pengguna lain.
*   **Audit Log & Backup:** Memantau riwayat aktivitas pengguna, pencarian & filter aksi real-time, serta kontrol eksekusi Backup ke Google Drive.

### B. Admin
Role yang bertanggung jawab atas operasional dan administrasi harian perusahaan (Produksi, SDM, Penjualan, dll).
**Fitur Khusus:**
*   **Dashboard Admin:** Menampilkan matriks dan grafik kinerja perusahaan secara umum.
*   **Manajemen Produksi:** Mengelola data Laporan Produksi, Panen Harian, Blok, Produktivitas, hingga mengunci (lock) data dan import/export Excel.
*   **Manajemen SDM:** Mengelola data Karyawan, melihat rekap absensi, menyetujui (approve) izin pulang cepat/absen, serta laporan penggajian.
*   **Manajemen Areal, Penjualan, dan Biaya:** Fitur pencatatan lengkap untuk memetakan blok, mencatat vendor, biaya pemeliharaan/pupuk, hingga penjualan (DO/Kontrak).
*   **Pusat Laporan:** Mengakses semua jenis laporan komprehensif (Keuangan, Regulasi, Ekspor, Manajemen).

### C. Atasan
Role untuk pihak manajemen atau level eksekutif yang memantau operasional (seperti Manajer atau Direksi).
**Fitur Khusus:**
*   **Dashboard Atasan:** Menampilkan summary ringkas atau High-level view dari kinerja kebun, finansial, dan produktivitas tanpa dihadapkan pada detail operasional data entry.

### D. Karyawan
Role untuk staf atau pekerja lapangan yang memiliki akun di sistem.
**Fitur Khusus:**
*   **Absensi (Clock In / Out):** Karyawan dapat melakukan proses presensi secara mandiri.
*   **Riwayat Absensi:** Melihat catatan kehadiran dan jam kerja pribadi.
*   **Update Profil:** Melakukan penyesuaian profil dasar (jika diizinkan).

---

## 5. Revisi & Pembaruan Terakhir (Changelog)
Berikut adalah daftar perubahan (revisi) terbaru yang telah diimplementasikan ke dalam sistem berdasarkan permintaan:

### Senin, 12 Oktober 2026 - Malam (Audit Lighthouse & Optimasi Performa Hosting Modul Laporan Produksi)
**✏️ Edit & Revisi Aksesibilitas (WCAG / Lighthouse Accessibility Skor 100):**
*   **Perbaikan Form & Label Aksesibilitas (*Names & Labels*):**
    *   Mengatasi isu *"Select elements do not have associated label elements"* pada dropdown filter Bulan, Tahun, Minggu, dan Format Ekspor.
    *   Mengubah kelas Tailwind label desktop dari `xl:hidden` (`display: none`) menjadi `xl:sr-only` agar tidak hilang dari *accessibility tree* dan tetap terbaca oleh *screen reader* serta audit Lighthouse.
    *   Memasangkan atribut `id`, `htmlFor`, dan `aria-label` eksplisit pada semua elemen dropdown (`filter-bulan`, `filter-tahun`, `filter-minggu`, dan `export-type`).
*   **Perbaikan Hirarki Heading (*Navigation*):**
    *   Mengatasi isu *"Heading elements are not in a sequentially-descending order"* (terdeteksi pada elemen `h3.text-xl...` Tren Berat).
    *   Mengubah tag logo/brand instansi di sidebar dan navbar mobile [`AuthenticatedLayout.jsx`](file:///d:/WEB/projectcsa/resources/js/Layouts/AuthenticatedLayout.jsx) dari `<h1>` menjadi `<span>` agar tidak menduplikasi judul utama halaman.
    *   Menyusun hirarki heading di [`Laporan.jsx`](file:///d:/WEB/projectcsa/resources/js/Pages/Admin/Produksi/Laporan.jsx) secara runtut: `<h1>Data Laporan Produksi</h1>` (judul halaman) -> `<h2>Tren Berat</h2>` (section chart) -> `<h2>Input Data Laporan</h2>` / `<h2>Edit Data Laporan</h2>` (dialog modal).
*   **Peningkatan Rasio Kontras Warna (*Contrast Ratio*):**
    *   Mengatasi isu *"Background and foreground colors do not have a sufficient contrast ratio"* (terdeteksi pada tab aktif Inti CSA, card/tabel, dan tombol PDF).
    *   Menaikkan warna teks aktif tab kategori dari `text-emerald-600` menjadi `text-emerald-700`.
    *   Menaikkan kontras tombol ekspor PDF dari `text-rose-600` menjadi `text-rose-700` dan tombol Excel menjadi `text-emerald-800`.
    *   Meningkatkan kontras warna teks tabel dan subtitle dari `text-gray-500` ke `text-gray-700` dan `text-gray-600`.
    *   Mengubah warna tick sumbu grafik Recharts dari `#94a3b8` ke `#475569` (slate-600) untuk memenuhi ambang batas kontras WCAG AA (minimal 4.5:1).

**⚡ Optimasi Performa & Web Vitals (*Insights & Diagnostics*):**
*   **Code-Splitting & Dynamic Import (*Reduce unused JavaScript* - Penghematan >1.2 MB):**
    *   Mengatasi temuan Lighthouse *"Reduce unused JavaScript — Est savings of 405 KiB"*.
    *   Mengubah impor pustaka berat `xlsx` (~430 kB), `jspdf` (~390 kB), `jspdf-autotable` (~31 kB), dan string base64 kop surat `kopSuratBase64.js` (~785 kB) dari impor statis di *top-level* menjadi *dynamic import* (`await import(...)`) saat tombol dieksekusi (*on-demand*).
    *   Ukuran bundle awal halaman [`Laporan.jsx`](file:///d:/WEB/projectcsa/resources/js/Pages/Admin/Produksi/Laporan.jsx) menyusut dari **>1.6 MB** menjadi hanya **35 kB** (gzip: **8.8 kB**), memangkas waktu *First Contentful Paint (FCP)*, *Largest Contentful Paint (LCP)*, serta meniadakan *long main-thread task*.
*   **Rekomendasi Caching Aset Hosting (*Use efficient cache lifetimes*):**
    *   Mengatasi temuan *"Use efficient cache lifetimes — Est savings of 1,159 KiB"* melalui panduan konfigurasi header `Cache-Control` (Expires) di server hosting untuk berkas statis `public/build/assets/` dan gambar publik.

### Senin, 12 Oktober 2026 (Audit Log Aktivitas & Ekspor Berkas)
**➕ Tambah (Add)**
*   **Audit Log Otentikasi (Login / Logout):** Mencatat otomatis ke tabel `activity_logs` saat pengguna berhasil login dan saat logout dari sistem di `AuthenticatedSessionController`.
*   **Audit Log Manajemen Pengguna:** Mencatat aktivitas penambahan akun baru (CREATE), pembaruan data pengguna (UPDATE), penghapusan pengguna (DELETE), dan reset password ke default (RESET PASSWORD) di `PengaturanAkunController`.
*   **Fitur Ekspor Excel & Audit Log Unduh Berkas:**
    *   Menambahkan opsi unduh berkas **Excel (.xlsx)** di halaman `Laporan.jsx` dan `Harian.jsx` selain opsi **PDF**.
    *   Menambahkan *route* `POST /audit-log/export` di `AuditLogController` untuk merekam aktivitas ekspor (PDF maupun Excel) beserta periode dan modul terkait.
*   **Penyempurnaan Halaman Audit Log (`AuditLog.jsx`):**
    *   Menambahkan *filter dropdown* berdasarkan Aksi (LOGIN, LOGOUT, CREATE, UPDATE, DELETE, RESET PASSWORD, EXPORT, BACKUP).
    *   Menambahkan fitur pencarian (*search*) instan real-time (otomatis mencari saat mengetik tanpa perlu klik tombol cari, dilengkapi ikon silang untuk reset cepat).
    *   Menyesuaikan tipografi dan warna *badge* sesuai format standar: format waktu numerik `DD/MM/YYYY, HH.mm.ss` (*clean sans-serif*), nama pengguna & modul `font-semibold`, serta lencana aksi (*pill badge*) berlatar lembut (*soft pastel*).
*   **Sistem Auto Backup ke Google Drive Pribadi:**
    *   Mengintegrasikan `spatie/laravel-backup` dan `google/apiclient`.
    *   Membuat *service* [`GoogleDriveService.php`](file:///d:/WEB/projectcsa/app/Services/GoogleDriveService.php) dan Artisan command `backup:to-drive` ([`BackupToGoogleDrive.php`](file:///d:/WEB/projectcsa/app/Console/Commands/BackupToGoogleDrive.php)).
    *   Mencadangkan database & berkas ke Google Drive, lalu otomatis menghapus file lokal di hosting Rumahweb sehingga kapasitas hosting tetap 0 byte terpakai.
    *   Menambahkan tombol **Backup ke Drive** pada halaman Super Admin Audit Log untuk memicu backup instan.
    *   Menjadwalkan eksekusi otomatis setiap hari pukul 02:00 pagi di [`routes/console.php`](file:///d:/WEB/projectcsa/routes/console.php).

### Jumat, 9 Oktober 2026 (Modul Absensi / SDM)
**➕ Tambah (Add)**
*   **Fitur Edit Absensi (Admin):** Menambahkan *route* `sdm.absensi.update` dan fungsi `adminUpdate` di *controller* agar admin dapat mengubah manual data absensi (waktu, status, dan tipe kehadiran) melalui *modal* popup (dengan menekan ikon pensil kotak `Edit`).
*   **Sistem Auto-Alpa (Cron Job):** Membuat *Artisan Command* (`MarkAlpaUsers`) yang berjalan di *scheduler* setiap jam 23:59 untuk mendeteksi karyawan yang tidak absen hari itu dan otomatis memberi status **Alpa**.
*   **Logika Hukuman Pulang Cepat:** Menambahkan logika di `PersetujuanAbsensiController` agar saat pengajuan "Pulang Cepat" di-*reject* oleh Admin, status absensi utama hari tersebut otomatis diubah menjadi **Alpa**.

**✏️ Edit & Revisi (Update/Fix)**
*   **Pembersihan UI Tabel Utama:** Menghapus badge WFO/WFH dan link lokasi dari kolom jam di tabel utama agar lebih bersih.
*   **Tombol Aksi (Action Buttons):** Mengganti gaya tombol agar tidak lagi memiliki lingkaran latar belakang (hanya ikon murni `Eye` dan `Edit` yang berubah warna saat di-*hover*).
*   **Filter Default (Harian):** Mengubah *default* *query* tabel absensi admin dari bulanan menjadi harian (menampilkan data hari ini saja), beserta mengubah filter *Date Picker* dari tipe `month` menjadi `date`.
*   **Penyempurnaan Modal Detail:** 
    *   Mengatur ulang tata letak (layout) detail dan memunculkan foto datang/pulang.
    *   Mengembalikan tombol cek lokasi Google Maps di dalam modal (di bawah teks Jam Datang dan Jam Pulang) lengkap dengan keterangan WFO/WFH.
    *   Memperbaiki *card* statistik (Hadir, Telat, Alpa) di dalam modal agar menghitung **Rekapitulasi 1 Bulan Penuh** untuk karyawan tersebut.
*   **Perbaikan Bug Mass Assignment:** Memperbaiki model `Absensi.php` dengan menambahkan kolom `status` dan `tipe_kehadiran` ke dalam `$fillable` agar sistem bisa memproses status "Terlambat" dengan benar saat absen datang.

### Revisi Sebelumnya (Modul Laporan Produksi)
*   **Penambahan Keterangan pada Baris Total Pendapatan**
    *   **Lokasi:** File `resources/js/Pages/Admin/Produksi/Laporan.jsx` (pada tabel Laporan Produksi bagian footer/bawah).
    *   **Detail Revisi:** Menambahkan teks keterangan kecil (*Akumulatif pendapatan sebelum pengurangan SPSI (upah bongkar) dll) tepat di bawah angka Total Rupiah (Total Pendapatan).
    *   **Tujuan:** Memberikan klarifikasi dan konteks kepada pembaca laporan bahwa angka total pendapatan yang tertera merupakan nilai kotor sebelum dipotong oleh biaya SPSI (Serikat Pekerja Seluruh Indonesia) atau upah bongkar dan potongan lainnya.
    *   **Status:** Selesai (✅)
