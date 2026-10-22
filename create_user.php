<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

// Alter table to support 'karyawan'
\Illuminate\Support\Facades\DB::statement("ALTER TABLE users MODIFY COLUMN role ENUM('admin', 'atasan', 'karyawan') NOT NULL DEFAULT 'karyawan'");

$user = \App\Models\User::firstOrCreate(
    ['email' => 'karyawan@csa.com'],
    [
        'name' => 'Karyawan Lapangan',
        'username' => 'karyawan',
        'password' => bcrypt('password'),
        'role' => 'karyawan'
    ]
);
echo "Email: {$user->email} | Password: password | Role: {$user->role}\n";
