<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('laporans', function (Blueprint $table) {
            $table->string('kategori')->default('Inti CSA')->after('tanggal');
        });

        // Pindahkan data dari laporan_brondols ke laporans
        if (Schema::hasTable('laporan_brondols')) {
            $brondols = DB::table('laporan_brondols')->get();
            foreach ($brondols as $b) {
                DB::table('laporans')->insert([
                    'tanggal' => $b->tanggal,
                    'kategori' => 'Brondol',
                    'harga_per_kg' => $b->harga_per_kg,
                    'tonase' => $b->tonase,
                    'total' => $b->total,
                    'created_at' => $b->created_at ?? now(),
                    'updated_at' => $b->updated_at ?? now()
                ]);
            }
            Schema::dropIfExists('laporan_brondols');
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('laporans', function (Blueprint $table) {
            $table->dropColumn('kategori');
        });
    }
};
