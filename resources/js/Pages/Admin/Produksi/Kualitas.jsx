import { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';

export default function Kualitas({ auth, data, filters = {} }) {
    const listData = data?.kualitas || [];

    const currentBulan = filters?.bulan || (new Date().getMonth() + 1).toString();
    const currentTahun = filters?.tahun || new Date().getFullYear().toString();
    const [sortOrder, setSortOrder] = useState(''); // '', 'tertinggi', 'terendah'

    const handleFilterChange = (key, value) => {
        router.get('/produksi/kualitas', {
            bulan: key === 'bulan' ? value : currentBulan,
            tahun: key === 'tahun' ? value : currentTahun,
        }, { preserveState: true });
    };

    const sortedData = [...listData].sort((a, b) => {
        if (sortOrder === 'tertinggi') return (b.bjrAktual || 0) - (a.bjrAktual || 0);
        if (sortOrder === 'terendah') return (a.bjrAktual || 0) - (b.bjrAktual || 0);
        return 0;
    });

    return (
        <AuthenticatedLayout
            user={auth.user}
        >
            <Head title="Kualitas Produksi" />

            <div className="py-4 sm:py-12">
                <div className="w-full mx-auto sm:px-6 lg:px-8 space-y-6">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 xl:gap-0 px-6 py-5 border-b border-gray-100 bg-white flex-wrap">
                            <div>
                                <h3 className="text-2xl font-extrabold text-gray-900 tracking-tight">Data Kualitas BJR</h3>
                                <p className="mt-1 text-sm text-gray-500">Pantau performa rata-rata berat janjang (BJR) seluruh blok.</p>
                            </div>
                            
                            <div className="flex flex-col xl:flex-row gap-3 w-full xl:w-auto xl:items-center">
                                {/* Filter Card */}
                                <div className="bg-white border xl:border-none border-gray-200 rounded-xl p-3 sm:p-4 xl:p-0 w-full xl:w-auto">
                                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 xl:gap-2">
                                        <div className="grid grid-cols-2 gap-3 sm:flex sm:flex-row sm:gap-4 xl:gap-2 w-full sm:w-auto">
                                            <div className="flex flex-col w-full sm:w-36 xl:w-auto">
                                                <label className="xl:hidden text-[11px] font-medium text-slate-500 mb-1 ml-1">Bulan</label>
                                                <select value={currentBulan} onChange={(e) => handleFilterChange('bulan', e.target.value)} className="w-full xl:w-auto border-gray-300 rounded-xl shadow-sm focus:ring-emerald-500 focus:border-emerald-500 text-sm font-medium text-gray-700 bg-white">
                                                    <option value="1">Januari</option>
                                                    <option value="2">Februari</option>
                                                    <option value="3">Maret</option>
                                                    <option value="4">April</option>
                                                    <option value="5">Mei</option>
                                                    <option value="6">Juni</option>
                                                    <option value="7">Juli</option>
                                                    <option value="8">Agustus</option>
                                                    <option value="9">September</option>
                                                    <option value="10">Oktober</option>
                                                    <option value="11">November</option>
                                                    <option value="12">Desember</option>
                                                </select>
                                            </div>
                                            <div className="flex flex-col w-full sm:w-28 xl:w-auto">
                                                <label className="xl:hidden text-[11px] font-medium text-slate-500 mb-1 ml-1">Tahun</label>
                                                <select value={currentTahun} onChange={(e) => handleFilterChange('tahun', e.target.value)} className="w-full xl:w-auto border-gray-300 rounded-xl shadow-sm focus:ring-emerald-500 focus:border-emerald-500 text-sm font-medium text-gray-700 bg-white">
                                                    <option value="2024">2024</option>
                                                    <option value="2025">2025</option>
                                                    <option value="2026">2026</option>
                                                    <option value="2027">2027</option>
                                                </select>
                                            </div>
                                        </div>
                                        <div className="flex flex-col w-full sm:w-48 xl:w-auto">
                                            <label className="xl:hidden text-[11px] font-medium text-slate-500 mb-1 ml-1">Urutan</label>
                                            <select
                                                value={sortOrder}
                                                onChange={(e) => setSortOrder(e.target.value)}
                                                className="w-full xl:w-auto border-gray-300 rounded-xl shadow-sm focus:ring-emerald-500 focus:border-emerald-500 text-sm font-medium text-gray-700 bg-white"
                                            >
                                                <option value="">Urutan Default</option>
                                                <option value="tertinggi">BJR Tertinggi</option>
                                                <option value="terendah">BJR Terendah</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="overflow-auto w-full" style={{ maxHeight: '645px' }}>
                            <table className="w-full text-sm text-left text-gray-500">
                                <thead className="text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-200 bg-gray-50 sticky top-0 z-10">
                                    <tr>
                                        <th className="px-6 py-4 w-16">No</th>
                                        <th className="px-6 py-4">Blok</th>
                                        <th className="px-6 py-4 text-center">Total Janjang</th>
                                        <th className="px-6 py-4 text-center">Total Tonase (Kg)</th>
                                        <th className="px-6 py-4 text-center">BJR Aktual (Kg)</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {sortedData.map((item, index) => (
                                        <tr key={item.id} className="hover:bg-indigo-50/30 transition-colors duration-150 border-b border-gray-100">
                                            <td className="px-6 py-4">{index + 1}</td>
                                            <td className="px-6 py-4 font-bold text-gray-800">{item.blok}</td>
                                            <td className="px-6 py-4 text-center">{item.totalJanjang.toLocaleString('id-ID')}</td>
                                            <td className="px-6 py-4 text-center">{item.totalTonase.toLocaleString('id-ID')}</td>
                                            <td className="px-6 py-4 text-center font-bold text-emerald-600">{Number(item.bjrAktual || 0).toFixed(2)}</td>
                                        </tr>
                                    ))}
                                    {sortedData.length === 0 && (
                                        <tr>
                                            <td colSpan="5" className="px-6 py-8 text-center text-gray-400">
                                                Tidak ada data pada bulan {["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"][parseInt(currentBulan) - 1]} tahun {currentTahun}
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
