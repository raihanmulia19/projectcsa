import { useState, useRef } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router } from '@inertiajs/react';
import Modal from '@/Components/Modal';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import * as XLSX from 'xlsx';
import Swal from 'sweetalert2';

export default function PerBlok({ auth, data, filters = {} }) {
    const listData = (data?.perBlok && data.perBlok.length > 0) ? data.perBlok : [];

    const currentBulan = filters?.bulan || (new Date().getMonth() + 1).toString();
    const currentTahun = filters?.tahun || new Date().getFullYear().toString();

    const handleFilterChange = (key, value) => {
        router.get('/produksi/blok', {
            bulan: key === 'bulan' ? value : currentBulan,
            tahun: key === 'tahun' ? value : currentTahun,
        }, { preserveState: true });
    };

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [filterKategori, setFilterKategori] = useState('Semua');

    const filteredData = listData.filter(item => {
        if (filterKategori === 'Semua') return true;
        return item.kategori?.toLowerCase() === filterKategori.toLowerCase();
    });

    const { data: formData, setData, post, processing, reset } = useForm({
        namaBlok: '',
        kategori: 'Inti',
        luas: '',
        tahunTanam: '',
        jumlahPokok: '',
        tandanPerPokok: '',
        rotasi: ''
    });

    const handleFormCalculate = (field, value) => {
        const newData = { ...formData, [field]: value };
        setData(newData);
    };

    const submit = (e) => {
        e.preventDefault();
        post('/produksi/perblok', {
            onSuccess: () => {
                reset();
                setIsModalOpen(false);
            },
        });
    };

    const { data: editData, setData: setEditData, put, processing: editProcessing, reset: editReset } = useForm({
        id: '',
        namaBlok: '',
        kategori: '',
        luas: '',
        tahunTanam: '',
        jumlahPokok: '',
        tandanPerPokok: '',
        rotasi: ''
    });

    const handleEditClick = (item) => {
        setEditData({
            id: item.id,
            namaBlok: item.namaBlok,
            kategori: item.kategori,
            luas: item.luas,
            tahunTanam: item.tahunTanam,
            jumlahPokok: item.jumlahPokok,
            tandanPerPokok: item.tandanPerPokok,
            rotasi: item.rotasi
        });
        setIsEditModalOpen(true);
    };

    const submitEdit = (e) => {
        e.preventDefault();
        put(`/produksi/perblok/${editData.id}`, {
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
                router.delete(`/produksi/perblok/${id}`);
            }
        });
    };

    const fileInputRef = useRef(null);

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (evt) => {
            const bstr = evt.target.result;
            const wb = XLSX.read(bstr, { type: 'binary' });
            const wsname = wb.SheetNames[0];
            const ws = wb.Sheets[wsname];
            const data = XLSX.utils.sheet_to_json(ws);

            const formattedData = data.map(row => ({
                namaBlok: row['Blok'] || row['blok'],
                kategori: row['Kategori'] || row['kategori'],
                luas: row['Luas'] || row['luas'],
                tahunTanam: row['Tahun Tanam'] || row['tahun_tanam'],
                jumlahPokok: row['Jumlah Pokok'] || row['jumlah_pokok'],
                tandanPerPokok: row['Tandan Per Pokok'] || row['tandan_per_pokok'],
                rotasi: row['Rotasi'] || row['rotasi']
            }));

            router.post('/produksi/perblok/import', { data: formattedData }, {
                onSuccess: () => {
                    if (fileInputRef.current) fileInputRef.current.value = '';
                    alert('Data Excel berhasil di-import!');
                }
            });
        };
        reader.readAsBinaryString(file);
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
        >
            <Head title="Produksi Per Blok" />

            <div className="py-4 sm:py-12">
                <div className="w-full mx-auto sm:px-6 lg:px-8 space-y-6">
                    {/* Header with Title and Filters */}
                    <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 xl:gap-0 mb-6">
                        <div>
                            <h3 className="text-2xl font-extrabold text-gray-900 tracking-tight">Data Produksi Per Blok</h3>
                            <p className="mt-1 text-sm text-gray-500">Kelola master data area dan target produksi per blok.</p>
                        </div>
                        
                        <div className="flex flex-col xl:flex-row gap-3 xl:gap-2 w-full xl:w-auto xl:items-center">
                            {/* Filter Card */}
                            <div className="bg-white border xl:border-none border-gray-200 rounded-xl p-3 sm:p-4 xl:p-0 w-full xl:w-auto">
                                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 xl:gap-2">
                                    <div className="grid grid-cols-2 gap-3 sm:flex sm:flex-row sm:gap-4 xl:gap-2">
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
                                        <label className="xl:hidden text-[11px] font-medium text-slate-500 mb-1 ml-1">Kategori</label>
                                        <select 
                                            className="w-full xl:w-auto border-gray-300 rounded-xl shadow-sm focus:ring-emerald-500 focus:border-emerald-500 text-sm font-medium text-gray-700 bg-white"
                                            value={filterKategori}
                                            onChange={(e) => setFilterKategori(e.target.value)}
                                        >
                                            <option value="Semua">Semua Kategori</option>
                                            <option value="Inti">Inti</option>
                                            <option value="Agrinas">Agrinas</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Buttons */}
                            <div className="grid grid-cols-2 sm:flex sm:justify-end xl:items-center gap-3 xl:gap-2 w-full xl:w-auto">
                                <input type="file" accept=".xlsx, .xls" ref={fileInputRef} onChange={handleFileUpload} className="hidden" />
                                <button onClick={() => fileInputRef.current?.click()} className="w-full sm:w-auto justify-center xl:justify-start inline-flex items-center px-4 py-2.5 bg-white border border-gray-300 rounded-xl font-bold text-xs text-gray-700 uppercase tracking-wider shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-200">
                                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>
                                    Import Excel
                                </button>
                                <button onClick={() => setIsModalOpen(true)} className="w-full sm:w-auto justify-center xl:justify-start inline-flex items-center px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-green-600 border border-transparent rounded-xl font-bold text-xs text-white uppercase tracking-wider shadow-sm hover:shadow-md hover:from-emerald-600 hover:to-green-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transform transition-all duration-200 hover:-translate-y-0.5">
                                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
                                    Input Blok
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Data Table */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="overflow-x-auto w-full">
                            <table className="w-full text-sm text-left text-gray-500">
                                <thead className="text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-200 bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-4 w-16">No</th>
                                        <th className="px-6 py-4">Nama Blok</th>
                                        <th className="px-6 py-4">Kategori</th>
                                        <th className="px-6 py-4 text-center">Tahun Tanam</th>
                                        <th className="px-6 py-4 text-center">Luas (HA)</th>
                                        <th className="px-6 py-4 text-center">Pokok</th>
                                        <th className="px-6 py-4 text-center">Tandan/Pokok</th>
                                        <th className="px-6 py-4 text-center">Rotasi</th>
                                        <th className="px-6 py-4 text-center">Aktual Tonase (Kg)</th>
                                        <th className="px-6 py-4 text-center">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredData.map((item, index) => {
                                        return (
                                            <tr key={item.id} className="hover:bg-indigo-50/30 transition-colors duration-150 border-b border-gray-100">
                                                <td className="px-6 py-4">{index + 1}</td>
                                                <td className="px-6 py-4 font-bold text-gray-800">{item.namaBlok}</td>
                                                <td className="px-6 py-4">{item.kategori}</td>
                                                <td className="px-6 py-4 text-center">{item.tahunTanam}</td>
                                                <td className="px-6 py-4 text-center">{item.luas}</td>
                                                <td className="px-6 py-4 text-center">{item.jumlahPokok}</td>
                                                <td className="px-6 py-4 text-center">{item.tandanPerPokok}</td>
                                                <td className="px-6 py-4 text-center">{item.rotasi}</td>
                                                <td className="px-6 py-4 text-center font-bold text-gray-900">{item.aktualTonase}</td>
                                                <td className="px-6 py-4 text-center space-x-2">
                                                    <button onClick={() => handleEditClick(item)} className="text-emerald-600 hover:text-emerald-900" title="Edit">
                                                        <svg className="w-5 h-5 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                                                    </button>
                                                    <button onClick={() => handleDeleteClick(item.id)} className="text-rose-600 hover:text-rose-900" title="Hapus">
                                                        <svg className="w-5 h-5 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal Form */}
            <Modal show={isModalOpen} onClose={() => setIsModalOpen(false)}>
                <div className="p-6">
                    <h2 className="text-lg font-medium text-gray-900 mb-4">Input Data Per Blok</h2>
                    <form onSubmit={submit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Nama Blok</label>
                                <input type="text" value={formData.namaBlok} onChange={e => setData('namaBlok', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Kategori</label>
                                <select value={formData.kategori} onChange={e => setData('kategori', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm">
                                    <option value="Inti">Inti</option>
                                    <option value="Agrinas">Agrinas</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Tahun Tanam</label>
                                <input type="number" value={formData.tahunTanam} onChange={e => setData('tahunTanam', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Luas (HA)</label>
                                <input type="number" step="0.01" value={formData.luas} onChange={e => setData('luas', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Jumlah Pokok</label>
                                <input type="number" value={formData.jumlahPokok} onChange={e => handleFormCalculate('jumlahPokok', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Tandan Per Pokok</label>
                                <input type="number" step="0.01" value={formData.tandanPerPokok} onChange={e => handleFormCalculate('tandanPerPokok', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Rotasi</label>
                                <input type="number" value={formData.rotasi} onChange={e => handleFormCalculate('rotasi', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
                            </div>
                        </div>
                        <div className="mt-6 flex justify-end gap-3">
                            <SecondaryButton onClick={() => setIsModalOpen(false)}>
                                Batal
                            </SecondaryButton>
                            <button type="submit" disabled={processing} className="inline-flex items-center px-4 py-2 bg-green-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-green-700 focus:bg-green-700 active:bg-green-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition ease-in-out duration-150 disabled:opacity-50">
                                Simpan Data
                            </button>
                        </div>
                    </form>
                </div>
            </Modal>

            {/* Modal Edit */}
            <Modal show={isEditModalOpen} onClose={() => setIsEditModalOpen(false)}>
                <div className="p-6">
                    <h2 className="text-lg font-medium text-gray-900 mb-4">Edit Data Blok</h2>
                    <form onSubmit={submitEdit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Nama Blok</label>
                                <input type="text" value={editData.namaBlok} onChange={e => setEditData('namaBlok', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Kategori</label>
                                <select value={editData.kategori} onChange={e => setEditData('kategori', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm">
                                    <option value="Inti">Inti</option>
                                    <option value="Agrinas">Agrinas</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Tahun Tanam</label>
                                <input type="number" value={editData.tahunTanam} onChange={e => setEditData('tahunTanam', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Luas (HA)</label>
                                <input type="number" step="0.01" value={editData.luas} onChange={e => setEditData('luas', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Jumlah Pokok</label>
                                <input type="number" value={editData.jumlahPokok} onChange={e => setEditData('jumlahPokok', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Tandan Per Pokok</label>
                                <input type="number" step="0.01" value={editData.tandanPerPokok} onChange={e => setEditData('tandanPerPokok', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Rotasi</label>
                                <input type="number" value={editData.rotasi} onChange={e => setEditData('rotasi', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
                            </div>
                        </div>
                        <div className="mt-6 flex justify-end gap-3">
                            <SecondaryButton onClick={() => setIsEditModalOpen(false)}>
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
