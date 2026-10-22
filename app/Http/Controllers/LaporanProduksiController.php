<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class LaporanProduksiController extends Controller
{
    private function getSummaryData($bulan, $tahun) {
        $monthFilterR = $bulan === 'all' ? "" : "MONTH(tanggal_panen) = " . (int)$bulan . " AND";

        $data = DB::select("
            SELECT
                COALESCE(SUM(r.total_aktual), 0) AS total_tonase_aktual
            FROM master_bloks m
            LEFT JOIN (
                SELECT blok_id, SUM(tonase_kg_aktual) as total_aktual
                FROM realisasi_harians
                WHERE $monthFilterR YEAR(tanggal_panen) = ?
                GROUP BY blok_id
            ) r ON m.id = r.blok_id
        ", [$tahun]);
        
        return [
            'totalAktual' => $data[0]->total_tonase_aktual ?? 0,
        ];
    }

    private function getPerBlokData($bulan, $tahun) {
        $monthFilterR = $bulan === 'all' ? "" : "MONTH(tanggal_panen) = " . (int)$bulan . " AND";

        $data = DB::select("
            SELECT
                m.id,
                m.kode_blok as namaBlok,
                m.kategori_kebun as kategori,
                m.luas_area_ha as luas,
                m.tahun_tanam as tahunTanam,
                m.jumlah_pokok as jumlahPokok,
                m.tandan_per_pokok as tandanPerPokok,
                m.rotasi as rotasi,
                COALESCE(r.total_aktual, 0) AS aktualTonase
            FROM master_bloks m
            LEFT JOIN (
                SELECT blok_id, SUM(tonase_kg_aktual) as total_aktual
                FROM realisasi_harians
                WHERE $monthFilterR YEAR(tanggal_panen) = ?
                GROUP BY blok_id
            ) r ON m.id = r.blok_id
        ", [$tahun]);
        return $data;
    }

    private function getHarianData($bulan, $tahun) {
        $data = DB::select("
            SELECT 
                r.tanggal_panen as tanggal,
                m.kode_blok as blok,
                SUM(r.janjang_aktual) AS janjang,
                SUM(r.tonase_kg_aktual) AS tonase,
                (SUM(r.tonase_kg_aktual) / NULLIF(SUM(r.janjang_aktual), 0)) AS bjrHarian
            FROM realisasi_harians r
            LEFT JOIN master_bloks m ON r.blok_id = m.id
            WHERE MONTH(r.tanggal_panen) = ? 
              AND YEAR(r.tanggal_panen) = ?
            GROUP BY r.tanggal_panen, m.kode_blok
            ORDER BY r.tanggal_panen ASC
        ", [$bulan, $tahun]);
        return $data;
    }

    private function getProduktivitasData($bulan, $tahun) {
        $data = DB::select("
            SELECT 
                m.id,
                m.kode_blok as blok,
                m.tahun_tanam as tahunTanam,
                m.luas_area_ha as luas,
                COALESCE(SUM(r.tonase_kg_aktual), 0) AS totalTonase,
                (COALESCE(SUM(r.tonase_kg_aktual), 0) / NULLIF(m.luas_area_ha, 0)) AS yieldAktual,
                6.0 as targetYield /* Placeholder target yield */
            FROM master_bloks m
            LEFT JOIN realisasi_harians r ON m.id = r.blok_id 
                AND MONTH(r.tanggal_panen) = ? 
                AND YEAR(r.tanggal_panen) = ?
            GROUP BY m.id, m.kode_blok, m.tahun_tanam, m.luas_area_ha
        ", [$bulan, $tahun]);
        return $data;
    }

    private function getKualitasData($bulan, $tahun) {
        return DB::select("
            SELECT 
                m.id,
                m.kode_blok as blok,
                COALESCE(SUM(r.janjang_aktual), 0) as totalJanjang,
                COALESCE(SUM(r.tonase_kg_aktual), 0) as totalTonase,
                (COALESCE(SUM(r.tonase_kg_aktual), 0) / NULLIF(SUM(r.janjang_aktual), 0)) as bjrAktual
            FROM master_bloks m
            LEFT JOIN realisasi_harians r ON m.id = r.blok_id
                AND MONTH(r.tanggal_panen) = ? 
                AND YEAR(r.tanggal_panen) = ?
            GROUP BY m.id, m.kode_blok
        ", [$bulan, $tahun]);
    }

    private function getMasterBloks() {
        return DB::table('master_bloks')->select('id', 'kode_blok')->orderBy('kode_blok')->get();
    }

    private function getRekapGabungan($bulan, $tahun) {
        return DB::select("
            SELECT 
                m.id,
                m.kode_blok as blok,
                m.kategori_kebun as kategori,
                m.luas_area_ha as luas,
                
                6.0 as targetYield,
                
                COALESCE(SUM(r.janjang_aktual), 0) as aktualJanjang,
                COALESCE(SUM(r.tonase_kg_aktual), 0) as aktualTonase,
                
                (COALESCE(SUM(r.tonase_kg_aktual), 0) / NULLIF(m.luas_area_ha, 0)) as yieldAktual,
                (COALESCE(SUM(r.tonase_kg_aktual), 0) / NULLIF(SUM(r.janjang_aktual), 0)) as bjrAktual
                
            FROM master_bloks m
            LEFT JOIN realisasi_harians r ON m.id = r.blok_id 
                AND MONTH(r.tanggal_panen) = ? 
                AND YEAR(r.tanggal_panen) = ?
            GROUP BY m.id, m.kode_blok, m.kategori_kebun, m.luas_area_ha
        ", [$bulan, $tahun]);
    }

    public function rekap(Request $request): Response
    {
        $bulan = $request->query('bulan', date('n'));
        $tahun = $request->query('tahun', date('Y'));

        return Inertia::render('Admin/Produksi/Rekap', [
            'data' => [
                'summary' => $this->getSummaryData($bulan, $tahun),
                'gabungan' => $this->getRekapGabungan($bulan, $tahun),
            ],
            'masterBloks' => $this->getMasterBloks(),
            'filters' => ['bulan' => $bulan, 'tahun' => $tahun]
        ]);
    }

    public function perBlok(Request $request): Response
    {
        $bulan = $request->query('bulan', date('n'));
        $tahun = $request->query('tahun', date('Y'));

        return Inertia::render('Admin/Produksi/PerBlok', [
            'data' => ['perBlok' => $this->getPerBlokData($bulan, $tahun)],
            'filters' => ['bulan' => $bulan, 'tahun' => $tahun]
        ]);
    }

    public function harian(Request $request): Response
    {
        $bulan = $request->query('bulan', date('n'));
        $tahun = $request->query('tahun', date('Y'));

        return Inertia::render('Admin/Produksi/Harian', [
            'data' => ['harian' => $this->getHarianData($bulan, $tahun)],
            'masterBloks' => $this->getMasterBloks(),
            'filters' => ['bulan' => $bulan, 'tahun' => $tahun]
        ]);
    }

    public function laporan(Request $request): Response
    {
        $bulan = $request->query('bulan', date('n'));
        $tahun = $request->query('tahun', date('Y'));
        $minggu = $request->query('minggu', 'all');
        $kategori = $request->query('kategori', 'Inti CSA');

        $monthFilter = $bulan === 'all' ? "" : "MONTH(tanggal) = " . (int)$bulan . " AND";
        
        $weekFilter = "";
        if ($minggu !== 'all') {
            $m = (int)$minggu;
            $startDay = ($m - 1) * 7 + 1;
            $endDay = $m * 7;
            if ($m == 5) {
                $weekFilter = "DAY(tanggal) >= 29 AND";
            } else {
                $weekFilter = "DAY(tanggal) BETWEEN $startDay AND $endDay AND";
            }
        }

        $data = DB::select("
            SELECT 
                id,
                tanggal,
                kategori,
                harga_per_kg,
                tonase,
                total
            FROM laporans
            WHERE $monthFilter $weekFilter YEAR(tanggal) = ? AND kategori = ?
            ORDER BY tanggal ASC
        ", [$tahun, $kategori]);

        $isLocked = false;
        if ($bulan !== 'all') {
            $lock = DB::table('laporan_locks')->where('bulan', $bulan)->where('tahun', $tahun)->first();
            if ($lock) {
                $isLocked = (bool) $lock->is_locked;
            }
        }

        return Inertia::render('Admin/Produksi/Laporan', [
            'data' => ['laporan' => $data],
            'filters' => ['bulan' => $bulan, 'tahun' => $tahun, 'minggu' => $minggu, 'kategori' => $kategori],
            'isLocked' => $isLocked
        ]);
    }

    public function storeLaporan(Request $request)
    {
        $request->validate([
            'tanggal' => 'required|date',
            'kategori' => 'required|string',
            'harga_per_kg' => 'required|numeric',
            'tonase' => 'required|numeric',
            'total' => 'nullable|numeric'
        ]);

        $reqBulan = date('n', strtotime($request->tanggal));
        $reqTahun = date('Y', strtotime($request->tanggal));
        $lock = DB::table('laporan_locks')->where('bulan', $reqBulan)->where('tahun', $reqTahun)->first();
        if ($lock && $lock->is_locked) {
            return redirect()->back()->with('error', 'Data pada bulan dan tahun tersebut sudah dikunci (locked)!');
        }

        $exists = DB::table('laporans')
            ->where('tanggal', $request->tanggal)
            ->where('kategori', $request->kategori)
            ->exists();

        if ($exists) {
            return redirect()->back()->with('error', 'Data pada tanggal dan kategori tersebut sudah ada!');
        }

        $total = round((float)$request->harga_per_kg * (float)$request->tonase, 2);

        DB::table('laporans')->insert([
            'tanggal' => $request->tanggal,
            'kategori' => $request->kategori,
            'harga_per_kg' => $request->harga_per_kg,
            'tonase' => $request->tonase,
            'total' => $total,
            'created_at' => now(),
            'updated_at' => now()
        ]);

        $this->logActivity('CREATE', 'Laporan Produksi', "Menambah laporan baru tanggal {$request->tanggal} kategori {$request->kategori}");

        return redirect()->back()->with('success', 'Data Laporan berhasil disimpan.');
    }

    public function updateLaporan(Request $request, $id)
    {
        $request->validate([
            'tanggal' => 'required|date',
            'kategori' => 'required|string',
            'harga_per_kg' => 'required|numeric',
            'tonase' => 'required|numeric',
            'total' => 'nullable|numeric'
        ]);

        $laporan = DB::table('laporans')->where('id', $id)->first();
        if ($laporan) {
            $reqBulan = date('n', strtotime($laporan->tanggal));
            $reqTahun = date('Y', strtotime($laporan->tanggal));
            $lock = DB::table('laporan_locks')->where('bulan', $reqBulan)->where('tahun', $reqTahun)->first();
            if ($lock && $lock->is_locked) {
                return redirect()->back()->with('error', 'Data pada bulan dan tahun tersebut sudah dikunci (locked)!');
            }
        }

        $reqBulanNew = date('n', strtotime($request->tanggal));
        $reqTahunNew = date('Y', strtotime($request->tanggal));
        $lockNew = DB::table('laporan_locks')->where('bulan', $reqBulanNew)->where('tahun', $reqTahunNew)->first();
        if ($lockNew && $lockNew->is_locked) {
            return redirect()->back()->with('error', 'Data tanggal baru berada pada bulan dan tahun yang sudah dikunci!');
        }

        $exists = DB::table('laporans')
            ->where('tanggal', $request->tanggal)
            ->where('kategori', $request->kategori)
            ->where('id', '!=', $id)
            ->exists();

        if ($exists) {
            return redirect()->back()->with('error', 'Data pada tanggal dan kategori tersebut sudah ada!');
        }

        $total = round((float)$request->harga_per_kg * (float)$request->tonase, 2);

        DB::table('laporans')->where('id', $id)->update([
            'tanggal' => $request->tanggal,
            'kategori' => $request->kategori,
            'harga_per_kg' => $request->harga_per_kg,
            'tonase' => $request->tonase,
            'total' => $total,
            'updated_at' => now()
        ]);

        $this->logActivity('UPDATE', 'Laporan Produksi', "Mengedit laporan ID {$id} tanggal {$request->tanggal}");

        return redirect()->back()->with('success', 'Data Laporan berhasil diperbarui.');
    }

    public function destroyLaporan($id)
    {
        $laporan = DB::table('laporans')->where('id', $id)->first();
        if ($laporan) {
            $reqBulan = date('n', strtotime($laporan->tanggal));
            $reqTahun = date('Y', strtotime($laporan->tanggal));
            $lock = DB::table('laporan_locks')->where('bulan', $reqBulan)->where('tahun', $reqTahun)->first();
            if ($lock && $lock->is_locked) {
                return redirect()->back()->with('error', 'Data pada bulan dan tahun tersebut sudah dikunci (locked)!');
            }
        }

        DB::table('laporans')->where('id', $id)->delete();
        
        $tglStr = $laporan ? $laporan->tanggal : '-';
        $this->logActivity('DELETE', 'Laporan Produksi', "Menghapus laporan ID {$id} tanggal {$tglStr}");
        
        return redirect()->back()->with('success', 'Data Laporan berhasil dihapus.');
    }

    public function produktivitas(Request $request): Response
    {
        $bulan = $request->query('bulan', date('n'));
        $tahun = $request->query('tahun', date('Y'));

        return Inertia::render('Admin/Produksi/Produktivitas', [
            'data' => ['produktivitas' => $this->getProduktivitasData($bulan, $tahun)],
            'masterBloks' => $this->getMasterBloks(),
            'filters' => ['bulan' => $bulan, 'tahun' => $tahun]
        ]);
    }

    public function kualitas(Request $request): Response
    {
        $bulan = $request->query('bulan', date('n'));
        $tahun = $request->query('tahun', date('Y'));

        return Inertia::render('Admin/Produksi/Kualitas', [
            'data' => ['kualitas' => $this->getKualitasData($bulan, $tahun)],
            'masterBloks' => $this->getMasterBloks(),
            'filters' => ['bulan' => $bulan, 'tahun' => $tahun]
        ]);
    }

    public function storeBlok(Request $request)
    {
        $request->validate([
            'namaBlok' => 'required|string',
            'kategori' => 'required|string',
            'luas' => 'required|numeric',
            'tahunTanam' => 'nullable|integer',
            'jumlahPokok' => 'nullable|integer',
            'tandanPerPokok' => 'nullable|numeric',
            'rotasi' => 'nullable|integer'
        ]);

        $blok = DB::table('master_bloks')->where('kode_blok', $request->namaBlok)->first();
        $blokId = null;

        if (!$blok) {
            $blokId = DB::table('master_bloks')->insertGetId([
                'kode_blok' => $request->namaBlok,
                'kategori_kebun' => $request->kategori,
                'luas_area_ha' => $request->luas,
                'tahun_tanam' => $request->tahunTanam ?? date('Y'),
                'jumlah_pokok' => $request->jumlahPokok ?? 0,
                'tandan_per_pokok' => $request->tandanPerPokok ?? 0,
                'rotasi' => $request->rotasi ?? 0,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        } else {
            $blokId = $blok->id;
            DB::table('master_bloks')->where('id', $blokId)->update([
                'luas_area_ha' => $request->luas,
                'kategori_kebun' => $request->kategori,
                'tahun_tanam' => $request->tahunTanam ?? $blok->tahun_tanam,
                'jumlah_pokok' => $request->jumlahPokok ?? $blok->jumlah_pokok,
                'tandan_per_pokok' => $request->tandanPerPokok ?? $blok->tandan_per_pokok,
                'rotasi' => $request->rotasi ?? $blok->rotasi,
                'updated_at' => now(),
            ]);
        }

        if ($request->aktualTonase) {
            DB::table('realisasi_harians')->insert([
                'blok_id' => $blokId,
                'tanggal_panen' => date('Y-m-d'),
                'janjang_aktual' => 0,
                'tonase_kg_aktual' => $request->aktualTonase,
                'created_at' => now(),
                'updated_at' => now()
            ]);
        }

        return redirect()->back()->with('success', 'Data Blok berhasil disimpan.');
    }

    public function updateBlok(Request $request, $id) {
        $request->validate([
            'namaBlok' => 'required|string',
            'kategori' => 'required|string',
            'luas' => 'required|numeric',
            'tahunTanam' => 'nullable|integer',
            'jumlahPokok' => 'nullable|integer',
            'tandanPerPokok' => 'nullable|numeric',
            'rotasi' => 'nullable|integer'
        ]);

        DB::table('master_bloks')->where('id', $id)->update([
            'kode_blok' => $request->namaBlok,
            'kategori_kebun' => $request->kategori,
            'luas_area_ha' => $request->luas,
            'tahun_tanam' => $request->tahunTanam ?? date('Y'),
            'jumlah_pokok' => $request->jumlahPokok ?? 0,
            'tandan_per_pokok' => $request->tandanPerPokok ?? 0,
            'rotasi' => $request->rotasi ?? 0,
            'updated_at' => now(),
        ]);

        return redirect()->back()->with('success', 'Data Blok berhasil diperbarui.');
    }

    public function destroyBlok($id) {
        DB::table('master_bloks')->where('id', $id)->delete();
        DB::table('realisasi_harians')->where('blok_id', $id)->delete();
        return redirect()->back()->with('success', 'Data Blok berhasil dihapus.');
    }

    public function storeHarian(Request $request)
    {
        $request->validate([
            'blok_id' => 'required|exists:master_bloks,id',
            'tanggal' => 'required|date',
            'janjang' => 'required|numeric',
            'tonase' => 'required|numeric'
        ]);

        DB::table('realisasi_harians')->insert([
            'blok_id' => $request->blok_id,
            'tanggal_panen' => $request->tanggal,
            'janjang_aktual' => $request->janjang ?? 0,
            'tonase_kg_aktual' => $request->tonase,
            'created_at' => now(),
            'updated_at' => now()
        ]);

        return redirect()->back()->with('success', 'Data Harian berhasil disimpan.');
    }


    public function storeProduktivitas(Request $request) {
        $blok = DB::table('master_bloks')->where('kode_blok', $request->blok)->first();
        if($blok && $request->totalTonase) {
            DB::table('realisasi_harians')->insert([
                'blok_id' => $blok->id,
                'tanggal_panen' => date('Y-m-d'),
                'janjang_aktual' => 0,
                'tonase_kg_aktual' => $request->totalTonase,
                'created_at' => now(),
                'updated_at' => now()
            ]);
        }
        return redirect()->back()->with('success', 'Data disimpan.');
    }

    public function storeKualitas(Request $request) {
        $blok = DB::table('master_bloks')->where('kode_blok', $request->blok)->first();
        if($blok && $request->totalTonase) {
            DB::table('realisasi_harians')->insert([
                'blok_id' => $blok->id,
                'tanggal_panen' => date('Y-m-d'),
                'janjang_aktual' => $request->totalJanjang ?? 0,
                'tonase_kg_aktual' => $request->totalTonase,
                'created_at' => now(),
                'updated_at' => now()
            ]);
        }
        return redirect()->back()->with('success', 'Data disimpan.');
    }

    public function updateRekap(Request $request, $id) {
        $request->validate([
            'luas' => 'required|numeric',
            'targetTonase' => 'required|numeric',
            'aktualTonase' => 'required|numeric',
            'targetBjr' => 'required|numeric',
            'aktualJanjang' => 'required|numeric',
        ]);

        // Update master_bloks
        DB::table('master_bloks')->where('id', $id)->update([
            'luas_area_ha' => $request->luas,
            'updated_at' => now(),
        ]);

        // Update realisasi_harians
        $realisasi = DB::table('realisasi_harians')
            ->where('blok_id', $id)
            ->whereMonth('tanggal_panen', date('n'))
            ->whereYear('tanggal_panen', date('Y'))
            ->first();

        if ($realisasi) {
            DB::table('realisasi_harians')->where('id', $realisasi->id)->update([
                'tonase_kg_aktual' => $request->aktualTonase,
                'janjang_aktual' => $request->aktualJanjang,
                'updated_at' => now()
            ]);
        } else {
            DB::table('realisasi_harians')->insert([
                'blok_id' => $id,
                'tanggal_panen' => date('Y-m-d'),
                'tonase_kg_aktual' => $request->aktualTonase,
                'janjang_aktual' => $request->aktualJanjang,
                'created_at' => now(),
                'updated_at' => now()
            ]);
        }

        return redirect()->back()->with('success', 'Data rekap berhasil diperbarui.');
    }

    public function destroyRekap($id) {
        DB::table('master_bloks')->where('id', $id)->delete();
        return redirect()->back()->with('success', 'Data blok beserta relasinya berhasil dihapus.');
    }

    public function importHarian(Request $request) {
        $data = $request->input('data', []);
        foreach ($data as $row) {
            $blok = DB::table('master_bloks')->where('kode_blok', $row['blok'] ?? '')->first();
            if ($blok && isset($row['tanggal']) && isset($row['tonase']) && isset($row['janjang'])) {
                DB::table('realisasi_harians')->updateOrInsert(
                    ['blok_id' => $blok->id, 'tanggal_panen' => $row['tanggal']],
                    [
                        'tonase_kg_aktual' => $row['tonase'],
                        'janjang_aktual' => $row['janjang'],
                        'updated_at' => now()
                    ]
                );
            }
        }
        return redirect()->back()->with('success', 'Data Excel Harian berhasil di-import.');
    }

    public function importPerBlok(Request $request) {
        $data = $request->input('data', []);
        foreach ($data as $row) {
            if (!isset($row['namaBlok']) || !isset($row['luas'])) continue;
            
            DB::table('master_bloks')->updateOrInsert(
                ['kode_blok' => $row['namaBlok']],
                [
                    'kategori_kebun' => $row['kategori'] ?? 'Inti',
                    'luas_area_ha' => $row['luas'],
                    'tahun_tanam' => $row['tahunTanam'] ?? date('Y'),
                    'jumlah_pokok' => $row['jumlahPokok'] ?? 0,
                    'tandan_per_pokok' => $row['tandanPerPokok'] ?? 0,
                    'rotasi' => $row['rotasi'] ?? 0,
                    'updated_at' => now()
                ]
            );
        }
        return redirect()->back()->with('success', 'Data Excel Master Blok berhasil di-import.');
    }

    public function importLaporan(Request $request) {
        $data = $request->input('data', []);
        $kategori = $request->input('kategori', 'Inti CSA');
        $bulan = $request->input('bulan');
        $tahun = $request->input('tahun');
        
        if ($bulan && $tahun && $bulan !== 'all') {
            $lock = DB::table('laporan_locks')->where('bulan', $bulan)->where('tahun', $tahun)->first();
            if ($lock && $lock->is_locked) {
                return redirect()->back()->with('error', 'Data pada bulan dan tahun tersebut sudah dikunci (locked)!');
            }
        }

        $insertedCount = 0;
        foreach ($data as $row) {
            if (isset($row['tanggal']) && isset($row['harga_per_kg']) && isset($row['tonase'])) {
                $tanggal = $row['tanggal'];

                // Filter data berdasarkan bulan dan tahun yang dipilih
                if ($bulan && $tahun && $bulan !== 'all') {
                    $rowBulan = date('n', strtotime($tanggal));
                    $rowTahun = date('Y', strtotime($tanggal));
                    
                    if ($rowBulan != $bulan || $rowTahun != $tahun) {
                        continue; // Lewati jika tidak sesuai bulan & tahun yang dipilih
                    }
                }

                DB::table('laporans')->updateOrInsert(
                    ['tanggal' => $tanggal, 'kategori' => $kategori],
                    [
                        'harga_per_kg' => $row['harga_per_kg'],
                        'tonase' => $row['tonase'],
                        'total' => $row['harga_per_kg'] * $row['tonase'],
                        'updated_at' => now()
                    ]
                );
                $insertedCount++;
            }
        }
        
        if ($insertedCount > 0) {
            $this->logActivity('CREATE', 'Laporan Produksi', "Mengimport data Excel laporan sebanyak {$insertedCount} baris");
        }

        return redirect()->back()->with('success', "Data Excel Laporan berhasil di-import ($insertedCount data).");
    }

    public function toggleLockLaporan(Request $request)
    {
        $bulan = $request->input('bulan');
        $tahun = $request->input('tahun');

        if (!$bulan || !$tahun || $bulan === 'all') {
            return redirect()->back()->with('error', 'Pilih bulan dan tahun spesifik untuk melakukan lock/unlock.');
        }

        $lock = DB::table('laporan_locks')->where('bulan', $bulan)->where('tahun', $tahun)->first();
        
        if ($lock) {
            $newStatus = !$lock->is_locked;
            DB::table('laporan_locks')->where('id', $lock->id)->update([
                'is_locked' => $newStatus,
                'updated_at' => now()
            ]);
            $statusStr = $newStatus ? 'dikunci' : 'dibuka';
        } else {
            DB::table('laporan_locks')->insert([
                'bulan' => $bulan,
                'tahun' => $tahun,
                'is_locked' => true,
                'created_at' => now(),
                'updated_at' => now()
            ]);
            $statusStr = 'dikunci';
        }

        $this->logActivity('UPDATE', 'Lock Laporan', "Status lock bulan {$bulan} tahun {$tahun} diubah menjadi " . strtoupper($statusStr));

        return redirect()->back()->with('success', "Data bulan $bulan tahun $tahun berhasil $statusStr.");
    }
}

