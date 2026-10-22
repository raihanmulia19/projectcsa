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
        Schema::create('realisasi_harians', function (Blueprint $table) {
            $table->id();
            $table->foreignId('blok_id')->constrained('master_bloks')->onDelete('cascade');
            $table->date('tanggal_panen');
            $table->integer('janjang_aktual');
            $table->decimal('tonase_kg_aktual', 15, 2);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('realisasi_harians');
    }
};
