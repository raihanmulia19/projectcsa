<?php
$tables = ['absensis', 'karyawans', 'laporans', 'master_bloks', 'realisasi_harians', 'users'];
foreach($tables as $t) {
    try {
        $rows = DB::table($t)->get();
        foreach($rows as $r) {
            $encoded = json_encode($r);
            if(stripos($encoded, 'agrinas') !== false) {
                echo "Found in {$t}: " . ($r->id ?? 'no id') . "\n";
            }
        }
    } catch (\Exception $e) {
        // ignore
    }
}
echo "Done.\n";
