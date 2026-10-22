<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Absensi extends Model
{
    protected $fillable = [
        'user_id',
        'tanggal',
        'waktu_datang',
        'waktu_pulang',
        'foto_datang',
        'foto_pulang',
        'lat_datang',
        'long_datang',
        'lat_pulang',
        'long_pulang',
        'status',
        'tipe_kehadiran',
        'status_pulang',
        'alasan_pulang_cepat',
        'status_persetujuan_pulang',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
