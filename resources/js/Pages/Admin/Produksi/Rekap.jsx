import { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router } from '@inertiajs/react';
import Modal from '@/Components/Modal';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import Swal from 'sweetalert2';

export default function Rekap({ auth, data, masterBloks = [], filters = {} }) {
    const currentBulan = filters?.bulan || (new Date().getMonth() + 1).toString();
    const currentTahun = filters?.tahun || new Date().getFullYear().toString();

    const handleFilterChange = (key, value) => {
        router.get('/produksi/rekap', {
            bulan: key === 'bulan' ? value : currentBulan,
            tahun: key === 'tahun' ? value : currentTahun,
        }, { preserveState: true });
    };

    const summary = data?.summary || {
        totalAktual: 125000
    };

    const gabungan = data?.gabungan || [];

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('Semua');

    const filteredGabungan = gabungan.filter(item => {
        const matchSearch = item.blok.toLowerCase().includes(searchTerm.toLowerCase());
        return matchSearch;
    });

    // Computed summary stats from filteredGabungan
    const totalAktual = filteredGabungan.reduce((s, i) => s + (parseFloat(i.aktualTonase) || 0), 0);
    const totalHa = filteredGabungan.reduce((s, i) => s + (parseFloat(i.luas) || 0), 0);
    const yieldRata = totalHa > 0 ? (totalAktual / 1000) / totalHa : 0;
    const bjrItems = filteredGabungan.filter(i => parseFloat(i.bjrAktual) > 0);
    const bjrRata = bjrItems.length > 0 ? bjrItems.reduce((s, i) => s + parseFloat(i.bjrAktual), 0) / bjrItems.length : 0;



    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const { data: editData, setData: setEditData, put, processing: editProcessing, reset: editReset } = useForm({
        id: '',
        luas: '',
        aktualTonase: '',
        aktualJanjang: ''
    });

    const handleEditClick = (item) => {
        setEditData({
            id: item.id,
            luas: item.luas,
            aktualTonase: item.aktualTonase,
            aktualJanjang: item.aktualJanjang || 0
        });
        setIsEditModalOpen(true);
    };

    const submitEdit = (e) => {
        e.preventDefault();
        put(`/produksi/rekap/${editData.id}`, {
            onSuccess: () => {
                setIsEditModalOpen(false);
                editReset();
            }
        });
    };

    const handleDeleteClick = (id) => {
        Swal.fire({
            title: 'Hapus Data?',
            text: "Data laporan yang dihapus tidak dapat dikembalikan!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#9ca3af',
            confirmButtonText: 'Ya, Hapus!',
            cancelButtonText: 'Batal'
        }).then((result) => {
            if (result.isConfirmed) {
                router.delete(`/produksi/rekap/${id}`);
            }
        });
    };



    return (
        <AuthenticatedLayout
            user={auth.user}
        >
            <Head title="Rekap Produksi" />

            <div className="py-4 sm:py-12">
                <div className="w-full mx-auto sm:px-6 lg:px-8 space-y-6">
                    
                    <div className="flex justify-between items-center">
                        <div>
                            <h3 className="text-2xl font-extrabold text-gray-900 tracking-tight">Dashboard Rekap Produksi</h3>
                            <p className="mt-1 text-sm text-gray-500">Ringkasan performa produksi per blok.</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                        {/* Card 1: Total Aktual */}
                        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6 border-l-4 border-indigo-500">
                            <div className="text-gray-500 text-sm font-medium uppercase tracking-wider">Total Panen</div>
                            <div className="text-3xl font-bold text-gray-900 mt-2">
                                {Number(summary.totalAktual || totalAktual).toLocaleString('id-ID')} <span className="text-sm font-normal text-gray-500">Kg</span>
                            </div>
                        </div>

                        {/* Card 2: Panen Rata-rata/Ha */}
                        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6 border-l-4 border-emerald-500">
                            <div className="text-gray-500 text-sm font-medium uppercase tracking-wider">Panen Rata-rata/Hektar</div>
                            <div className="text-3xl font-bold text-gray-900 mt-2">
                                {yieldRata.toFixed(3)} <span className="text-sm font-normal text-gray-500">Ton/Ha</span>
                            </div>
                        </div>

                        {/* Card 3: BJR Rata-rata */}
                        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6 border-l-4 border-amber-500">
                            <div className="text-gray-500 text-sm font-medium uppercase tracking-wider">BJR Rata-rata</div>
                            <div className="text-3xl font-bold text-gray-900 mt-2">
                                {bjrRata.toFixed(2)} <span className="text-sm font-normal text-gray-500">Kg/Janjang</span>
                            </div>
                        </div>
                    </div>

                    {/* TABEL MASTER REKAP */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="px-6 py-5 border-b border-gray-100 bg-white flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <h3 className="text-lg font-bold text-gray-800">Detail Rekapitulasi Produksi Per Blok</h3>
                            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                                <select value={currentBulan} onChange={(e) => handleFilterChange('bulan', e.target.value)} className="border-gray-300 rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm text-gray-700 bg-white w-full sm:w-36">
                                    <option value="all">Semua Bulan</option>
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
                                <select value={currentTahun} onChange={(e) => handleFilterChange('tahun', e.target.value)} className="border-gray-300 rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm text-gray-700 bg-white w-full sm:w-28">
                                    <option value="2024">2024</option>
                                    <option value="2025">2025</option>
                                    <option value="2026">2026</option>
                                    <option value="2027">2027</option>
                                </select>
                                <input 
                                    type="text" 
                                    placeholder="Cari Blok..." 
                                    className="border-gray-300 rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm w-full sm:w-48"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="overflow-auto w-full" style={{ maxHeight: '645px' }}>
                            <table className="w-full text-sm text-left text-gray-600 whitespace-nowrap">
                                <thead className="sticky top-0 z-10">
                                    <tr className="text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-200 bg-gray-50">
                                        <th className="px-6 py-4 w-16">No</th>
                                        <th className="px-6 py-4">Blok</th>
                                        <th className="px-6 py-4 text-center">Luas (Ha)</th>
                                        <th className="px-6 py-4 text-center">Total Panen (Kg)</th>
                                        <th className="px-6 py-4 text-center">Panen (Ton/Ha)</th>
                                        <th className="px-6 py-4 text-center">BJR Aktual</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {filteredGabungan.length > 0 ? filteredGabungan.map((item, index) => {
                                        const luas = parseFloat(item.luas) || 0;
                                        const tonase = parseFloat(item.aktualTonase) || 0;
                                        const yieldTonHa = luas > 0 ? (tonase / 1000) / luas : 0;
                                        
                                        return (
                                            <tr key={item.id} className="hover:bg-indigo-50/30 transition-colors duration-150">
                                                <td className="px-6 py-4">{index + 1}</td>
                                                <td className="px-6 py-4 font-bold text-gray-800">{item.blok}</td>
                                                <td className="px-6 py-4 text-center">{item.luas}</td>
                                                <td className="px-6 py-4 text-center font-bold text-gray-900">{Number(item.aktualTonase).toLocaleString('id-ID')}</td>
                                                <td className="px-6 py-4 text-center font-bold text-emerald-700">{yieldTonHa.toFixed(3)}</td>
                                                <td className="px-6 py-4 text-center font-bold text-gray-900">{Number(item.bjrAktual || 0).toFixed(2)}</td>
                                            </tr>
                                        );
                                    }) : (
                                        <tr>
                                            <td colSpan="6" className="px-6 py-12 text-center text-gray-400 font-medium text-base">Tidak ada data ditemukan</td>
                                        </tr>
                                    )}
                                </tbody>
                                {filteredGabungan.length > 0 && (
                                    <tfoot className="sticky bottom-0 z-10">
                                        <tr className="bg-gray-50 border-t-2 border-gray-300">
                                            <td colSpan="3" className="px-6 py-4 text-right font-bold text-gray-800 uppercase tracking-wider text-sm">Total</td>
                                            <td className="px-6 py-4 text-center font-extrabold text-emerald-700 text-base">
                                                {new Intl.NumberFormat('id-ID').format(
                                                    filteredGabungan.reduce((sum, item) => sum + (parseFloat(item.aktualTonase) || 0), 0)
                                                )} Kg
                                            </td>
                                            <td className="px-6 py-4 text-center font-bold text-gray-500 text-sm">
                                                {(() => {
                                                    const totalTon = filteredGabungan.reduce((s, i) => s + (parseFloat(i.aktualTonase) || 0), 0) / 1000;
                                                    const totalHa = filteredGabungan.reduce((s, i) => s + (parseFloat(i.luas) || 0), 0);
                                                    return totalHa > 0 ? (totalTon / totalHa).toFixed(3) : '0.000';
                                                })()} Ton/Ha
                                            </td>
                                            <td className="px-6 py-4 text-center font-bold text-gray-500 text-sm">
                                                {(() => {
                                                    const items = filteredGabungan.filter(i => parseFloat(i.bjrAktual) > 0);
                                                    const avg = items.length > 0 ? items.reduce((s, i) => s + parseFloat(i.bjrAktual), 0) / items.length : 0;
                                                    return avg.toFixed(2);
                                                })()} Kg/Jjg
                                            </td>
                                        </tr>
                                    </tfoot>
                                )}
                            </table>
                        </div>
                    </div>
                </div>
            </div>



            {/* Modal Edit */}
            <Modal show={isEditModalOpen} onClose={() => setIsEditModalOpen(false)}>
                <div className="p-6">
                    <h2 className="text-lg font-medium text-gray-900 mb-4">Edit Data Rekap Produksi</h2>
                    <form onSubmit={submitEdit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Luas Area (Ha)</label>
                                <input type="number" step="0.01" value={editData.luas} onChange={e => setEditData('luas', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm" required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Aktual Janjang</label>
                                <input type="number" value={editData.aktualJanjang} onChange={e => setEditData('aktualJanjang', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm" required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Aktual Tonase (Kg)</label>
                                <input type="number" step="0.01" value={editData.aktualTonase} onChange={e => setEditData('aktualTonase', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm" required />
                            </div>
                        </div>
                        <div className="mt-6 flex justify-end gap-3">
                            <SecondaryButton type="button" onClick={() => setIsEditModalOpen(false)}>
                                Batal
                            </SecondaryButton>
                            <button type="submit" disabled={editProcessing} className="inline-flex items-center px-4 py-2 bg-indigo-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-indigo-700 focus:bg-indigo-700 active:bg-indigo-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition ease-in-out duration-150 disabled:opacity-50">
                                Simpan Perubahan
                            </button>
                        </div>
                    </form>
                </div>
            </Modal>
        </AuthenticatedLayout>
    );
}
