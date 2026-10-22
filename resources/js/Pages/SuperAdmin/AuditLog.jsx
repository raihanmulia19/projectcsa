import React, { useState, useEffect, useRef } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import Swal from 'sweetalert2';

export default function AuditLog({ auth, logs, filters = {} }) {
    const [actionFilter, setActionFilter] = useState(filters?.action || 'all');
    const [searchQuery, setSearchQuery] = useState(filters?.search || '');
    const isFirstRender = useRef(true);

    // Pencarian real-time otomatis saat ada inputan (debounce 300ms)
    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }

        const timer = setTimeout(() => {
            router.get(route('pengaturan.audit'), {
                action: actionFilter,
                search: searchQuery,
            }, { preserveState: true, replace: true, preserveScroll: true });
        }, 300);

        return () => clearTimeout(timer);
    }, [searchQuery]);

    const handleActionChange = (newAction) => {
        setActionFilter(newAction);
        router.get(route('pengaturan.audit'), {
            action: newAction,
            search: searchQuery,
        }, { preserveState: true, replace: true, preserveScroll: true });
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        router.get(route('pengaturan.audit'), {
            action: actionFilter,
            search: searchQuery,
        }, { preserveState: true, replace: true, preserveScroll: true });
    };

    const handleBackupNow = () => {
        Swal.fire({
            title: 'Mulai Backup ke Google Drive?',
            text: 'Sistem akan mencadangkan database dan mengunggahnya langsung ke Google Drive pribadi Anda.',
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#059669',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Ya, Jalankan Backup!',
            cancelButtonText: 'Batal'
        }).then((result) => {
            if (result.isConfirmed) {
                Swal.fire({
                    title: 'Sedang Memproses Backup...',
                    text: 'Mohon tunggu beberapa saat hingga proses backup dan upload ke Google Drive selesai.',
                    allowOutsideClick: false,
                    didOpen: () => {
                        Swal.showLoading();
                    }
                });

                router.post(route('pengaturan.audit.backup-now'), {}, {
                    onSuccess: (page) => {
                        const successMsg = page.props.flash?.success;
                        const errorMsg = page.props.flash?.error;
                        if (errorMsg) {
                            Swal.fire({
                                title: 'Gagal Backup',
                                text: errorMsg,
                                icon: 'error'
                            });
                        } else {
                            Swal.fire({
                                title: 'Berhasil!',
                                text: successMsg || 'Backup berhasil diunggah ke Google Drive!',
                                icon: 'success'
                            });
                        }
                    },
                    onError: () => {
                        Swal.fire({
                            title: 'Terjadi Kesalahan',
                            text: 'Gagal memproses backup ke Google Drive.',
                            icon: 'error'
                        });
                    }
                });
            }
        });
    };

    const getActionBadge = (action) => {
        switch (action) {
            case 'CREATE':
                return 'bg-emerald-100 text-emerald-600';
            case 'UPDATE':
                return 'bg-blue-100 text-blue-600';
            case 'DELETE':
                return 'bg-rose-100 text-rose-600';
            case 'LOGIN':
                return 'bg-teal-100 text-teal-600';
            case 'LOGOUT':
                return 'bg-slate-100 text-slate-600';
            case 'RESET PASSWORD':
                return 'bg-amber-100 text-amber-600';
            case 'EXPORT':
                return 'bg-purple-100 text-purple-600';
            case 'BACKUP':
                return 'bg-emerald-100 text-emerald-600';
            default:
                return 'bg-gray-100 text-gray-600';
        }
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Audit Log Aktivitas" />

            <div className="py-4 sm:py-12">
                <div className="w-full mx-auto sm:px-6 lg:px-8 space-y-4">
                    <div className="bg-white overflow-hidden shadow-sm border border-gray-100 sm:rounded-2xl">
                        {/* Header & Filter */}
                        <div className="p-6 border-b border-gray-100 bg-white">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div>
                                    <h3 className="text-xl font-extrabold text-gray-900 tracking-tight">Audit Log Aktivitas</h3>
                                    <p className="mt-1 text-sm text-gray-500">
                                        Riwayat seluruh aktivitas di sistem (Login/Logout, Manajemen Pengguna, Ekspor Berkas, Perubahan Data).
                                    </p>
                                </div>

                                {/* Filter Controls */}
                                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                                    <select
                                        value={actionFilter}
                                        onChange={(e) => handleActionChange(e.target.value)}
                                        className="border-gray-300 rounded-xl text-sm font-normal text-gray-700 focus:ring-emerald-500 focus:border-emerald-500 shadow-sm"
                                    >
                                        <option value="all">Semua Aksi</option>
                                        <option value="LOGIN">LOGIN</option>
                                        <option value="LOGOUT">LOGOUT</option>
                                        <option value="CREATE">CREATE</option>
                                        <option value="UPDATE">UPDATE</option>
                                        <option value="DELETE">DELETE</option>
                                        <option value="RESET PASSWORD">RESET PASSWORD</option>
                                        <option value="EXPORT">EXPORT</option>
                                        <option value="BACKUP">BACKUP</option>
                                    </select>

                                    <button
                                        type="button"
                                        onClick={handleBackupNow}
                                        title="Jalankan backup database dan upload ke Google Drive"
                                        className="inline-flex items-center justify-center px-3.5 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-bold uppercase rounded-xl tracking-wider shadow-sm transition-all transform hover:-translate-y-0.5 whitespace-nowrap"
                                    >
                                        <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10"></path>
                                        </svg>
                                        Backup ke Drive
                                    </button>

                                    <form onSubmit={handleSearchSubmit} className="flex items-center">
                                        <div className="relative w-full sm:w-72">
                                            <input
                                                type="text"
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                                placeholder="Cari user, modul, keterangan..."
                                                className="w-full pl-9 pr-8 py-2 border-gray-300 rounded-xl text-sm focus:ring-emerald-500 focus:border-emerald-500 shadow-sm"
                                            />
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                                                </svg>
                                            </div>
                                            {searchQuery && (
                                                <button
                                                    type="button"
                                                    onClick={() => setSearchQuery('')}
                                                    className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                                                    title="Hapus pencarian"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                                                    </svg>
                                                </button>
                                            )}
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>

                        {/* Tabel Aktivitas */}
                        <div className="overflow-x-auto w-full">
                            <table className="w-full text-sm text-left text-gray-500">
                                <thead className="text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-200 bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-4 w-44">Waktu</th>
                                        <th className="px-6 py-4 w-48">User</th>
                                        <th className="px-6 py-4 w-32 text-center">Aksi</th>
                                        <th className="px-6 py-4 w-44">Modul</th>
                                        <th className="px-6 py-4">Keterangan</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {logs.data && logs.data.length > 0 ? (
                                        logs.data.map((log) => (
                                            <tr key={log.id} className="hover:bg-slate-50/70 transition-colors duration-150">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {new Date(log.created_at).toLocaleString('id-ID')}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-semibold text-gray-900">{log.user_name || 'Sistem'}</span>
                                                        {log.user_role && (
                                                            <span className="px-2 py-0.5 text-xs text-gray-500 bg-gray-100 rounded-md">
                                                                {log.user_role}
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-center">
                                                    <span className={`inline-block px-2.5 py-1 text-xs font-semibold rounded-md ${getActionBadge(log.action)}`}>
                                                        {log.action}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 font-semibold text-gray-800 whitespace-nowrap">
                                                    {log.module}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-600 leading-relaxed">
                                                    {log.description}
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="5" className="px-6 py-12 text-center text-gray-500 font-medium">
                                                Tidak ada log aktivitas yang cocok dengan kriteria pencarian.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination Links */}
                        {logs.links && logs.links.length > 3 && (
                            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
                                <div className="text-xs text-gray-500">
                                    Menampilkan <span className="font-semibold text-gray-700">{logs.from || 0}</span> - <span className="font-semibold text-gray-700">{logs.to || 0}</span> dari <span className="font-semibold text-gray-700">{logs.total || 0}</span> aktivitas
                                </div>
                                <div className="flex flex-wrap gap-1 justify-end">
                                    {logs.links.map((link, index) => (
                                        link.url ? (
                                            <Link
                                                key={index}
                                                href={link.url}
                                                dangerouslySetInnerHTML={{ __html: link.label }}
                                                className={`px-3 py-1.5 text-xs rounded-lg border transition-all ${link.active
                                                        ? 'bg-emerald-600 border-emerald-600 text-white font-bold shadow-sm'
                                                        : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50'
                                                    }`}
                                            />
                                        ) : (
                                            <span
                                                key={index}
                                                dangerouslySetInnerHTML={{ __html: link.label }}
                                                className="px-3 py-1.5 text-xs rounded-lg border bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed"
                                            />
                                        )
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
