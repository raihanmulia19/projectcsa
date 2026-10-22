<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('absensis', function (Blueprint $table) {
            $table->enum('status_pulang', ['Pulang Cepat', 'Tepat Waktu', 'Lembur'])->nullable();
            $table->text('alasan_pulang_cepat')->nullable();
            $table->enum('status_persetujuan_pulang', ['Approved', 'Pending', 'Rejected'])->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('absensis', function (Blueprint $table) {
            $table->dropColumn(['status_pulang', 'alasan_pulang_cepat', 'status_persetujuan_pulang']);
        });
    }
};
