<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return redirect()->route('login');
});

use App\Http\Controllers\Atasan\DashboardController;
use App\Http\Controllers\AbsensiController;

use App\Http\Controllers\Admin\DashboardController as AdminDashboardController;

Route::get('/admin/dashboard', [AdminDashboardController::class, 'index'])->middleware(['auth', 'verified'])->name('dashboard.admin');

Route::get('/atasan/dashboard', [DashboardController::class, 'index'])->middleware(['auth', 'verified'])->name('dashboard.atasan');

use App\Http\Controllers\LaporanProduksiController;

Route::middleware(['auth', 'verified'])->prefix('produksi')->group(function () {
    Route::get('/rekap', [LaporanProduksiController::class, 'rekap'])->name('produksi.rekap');
    Route::get('/blok', [LaporanProduksiController::class, 'perBlok'])->name('produksi.blok');
    Route::get('/harian', [LaporanProduksiController::class, 'harian'])->name('produksi.harian');
    Route::get('/produktivitas', [LaporanProduksiController::class, 'produktivitas'])->name('produksi.produktivitas');
    Route::get('/kualitas', [LaporanProduksiController::class, 'kualitas'])->name('produksi.kualitas');
    Route::get('/laporan', [LaporanProduksiController::class, 'laporan'])->name('produksi.laporan');
    Route::get('/laporan-brondol', function () {
        return redirect()->route('produksi.laporan', ['kategori' => 'Brondol']);
    });
    
    // Admin Only POST routes
    Route::post('/perblok', [LaporanProduksiController::class, 'storeBlok'])->name('produksi.perblok.store');
    Route::put('/perblok/{id}', [LaporanProduksiController::class, 'updateBlok'])->name('produksi.perblok.update');
    Route::delete('/perblok/{id}', [LaporanProduksiController::class, 'destroyBlok'])->name('produksi.perblok.destroy');
    Route::post('/perblok/import', [LaporanProduksiController::class, 'importPerBlok'])->name('produksi.perblok.import');
    
    Route::post('/harian', [LaporanProduksiController::class, 'storeHarian'])->name('produksi.harian.store');
    Route::post('/harian/import', [LaporanProduksiController::class, 'importHarian'])->name('produksi.harian.import');
    Route::put('/rekap/{id}', [LaporanProduksiController::class, 'updateRekap'])->name('produksi.rekap.update');
    Route::delete('/rekap/{id}', [LaporanProduksiController::class, 'destroyRekap'])->name('produksi.rekap.destroy');
    
    Route::post('/produktivitas', [LaporanProduksiController::class, 'storeProduktivitas'])->name('produksi.produktivitas.store');
    Route::post('/kualitas', [LaporanProduksiController::class, 'storeKualitas'])->name('produksi.kualitas.store');
    Route::post('/laporan', [LaporanProduksiController::class, 'storeLaporan'])->name('produksi.laporan.store');
    Route::put('/laporan/{id}', [LaporanProduksiController::class, 'updateLaporan'])->name('produksi.laporan.update');
    Route::delete('/laporan/{id}', [LaporanProduksiController::class, 'destroyLaporan'])->name('produksi.laporan.destroy');
    Route::post('/laporan/import', [LaporanProduksiController::class, 'importLaporan'])->name('produksi.laporan.import');
    Route::post('/laporan/toggle-lock', [LaporanProduksiController::class, 'toggleLockLaporan'])->name('produksi.laporan.toggleLock');

    // Admin Only
    Route::get('/input', function () { return Inertia::render('Dummy', ['title' => 'Input Panen Harian']); })->name('produksi.input');
});

Route::middleware(['auth', 'verified'])->group(function () {
    // Penjualan
    Route::prefix('penjualan')->group(function () {
        Route::get('/rekap', function () { return Inertia::render('Dummy', ['title' => 'Rekap Penjualan']); })->name('penjualan.rekap');
        Route::get('/pembeli', function () { return Inertia::render('Dummy', ['title' => 'Penjualan per Pembeli']); })->name('penjualan.pembeli');
        Route::get('/harga', function () { return Inertia::render('Dummy', ['title' => 'Harga & Kontrak']); })->name('penjualan.harga');
        Route::get('/do', function () { return Inertia::render('Dummy', ['title' => 'Surat Jalan (DO)']); })->name('penjualan.do');
        Route::get('/piutang', function () { return Inertia::render('Dummy', ['title' => 'Piutang & Pembayaran']); })->name('penjualan.piutang');
    });

    // Biaya
    Route::prefix('biaya')->group(function () {
        Route::get('/rekap', function () { return Inertia::render('Dummy', ['title' => 'Rekap Biaya']); })->name('biaya.rekap');
        Route::get('/kategori', function () { return Inertia::render('Dummy', ['title' => 'Biaya per Kategori']); })->name('biaya.kategori');
        Route::get('/vendor', function () { return Inertia::render('Dummy', ['title' => 'Pembelian & Vendor']); })->name('biaya.vendor');
        Route::get('/bbm', function () { return Inertia::render('Dummy', ['title' => 'BBM & Transportasi']); })->name('biaya.bbm');
        Route::get('/alat', function () { return Inertia::render('Dummy', ['title' => 'Pemeliharaan Alat']); })->name('biaya.alat');
        Route::get('/pupuk', function () { return Inertia::render('Dummy', ['title' => 'Pupuk & Bahan Kimia']); })->name('biaya.pupuk');
    });

    // Areal
    Route::prefix('areal')->group(function () {
        Route::get('/peta', function () { return Inertia::render('Dummy', ['title' => 'Peta Interaktif']); })->name('areal.peta');
        Route::get('/data', function () { return Inertia::render('Dummy', ['title' => 'Data Areal']); })->name('areal.data');
        Route::get('/blok', function () { return Inertia::render('Dummy', ['title' => 'Data Blok']); })->name('areal.blok');
        Route::get('/tanaman', function () { return Inertia::render('Dummy', ['title' => 'Tanaman (TBM/TM)']); })->name('areal.tanaman');
        Route::get('/realisasi', function () { return Inertia::render('Dummy', ['title' => 'Realisasi Pekerjaan']); })->name('areal.realisasi');
        Route::get('/satelit', function () { return Inertia::render('Dummy', ['title' => 'Monitoring Satelit']); })->name('areal.satelit');
    });

    // SDM
    Route::prefix('sdm')->group(function () {
        Route::get('/karyawan', [App\Http\Controllers\Admin\KaryawanController::class, 'index'])->name('sdm.karyawan');
        Route::get('/absensi', [AbsensiController::class, 'adminIndex'])->name('sdm.absensi');
        Route::put('/absensi/{id}', [AbsensiController::class, 'adminUpdate'])->name('sdm.absensi.update');
        
        Route::get('/persetujuan-pulang', [App\Http\Controllers\Admin\PersetujuanAbsensiController::class, 'index'])->name('sdm.persetujuan_pulang');
        Route::patch('/persetujuan-pulang/{id}', [App\Http\Controllers\Admin\PersetujuanAbsensiController::class, 'update'])->name('sdm.persetujuan_pulang.update');

        Route::get('/penggajian', function () { return Inertia::render('Dummy', ['title' => 'Penggajian']); })->name('sdm.penggajian');
        Route::get('/produktivitas', function () { return Inertia::render('Dummy', ['title' => 'Produktivitas Tenaga Kerja']); })->name('sdm.produktivitas');
        Route::get('/pelatihan', function () { return Inertia::render('Dummy', ['title' => 'Pelatihan & Sertifikasi']); })->name('sdm.pelatihan');
        Route::get('/k3', function () { return Inertia::render('Dummy', ['title' => 'K3 & Keselamatan']); })->name('sdm.k3');
    });

    // Laporan
    Route::prefix('laporan')->group(function () {
        Route::get('/manajemen', function () { return Inertia::render('Dummy', ['title' => 'Laporan Manajemen']); })->name('laporan.manajemen');
        Route::get('/produksi', function () { return Inertia::render('Dummy', ['title' => 'Laporan Produksi']); })->name('laporan.produksi');
        Route::get('/penjualan', function () { return Inertia::render('Dummy', ['title' => 'Laporan Penjualan']); })->name('laporan.penjualan');
        Route::get('/keuangan', function () { return Inertia::render('Dummy', ['title' => 'Laporan Keuangan']); })->name('laporan.keuangan');
        Route::get('/sdm', function () { return Inertia::render('Dummy', ['title' => 'Laporan SDM']); })->name('laporan.sdm');
        Route::get('/regulasi', function () { return Inertia::render('Dummy', ['title' => 'Laporan Regulasi & Pajak']); })->name('laporan.regulasi');
        Route::get('/ekspor', function () { return Inertia::render('Dummy', ['title' => 'Ekspor Data']); })->name('laporan.ekspor');
    });

    // Pengaturan (Super Admin Only)
    Route::prefix('pengaturan')->middleware(['role:super_admin'])->group(function () {
        Route::get('/master', function () { return Inertia::render('Dummy', ['title' => 'Master Data']); })->name('pengaturan.master');
        Route::get('/konfigurasi', function () { return Inertia::render('Dummy', ['title' => 'Konfigurasi']); })->name('pengaturan.konfigurasi');
        Route::get('/audit', [\App\Http\Controllers\Admin\AuditLogController::class, 'index'])->name('pengaturan.audit');
        Route::post('/audit/backup-now', [\App\Http\Controllers\Admin\AuditLogController::class, 'backupNow'])->name('pengaturan.audit.backup-now');

        Route::get('/akun', [App\Http\Controllers\Admin\PengaturanAkunController::class, 'index'])->name('pengaturan.akun.index');
        Route::get('/akun/create', [App\Http\Controllers\Admin\PengaturanAkunController::class, 'create'])->name('pengaturan.akun.create');
        Route::post('/akun', [App\Http\Controllers\Admin\PengaturanAkunController::class, 'store'])->name('pengaturan.akun.store');
        Route::get('/akun/{akun}/edit', [App\Http\Controllers\Admin\PengaturanAkunController::class, 'edit'])->name('pengaturan.akun.edit');
        Route::put('/akun/{akun}', [App\Http\Controllers\Admin\PengaturanAkunController::class, 'update'])->name('pengaturan.akun.update');
        Route::delete('/akun/{akun}', [App\Http\Controllers\Admin\PengaturanAkunController::class, 'destroy'])->name('pengaturan.akun.destroy');
        Route::post('/akun/{user}/reset-password', [App\Http\Controllers\Admin\PengaturanAkunController::class, 'resetPassword'])->name('akun.reset-password');
    });
});

Route::middleware('auth')->group(function () {
    Route::post('/audit-log/export', [\App\Http\Controllers\Admin\AuditLogController::class, 'logExport'])->name('audit.log-export');
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::patch('/profile/karyawan', [ProfileController::class, 'updateKaryawan'])->name('profile.karyawan.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

// Karyawan Only Routes
Route::middleware(['auth', 'verified', 'role:karyawan'])->prefix('karyawan')->group(function () {
    Route::get('/absensi', [AbsensiController::class, 'index'])->name('karyawan.absensi');
    Route::post('/absensi', [AbsensiController::class, 'store'])->name('absensi.store');
    Route::put('/absensi', [AbsensiController::class, 'update'])->name('absensi.update');
    Route::get('/riwayat-absen', [AbsensiController::class, 'riwayat'])->name('karyawan.riwayat');
});

require __DIR__.'/auth.php';

// Route bantuan untuk membersihkan cache saat di-hosting
Route::get('/clear', function() {
    \Illuminate\Support\Facades\Artisan::call('optimize:clear');
    return 'Cache Laravel berhasil dibersihkan! Silakan kembali ke halaman awal / login.';
});
