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
        Schema::dropIfExists('budget_produksis');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::create('budget_produksis', function (Blueprint $table) {
            $table->id();
            $table->foreignId('blok_id')->constrained('master_bloks')->onDelete('cascade');
            $table->integer('tahun');
            $table->integer('bulan');
            $table->integer('target_janjang');
            $table->decimal('target_bjr', 10, 2);
            $table->decimal('target_tonase_kg', 15, 2);
            $table->timestamps();
            
            $table->unique(['blok_id', 'tahun', 'bulan'], 'unique_budget');
        });
    }
};
