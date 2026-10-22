import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { useForm, usePage } from '@inertiajs/react';
import { Transition } from '@headlessui/react';
import { useState, useEffect } from 'react';
import Swal from 'sweetalert2';

export default function UpdateKaryawanInformationForm({ className = '' }) {
    const user = usePage().props.auth.user;
    const { karyawan } = usePage().props;

    const { data, setData, patch, errors, processing, recentlySuccessful, reset } =
        useForm({
            name: user.name,
            email: user.email,
            nik: karyawan?.nik || '',
            jabatan: karyawan?.jabatan || '',
            departemen: karyawan?.departemen || '',
            no_hp: karyawan?.no_hp || '',
            alamat: karyawan?.alamat || '',
            tanggal_lahir: karyawan?.tanggal_lahir || '',
            jenis_kelamin: karyawan?.jenis_kelamin || '',
        });

    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        if (recentlySuccessful) {
            setIsEditing(false);
        }
    }, [recentlySuccessful]);

    const submit = (e) => {
        e.preventDefault();
        patch(route('profile.karyawan.update'));
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
                    Profile Kepegawaian
                </h2>

                <p className="mt-1 text-sm text-gray-600">
                    Perbarui informasi akun dan data diri kepegawaian Anda di perusahaan.
                </p>
            </header>

            <form onSubmit={submit} className="mt-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <InputLabel htmlFor="name" value="Nama Lengkap" />
                        <TextInput
                            id="name"
                            className={`mt-1 block w-full ${!isEditing ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : ''}`}
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            required
                            disabled={!isEditing}
                            autoComplete="name"
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
                            disabled={!isEditing}
                            autoComplete="username"
                        />
                        <InputError className="mt-2" message={errors.email} />
                    </div>
                    <div>
                        <InputLabel htmlFor="nik" value="NIK" />
                        <TextInput
                            id="nik"
                            className={`mt-1 block w-full ${!isEditing ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : ''}`}
                            value={data.nik}
                            disabled={!isEditing}
                            onChange={(e) => setData('nik', e.target.value)}
                        />
                        <InputError className="mt-2" message={errors.nik} />
                    </div>

                    <div>
                        <InputLabel htmlFor="no_hp" value="Nomor HP" />
                        <TextInput
                            id="no_hp"
                            className={`mt-1 block w-full ${!isEditing ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : ''}`}
                            value={data.no_hp}
                            disabled={!isEditing}
                            onChange={(e) => setData('no_hp', e.target.value)}
                        />
                        <InputError className="mt-2" message={errors.no_hp} />
                    </div>

                    <div>
                        <InputLabel htmlFor="jabatan" value="Jabatan" />
                        <TextInput
                            id="jabatan"
                            className={`mt-1 block w-full ${!isEditing ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : ''}`}
                            value={data.jabatan}
                            disabled={!isEditing}
                            onChange={(e) => setData('jabatan', e.target.value)}
                        />
                        <InputError className="mt-2" message={errors.jabatan} />
                    </div>

                    <div>
                        <InputLabel htmlFor="departemen" value="Departemen" />
                        <TextInput
                            id="departemen"
                            className={`mt-1 block w-full ${!isEditing ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : ''}`}
                            value={data.departemen}
                            disabled={!isEditing}
                            onChange={(e) => setData('departemen', e.target.value)}
                        />
                        <InputError className="mt-2" message={errors.departemen} />
                    </div>

                    <div>
                        <InputLabel htmlFor="tanggal_lahir" value="Tanggal Lahir" />
                        <TextInput
                            id="tanggal_lahir"
                            type="date"
                            className={`mt-1 block w-full ${!isEditing ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : ''}`}
                            value={data.tanggal_lahir}
                            disabled={!isEditing}
                            onChange={(e) => setData('tanggal_lahir', e.target.value)}
                        />
                        <InputError className="mt-2" message={errors.tanggal_lahir} />
                    </div>

                    <div>
                        <InputLabel htmlFor="jenis_kelamin" value="Jenis Kelamin" />
                        <select
                            id="jenis_kelamin"
                            className={`mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm ${!isEditing ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : ''}`}
                            value={data.jenis_kelamin}
                            disabled={!isEditing}
                            onChange={(e) => setData('jenis_kelamin', e.target.value)}
                        >
                            <option value="">Pilih Jenis Kelamin</option>
                            <option value="Laki-laki">Laki-laki</option>
                            <option value="Perempuan">Perempuan</option>
                        </select>
                        <InputError className="mt-2" message={errors.jenis_kelamin} />
                    </div>
                </div>

                <div>
                    <InputLabel htmlFor="alamat" value="Alamat Lengkap" />
                    <textarea
                        id="alamat"
                        className={`mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm ${!isEditing ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : ''}`}
                        rows="3"
                        value={data.alamat}
                        disabled={!isEditing}
                        onChange={(e) => setData('alamat', e.target.value)}
                    ></textarea>
                    <InputError className="mt-2" message={errors.alamat} />
                </div>

                <div className="flex items-center gap-4">
                    {!isEditing ? (
                        <PrimaryButton type="button" onClick={handleEditClick}>Edit</PrimaryButton>
                    ) : (
                        <>
                            <PrimaryButton disabled={processing}>Save Profile</PrimaryButton>
                            <button
                                type="button"
                                onClick={() => {
                                    setIsEditing(false);
                                    reset();
                                }}
                                className="text-sm text-gray-600 hover:text-gray-900 underline"
                            >
                                Cancel
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
                        <p className="text-sm text-green-600">Berhasil disimpan.</p>
                    </Transition>
                </div>
            </form>
        </section>
    );
}
