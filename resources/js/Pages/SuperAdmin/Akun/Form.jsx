import React from 'react';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import { ArrowLeft } from 'lucide-react';

export default function Form({ userEdit }) {
    const isEditing = !!userEdit;

    const { data, setData, post, put, processing, errors } = useForm({
        name: userEdit?.name || '',
        username: userEdit?.username || '',
        email: userEdit?.email || '',
        password: '',
        role: userEdit?.role || 'karyawan',
        no_hp: userEdit?.karyawan?.no_hp || '',
        jabatan: userEdit?.karyawan?.jabatan || '',
        departemen: userEdit?.karyawan?.departemen || '',
    });

    const submit = (e) => {
        e.preventDefault();
        if (isEditing) {
            put(route('pengaturan.akun.update', userEdit.id));
        } else {
            post(route('pengaturan.akun.store'));
        }
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center gap-4">
                    <Link href={route('pengaturan.akun.index')} className="text-gray-500 hover:text-gray-700 transition">
                        <ArrowLeft size={20} />
                    </Link>
                    <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                        {isEditing ? 'Edit Akun Pengguna' : 'Tambah Akun Pengguna'}
                    </h2>
                </div>
            }
        >
            <Head title={isEditing ? 'Edit Akun' : 'Tambah Akun'} />

            <div className="py-12">
                <div className="mx-auto w-full max-w-full px-4 sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-xl border border-gray-100">
                        <form onSubmit={submit} className="p-6 sm:p-10 text-gray-900">
                            
                            <div className="mb-8">
                                <h3 className="text-lg font-semibold text-gray-800 border-b pb-2 mb-4">Informasi Dasar</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <InputLabel htmlFor="name" value="Nama Lengkap *" />
                                        <TextInput
                                            id="name"
                                            className="mt-1 block w-full"
                                            value={data.name}
                                            onChange={(e) => setData('name', e.target.value)}
                                            required
                                        />
                                        <InputError className="mt-2" message={errors.name} />
                                    </div>
                                    
                                    <div>
                                        <InputLabel htmlFor="username" value="Username *" />
                                        <TextInput
                                            id="username"
                                            className="mt-1 block w-full"
                                            value={data.username}
                                            onChange={(e) => setData('username', e.target.value)}
                                            required
                                        />
                                        <InputError className="mt-2" message={errors.username} />
                                    </div>

                                    <div>
                                        <InputLabel htmlFor="email" value="Alamat Email *" />
                                        <TextInput
                                            id="email"
                                            type="email"
                                            className="mt-1 block w-full"
                                            value={data.email}
                                            onChange={(e) => setData('email', e.target.value)}
                                            required
                                        />
                                        <InputError className="mt-2" message={errors.email} />
                                    </div>

                                    <div>
                                        <InputLabel htmlFor="password" value={isEditing ? 'Password (Kosongkan jika tidak diubah)' : 'Password *'} />
                                        <TextInput
                                            id="password"
                                            type="password"
                                            className="mt-1 block w-full"
                                            value={data.password}
                                            onChange={(e) => setData('password', e.target.value)}
                                            required={!isEditing}
                                        />
                                        <InputError className="mt-2" message={errors.password} />
                                    </div>

                                    <div className="md:col-span-2">
                                        <InputLabel htmlFor="role" value="Role Pengguna *" />
                                        <select
                                            id="role"
                                            className="mt-1 block w-full border-gray-300 focus:border-[#143d2c] focus:ring-[#143d2c] rounded-md shadow-sm"
                                            value={data.role}
                                            onChange={(e) => setData('role', e.target.value)}
                                            required
                                        >
                                            <option value="karyawan">Karyawan</option>
                                            <option value="admin">Admin</option>
                                            <option value="atasan">Atasan</option>
                                            <option value="super_admin">Super Admin</option>
                                        </select>
                                        <InputError className="mt-2" message={errors.role} />
                                    </div>
                                </div>
                            </div>

                            {data.role === 'karyawan' && (
                                <div className="mb-8 animate-fade-in-up">
                                    <h3 className="text-lg font-semibold text-gray-800 border-b pb-2 mb-4">Informasi Kepegawaian (Khusus Karyawan)</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <InputLabel htmlFor="no_hp" value="Nomor HP" />
                                            <TextInput
                                                id="no_hp"
                                                className="mt-1 block w-full"
                                                value={data.no_hp}
                                                onChange={(e) => setData('no_hp', e.target.value)}
                                            />
                                            <InputError className="mt-2" message={errors.no_hp} />
                                        </div>

                                        <div>
                                            <InputLabel htmlFor="departemen" value="Departemen / Devisi" />
                                            <select
                                                id="departemen"
                                                className="mt-1 block w-full border-gray-300 focus:border-[#143d2c] focus:ring-[#143d2c] rounded-md shadow-sm"
                                                value={data.departemen}
                                                onChange={(e) => setData('departemen', e.target.value)}
                                            >
                                                <option value="">Pilih Departemen</option>
                                                <option value="IT">IT</option>
                                                <option value="HRD">HRD</option>
                                                <option value="Keuangan">Keuangan</option>
                                                <option value="Produksi">Produksi</option>
                                                <option value="Marketing">Marketing</option>
                                            </select>
                                            <InputError className="mt-2" message={errors.departemen} />
                                        </div>

                                        <div>
                                            <InputLabel htmlFor="jabatan" value="Jabatan" />
                                            <select
                                                id="jabatan"
                                                className="mt-1 block w-full border-gray-300 focus:border-[#143d2c] focus:ring-[#143d2c] rounded-md shadow-sm"
                                                value={data.jabatan}
                                                onChange={(e) => setData('jabatan', e.target.value)}
                                            >
                                                <option value="">Pilih Jabatan</option>
                                                <option value="Staff">Staff</option>
                                                <option value="Supervisor">Supervisor</option>
                                                <option value="Manager">Manager</option>
                                            </select>
                                            <InputError className="mt-2" message={errors.jabatan} />
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="flex items-center justify-end mt-6 gap-4 border-t pt-6">
                                <Link
                                    href={route('pengaturan.akun.index')}
                                    className="px-4 py-2 bg-white border border-gray-300 rounded-md font-semibold text-xs text-gray-700 uppercase tracking-widest shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#143d2c] focus:ring-offset-2 disabled:opacity-25 transition ease-in-out duration-150"
                                >
                                    Batal
                                </Link>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className={`inline-flex items-center px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-green-600 border border-transparent rounded-xl font-bold text-xs text-white uppercase tracking-wider shadow-sm hover:shadow-md hover:from-emerald-600 hover:to-green-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transform transition-all duration-200 hover:-translate-y-0.5 ${processing ? 'opacity-25' : ''}`}
                                >
                                    {isEditing ? 'Simpan Perubahan' : 'Tambahkan Akun'}
                                </button>
                            </div>
                            
                        </form>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
