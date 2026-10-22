import React from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Edit, Trash2, Plus, KeyRound } from 'lucide-react';
import Swal from 'sweetalert2';

export default function Index({ users }) {
    const { flash } = usePage().props;

    React.useEffect(() => {
        if (flash?.success) {
            Swal.fire({ title: 'Berhasil!', text: flash.success, icon: 'success', timer: 3000 });
        }
        if (flash?.error) {
            Swal.fire({ title: 'Gagal!', text: flash.error, icon: 'error', timer: 3000 });
        }
    }, [flash]);

    const deleteUser = (id, role) => {
        if (role === 'super_admin') {
            Swal.fire('Error', 'Super Admin tidak dapat dihapus.', 'error');
            return;
        }

        Swal.fire({
            title: 'Hapus Pengguna?',
            text: "Data yang dihapus tidak dapat dikembalikan!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#9ca3af',
            confirmButtonText: 'Ya, Hapus!',
            cancelButtonText: 'Batal'
        }).then((result) => {
            if (result.isConfirmed) {
                router.delete(route('pengaturan.akun.destroy', id));
            }
        });
    };

    const handleResetPassword = (user) => {
        Swal.fire({
            title: 'Reset Password?',
            text: `Sandi untuk akun ${user.name} akan dikembalikan ke default: csa12345. Anda yakin?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#f59e0b',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Ya, Reset!',
            cancelButtonText: 'Batal'
        }).then((result) => {
            if (result.isConfirmed) {
                router.post(route('akun.reset-password', user.id));
            }
        });
    };

    const getRoleBadge = (role) => {
        switch (role) {
            case 'super_admin':
                return <span className="bg-purple-100 text-purple-800 text-xs font-medium px-2.5 py-0.5 rounded-full border border-purple-200">Super Admin</span>;
            case 'admin':
                return <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full border border-blue-200">Admin</span>;
            case 'atasan':
                return <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full border border-green-200">Atasan</span>;
            case 'karyawan':
                return <span className="bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded-full border border-gray-200">Karyawan</span>;
            default:
                return <span className="bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded-full">{role}</span>;
        }
    };

    return (
        <AuthenticatedLayout
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Manajemen Akun Pengguna</h2>}
        >
            <Head title="Manajemen Akun" />

            <div className="py-12">
                <div className="mx-auto w-full max-w-full px-4 sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-lg font-semibold text-gray-800">Daftar Pengguna Terdaftar</h3>
                                <Link 
                                    href={route('pengaturan.akun.create')}
                                    className="inline-flex items-center px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-green-600 border border-transparent rounded-xl font-bold text-xs text-white uppercase tracking-wider shadow-sm hover:shadow-md hover:from-emerald-600 hover:to-green-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transform transition-all duration-200 hover:-translate-y-0.5"
                                >
                                    <Plus size={16} className="mr-2" />
                                    Tambah Pengguna
                                </Link>
                            </div>

                            <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
                                <table className="w-full text-sm text-left text-gray-600">
                                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b border-gray-200">
                                        <tr>
                                            <th className="px-6 py-4 font-semibold">Nama Lengkap</th>
                                            <th className="px-6 py-4 font-semibold">Username</th>
                                            <th className="px-6 py-4 font-semibold">Email</th>
                                            <th className="px-6 py-4 font-semibold">Role</th>
                                            <th className="px-6 py-4 font-semibold text-center">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {users.map((item) => (
                                            <tr key={item.id} className="bg-white hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4 font-medium text-gray-900">{item.name}</td>
                                                <td className="px-6 py-4 text-gray-500">{item.username}</td>
                                                <td className="px-6 py-4 text-gray-500">{item.email}</td>
                                                <td className="px-6 py-4">
                                                    {getRoleBadge(item.role)}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center justify-center gap-3">
                                                        <Link 
                                                            href={route('pengaturan.akun.edit', item.id)}
                                                            className="text-emerald-600 hover:text-emerald-900"
                                                            title="Edit"
                                                        >
                                                            <svg className="w-5 h-5 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                                                        </Link>
                                                        {item.role !== 'super_admin' && (
                                                            <button 
                                                                onClick={() => deleteUser(item.id, item.role)}
                                                                className="text-rose-600 hover:text-rose-900"
                                                                title="Hapus"
                                                            >
                                                                <svg className="w-5 h-5 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                                            </button>
                                                        )}
                                                        {item.role !== 'super_admin' && (
                                                            <button 
                                                                onClick={() => handleResetPassword(item)}
                                                                className="text-amber-500 hover:text-amber-700 hover:bg-amber-50 p-2 rounded-md transition-colors"
                                                                title="Reset Password"
                                                            >
                                                                <KeyRound size={18} />
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                        {users.length === 0 && (
                                            <tr>
                                                <td colSpan="5" className="px-6 py-8 text-center text-gray-500 italic">
                                                    Belum ada data pengguna.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
