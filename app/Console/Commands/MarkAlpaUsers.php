<?php

namespace App\Console\Commands;

use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;

#[Signature('app:mark-alpa-users')]
#[Description('Command description')]
class MarkAlpaUsers extends Command
{
    /**
     * Execute the console command.
     */
    public function handle()
    {
        $today = \Carbon\Carbon::today()->toDateString();
        
        // Asumsi kolom role di tabel users. Sesuaikan jika role menggunakan Spatie atau cara lain.
        $karyawans = \App\Models\User::where('role', 'karyawan')->get();
        $count = 0;

        foreach ($karyawans as $karyawan) {
            $absensi = \App\Models\Absensi::where('user_id', $karyawan->id)
                ->where('tanggal', $today)
                ->first();

            if (!$absensi) {
                \App\Models\Absensi::create([
                    'user_id' => $karyawan->id,
                    'tanggal' => $today,
                    'status' => 'alpa',
                    'tipe_kehadiran' => 'wfo', // Default untuk yang tidak absen
                ]);
                $count++;
            }
        }

        $this->info("Berhasil menandai $count karyawan sebagai alpa untuk tanggal $today.");
    }
}
