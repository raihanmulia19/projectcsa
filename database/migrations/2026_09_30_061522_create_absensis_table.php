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
        Schema::create('absensis', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->date('tanggal');
            $table->time('waktu_datang')->nullable();
            $table->time('waktu_pulang')->nullable();
            $table->string('foto_datang')->nullable();
            $table->string('foto_pulang')->nullable();
            $table->string('lat_datang')->nullable();
            $table->string('long_datang')->nullable();
            $table->string('lat_pulang')->nullable();
            $table->string('long_pulang')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('absensis');
    }
};
