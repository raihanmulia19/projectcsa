<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RealisasiHarian extends Model
{
    protected $fillable = [
        'blok_id',
        'tanggal_panen',
        'janjang_aktual',
        'tonase_kg_aktual',
    ];

    public function masterBlok()
    {
        return $this->belongsTo(MasterBlok::class, 'blok_id');
    }
}
