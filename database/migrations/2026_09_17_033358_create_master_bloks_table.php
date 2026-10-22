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
        Schema::create('master_bloks', function (Blueprint $table) {
            $table->id();
            $table->string('kode_blok', 50)->unique();
            $table->string('kategori_kebun', 100);
            $table->integer('tahun_tanam');
            $table->decimal('luas_area_ha', 10, 2);
            $table->integer('jumlah_pokok');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('master_bloks');
    }
};
