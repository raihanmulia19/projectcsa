<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

use App\Models\User;
use Inertia\Inertia;

class KaryawanController extends Controller
{
    public function index(Request $request)
    {
        $karyawans = User::with('karyawan')
            ->where('role', 'karyawan')
            ->orderBy('name')
            ->get();

        return Inertia::render('Admin/SDM/Karyawan', [
            'title' => 'Data Karyawan',
            'karyawans' => $karyawans
        ]);
    }
}
