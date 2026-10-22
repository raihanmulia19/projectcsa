<?php

namespace App\Services;

use Google\Client;
use Google\Service\Drive;
use Google\Service\Drive\DriveFile;
use Illuminate\Support\Facades\Log;

class GoogleDriveService
{
    protected ?Drive $driveService = null;
    protected ?string $folderId = null;
    protected ?string $authType = null;
    protected ?string $lastError = null;
    protected ?string $oauthError = null;

    public function __construct()
    {
        $this->folderId = config('services.google_drive.folder_id') ?: env('GOOGLE_DRIVE_FOLDER_ID');
        $this->initClient();
    }

    protected function initClient(): void
    {
        if (empty($this->folderId)) {
            $this->lastError = 'GOOGLE_DRIVE_FOLDER_ID belum diatur di file .env.';
            return;
        }

        // Prioritas 1: OAuth 2.0 (Client ID, Client Secret, Refresh Token) - Menggunakan kuota akun pribadi 15GB
        $clientId = config('services.google_drive.client_id') ?: env('GOOGLE_DRIVE_CLIENT_ID');
        $clientSecret = config('services.google_drive.client_secret') ?: env('GOOGLE_DRIVE_CLIENT_SECRET');
        $refreshToken = config('services.google_drive.refresh_token') ?: env('GOOGLE_DRIVE_REFRESH_TOKEN');

        if ($clientId && $clientSecret && $refreshToken) {
            try {
                $client = new Client();
                $client->setScopes([Drive::DRIVE_FILE, Drive::DRIVE]);
                $client->setClientId($clientId);
                $client->setClientSecret($clientSecret);
                $token = $client->fetchAccessTokenWithRefreshToken($refreshToken);

                if (isset($token['error'])) {
                    $errorDesc = $token['error_description'] ?? $token['error'];
                    $this->oauthError = $errorDesc;
                    $this->lastError = "OAuth refresh token error: {$errorDesc}";
                    Log::warning("Google Drive OAuth gagal ({$errorDesc}), mencoba Service Account jika tersedia...");
                } else {
                    $this->driveService = new Drive($client);
                    $this->authType = 'OAuth 2.0 (Akun Google Pribadi)';
                    $this->lastError = null;
                    $this->oauthError = null;
                    return;
                }
            } catch (\Exception $e) {
                $this->oauthError = $e->getMessage();
                $this->lastError = "OAuth error: " . $e->getMessage();
                Log::warning("Google Drive OAuth exception: " . $e->getMessage());
            }
        }

        // Prioritas 2: Service Account JSON file path (Untuk Google Workspace / Shared Drive)
        $serviceAccountPath = config('services.google_drive.service_account_json') 
            ?: env('GOOGLE_DRIVE_SERVICE_ACCOUNT_JSON');

        if ($serviceAccountPath && !file_exists($serviceAccountPath) && file_exists(base_path($serviceAccountPath))) {
            $serviceAccountPath = base_path($serviceAccountPath);
        }

        if (!$serviceAccountPath && file_exists(storage_path('app/google-service-account.json'))) {
            $serviceAccountPath = storage_path('app/google-service-account.json');
        }

        if ($serviceAccountPath && file_exists($serviceAccountPath)) {
            try {
                $client = new Client();
                $client->setScopes([Drive::DRIVE_FILE, Drive::DRIVE]);
                $client->setAuthConfig($serviceAccountPath);
                $this->driveService = new Drive($client);
                $this->authType = 'Service Account';
                $this->lastError = null;
                return;
            } catch (\Exception $e) {
                $saError = "Service Account error: " . $e->getMessage();
                $this->lastError = $this->lastError ? "{$this->lastError} | {$saError}" : $saError;
                Log::error("Google Drive Service Account gagal: " . $e->getMessage());
            }
        }

        if (!$this->lastError) {
            $this->lastError = 'Kredensial OAuth (CLIENT_ID, SECRET, REFRESH_TOKEN) maupun file Service Account belum terkonfigurasi di .env.';
        }
    }

    public function isConfigured(): bool
    {
        return $this->driveService !== null && !empty($this->folderId);
    }

    public function getLastError(): ?string
    {
        return $this->lastError;
    }

    public function getOAuthError(): ?string
    {
        return $this->oauthError;
    }

    public function getAuthType(): ?string
    {
        return $this->authType;
    }

    /**
     * Upload a file to Google Drive.
     */
    public function uploadFile(string $filePath, ?string $customFileName = null): ?DriveFile
    {
        if (!$this->isConfigured()) {
            throw new \Exception("Google Drive belum dikonfigurasi. Pastikan Service Account JSON (atau OAuth) dan GOOGLE_DRIVE_FOLDER_ID sudah terisi di .env.");
        }

        $fileName = $customFileName ?: basename($filePath);
        $mimeType = mime_content_type($filePath) ?: 'application/zip';

        $fileMetadata = new DriveFile([
            'name' => $fileName,
            'parents' => [$this->folderId],
        ]);

        $content = file_get_contents($filePath);

        try {
            $uploadedFile = $this->driveService->files->create($fileMetadata, [
                'data' => $content,
                'mimeType' => $mimeType,
                'uploadType' => 'multipart',
                'fields' => 'id, name, size, webViewLink, createdTime',
            ]);

            return $uploadedFile;
        } catch (\Google\Service\Exception $e) {
            $errorBody = json_decode($e->getMessage(), true);
            $rawMsg = $errorBody['error']['message'] ?? $e->getMessage();
            if (str_contains($rawMsg, 'storage quota') || str_contains($rawMsg, 'storageQuotaExceeded')) {
                throw new \Exception("Akun Service Account tidak memiliki kuota penyimpanan Google Drive pribadi. Gunakan OAuth 2.0 (GOOGLE_DRIVE_REFRESH_TOKEN) agar upload menggunakan kuota 15 GB akun Google Drive Anda.");
            }
            throw new \Exception("Gagal upload file ke Google Drive: {$rawMsg}");
        }
    }

    /**
     * List backup files in the Google Drive folder.
     */
    public function listBackupFiles(): array
    {
        if (!$this->isConfigured()) {
            return [];
        }

        try {
            $query = "'{$this->folderId}' in parents and trashed = false";
            $optParams = [
                'q' => $query,
                'fields' => 'files(id, name, size, createdTime)',
                'orderBy' => 'createdTime desc',
                'pageSize' => 50,
            ];

            $results = $this->driveService->files->listFiles($optParams);
            return $results->getFiles() ?? [];
        } catch (\Exception $e) {
            Log::error("Gagal membaca daftar file Google Drive: " . $e->getMessage());
            return [];
        }
    }

    /**
     * Hapus file cadangan lama jika melebihi hari retensi (misal simpan 7 hari terakhir).
     */
    public function cleanOldBackups(int $keepDays = 7): int
    {
        if (!$this->isConfigured()) return 0;

        $files = $this->listBackupFiles();
        $cutoffDate = now()->subDays($keepDays);
        $deletedCount = 0;

        foreach ($files as $file) {
            $fileTime = \Carbon\Carbon::parse($file->getCreatedTime());
            if ($fileTime->lessThan($cutoffDate)) {
                try {
                    $this->driveService->files->delete($file->getId());
                    $deletedCount++;
                } catch (\Exception $e) {
                    Log::warning("Gagal menghapus file lama di Drive: " . $e->getMessage());
                }
            }
        }

        return $deletedCount;
    }

    /**
     * Hapus file spesifik berdasarkan ID.
     */
    public function deleteFile(string $fileId): bool
    {
        if (!$this->isConfigured()) return false;

        try {
            $this->driveService->files->delete($fileId);
            return true;
        } catch (\Exception $e) {
            Log::warning("Gagal menghapus file di Drive: " . $e->getMessage());
            return false;
        }
    }
}
