<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

use App\Models\Absensi;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Carbon\Carbon;
use Inertia\Inertia;

class AbsensiController extends Controller
{
    // Koordinat pusat kantor
    private $kantor_lat = 0.4709316;
    private $kantor_long = 101.4232244;
    private $radius_maksimal = 100; // dalam meter

    public function index()
    {
        $hari_ini = Carbon::today()->toDateString();
        $absensi = Absensi::where('user_id', Auth::id())
                          ->where('tanggal', $hari_ini)
                          ->first();

        return Inertia::render('Karyawan/Absensi', [
            'absensi_hari_ini' => $absensi
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'foto' => 'required',
            'latitude' => 'required|numeric',
            'longitude' => 'required|numeric',
            'tipe_kehadiran' => 'required|in:wfo,wfh',
        ]);

        if ($request->tipe_kehadiran === 'wfo') {
            $jarak = $this->hitungJarakMeter($this->kantor_lat, $this->kantor_long, $request->latitude, $request->longitude);
            if ($jarak > $this->radius_maksimal) {
                return back()->withErrors(['message' => 'Anda berada di luar jangkauan radius kantor.']);
            }
        }

        $hari_ini = Carbon::today()->toDateString();
        $absensi_exist = Absensi::where('user_id', Auth::id())->where('tanggal', $hari_ini)->first();

        if ($absensi_exist) {
            return back()->withErrors(['message' => 'Anda sudah melakukan absen datang hari ini.']);
        }

        // Proses Foto (Base64)
        $foto = $request->foto;
        $foto = str_replace('data:image/jpeg;base64,', '', $foto);
        $foto = str_replace(' ', '+', $foto);
        $imageName = 'datang_' . Auth::id() . '_' . time() . '.jpeg';
        Storage::disk('public')->put('absensi/' . $imageName, base64_decode($foto));

        $now = Carbon::now();
        $limit_datang = Carbon::today()->setTime(8, 0, 0); // Asumsi batas datang 08:00:00
        $status_kehadiran = $now->greaterThan($limit_datang) ? 'terlambat' : 'hadir';

        Absensi::create([
            'user_id' => Auth::id(),
            'tanggal' => $hari_ini,
            'waktu_datang' => $now->toTimeString(),
            'foto_datang' => 'absensi/' . $imageName,
            'lat_datang' => $request->latitude,
            'long_datang' => $request->longitude,
            'status' => $status_kehadiran,
            'tipe_kehadiran' => $request->tipe_kehadiran,
        ]);

        return back()->with('success', 'Berhasil Absen Datang!');
    }

    public function update(Request $request)
    {
        $request->validate([
            'foto' => 'required',
            'latitude' => 'required|numeric',
            'longitude' => 'required|numeric',
            'alasan_pulang_cepat' => 'nullable|string',
        ]);

        $hari_ini = Carbon::today()->toDateString();
        $absensi = Absensi::where('user_id', Auth::id())->where('tanggal', $hari_ini)->first();

        if (!$absensi) {
            return back()->withErrors(['message' => 'Anda belum melakukan absen datang hari ini.']);
        }

        if ($absensi->tipe_kehadiran === 'wfo') {
            $jarak = $this->hitungJarakMeter($this->kantor_lat, $this->kantor_long, $request->latitude, $request->longitude);
            if ($jarak > $this->radius_maksimal) {
                return back()->withErrors(['message' => 'Anda berada di luar jangkauan radius kantor.']);
            }
        }

        if ($absensi->waktu_pulang) {
            return back()->withErrors(['message' => 'Anda sudah melakukan absen pulang hari ini.']);
        }

        $now = Carbon::now();
        $limit_time = Carbon::today()->setTime(17, 0, 0);

        if ($now->lessThan($limit_time)) {
            if (!$request->alasan_pulang_cepat) {
                return back()->withErrors(['message' => 'Alasan pulang cepat wajib diisi jika pulang sebelum jam 17:00.']);
            }
            $status_pulang = 'Pulang Cepat';
            $status_persetujuan = 'Pending';
        } else {
            $status_pulang = 'Tepat Waktu';
            $status_persetujuan = null;
        }

        // Proses Foto (Base64)
        $foto = $request->foto;
        $foto = str_replace('data:image/jpeg;base64,', '', $foto);
        $foto = str_replace(' ', '+', $foto);
        $imageName = 'pulang_' . Auth::id() . '_' . time() . '.jpeg';
        Storage::disk('public')->put('absensi/' . $imageName, base64_decode($foto));

        $absensi->update([
            'waktu_pulang' => $now->toTimeString(),
            'foto_pulang' => 'absensi/' . $imageName,
            'lat_pulang' => $request->latitude,
            'long_pulang' => $request->longitude,
            'status_pulang' => $status_pulang,
            'alasan_pulang_cepat' => $request->alasan_pulang_cepat,
            'status_persetujuan_pulang' => $status_persetujuan,
        ]);

        return back()->with('success', 'Berhasil Absen Pulang!');
    }

    private function hitungJarakMeter($lat1, $lon1, $lat2, $lon2)
    {
        $earthRadius = 6371000; // Radius bumi dalam meter

        $latFrom = deg2rad($lat1);
        $lonFrom = deg2rad($lon1);
        $latTo = deg2rad($lat2);
        $lonTo = deg2rad($lon2);

        $latDelta = $latTo - $latFrom;
        $lonDelta = $lonTo - $lonFrom;

        $a = sin($latDelta / 2) * sin($latDelta / 2) +
             cos($latFrom) * cos($latTo) *
             sin($lonDelta / 2) * sin($lonDelta / 2);
        
        $c = 2 * atan2(sqrt($a), sqrt(1 - $a));

        return $earthRadius * $c;
    }

    public function riwayat(Request $request)
    {
        $filter_bulan = $request->query('bulan');
        
        if ($filter_bulan) {
            $tahun_ini = date('Y', strtotime($filter_bulan));
            $bulan_ini = date('m', strtotime($filter_bulan));
            $bulan_label = Carbon::parse($filter_bulan . '-01')->translatedFormat('F Y');
            $current_filter = $filter_bulan;
        } else {
            $bulan_ini = Carbon::now()->month;
            $tahun_ini = Carbon::now()->year;
            $bulan_label = Carbon::now()->translatedFormat('F Y');
            $current_filter = Carbon::now()->format('Y-m');
        }

        $riwayat = Absensi::where('user_id', Auth::id())
                          ->whereMonth('tanggal', $bulan_ini)
                          ->whereYear('tanggal', $tahun_ini)
                          ->orderBy('tanggal', 'desc')
                          ->get();

        return Inertia::render('Karyawan/RiwayatAbsensi', [
            'riwayat' => $riwayat,
            'bulan' => $bulan_label,
            'current_filter' => $current_filter
        ]);
    }

    public function adminIndex(Request $request)
    {
        $filter_tanggal = $request->query('tanggal');
        
        if ($filter_tanggal) {
            $tanggal_ini = Carbon::parse($filter_tanggal)->toDateString();
            $tanggal_label = Carbon::parse($filter_tanggal)->translatedFormat('l, d F Y');
            $current_filter = $filter_tanggal;
        } else {
            $tanggal_ini = Carbon::today()->toDateString();
            $tanggal_label = Carbon::today()->translatedFormat('l, d F Y');
            $current_filter = Carbon::today()->format('Y-m-d');
        }

        $absensi = Absensi::with('user')
                          ->where('tanggal', $tanggal_ini)
                          ->orderBy('waktu_datang', 'desc')
                          ->get();

        $bulan_ini = Carbon::parse($tanggal_ini)->month;
        $tahun_ini = Carbon::parse($tanggal_ini)->year;
        
        $rekap_bulan = Absensi::whereMonth('tanggal', $bulan_ini)
                              ->whereYear('tanggal', $tahun_ini)
                              ->get();

        return Inertia::render('Admin/SDM/Absensi', [
            'title' => 'Absensi & Kehadiran',
            'absensi' => $absensi,
            'rekap_bulan' => $rekap_bulan,
            'tanggal_label' => $tanggal_label,
            'current_filter' => $current_filter
        ]);
    }

    public function adminUpdate(Request $request, $id)
    {
        $request->validate([
            'waktu_datang' => 'nullable|string',
            'waktu_pulang' => 'nullable|string',
            'status' => 'required|in:hadir,terlambat,alpa',
            'tipe_kehadiran' => 'required|in:wfo,wfh',
        ]);

        $absensi = Absensi::findOrFail($id);
        $absensi->update([
            'waktu_datang' => $request->waktu_datang,
            'waktu_pulang' => $request->waktu_pulang,
            'status' => $request->status,
            'tipe_kehadiran' => $request->tipe_kehadiran,
        ]);

        return back()->with('success', 'Data absensi berhasil diupdate!');
    }
}
