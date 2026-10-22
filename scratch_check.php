<?php
$row = DB::table('master_bloks')->where('id', 150)->first();
echo "master_bloks 150:\n";
print_r($row);

$row = DB::table('laporans')->where('id', 536)->first();
echo "\nlaporans 536:\n";
print_r($row);
