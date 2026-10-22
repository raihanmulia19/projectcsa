<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations to fix corrupted/inflated totals in laporans.
     */
    public function up(): void
    {
        DB::statement("UPDATE laporans SET total = ROUND(harga_per_kg * tonase, 2) WHERE ABS(total - (harga_per_kg * tonase)) > 0.01");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // No-op
    }
};
