<?php

namespace App\Http\Controllers\Atasan;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(\Illuminate\Http\Request $request): Response
    {
        $currentYear = date('Y');
        $kategori = $request->query('kategori', 'Global');

        $queryTotal = DB::table('laporans')->whereYear('tanggal', $currentYear);
        if ($kategori !== 'Global') $queryTotal->where('kategori', $kategori);
        $totalProduksi = $queryTotal->sum('tonase');

        $queryHarga = DB::table('laporans')->whereYear('tanggal', $currentYear)->where('harga_per_kg', '>', 0);
        if ($kategori !== 'Global') $queryHarga->where('kategori', $kategori);
        $rataRataHarga = $queryHarga->avg('harga_per_kg') ?? 0;

        $queryBulan = DB::table('laporans')
            ->selectRaw('MONTH(tanggal) as bulan, SUM(tonase) as total_produksi, SUM(total) as total_pendapatan')
            ->whereYear('tanggal', $currentYear);
        if ($kategori !== 'Global') $queryBulan->where('kategori', $kategori);
        $produksiPerBulan = $queryBulan->groupByRaw('MONTH(tanggal)')->orderBy('bulan')->get()->keyBy('bulan');

        $monthlyData = [];
        $bulanNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
        $q1 = $q2 = $q3 = $q4 = 0;
        $maxProduksi = 0;
        $minProduksi = PHP_INT_MAX;
        $maxBulan = '';
        $minBulan = '';
        $countActiveMonths = 0;

        for ($i = 1; $i <= 12; $i++) {
            $totalProd = isset($produksiPerBulan[$i]) ? (float) $produksiPerBulan[$i]->total_produksi : 0;
            $totalPend = isset($produksiPerBulan[$i]) ? (float) $produksiPerBulan[$i]->total_pendapatan : 0;
            $monthlyData[] = [
                'name' => $bulanNames[$i - 1],
                'produksi' => $totalProd,
                'pendapatan' => $totalPend,
            ];

            if ($totalProd > 0) {
                $countActiveMonths++;
                if ($totalProd > $maxProduksi) {
                    $maxProduksi = $totalProd;
                    $maxBulan = $bulanNames[$i - 1];
                }
                if ($totalProd < $minProduksi) {
                    $minProduksi = $totalProd;
                    $minBulan = $bulanNames[$i - 1];
                }
            }

            if ($i <= 3) $q1 += $totalPend;
            elseif ($i <= 6) $q2 += $totalPend;
            elseif ($i <= 9) $q3 += $totalPend;
            else $q4 += $totalPend;
        }

        if ($minProduksi == PHP_INT_MAX) {
            $minProduksi = 0;
            $minBulan = '-';
        }

        $rataRata = $countActiveMonths > 0 ? $totalProduksi / $countActiveMonths : 0;

        $quarterlyData = [
            ['name' => 'Q1 (Jan - Mar)', 'value' => $q1],
            ['name' => 'Q2 (Apr - Jun)', 'value' => $q2],
            ['name' => 'Q3 (Jul - Sep)', 'value' => $q3],
            ['name' => 'Q4 (Okt - Des)', 'value' => $q4],
        ];

        $queryRaw = DB::table('laporans')->select('tanggal', 'tonase', 'total')->orderBy('tanggal');
        if ($kategori !== 'Global') $queryRaw->where('kategori', $kategori);
        $rawChartData = $queryRaw->get();

        return Inertia::render('Atasan/Dashboard', [
            'data' => [
                'totalProduksi' => $totalProduksi,
                'rataRata' => $rataRata,
                'rataRataHarga' => (float) $rataRataHarga,
                'maxProduksi' => $maxProduksi,
                'maxBulan' => $maxBulan,
                'minProduksi' => $minProduksi,
                'minBulan' => $minBulan,
                'monthlyData' => $monthlyData,
                'quarterlyData' => $quarterlyData,
                'currentYear' => $currentYear,
                'rawChartData' => $rawChartData,
                'kategori' => $kategori
            ]
        ]);
    }
}
