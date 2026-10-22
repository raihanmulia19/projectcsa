<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MasterBlok extends Model
{
    protected $fillable = [
        'kode_blok',
        'kategori_kebun',
        'tahun_tanam',
        'luas_area_ha',
        'jumlah_pokok',
    ];

    public function realisasiHarians()
    {
        return $this->hasMany(RealisasiHarian::class, 'blok_id');
    }
}
