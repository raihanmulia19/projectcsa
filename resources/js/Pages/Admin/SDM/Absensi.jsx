import React, { useState } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Calendar, CheckCircle2, Clock, MapPin, Search, XCircle, Eye, X, Edit, Save } from 'lucide-react';
import Modal from '@/Components/Modal';
import Swal from 'sweetalert2';

export default function AbsensiAdmin({ auth, title, absensi, rekap_bulan, tanggal_label, current_filter }) {
    const [search, setSearch] = useState('');
    const [selectedAbsen, setSelectedAbsen] = useState(null);
    const [editAbsen, setEditAbsen] = useState(null);

    const { data, setData, put, processing, errors } = useForm({
        waktu_datang: '',
        waktu_pulang: '',
        status: '',
        tipe_kehadiran: ''
    });

    const openEditModal = (absen) => {
        setEditAbsen(absen);
        setData({
            waktu_datang: absen.waktu_datang || '',
            waktu_pulang: absen.waktu_pulang || '',
            status: absen.status || 'hadir',
            tipe_kehadiran: absen.tipe_kehadiran || 'wfo'
        });
    };

    const handleEditSubmit = (e) => {
        e.preventDefault();
        put(route('sdm.absensi.update', editAbsen.id), {
            preserveScroll: true,
            onSuccess: () => {
                setEditAbsen(null);
                Swal.fire({
                    title: 'Berhasil!',
                    text: 'Data absensi berhasil diubah.',
                    icon: 'success',
                    timer: 1500,
                    showConfirmButton: false
                });
            }
        });
    };

    const handleFilterChange = (e) => {
        router.get(route('sdm.absensi'), { tanggal: e.target.value }, {
            preserveState: true,
            replace: true,
        });
    };

    const formatDate = (dateString) => {
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString('id-ID', options);
    };

    // Filter absensi by search name
    const filteredAbsensi = absensi.filter(a => 
        a.user.name.toLowerCase().includes(search.toLowerCase())
    );

    // Get user attendance stats from monthly recap data
    const getUserStats = (userId) => {
        const userAbsen = rekap_bulan ? rekap_bulan.filter(a => a.user_id === userId) : [];
        return {
            hadir: userAbsen.filter(a => a.status === 'hadir').length,
            terlambat: userAbsen.filter(a => a.status === 'terlambat').length,
            alpa: userAbsen.filter(a => a.status !== 'hadir' && a.status !== 'terlambat').length,
        };
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">{title}</h2>}
        >
            <Head title={title} />

            <div className="py-8">
                <div className="w-full px-4 sm:px-6 lg:px-8 space-y-6">
                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                            <div className="w-12 h-12 bg-green-50 text-green-600 rounded-full flex items-center justify-center">
                                <CheckCircle2 size={24} />
                            </div>
                            <div>
                                <div className="text-sm font-medium text-gray-500">Total Hadir</div>
                                <div className="text-2xl font-bold text-gray-800">{absensi.filter(a => a.status === 'hadir').length}</div>
                            </div>
                        </div>
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                            <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center">
                                <Clock size={24} />
                            </div>
                            <div>
                                <div className="text-sm font-medium text-gray-500">Total Terlambat</div>
                                <div className="text-2xl font-bold text-gray-800">{absensi.filter(a => a.status === 'terlambat').length}</div>
                            </div>
                        </div>
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                            <div className="w-12 h-12 bg-red-50 text-red-600 rounded-full flex items-center justify-center">
                                <XCircle size={24} />
                            </div>
                            <div>
                                <div className="text-sm font-medium text-gray-500">Total Alpa</div>
                                <div className="text-2xl font-bold text-gray-800">{absensi.filter(a => a.status !== 'hadir' && a.status !== 'terlambat').length}</div>
                            </div>
                        </div>
                    </div>

                    {/* Header & Filter */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                            <h3 className="text-lg font-bold text-gray-800">Data Absensi Karyawan</h3>
                            <p className="text-sm text-gray-500">Menampilkan rekapitulasi kehadiran pada {tanggal_label}</p>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <input 
                                    type="text"
                                    placeholder="Cari nama karyawan..."
                                    className="pl-10 pr-4 py-2 w-full sm:w-64 border-gray-200 rounded-xl text-sm focus:ring-green-500 focus:border-green-500"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                            </div>
                            <div className="relative">
                                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <input 
                                    type="date"
                                    value={current_filter}
                                    onChange={handleFilterChange}
                                    className="pl-10 pr-4 py-2 w-full border-gray-200 rounded-xl text-sm focus:ring-green-500 focus:border-green-500"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Table Data */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-gray-50/80 text-gray-600 font-medium border-b border-gray-100">
                                    <tr>
                                        <th className="px-6 py-4 whitespace-nowrap">Tanggal</th>
                                        <th className="px-6 py-4">Nama Karyawan</th>
                                        <th className="px-6 py-4">Jam Datang</th>
                                        <th className="px-6 py-4">Jam Pulang</th>
                                        <th className="px-6 py-4">Status</th>
                                        <th className="px-6 py-4">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {filteredAbsensi.length > 0 ? (
                                        filteredAbsensi.map((absen) => (
                                            <tr key={absen.id} className="hover:bg-gray-50/50 transition-colors">
                                                <td className="px-6 py-4 whitespace-nowrap text-gray-700 font-medium">
                                                    {formatDate(absen.tanggal)}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="font-bold text-gray-800">{absen.user.name}</div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="font-bold text-gray-800">
                                                        {absen.waktu_datang}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    {absen.waktu_pulang ? (
                                                        <div className="font-bold text-gray-800">{absen.waktu_pulang}</div>
                                                    ) : (
                                                        <span className="text-gray-400 italic text-xs">Belum Absen</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {absen.status === 'hadir' ? (
                                                        <span className="inline-flex items-center gap-1.5 bg-green-50 text-green-700 text-xs font-bold px-3 py-1.5 rounded-full border border-green-200">
                                                            <CheckCircle2 size={14} /> Hadir
                                                        </span>
                                                    ) : absen.status === 'terlambat' ? (
                                                        <span className="inline-flex items-center gap-1.5 bg-amber-50 text-amber-700 text-xs font-bold px-3 py-1.5 rounded-full border border-amber-200">
                                                            <Clock size={14} /> Terlambat
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1.5 bg-red-50 text-red-700 text-xs font-bold px-3 py-1.5 rounded-full border border-red-200">
                                                            <XCircle size={14} /> Tidak Hadir
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center gap-3">
                                                        <button
                                                            onClick={() => setSelectedAbsen(absen)}
                                                            className="text-blue-600 hover:text-blue-800 transition-colors"
                                                            title="Detail Kehadiran"
                                                        >
                                                            <Eye size={18} />
                                                        </button>
                                                        <button
                                                            onClick={() => openEditModal(absen)}
                                                            className="text-green-700 hover:text-green-900 transition-colors"
                                                            title="Edit Absensi"
                                                        >
                                                            <Edit size={18} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="5" className="px-6 py-12 text-center">
                                                <div className="flex flex-col items-center justify-center text-gray-400">
                                                    <Calendar size={48} className="mb-3 opacity-20" />
                                                    <p className="text-base font-medium text-gray-500">Belum ada data absensi</p>
                                                    <p className="text-sm mt-1">Tidak ada kehadiran pada tanggal ini.</p>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal Detail Absensi */}
            <Modal show={selectedAbsen !== null} onClose={() => setSelectedAbsen(null)} maxWidth="2xl">
                {selectedAbsen && (
                    <div className="p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-gray-800">Detail Kehadiran</h3>
                            <button onClick={() => setSelectedAbsen(null)} className="text-gray-400 hover:text-gray-600">
                                <X size={24} />
                            </button>
                        </div>
                        
                        <div className="space-y-6">
                            {/* User Info & Stats */}
                            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 flex flex-col md:flex-row justify-between gap-4">
                                <div>
                                    <div className="font-bold text-gray-800 text-lg">{selectedAbsen.user.name}</div>
                                    <div className="text-sm text-gray-500">{selectedAbsen.user.email}</div>
                                </div>
                                <div className="flex gap-4">
                                    <div className="text-center bg-white px-4 py-2 rounded-lg border border-gray-100 shadow-sm">
                                        <div className="text-[10px] text-gray-500 font-medium mb-0.5">Hadir (Bulan Ini)</div>
                                        <div className="font-bold text-green-600">{getUserStats(selectedAbsen.user.id).hadir}</div>
                                    </div>
                                    <div className="text-center bg-white px-4 py-2 rounded-lg border border-gray-100 shadow-sm">
                                        <div className="text-[10px] text-gray-500 font-medium mb-0.5">Telat (Bulan Ini)</div>
                                        <div className="font-bold text-amber-600">{getUserStats(selectedAbsen.user.id).terlambat}</div>
                                    </div>
                                    <div className="text-center bg-white px-4 py-2 rounded-lg border border-gray-100 shadow-sm">
                                        <div className="text-[10px] text-gray-500 font-medium mb-0.5">Alpa (Bulan Ini)</div>
                                        <div className="font-bold text-red-600">{getUserStats(selectedAbsen.user.id).alpa}</div>
                                    </div>
                                </div>
                            </div>

                            {/* Attendance Photos */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Datang */}
                                <div className="bg-white p-4 rounded-xl border border-gray-200">
                                    <div className="text-sm font-bold text-gray-800 mb-3 border-b pb-2">Datang</div>
                                    <div className="flex flex-col items-center gap-3">
                                        {selectedAbsen.foto_datang ? (
                                            <a href={`/storage/${selectedAbsen.foto_datang}`} target="_blank" className="w-full">
                                                <img src={`/storage/${selectedAbsen.foto_datang}`} alt="Foto Datang" className="w-full h-48 object-cover rounded-lg border border-gray-100" />
                                            </a>
                                        ) : (
                                            <div className="w-full h-48 bg-gray-50 rounded-lg flex items-center justify-center text-gray-400 border border-gray-100 border-dashed text-sm">
                                                Tidak ada foto
                                            </div>
                                        )}
                                        <div className="w-full text-center">
                                            <div className="font-bold text-gray-800">{selectedAbsen.waktu_datang}</div>
                                            <div className="text-xs text-gray-500">{formatDate(selectedAbsen.tanggal)}</div>
                                            <a 
                                                href={`https://www.google.com/maps/search/?api=1&query=${selectedAbsen.lat_datang},${selectedAbsen.long_datang}`} 
                                                target="_blank" 
                                                rel="noreferrer"
                                                className="mt-2 inline-flex items-center gap-1.5 text-xs text-blue-600 bg-blue-50 hover:bg-blue-100 transition-colors px-3 py-1 rounded-full"
                                            >
                                                <MapPin size={12} /> Cek Lokasi {selectedAbsen.tipe_kehadiran === 'wfh' ? '(WFH)' : '(WFO)'}
                                            </a>
                                        </div>
                                    </div>
                                </div>

                                {/* Pulang */}
                                <div className="bg-white p-4 rounded-xl border border-gray-200">
                                    <div className="text-sm font-bold text-gray-800 mb-3 border-b pb-2">Pulang</div>
                                    <div className="flex flex-col items-center gap-3">
                                        {selectedAbsen.waktu_pulang ? (
                                            <>
                                                {selectedAbsen.foto_pulang ? (
                                                    <a href={`/storage/${selectedAbsen.foto_pulang}`} target="_blank" className="w-full">
                                                        <img src={`/storage/${selectedAbsen.foto_pulang}`} alt="Foto Pulang" className="w-full h-48 object-cover rounded-lg border border-gray-100" />
                                                    </a>
                                                ) : (
                                                    <div className="w-full h-48 bg-gray-50 rounded-lg flex items-center justify-center text-gray-400 border border-gray-100 border-dashed text-sm">
                                                        Tidak ada foto
                                                    </div>
                                                )}
                                                <div className="w-full text-center">
                                                    <div className="font-bold text-gray-800">{selectedAbsen.waktu_pulang}</div>
                                                    <div className="text-xs text-gray-500">{formatDate(selectedAbsen.tanggal)}</div>
                                                    <a 
                                                        href={`https://www.google.com/maps/search/?api=1&query=${selectedAbsen.lat_pulang},${selectedAbsen.long_pulang}`} 
                                                        target="_blank" 
                                                        rel="noreferrer"
                                                        className="mt-2 inline-flex items-center gap-1.5 text-xs text-blue-600 bg-blue-50 hover:bg-blue-100 transition-colors px-3 py-1 rounded-full"
                                                    >
                                                        <MapPin size={12} /> Cek Lokasi Pulang
                                                    </a>
                                                </div>
                                            </>
                                        ) : (
                                            <div className="flex flex-col items-center justify-center h-full min-h-[200px] text-gray-400">
                                                <Clock size={32} className="mb-2 opacity-20" />
                                                <span className="text-sm">Belum Absen Pulang</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </Modal>

            {/* Modal Edit Absensi */}
            <Modal show={editAbsen !== null} onClose={() => setEditAbsen(null)} maxWidth="md">
                {editAbsen && (
                    <form onSubmit={handleEditSubmit} className="p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-gray-800">Edit Absensi</h3>
                            <button type="button" onClick={() => setEditAbsen(null)} className="text-gray-400 hover:text-gray-600">
                                <X size={24} />
                            </button>
                        </div>
                        
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Nama Karyawan</label>
                                <input type="text" readOnly className="w-full border-gray-200 rounded-xl bg-gray-50 text-gray-500 text-sm" value={editAbsen.user.name} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Jam Datang</label>
                                    <input 
                                        type="time" 
                                        step="1"
                                        className="w-full border-gray-200 rounded-xl text-sm focus:ring-green-500 focus:border-green-500" 
                                        value={data.waktu_datang} 
                                        onChange={e => setData('waktu_datang', e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Jam Pulang</label>
                                    <input 
                                        type="time" 
                                        step="1"
                                        className="w-full border-gray-200 rounded-xl text-sm focus:ring-green-500 focus:border-green-500" 
                                        value={data.waktu_pulang} 
                                        onChange={e => setData('waktu_pulang', e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Status Kehadiran</label>
                                    <select 
                                        className="w-full border-gray-200 rounded-xl text-sm focus:ring-green-500 focus:border-green-500"
                                        value={data.status}
                                        onChange={e => setData('status', e.target.value)}
                                    >
                                        <option value="hadir">Hadir</option>
                                        <option value="terlambat">Terlambat</option>
                                        <option value="alpa">Alpa / Tidak Hadir</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Tipe</label>
                                    <select 
                                        className="w-full border-gray-200 rounded-xl text-sm focus:ring-green-500 focus:border-green-500"
                                        value={data.tipe_kehadiran}
                                        onChange={e => setData('tipe_kehadiran', e.target.value)}
                                    >
                                        <option value="wfo">WFO (Office)</option>
                                        <option value="wfh">WFH (Home)</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => setEditAbsen(null)}
                                className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50 font-medium text-sm transition-colors"
                            >
                                Batal
                            </button>
                            <button
                                type="submit"
                                disabled={processing}
                                className="px-4 py-2 bg-green-600 border border-transparent rounded-xl text-white hover:bg-green-700 font-medium text-sm transition-colors flex items-center gap-2 disabled:opacity-75 disabled:cursor-not-allowed"
                            >
                                <Save size={16} /> Simpan Perubahan
                            </button>
                        </div>
                    </form>
                )}
            </Modal>
        </AuthenticatedLayout>
    );
}
