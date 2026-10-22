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
        Schema::table('master_bloks', function (Blueprint $table) {
            $table->decimal('tandan_per_pokok', 8, 2)->default(0)->after('jumlah_pokok');
            $table->integer('rotasi')->default(0)->after('tandan_per_pokok');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('master_bloks', function (Blueprint $table) {
            $table->dropColumn(['tandan_per_pokok', 'rotasi']);
        });
    }
};
