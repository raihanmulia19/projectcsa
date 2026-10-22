<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

use App\Models\Absensi;
use Inertia\Inertia;

class PersetujuanAbsensiController extends Controller
{
    public function index()
    {
        $pendingAbsensi = Absensi::with('user')
            ->where('status_pulang', 'Pulang Cepat')
            ->where('status_persetujuan_pulang', 'Pending')
            ->orderBy('tanggal', 'desc')
            ->get();

        return Inertia::render('Admin/SDM/PersetujuanPulang', [
            'title' => 'Persetujuan Pulang Cepat',
            'pending_absensi' => $pendingAbsensi
        ]);
    }

    public function update(Request $request, $id)
    {
        $request->validate([
            'status' => 'required|in:Approved,Rejected'
        ]);

        $absensi = Absensi::findOrFail($id);
        $absensi->status_persetujuan_pulang = $request->status;
        
        // Jika ditolak, maka status kehadiran hari itu otomatis diubah menjadi alpa
        if ($request->status === 'Rejected') {
            $absensi->status = 'alpa';
        }
        
        $absensi->save();

        return back()->with('success', 'Status persetujuan berhasil diupdate!');
    }
}
