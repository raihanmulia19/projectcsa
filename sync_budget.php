<?php
use Illuminate\Support\Facades\DB;

$bloks = DB::table('master_bloks')->get();
foreach ($bloks as $b) {
    $estimasiJanjang = ($b->jumlah_pokok ?? 0) * ($b->tandan_per_pokok ?? 0) * ($b->rotasi ?? 0);
    $targetTonase = $estimasiJanjang * 17;
    
    if ($targetTonase > 0) {
        DB::table('budget_produksis')->updateOrInsert(
            ['blok_id' => $b->id, 'bulan' => date('n'), 'tahun' => date('Y')],
            ['target_janjang' => $estimasiJanjang, 'target_bjr' => 17, 'target_tonase_kg' => $targetTonase, 'updated_at' => now()]
        );
    }
}
echo "Budget Produksi (Target Tonase) berhasil disinkronisasi untuk bulan ini!\n";
