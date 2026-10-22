<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Karyawan extends Model
{
    protected $fillable = [
        'user_id', 'nik', 'jabatan', 'departemen', 'no_hp', 'alamat', 'tanggal_lahir', 'jenis_kelamin'
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
