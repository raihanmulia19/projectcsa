import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { Transition } from '@headlessui/react';
import { Link, useForm, usePage } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import Swal from 'sweetalert2';

export default function UpdateProfileInformation({
    mustVerifyEmail,
    status,
    className = '',
}) {
    const user = usePage().props.auth.user;

    const { data, setData, patch, errors, processing, recentlySuccessful, reset } =
        useForm({
            name: user.name,
            email: user.email,
        });

    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        if (recentlySuccessful) {
            setIsEditing(false);
        }
    }, [recentlySuccessful]);

    const submit = (e) => {
        e.preventDefault();
        patch(route('profile.update'));
    };

    const handleEditClick = () => {
        Swal.fire({
            title: 'Konfirmasi',
            text: 'Anda yakin mau edit data profile?',
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#3b82f6',
            cancelButtonColor: '#9ca3af',
            confirmButtonText: 'Ya, Edit!',
            cancelButtonText: 'Batal'
        }).then((result) => {
            if (result.isConfirmed) {
                setIsEditing(true);
            }
        });
    };

    return (
        <section className={className}>
            <header>
                <h2 className="text-lg font-medium text-gray-900">
                    Informasi Profil
                </h2>

                <p className="mt-1 text-sm text-gray-600">
                    Perbarui informasi profil dan alamat email akun Anda.
                </p>
            </header>

            <form onSubmit={submit} className="mt-6 space-y-6">
                <div>
                    <InputLabel htmlFor="name" value="Nama" />

                    <TextInput
                        id="name"
                        className={`mt-1 block w-full ${!isEditing ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : ''}`}
                        value={data.name}
                        onChange={(e) => setData('name', e.target.value)}
                        required
                        isFocused={isEditing}
                        autoComplete="name"
                        disabled={!isEditing}
                    />

                    <InputError className="mt-2" message={errors.name} />
                </div>

                <div>
                    <InputLabel htmlFor="email" value="Email" />

                    <TextInput
                        id="email"
                        type="email"
                        className={`mt-1 block w-full ${!isEditing ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : ''}`}
                        value={data.email}
                        onChange={(e) => setData('email', e.target.value)}
                        required
                        autoComplete="username"
                        disabled={!isEditing}
                    />

                    <InputError className="mt-2" message={errors.email} />
                </div>

                {mustVerifyEmail && user.email_verified_at === null && (
                    <div>
                        <p className="mt-2 text-sm text-gray-800">
                            Alamat email Anda belum diverifikasi.
                            <Link
                                href={route('verification.send')}
                                method="post"
                                as="button"
                                className="rounded-md text-sm text-gray-600 underline hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                            >
                                Klik di sini untuk mengirim ulang email verifikasi.
                            </Link>
                        </p>

                        {status === 'verification-link-sent' && (
                            <div className="mt-2 text-sm font-medium text-green-600">
                                Tautan verifikasi baru telah dikirim ke alamat email Anda.
                            </div>
                        )}
                    </div>
                )}

                <div className="flex items-center gap-4">
                    {!isEditing ? (
                        <PrimaryButton type="button" onClick={handleEditClick}>EDIT</PrimaryButton>
                    ) : (
                        <>
                            <PrimaryButton disabled={processing}>SIMPAN</PrimaryButton>
                            <button
                                type="button"
                                onClick={() => {
                                    setIsEditing(false);
                                    reset();
                                }}
                                className="text-sm text-gray-600 hover:text-gray-900 underline"
                            >
                                Batal
                            </button>
                        </>
                    )}

                    <Transition
                        show={recentlySuccessful}
                        enter="transition ease-in-out"
                        enterFrom="opacity-0"
                        leave="transition ease-in-out"
                        leaveTo="opacity-0"
                    >
                        <p className="text-sm text-gray-600">
                            Tersimpan.
                        </p>
                    </Transition>
                </div>
            </form>
        </section>
    );
}
