<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Storage;
use App\Services\GoogleDriveService;
use App\Http\Controllers\Controller;

class BackupToGoogleDrive extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'backup:to-drive {--only-db : Hanya mencadangkan database} {--keep-days=7 : Jumlah hari file disimpan di Google Drive}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Jalankan backup sistem dan unggah langsung ke Google Drive pribadi, lalu hapus file lokal di hosting.';

    /**
     * Execute the console command.
     */
    public function handle(GoogleDriveService $googleDrive)
    {
        $this->info('🚀 Memulai proses backup...');

        if (!$googleDrive->isConfigured()) {
            $err = $googleDrive->getLastError() ?: 'Pastikan GOOGLE_DRIVE_FOLDER_ID dan Service Account JSON / OAuth sudah terpasang.';
            $this->error("❌ Google Drive belum terkonfigurasi atau gagal terhubung: {$err}");
            return Command::FAILURE;
        }

        $this->info("🔑 Menggunakan autentikasi Google Drive: " . $googleDrive->getAuthType());

        $backupName = config('backup.backup.name', 'Laravel');
        $disks = config('backup.backup.destination.disks', ['local']);
        $primaryDisk = $disks[0] ?? 'local';

        $latestZipRelative = null;
        $isProcOpenAvailable = function_exists('proc_open') && !in_array('proc_open', array_map('trim', explode(',', (string) ini_get('disable_functions'))));
        $backupSuccess = false;

        // 1. Coba Spatie Backup jika proc_open diizinkan
        if ($isProcOpenAvailable) {
            $backupOptions = [];
            if ($this->option('only-db')) {
                $backupOptions['--only-db'] = true;
                $this->info('📦 Membuat cadangan database (Spatie)...');
            } else {
                $this->info('📦 Membuat cadangan database & file storage (Spatie)...');
            }

            try {
                $bufferedOutput = new \Symfony\Component\Console\Output\BufferedOutput();
                $exitCode = Artisan::call('backup:run', $backupOptions, $bufferedOutput);
                $backupOutput = $bufferedOutput->fetch();

                if ($exitCode === 0) {
                    $backupSuccess = true;
                    $this->line($backupOutput);
                } else {
                    $this->warn('⚠️ Spatie backup gagal (' . trim($backupOutput) . '). Beralih ke Native PHP Exporter...');
                }
            } catch (\Throwable $e) {
                $this->warn('⚠️ Spatie backup error (' . $e->getMessage() . '). Beralih ke Native PHP Exporter...');
            }
        } else {
            $this->info('ℹ️ Fungsi proc_open dinonaktifkan di server hosting. Menggunakan Native PHP Exporter (PDO)...');
        }

        // 2. Jika Spatie gagal / proc_open dibatasi, gunakan Native PHP Database Dumper
        if (!$backupSuccess) {
            $this->info('📦 Mengekspor database langsung via PHP (PDO)...');
            try {
                $latestZipRelative = $this->createNativeBackup($primaryDisk, $backupName, (bool) $this->option('only-db'));
                $backupSuccess = true;
            } catch (\Throwable $e) {
                $this->error('❌ Gagal menjalankan Native PHP Backup: ' . $e->getMessage());
                return Command::FAILURE;
            }
        }

        // 3. Cari file zip yang baru dibuat jika belum diset langsung
        if (!$latestZipRelative) {
            $files = Storage::disk($primaryDisk)->allFiles($backupName);
            $zipFiles = array_filter($files, fn($f) => str_ends_with($f, '.zip'));

            if (empty($zipFiles)) {
                $allDiskFiles = Storage::disk($primaryDisk)->allFiles();
                $zipFiles = array_filter($allDiskFiles, fn($f) => str_ends_with($f, '.zip'));
            }

            if (empty($zipFiles)) {
                $this->error('❌ Tidak ditemukan file .zip hasil backup.');
                return Command::FAILURE;
            }

            usort($zipFiles, function ($a, $b) use ($primaryDisk) {
                return Storage::disk($primaryDisk)->lastModified($b) <=> Storage::disk($primaryDisk)->lastModified($a);
            });

            $latestZipRelative = $zipFiles[0];
        }

        $latestZipPath = Storage::disk($primaryDisk)->path($latestZipRelative);
        $fileName = basename($latestZipPath);
        $fileSizeMb = round(filesize($latestZipPath) / (1024 * 1024), 2);

        $this->info("📤 Mengunggah {$fileName} ({$fileSizeMb} MB) ke Google Drive...");

        // 4. Unggah ke Google Drive
        try {
            $uploaded = $googleDrive->uploadFile($latestZipPath, $fileName);
            $this->info("✅ Berhasil diunggah ke Google Drive! ID File: {$uploaded->getId()}");

            // 5. Hapus file zip lokal di server agar hemat kapasitas hosting
            Storage::disk($primaryDisk)->delete($latestZipRelative);
            $this->info("🧹 File backup lokal berhasil dihapus dari hosting (Penyimpanan hosting tetap 0 byte terpakai).");

            // 6. Bersihkan cadangan lama di Google Drive
            $keepDays = (int) $this->option('keep-days');
            $deletedCount = $googleDrive->cleanOldBackups($keepDays);
            if ($deletedCount > 0) {
                $this->info("🗑️  Dibersihkan {$deletedCount} file backup lama (> {$keepDays} hari) di Google Drive.");
            }

            // 7. Catat log aktivitas
            Controller::recordActivity(
                'BACKUP',
                'Sistem',
                "Auto-backup berhasil diunggah ke Google Drive: {$fileName} ({$fileSizeMb} MB). Disimpan untuk {$keepDays} hari."
            );

            return Command::SUCCESS;
        } catch (\Exception $e) {
            $this->error("❌ Terjadi kesalahan saat mengunggah ke Google Drive: " . $e->getMessage());
            return Command::FAILURE;
        }
    }

    /**
     * Membuat cadangan database secara native via PHP PDO tanpa proc_open atau mysqldump.
     */
    protected function createNativeBackup(string $primaryDisk, string $backupName, bool $onlyDb): string
    {
        $timestamp = date('Y-m-d-H-i-s');
        $zipRelative = "{$backupName}/{$timestamp}.zip";
        $zipFullPath = Storage::disk($primaryDisk)->path($zipRelative);

        $dir = dirname($zipFullPath);
        if (!is_dir($dir)) {
            @mkdir($dir, 0755, true);
        }

        $tempDir = storage_path('app/backup-temp');
        if (!is_dir($tempDir)) {
            @mkdir($tempDir, 0755, true);
        }

        $dbConnection = config('database.default', 'mysql');
        $dbName = config("database.connections.{$dbConnection}.database", 'database');
        $tempSqlFile = $tempDir . DIRECTORY_SEPARATOR . "dump-{$timestamp}.sql";

        $handle = fopen($tempSqlFile, 'w');
        if (!$handle) {
            throw new \RuntimeException("Tidak dapat membuat file dump sementara: {$tempSqlFile}");
        }

        fwrite($handle, "-- CSA MySQL Dump (Native PHP Exporter)\n");
        fwrite($handle, "-- Generated: " . date('Y-m-d H:i:s') . "\n");
        fwrite($handle, "-- Database: {$dbName}\n\n");
        fwrite($handle, "SET NAMES utf8mb4;\n");
        fwrite($handle, "SET FOREIGN_KEY_CHECKS = 0;\n");
        fwrite($handle, "SET SQL_MODE = \"NO_AUTO_VALUE_ON_ZERO\";\n");
        fwrite($handle, "SET AUTOCOMMIT = 0;\n");
        fwrite($handle, "START TRANSACTION;\n\n");

        $pdo = \Illuminate\Support\Facades\DB::connection()->getPdo();
        $tablesStmt = $pdo->query("SHOW FULL TABLES WHERE Table_type = 'BASE TABLE'");
        $tables = $tablesStmt->fetchAll(\PDO::FETCH_COLUMN);

        foreach ($tables as $table) {
            fwrite($handle, "-- --------------------------------------------------------\n");
            fwrite($handle, "-- Struktur Tabel `{$table}`\n");
            fwrite($handle, "-- --------------------------------------------------------\n");
            fwrite($handle, "DROP TABLE IF EXISTS `{$table}`;\n");

            $createStmt = $pdo->query("SHOW CREATE TABLE `{$table}`");
            $createRow = $createStmt->fetch(\PDO::FETCH_ASSOC);
            if (!empty($createRow['Create Table'])) {
                fwrite($handle, $createRow['Create Table'] . ";\n\n");
            }

            fwrite($handle, "-- Data untuk `{$table}`\n");
            $selectStmt = $pdo->query("SELECT * FROM `{$table}`");
            $rows = [];

            while ($row = $selectStmt->fetch(\PDO::FETCH_ASSOC)) {
                $escaped = array_map(function ($val) use ($pdo) {
                    if (is_null($val)) {
                        return 'NULL';
                    }
                    return $pdo->quote((string) $val);
                }, $row);

                $rows[] = "(" . implode(", ", $escaped) . ")";

                if (count($rows) >= 100) {
                    fwrite($handle, "INSERT INTO `{$table}` VALUES \n" . implode(",\n", $rows) . ";\n");
                    $rows = [];
                }
            }

            if (!empty($rows)) {
                fwrite($handle, "INSERT INTO `{$table}` VALUES \n" . implode(",\n", $rows) . ";\n");
            }
            fwrite($handle, "\n");
        }

        fwrite($handle, "COMMIT;\n");
        fwrite($handle, "SET FOREIGN_KEY_CHECKS = 1;\n");
        fclose($handle);

        // Buat file ZIP
        $zip = new \ZipArchive();
        if ($zip->open($zipFullPath, \ZipArchive::CREATE | \ZipArchive::OVERWRITE) !== true) {
            @unlink($tempSqlFile);
            throw new \RuntimeException("Gagal membuat zip di {$zipFullPath}");
        }

        $zip->addFile($tempSqlFile, "db-dumps/mysql-{$dbName}.sql");

        if (!$onlyDb) {
            $storagePublic = storage_path('app/public');
            if (is_dir($storagePublic)) {
                $files = new \RecursiveIteratorIterator(
                    new \RecursiveDirectoryIterator($storagePublic, \RecursiveDirectoryIterator::SKIP_DOTS),
                    \RecursiveIteratorIterator::LEAVES_ONLY
                );
                foreach ($files as $file) {
                    if (!$file->isDir()) {
                        $filePath = $file->getRealPath();
                        $relPath = 'storage/' . substr($filePath, strlen($storagePublic) + 1);
                        $zip->addFile($filePath, str_replace('\\', '/', $relPath));
                    }
                }
            }
        }

        $zip->close();
        @unlink($tempSqlFile);

        return $zipRelative;
    }
}
