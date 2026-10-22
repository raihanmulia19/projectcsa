<?php
$deletedLaporans = DB::table('laporans')->where('kategori', 'Agrinas')->delete();
$deletedMasterBloks = DB::table('master_bloks')->where('kategori_kebun', 'AGRINAS')->delete();

echo "Deleted from laporans: " . $deletedLaporans . "\n";
echo "Deleted from master_bloks: " . $deletedMasterBloks . "\n";
