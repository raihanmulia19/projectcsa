import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import KaryawanLayout from '@/Layouts/KaryawanLayout';
import { Calendar, Clock, MapPin, CheckCircle2, XCircle } from 'lucide-react';

export default function RiwayatAbsensi({ auth, riwayat, bulan, current_filter }) {
    const [selectedAbsen, setSelectedAbsen] = useState(null);

    const handleFilterChange = (e) => {
        router.get(route('karyawan.riwayat'), { bulan: e.target.value }, {
            preserveState: true,
            replace: true
        });
    };

    const formatDate = (dateString) => {
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString('id-ID', options);
    };

    return (
        <KaryawanLayout
            header={
                <div className="flex justify-between items-center">
                    <div>
                        <h2 className="text-xl font-bold text-[#143d2c] tracking-tight uppercase">RIWAYAT KEHADIRAN</h2>
                        <p className="text-xs text-gray-500 mt-0.5">Bulan {bulan}</p>
                    </div>
                </div>
            }
        >
            <Head title="Riwayat Kehadiran" />

            <div className="py-2">
                <div className="mb-6 bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                        <div className="bg-green-100 p-2 rounded-lg text-green-700">
                            <Calendar size={20} />
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-800">Total Kehadiran</h3>
                            <p className="text-sm text-gray-500">{riwayat.length} Hari Kerja</p>
                        </div>
                    </div>

                    <div className="w-full sm:w-auto flex items-center gap-2">
                        <label htmlFor="bulan" className="text-sm text-gray-500 font-medium hidden sm:block">Bulan:</label>
                        <input 
                            type="month" 
                            id="bulan"
                            value={current_filter}
                            onChange={handleFilterChange}
                            className="border-gray-200 focus:border-green-500 focus:ring-green-500 rounded-lg text-sm w-full sm:w-auto"
                        />
                    </div>
                </div>

                {/* Status Cards */}
                <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-6">
                    <div className="bg-white p-3 sm:p-4 rounded-xl shadow-sm border border-green-100 flex flex-col items-center justify-center text-center">
                        <CheckCircle2 className="text-green-500 mb-1 sm:mb-2" size={24} />
                        <h4 className="text-[10px] sm:text-xs font-bold text-gray-500 uppercase tracking-wider">Hadir</h4>
                        <p className="text-lg sm:text-2xl font-extrabold text-green-600 mt-1">{riwayat.filter(a => a.status === 'hadir').length} <span className="text-[10px] sm:text-xs text-green-600/60 font-normal">Hari</span></p>
                    </div>
                    <div className="bg-white p-3 sm:p-4 rounded-xl shadow-sm border border-amber-100 flex flex-col items-center justify-center text-center">
                        <Clock className="text-amber-500 mb-1 sm:mb-2" size={24} />
                        <h4 className="text-[10px] sm:text-xs font-bold text-gray-500 uppercase tracking-wider">Terlambat</h4>
                        <p className="text-lg sm:text-2xl font-extrabold text-amber-600 mt-1">{riwayat.filter(a => a.status === 'terlambat').length} <span className="text-[10px] sm:text-xs text-amber-600/60 font-normal">Hari</span></p>
                    </div>
                    <div className="bg-white p-3 sm:p-4 rounded-xl shadow-sm border border-red-100 flex flex-col items-center justify-center text-center">
                        <XCircle className="text-red-500 mb-1 sm:mb-2" size={24} />
                        <h4 className="text-[10px] sm:text-xs font-bold text-gray-500 uppercase tracking-wider">Tidak Hadir</h4>
                        <p className="text-lg sm:text-2xl font-extrabold text-red-600 mt-1">{riwayat.filter(a => a.status === 'tidak hadir').length} <span className="text-[10px] sm:text-xs text-red-600/60 font-normal">Hari</span></p>
                    </div>
                </div>

                {/* Desktop View (Table) */}
                <div className="hidden md:block bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50/80 text-gray-600 font-medium border-b border-gray-100">
                                <tr>
                                    <th className="px-4 py-3.5 tracking-wide">Tanggal</th>
                                    <th className="px-4 py-3.5 tracking-wide">Jam Datang</th>
                                    <th className="px-4 py-3.5 tracking-wide">Jam Pulang</th>
                                    <th className="px-4 py-3.5 tracking-wide">Bukti Foto</th>
                                    <th className="px-4 py-3.5 tracking-wide text-center">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {riwayat.length > 0 ? riwayat.map((absen, index) => (
                                    <tr key={index} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-4 py-3.5 font-medium text-gray-800 whitespace-nowrap">
                                            {formatDate(absen.tanggal)}
                                        </td>
                                        <td className="px-4 py-3.5">
                                            <div className="flex items-center gap-2">
                                                <span className="font-bold text-gray-700">{absen.waktu_datang}</span>
                                                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${absen.tipe_kehadiran === 'wfh' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>
                                                    {absen.tipe_kehadiran === 'wfh' ? 'WFH' : 'WFO'}
                                                </span>
                                                <a href={`https://www.google.com/maps/search/?api=1&query=${absen.lat_datang},${absen.long_datang}`} target="_blank" className="text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1 text-[10px] bg-blue-50 px-1.5 py-0.5 rounded">
                                                    <MapPin size={10} /> Maps
                                                </a>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3.5">
                                            {absen.waktu_pulang ? (
                                                <div className="flex items-center gap-2">
                                                    <span className="font-bold text-gray-700">{absen.waktu_pulang}</span>
                                                    <a href={`https://www.google.com/maps/search/?api=1&query=${absen.lat_pulang},${absen.long_pulang}`} target="_blank" className="text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1 text-[10px] bg-blue-50 px-1.5 py-0.5 rounded">
                                                        <MapPin size={10} /> Maps
                                                    </a>
                                                </div>
                                            ) : (
                                                <span className="text-gray-400 italic">Belum Absen</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3.5">
                                            <div className="flex items-center gap-2">
                                                {absen.foto_datang ? (
                                                    <a href={`/storage/${absen.foto_datang}`} target="_blank" title="Foto Datang">
                                                        <img src={`/storage/${absen.foto_datang}`} alt="Datang" className="w-8 h-8 rounded-full object-cover border-2 border-green-200" />
                                                    </a>
                                                ) : <div className="w-8 h-8 rounded-full bg-gray-100 border-2 border-gray-200"></div>}
                                                
                                                {absen.foto_pulang ? (
                                                    <a href={`/storage/${absen.foto_pulang}`} target="_blank" title="Foto Pulang">
                                                        <img src={`/storage/${absen.foto_pulang}`} alt="Pulang" className="w-8 h-8 rounded-full object-cover border-2 border-red-200" />
                                                    </a>
                                                ) : <div className="w-8 h-8 rounded-full bg-gray-100 border-2 border-gray-200" title="Belum Absen Pulang"></div>}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3.5 text-center">
                                            {absen.status === 'hadir' ? (
                                                <span className="inline-flex items-center justify-center gap-1 bg-green-50 text-green-700 border border-green-200 text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider w-24">
                                                    <CheckCircle2 size={12} /> Hadir
                                                </span>
                                            ) : absen.status === 'terlambat' ? (
                                                <span className="inline-flex items-center justify-center gap-1 bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider w-24">
                                                    <Clock size={12} /> Terlambat
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center justify-center gap-1 bg-red-50 text-red-700 border border-red-200 text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider w-24">
                                                    <XCircle size={12} /> Tdk Hadir
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="5" className="px-4 py-12 text-center text-gray-500">
                                            <XCircle size={32} className="mx-auto text-gray-300 mb-2" />
                                            Belum ada riwayat kehadiran bulan ini.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Mobile View (Cards) */}
                <div className="md:hidden space-y-3">
                    {riwayat.length > 0 ? riwayat.map((absen, index) => (
                        <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex justify-between items-center relative overflow-hidden">
                            <div className={`absolute left-0 top-0 bottom-0 w-1 ${absen.waktu_pulang ? 'bg-green-500' : 'bg-amber-400'}`}></div>
                            <div className="pl-2">
                                <div className="font-bold text-sm text-gray-800">{formatDate(absen.tanggal)}</div>
                                <div className="mt-1">
                                    {absen.waktu_pulang ? (
                                        absen.status_pulang === 'Pulang Cepat' ? (
                                            <div className="flex items-center gap-1">
                                                <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 text-[10px] font-bold px-2 py-0.5 rounded uppercase">
                                                    <Clock size={10} /> Cepat
                                                </span>
                                                <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded uppercase ${absen.status_persetujuan_pulang === 'Approved' ? 'bg-green-100 text-green-700' : absen.status_persetujuan_pulang === 'Rejected' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'}`}>
                                                    {absen.status_persetujuan_pulang}
                                                </span>
                                            </div>
                                        ) : (
                                            <span className="inline-flex items-center gap-1 bg-green-50 text-green-700 text-[10px] font-bold px-2 py-0.5 rounded uppercase">
                                                <CheckCircle2 size={10} /> Selesai
                                            </span>
                                        )
                                    ) : (
                                        <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded uppercase">
                                            <Clock size={10} /> Bekerja
                                        </span>
                                    )}
                                </div>
                            </div>
                            <button 
                                onClick={() => setSelectedAbsen(absen)}
                                className="bg-green-50 hover:bg-green-100 text-green-700 px-3 py-1.5 rounded-lg text-xs font-bold border border-green-200 transition-colors"
                            >
                                Detail
                            </button>
                        </div>
                    )) : (
                        <div className="text-center py-10 bg-white rounded-xl border border-gray-100 border-dashed">
                            <XCircle size={40} className="mx-auto text-gray-300 mb-3" />
                            <p className="text-gray-500 font-medium">Belum ada riwayat kehadiran bulan ini.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal Detail Absen untuk Mobile */}
            {selectedAbsen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm md:hidden">
                    <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
                        <div className="p-4 border-b flex justify-between items-center bg-gray-50">
                            <div>
                                <h3 className="font-bold text-gray-800">Detail Kehadiran</h3>
                                <p className="text-[10px] text-gray-500">{formatDate(selectedAbsen.tanggal)}</p>
                            </div>
                            <button onClick={() => setSelectedAbsen(null)} className="text-gray-400 hover:text-red-500 transition-colors">
                                <XCircle size={24} />
                            </button>
                        </div>
                        <div className="p-5 space-y-4">
                            <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                                <p className="text-xs font-bold text-gray-500 mb-2 border-b pb-1">ABSEN DATANG</p>
                                <div className="flex gap-3">
                                    <div className="shrink-0">
                                        {selectedAbsen.foto_datang ? (
                                            <a href={`/storage/${selectedAbsen.foto_datang}`} target="_blank">
                                                <img src={`/storage/${selectedAbsen.foto_datang}`} className="w-14 h-14 rounded-lg object-cover border border-gray-200" alt="Datang" />
                                            </a>
                                        ) : <div className="w-14 h-14 rounded-lg bg-gray-200"></div>}
                                    </div>
                                    <div className="flex flex-col justify-center">
                                        <div className="font-black text-lg text-gray-800">{selectedAbsen.waktu_datang}</div>
                                        <a href={`https://www.google.com/maps/search/?api=1&query=${selectedAbsen.lat_datang},${selectedAbsen.long_datang}`} target="_blank" className="text-[10px] text-blue-600 flex items-center gap-1 mt-0.5">
                                            <MapPin size={10} /> Cek Peta
                                        </a>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                                <p className="text-xs font-bold text-gray-500 mb-2 border-b pb-1">ABSEN PULANG</p>
                                {selectedAbsen.waktu_pulang ? (
                                    <div className="flex gap-3">
                                        <div className="shrink-0">
                                            {selectedAbsen.foto_pulang ? (
                                                <a href={`/storage/${selectedAbsen.foto_pulang}`} target="_blank">
                                                    <img src={`/storage/${selectedAbsen.foto_pulang}`} className="w-14 h-14 rounded-lg object-cover border border-gray-200" alt="Pulang" />
                                                </a>
                                            ) : <div className="w-14 h-14 rounded-lg bg-gray-200"></div>}
                                        </div>
                                        <div className="flex flex-col justify-center">
                                            <div className="font-black text-lg text-gray-800">{selectedAbsen.waktu_pulang}</div>
                                            <a href={`https://www.google.com/maps/search/?api=1&query=${selectedAbsen.lat_pulang},${selectedAbsen.long_pulang}`} target="_blank" className="text-[10px] text-blue-600 flex items-center gap-1 mt-0.5">
                                                <MapPin size={10} /> Cek Peta
                                            </a>
                                            {selectedAbsen.status_pulang === 'Pulang Cepat' && (
                                                <div className="mt-2 text-xs bg-amber-50 p-2 rounded-lg border border-amber-100">
                                                    <p className="font-bold text-amber-800">Status: Pulang Cepat ({selectedAbsen.status_persetujuan_pulang})</p>
                                                    <p className="text-amber-700 mt-1 italic">"{selectedAbsen.alasan_pulang_cepat}"</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center py-3">
                                        <p className="text-gray-400 italic text-sm font-medium">Belum Absen Pulang</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </KaryawanLayout>
    );
}
