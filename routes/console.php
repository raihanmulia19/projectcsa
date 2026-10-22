<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

use Illuminate\Support\Facades\Schedule;

// Menjalankan cron job otomatis setiap hari jam 23:59 malam
Schedule::command('app:mark-alpa-users')->dailyAt('23:59');

// Menjalankan auto-backup ke Google Drive setiap hari jam 02:00 pagi
Schedule::command('backup:to-drive --only-db')->dailyAt('02:00');
