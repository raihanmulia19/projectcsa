import React, { useState } from 'react';
import { Head } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Search, User, MapPin, Briefcase, Phone, Mail, Users, AlertCircle } from 'lucide-react';

export default function KaryawanAdmin({ auth, title, karyawans }) {
    const [search, setSearch] = useState('');

    // Filter karyawans by search name
    const filteredKaryawans = karyawans.filter(k => 
        k.name.toLowerCase().includes(search.toLowerCase()) || 
        k.email.toLowerCase().includes(search.toLowerCase()) ||
        (k.karyawan?.nik && k.karyawan.nik.includes(search))
    );

    const totalKaryawan = karyawans.length;
    const totalLakiLaki = karyawans.filter(k => k.karyawan?.jenis_kelamin === 'Laki-laki').length;
    const totalPerempuan = karyawans.filter(k => k.karyawan?.jenis_kelamin === 'Perempuan').length;
    const belumLengkap = karyawans.filter(k => !k.karyawan || !k.karyawan.nik).length;

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">{title}</h2>}
        >
            <Head title={title} />

            <div className="py-8">
                <div className="w-full px-4 sm:px-6 lg:px-8 space-y-6">
                    {/* Summary Cards */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-green-100 text-green-600 flex items-center justify-center shrink-0">
                                <Users size={24} />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-500">Total Karyawan</p>
                                <h4 className="text-2xl font-extrabold text-gray-800">{totalKaryawan}</h4>
                            </div>
                        </div>
                        
                        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                                <User size={24} />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-500">Laki-laki</p>
                                <h4 className="text-2xl font-extrabold text-gray-800">{totalLakiLaki}</h4>
                            </div>
                        </div>

                        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-pink-100 text-pink-600 flex items-center justify-center shrink-0">
                                <User size={24} />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-500">Perempuan</p>
                                <h4 className="text-2xl font-extrabold text-gray-800">{totalPerempuan}</h4>
                            </div>
                        </div>

                        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                                <AlertCircle size={24} />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-500">Data Belum Lengkap</p>
                                <h4 className="text-2xl font-extrabold text-gray-800">{belumLengkap}</h4>
                            </div>
                        </div>
                    </div>

                    {/* Header & Filter */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                            <h3 className="text-lg font-bold text-gray-800">Daftar Karyawan</h3>
                            <p className="text-sm text-gray-500">Menampilkan data semua karyawan PT CSA</p>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <input 
                                    type="text"
                                    placeholder="Cari nama, email, atau NIK..."
                                    className="pl-10 pr-4 py-2 w-full sm:w-72 border-gray-200 rounded-xl text-sm focus:ring-green-500 focus:border-green-500"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
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
                                        <th className="px-6 py-4 whitespace-nowrap">Nama & Kontak</th>
                                        <th className="px-6 py-4">NIK</th>
                                        <th className="px-6 py-4">Jabatan / Dept</th>
                                        <th className="px-6 py-4">Jenis Kelamin</th>
                                        <th className="px-6 py-4">Alamat</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {filteredKaryawans.length > 0 ? (
                                        filteredKaryawans.map((user) => (
                                            <tr key={user.id} className="hover:bg-gray-50/50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-full bg-green-100 text-green-700 flex items-center justify-center shrink-0">
                                                            <User size={20} />
                                                        </div>
                                                        <div>
                                                            <div className="font-bold text-gray-800">{user.name}</div>
                                                            <div className="text-[11px] text-gray-500 flex flex-col gap-0.5 mt-1">
                                                                <span className="flex items-center gap-1"><Mail size={10} /> {user.email}</span>
                                                                {user.karyawan?.no_hp && (
                                                                    <span className="flex items-center gap-1"><Phone size={10} /> {user.karyawan.no_hp}</span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 font-mono text-xs text-gray-600 whitespace-nowrap">
                                                    {user.karyawan?.nik ? user.karyawan.nik : '-'}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="font-medium text-gray-800">
                                                        {user.karyawan?.jabatan ? user.karyawan.jabatan : '-'}
                                                    </div>
                                                    <div className="text-[11px] text-gray-500 mt-1 flex items-center gap-1">
                                                        <Briefcase size={10} />
                                                        {user.karyawan?.departemen ? user.karyawan.departemen : '-'}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {user.karyawan?.jenis_kelamin ? (
                                                        <span className={`inline-flex items-center px-2 py-1 rounded-md text-[10px] font-bold ${
                                                            user.karyawan.jenis_kelamin === 'Laki-laki' ? 'bg-blue-50 text-blue-700' : 'bg-pink-50 text-pink-700'
                                                        }`}>
                                                            {user.karyawan.jenis_kelamin}
                                                        </span>
                                                    ) : '-'}
                                                </td>
                                                <td className="px-6 py-4 min-w-[200px]">
                                                    <div className="text-xs text-gray-600 line-clamp-2">
                                                        {user.karyawan?.alamat ? (
                                                            <span className="flex items-start gap-1">
                                                                <MapPin size={12} className="shrink-0 mt-0.5 text-gray-400" />
                                                                {user.karyawan.alamat}
                                                            </span>
                                                        ) : '-'}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="5" className="px-6 py-12 text-center">
                                                <div className="flex flex-col items-center justify-center text-gray-400">
                                                    <User size={48} className="mb-3 opacity-20" />
                                                    <p className="text-base font-medium text-gray-500">Tidak ada data karyawan</p>
                                                    <p className="text-sm mt-1">Belum ada user yang terdaftar dengan role Karyawan atau sesuai pencarian.</p>
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
