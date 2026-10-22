import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import KaryawanLayout from '@/Layouts/KaryawanLayout';
import { Head, usePage, Link, router } from '@inertiajs/react';
import { LogOut } from 'lucide-react';
import Swal from 'sweetalert2';

import UpdatePasswordForm from './Partials/UpdatePasswordForm';
import UpdateProfileInformationForm from './Partials/UpdateProfileInformationForm';
import UpdateKaryawanInformationForm from './Partials/UpdateKaryawanInformationForm';
import Modal from '@/Components/Modal';
import SecondaryButton from '@/Components/SecondaryButton';
import { useState } from 'react';

export default function Edit({ mustVerifyEmail, status }) {
    const user = usePage().props.auth.user;
    const Layout = user.role === 'karyawan' ? KaryawanLayout : AuthenticatedLayout;
    const [confirmingPasswordUpdate, setConfirmingPasswordUpdate] = useState(false);

    const handleLogout = () => {
        Swal.fire({
            title: 'Konfirmasi Logout',
            text: 'Yakin ingin keluar dari aplikasi?',
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#9ca3af',
            confirmButtonText: 'Ya, Keluar!',
            cancelButtonText: 'Batal'
        }).then((result) => {
            if (result.isConfirmed) {
                router.post(route('logout'));
            }
        });
    };

    return (
        <Layout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Profile
                </h2>
            }
        >
            <Head title="Profile" />

            <div className="md:py-12">
                <div className="mx-auto w-full max-w-full space-y-6 px-2 sm:px-6 lg:px-8">
                    <div className="bg-white p-4 shadow sm:rounded-lg sm:p-8 relative">
                        <div className="absolute top-4 right-4 sm:top-8 sm:right-8">
                            <SecondaryButton onClick={() => setConfirmingPasswordUpdate(true)}>
                                Ganti Password
                            </SecondaryButton>
                        </div>
                        {user.role !== 'karyawan' ? (
                            <UpdateProfileInformationForm
                                mustVerifyEmail={mustVerifyEmail}
                                status={status}
                                className="max-w-3xl"
                            />
                        ) : (
                            <UpdateKaryawanInformationForm className="w-full mt-8 sm:mt-0" />
                        )}
                    </div>

                    {user.role === 'karyawan' && (
                        <div className="md:hidden pt-4">
                            <button
                                type="button"
                                className="w-full flex justify-center items-center gap-2 px-4 py-3.5 bg-red-50 text-red-600 border border-red-200 rounded-xl font-bold text-sm shadow-sm hover:bg-red-100 active:scale-95 transition-all"
                                onClick={handleLogout}
                            >
                                <LogOut size={18} strokeWidth={2.5} />
                                KELUAR (LOGOUT)
                            </button>
                        </div>
                    )}

                </div>

                <Modal show={confirmingPasswordUpdate} onClose={() => setConfirmingPasswordUpdate(false)}>
                    <div className="p-6">
                        <UpdatePasswordForm 
                            className="max-w-full" 
                            onSuccessCallback={() => setConfirmingPasswordUpdate(false)}
                        />
                        <div className="mt-6 flex justify-end">
                            <SecondaryButton onClick={() => setConfirmingPasswordUpdate(false)}>
                                Tutup
                            </SecondaryButton>
                        </div>
                    </div>
                </Modal>
            </div>
        </Layout>
    );
}
