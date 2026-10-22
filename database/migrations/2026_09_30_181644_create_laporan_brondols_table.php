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
        Schema::create('laporan_brondols', function (Blueprint $table) {
            $table->id();
            $table->date('tanggal');
            $table->decimal('harga_per_kg', 15, 2);
            $table->decimal('tonase', 15, 2);
            $table->decimal('total', 15, 2);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('laporan_brondols');
    }
};
