<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Services\GoogleDriveService;

class CheckGoogleDrive extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'drive:check {--test-upload : Uji coba unggah dan hapus file dummy untuk memastikan izin upload}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Periksa status konfigurasi dan koneksi ke Google Drive untuk backup';

    /**
     * Execute the console command.
     */
    public function handle(GoogleDriveService $googleDrive)
    {
        $this->info("🔍 Memeriksa koneksi Google Drive...");

        $folderId = config('services.google_drive.folder_id') ?: env('GOOGLE_DRIVE_FOLDER_ID');
        $this->line("📁 Folder ID: " . ($folderId ?: '<belum diisi>'));

        if (!$googleDrive->isConfigured()) {
            $this->error("❌ Google Drive TIDAK terhubung!");
            $this->error("Penyebab: " . ($googleDrive->getLastError() ?: 'Kredensial belum lengkap'));
            return Command::FAILURE;
        }

        $this->info("✅ Google Drive terhubung!");
        $this->info("🔑 Tipe Autentikasi Aktif: " . $googleDrive->getAuthType());

        // Peringatan jika OAuth gagal sehingga beralih ke Service Account
        if ($googleDrive->getAuthType() === 'Service Account' && $googleDrive->getOAuthError()) {
            $this->newLine();
            $this->warn("⚠️  PERINGATAN OAUTH (PENTING):");
            $this->warn("   Kredensial OAuth gagal dengan pesan: '{$googleDrive->getOAuthError()}'.");
            $this->warn("   Sistem saat ini otomatis fallback ke Service Account.");
            $this->warn("   Akun Service Account TIDAK MEMILIKI KUOTA STORAGE untuk upload file ke Google Drive pribadi.");
            $this->warn("   Silakan perbarui GOOGLE_DRIVE_REFRESH_TOKEN di .env agar proses backup tidak gagal (Error 403 / Quota).");
        }

        $this->line("\n📂 Mengambil daftar file backup yang ada di Google Drive...");
        $files = $googleDrive->listBackupFiles();
        if (empty($files)) {
            $this->line("   (Belum ada file backup di folder ini)");
        } else {
            $this->info("   Ditemukan " . count($files) . " file backup:");
            foreach (array_slice($files, 0, 5) as $f) {
                $sizeMb = round(($f->getSize() ?? 0) / (1024 * 1024), 2);
                $this->line("   - {$f->getName()} ({$sizeMb} MB) [{$f->getCreatedTime()}]");
            }
            if (count($files) > 5) {
                $this->line("   ... dan " . (count($files) - 5) . " file lainnya.");
            }
        }

        if ($this->option('test-upload')) {
            $this->newLine();
            $this->info("🧪 Menguji izin unggah file ke Google Drive...");
            $tempFile = tempnam(sys_get_temp_dir(), 'drive_test_');
            file_put_contents($tempFile, "Test Google Drive Connection - " . now()->toIso8601String());

            try {
                $uploaded = $googleDrive->uploadFile($tempFile, 'csa-drive-test-' . time() . '.txt');
                $this->info("   ✅ Berhasil upload test file! (ID: {$uploaded->getId()})");
                
                // Bersihkan file test
                if (method_exists($googleDrive, 'deleteFile')) {
                    $googleDrive->deleteFile($uploaded->getId());
                    $this->info("   🗑️ File test berhasil dihapus kembali.");
                }
            } catch (\Exception $e) {
                $this->error("   ❌ Uji upload gagal: " . $e->getMessage());
                return Command::FAILURE;
            } finally {
                @unlink($tempFile);
            }
        }

        return Command::SUCCESS;
    }
}
