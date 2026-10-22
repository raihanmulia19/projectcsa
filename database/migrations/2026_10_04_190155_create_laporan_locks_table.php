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
        Schema::create('laporan_locks', function (Blueprint $table) {
            $table->id();
            $table->integer('bulan');
            $table->integer('tahun');
            $table->boolean('is_locked')->default(false);
            $table->timestamps();
            
            $table->unique(['bulan', 'tahun']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('laporan_locks');
    }
};
