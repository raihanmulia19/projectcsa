import React from 'react';
import { Head, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Swal from 'sweetalert2';
import { Check, X, Clock, MessageSquare, MapPin } from 'lucide-react';

export default function PersetujuanPulang({ auth, title, pending_absensi }) {
    
    const handleAction = (id, action) => {
        const actionText = action === 'Approved' ? 'menyetujui' : 'menolak';
        
        Swal.fire({
            title: `Konfirmasi ${action}?`,
            text: `Anda yakin ingin ${actionText} permintaan pulang cepat ini?`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: `Ya, ${action}`,
            cancelButtonText: 'Batal',
            confirmButtonColor: action === 'Approved' ? '#16a34a' : '#d33',
        }).then((result) => {
            if (result.isConfirmed) {
                router.patch(route('sdm.persetujuan_pulang.update', id), {
                    status: action
                }, {
                    onSuccess: () => {
                        Swal.fire('Berhasil!', `Permintaan telah di-${action.toLowerCase()}.`, 'success');
                    }
                });
            }
        });
    };

    const formatDate = (dateString) => {
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString('id-ID', options);
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">{title}</h2>}
        >
            <Head title={title} />

            <div className="py-8">
                <div className="w-full px-4 sm:px-6 lg:px-8 space-y-6">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex justify-between items-center">
                        <div>
                            <h3 className="text-lg font-bold text-gray-800">Antrean Persetujuan Pulang Cepat</h3>
                            <p className="text-sm text-gray-500">Daftar karyawan yang melakukan absen pulang sebelum jam 17:00</p>
                        </div>
                        <div className="bg-amber-100 text-amber-700 px-4 py-2 rounded-xl font-bold flex items-center gap-2">
                            <Clock size={18} />
                            {pending_absensi.length} Pending
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-gray-50/80 text-gray-600 font-medium border-b border-gray-100">
                                    <tr>
                                        <th className="px-6 py-4 whitespace-nowrap">Karyawan & Waktu</th>
                                        <th className="px-6 py-4">Foto Bukti</th>
                                        <th className="px-6 py-4">Alasan Pulang Cepat</th>
                                        <th className="px-6 py-4 text-center">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {pending_absensi.length > 0 ? (
                                        pending_absensi.map((absen) => (
                                            <tr key={absen.id} className="hover:bg-gray-50/50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="font-bold text-gray-800 text-base">{absen.user.name}</div>
                                                    <div className="text-xs text-gray-500 mt-1">{formatDate(absen.tanggal)}</div>
                                                    <div className="inline-flex mt-2 items-center gap-1.5 bg-amber-50 text-amber-700 text-xs font-bold px-2 py-1 rounded-md border border-amber-200">
                                                        <Clock size={12} /> Jam {absen.waktu_pulang}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    {absen.foto_pulang ? (
                                                        <a href={`/storage/${absen.foto_pulang}`} target="_blank" className="shrink-0 flex items-center gap-3 group">
                                                            <img src={`/storage/${absen.foto_pulang}`} alt="Pulang" className="w-16 h-16 rounded-xl object-cover border border-gray-200 group-hover:scale-110 transition-transform" />
                                                            <div className="text-[10px] text-blue-600 flex flex-col gap-1 hover:underline">
                                                                <span className="flex items-center gap-1"><MapPin size={10} /> Cek Peta GPS</span>
                                                                <span className="text-gray-400">Lat: {absen.lat_pulang}</span>
                                                                <span className="text-gray-400">Long: {absen.long_pulang}</span>
                                                            </div>
                                                        </a>
                                                    ) : (
                                                        <span className="text-gray-400 italic">Tidak ada foto</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 max-w-sm">
                                                    <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 text-gray-700 italic flex items-start gap-2 text-xs">
                                                        <MessageSquare size={14} className="shrink-0 text-gray-400 mt-0.5" />
                                                        "{absen.alasan_pulang_cepat}"
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center justify-center gap-2">
                                                        <button 
                                                            onClick={() => handleAction(absen.id, 'Approved')}
                                                            className="flex items-center gap-1 bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded-xl text-xs font-bold transition-colors shadow-sm"
                                                        >
                                                            <Check size={14} /> Approve
                                                        </button>
                                                        <button 
                                                            onClick={() => handleAction(absen.id, 'Rejected')}
                                                            className="flex items-center gap-1 bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-xl text-xs font-bold transition-colors shadow-sm"
                                                        >
                                                            <X size={14} /> Reject
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="4" className="px-6 py-12 text-center">
                                                <div className="flex flex-col items-center justify-center text-gray-400">
                                                    <Check size={48} className="mb-3 opacity-20" />
                                                    <p className="text-base font-medium text-gray-500">Semua permintaan sudah diproses</p>
                                                    <p className="text-sm mt-1">Tidak ada antrean persetujuan pulang cepat saat ini.</p>
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
        </AuthenticatedLayout>
    );
}
