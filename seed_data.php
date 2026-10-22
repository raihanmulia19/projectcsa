<?php

use Illuminate\Support\Facades\DB;

$dataInti = [
    ['kode_blok' => 'G27', 'tahun_tanam' => 2008, 'luas_area_ha' => 11.79, 'jumlah_pokok' => 1556, 'tandan_per_pokok' => 1, 'rotasi' => 4],
    ['kode_blok' => 'G28', 'tahun_tanam' => 2008, 'luas_area_ha' => 18.05, 'jumlah_pokok' => 2383, 'tandan_per_pokok' => 1, 'rotasi' => 4],
    ['kode_blok' => 'G29', 'tahun_tanam' => 2008, 'luas_area_ha' => 24.32, 'jumlah_pokok' => 3210, 'tandan_per_pokok' => 1, 'rotasi' => 4],
    ['kode_blok' => 'G30', 'tahun_tanam' => 2008, 'luas_area_ha' => 29.76, 'jumlah_pokok' => 3928, 'tandan_per_pokok' => 1, 'rotasi' => 4],
    ['kode_blok' => 'G31', 'tahun_tanam' => 2008, 'luas_area_ha' => 31.36, 'jumlah_pokok' => 4140, 'tandan_per_pokok' => 1, 'rotasi' => 4],
    ['kode_blok' => 'G32', 'tahun_tanam' => 2008, 'luas_area_ha' => 31.36, 'jumlah_pokok' => 4140, 'tandan_per_pokok' => 1, 'rotasi' => 4],
    ['kode_blok' => 'G33', 'tahun_tanam' => 2008, 'luas_area_ha' => 31.40, 'jumlah_pokok' => 4145, 'tandan_per_pokok' => 1, 'rotasi' => 4],
    ['kode_blok' => 'G34', 'tahun_tanam' => 2008, 'luas_area_ha' => 31.36, 'jumlah_pokok' => 4140, 'tandan_per_pokok' => 1, 'rotasi' => 4],
    ['kode_blok' => 'G35', 'tahun_tanam' => 2008, 'luas_area_ha' => 33.07, 'jumlah_pokok' => 4365, 'tandan_per_pokok' => 1, 'rotasi' => 4],
    ['kode_blok' => 'G36', 'tahun_tanam' => 2008, 'luas_area_ha' => 28.50, 'jumlah_pokok' => 3762, 'tandan_per_pokok' => 1, 'rotasi' => 4],
    ['kode_blok' => 'G37', 'tahun_tanam' => 2008, 'luas_area_ha' => 31.36, 'jumlah_pokok' => 4140, 'tandan_per_pokok' => 1, 'rotasi' => 4],
    ['kode_blok' => 'G38', 'tahun_tanam' => 2008, 'luas_area_ha' => 31.36, 'jumlah_pokok' => 4140, 'tandan_per_pokok' => 1, 'rotasi' => 4],
    
    ['kode_blok' => 'F31', 'tahun_tanam' => 2009, 'luas_area_ha' => 4.50, 'jumlah_pokok' => 594, 'tandan_per_pokok' => 1, 'rotasi' => 4],
    ['kode_blok' => 'F32', 'tahun_tanam' => 2009, 'luas_area_ha' => 10.99, 'jumlah_pokok' => 1451, 'tandan_per_pokok' => 1, 'rotasi' => 4],
    ['kode_blok' => 'F33', 'tahun_tanam' => 2009, 'luas_area_ha' => 16.42, 'jumlah_pokok' => 2167, 'tandan_per_pokok' => 1, 'rotasi' => 4],
    ['kode_blok' => 'F34', 'tahun_tanam' => 2009, 'luas_area_ha' => 23.27, 'jumlah_pokok' => 3072, 'tandan_per_pokok' => 1, 'rotasi' => 4],
    ['kode_blok' => 'F35A', 'tahun_tanam' => 2009, 'luas_area_ha' => 16.36, 'jumlah_pokok' => 2160, 'tandan_per_pokok' => 1, 'rotasi' => 4],
    ['kode_blok' => 'F35B', 'tahun_tanam' => 2009, 'luas_area_ha' => 21.27, 'jumlah_pokok' => 2808, 'tandan_per_pokok' => 1, 'rotasi' => 4],
    ['kode_blok' => 'F36', 'tahun_tanam' => 2009, 'luas_area_ha' => 20.00, 'jumlah_pokok' => 2640, 'tandan_per_pokok' => 1, 'rotasi' => 4],
    ['kode_blok' => 'F37', 'tahun_tanam' => 2009, 'luas_area_ha' => 32.77, 'jumlah_pokok' => 4326, 'tandan_per_pokok' => 1, 'rotasi' => 4],
    ['kode_blok' => 'F38', 'tahun_tanam' => 2009, 'luas_area_ha' => 29.78, 'jumlah_pokok' => 3931, 'tandan_per_pokok' => 1, 'rotasi' => 4],
    ['kode_blok' => 'F39', 'tahun_tanam' => 2009, 'luas_area_ha' => 32.33, 'jumlah_pokok' => 4268, 'tandan_per_pokok' => 1, 'rotasi' => 4],

    ['kode_blok' => 'E34', 'tahun_tanam' => 2010, 'luas_area_ha' => 5.40, 'jumlah_pokok' => 734, 'tandan_per_pokok' => 1, 'rotasi' => 4],
    ['kode_blok' => 'E35A', 'tahun_tanam' => 2010, 'luas_area_ha' => 1.69, 'jumlah_pokok' => 230, 'tandan_per_pokok' => 1, 'rotasi' => 4],
    ['kode_blok' => 'E36', 'tahun_tanam' => 2010, 'luas_area_ha' => 2.03, 'jumlah_pokok' => 276, 'tandan_per_pokok' => 1, 'rotasi' => 4],
    ['kode_blok' => 'E37', 'tahun_tanam' => 2010, 'luas_area_ha' => 10.29, 'jumlah_pokok' => 1399, 'tandan_per_pokok' => 1, 'rotasi' => 4],
    ['kode_blok' => 'E38', 'tahun_tanam' => 2010, 'luas_area_ha' => 16.78, 'jumlah_pokok' => 2282, 'tandan_per_pokok' => 1, 'rotasi' => 4],
    ['kode_blok' => 'E39', 'tahun_tanam' => 2010, 'luas_area_ha' => 21.74, 'jumlah_pokok' => 2957, 'tandan_per_pokok' => 1, 'rotasi' => 4],
];

$dataAgrinas = [
    ['kode_blok' => 'E35A-Agrinas', 'tahun_tanam' => 2010, 'luas_area_ha' => 13.52, 'jumlah_pokok' => 1785, 'tandan_per_pokok' => 0.58, 'rotasi' => 4],
    ['kode_blok' => 'E35B-Agrinas', 'tahun_tanam' => 2010, 'luas_area_ha' => 14.70, 'jumlah_pokok' => 1940, 'tandan_per_pokok' => 0.58, 'rotasi' => 4],
    ['kode_blok' => 'E36-Agrinas', 'tahun_tanam' => 2010, 'luas_area_ha' => 9.95, 'jumlah_pokok' => 1313, 'tandan_per_pokok' => 0.58, 'rotasi' => 4],
    ['kode_blok' => 'E37-Agrinas', 'tahun_tanam' => 2010, 'luas_area_ha' => 10.45, 'jumlah_pokok' => 1379, 'tandan_per_pokok' => 0.58, 'rotasi' => 4],
    ['kode_blok' => 'E38-Agrinas', 'tahun_tanam' => 2010, 'luas_area_ha' => 2.83, 'jumlah_pokok' => 374, 'tandan_per_pokok' => 0.58, 'rotasi' => 4],
    ['kode_blok' => 'F31-Agrinas', 'tahun_tanam' => 2009, 'luas_area_ha' => 27.95, 'jumlah_pokok' => 3689, 'tandan_per_pokok' => 0.58, 'rotasi' => 4],
    ['kode_blok' => 'F32-Agrinas', 'tahun_tanam' => 2009, 'luas_area_ha' => 21.46, 'jumlah_pokok' => 2833, 'tandan_per_pokok' => 0.58, 'rotasi' => 4],
    ['kode_blok' => 'F33-Agrinas', 'tahun_tanam' => 2009, 'luas_area_ha' => 15.98, 'jumlah_pokok' => 2109, 'tandan_per_pokok' => 0.58, 'rotasi' => 4],
    ['kode_blok' => 'F34-Agrinas', 'tahun_tanam' => 2009, 'luas_area_ha' => 9.18, 'jumlah_pokok' => 1212, 'tandan_per_pokok' => 0.58, 'rotasi' => 4],
    ['kode_blok' => 'F35A-Agrinas', 'tahun_tanam' => 2009, 'luas_area_ha' => 3.10, 'jumlah_pokok' => 409, 'tandan_per_pokok' => 0.58, 'rotasi' => 4],
    ['kode_blok' => 'F35B-Agrinas', 'tahun_tanam' => 2009, 'luas_area_ha' => 0.67, 'jumlah_pokok' => 88, 'tandan_per_pokok' => 0.58, 'rotasi' => 4],
    ['kode_blok' => 'G26-Agrinas', 'tahun_tanam' => 2008, 'luas_area_ha' => 19.11, 'jumlah_pokok' => 2523, 'tandan_per_pokok' => 0.58, 'rotasi' => 4],
    ['kode_blok' => 'G27-Agrinas', 'tahun_tanam' => 2008, 'luas_area_ha' => 18.72, 'jumlah_pokok' => 2471, 'tandan_per_pokok' => 0.58, 'rotasi' => 4],
    ['kode_blok' => 'G28-Agrinas', 'tahun_tanam' => 2008, 'luas_area_ha' => 12.47, 'jumlah_pokok' => 1646, 'tandan_per_pokok' => 0.58, 'rotasi' => 4],
    ['kode_blok' => 'G29-Agrinas', 'tahun_tanam' => 2008, 'luas_area_ha' => 6.32, 'jumlah_pokok' => 834, 'tandan_per_pokok' => 0.58, 'rotasi' => 4],
    ['kode_blok' => 'G30-Agrinas', 'tahun_tanam' => 2008, 'luas_area_ha' => 0.88, 'jumlah_pokok' => 116, 'tandan_per_pokok' => 0.58, 'rotasi' => 4],
];

echo "Inserting INTI...\n";
foreach ($dataInti as $row) {
    DB::table('master_bloks')->updateOrInsert(
        ['kode_blok' => $row['kode_blok']],
        array_merge($row, ['kategori_kebun' => 'Inti', 'created_at' => now(), 'updated_at' => now()])
    );
}

echo "Inserting AGRINAS...\n";
foreach ($dataAgrinas as $row) {
    DB::table('master_bloks')->updateOrInsert(
        ['kode_blok' => $row['kode_blok']],
        array_merge($row, ['kategori_kebun' => 'Agrinas', 'created_at' => now(), 'updated_at' => now()])
    );
}
echo "Done!\n";
