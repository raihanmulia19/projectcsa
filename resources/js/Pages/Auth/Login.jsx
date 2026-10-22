import { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import { Eye, EyeOff } from 'lucide-react';
import InputError from '@/Components/InputError';
import AuthLayout from '@/Layouts/AuthLayout';

export default function Login({ status, canResetPassword }) {
    const [showPassword, setShowPassword] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        username: '', 
        password: '',
        remember: false,
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    return (
        <AuthLayout>
            <Head title="Masuk" />

            <div className="flex w-full min-w-0 flex-col justify-center">
                <div className="w-full min-w-0">
                    <div className="mb-5 block lg:hidden sm:mb-7">
                        <img
                            className="mx-auto mb-3 h-20 w-20 rounded-full bg-white p-2 shadow-sm sm:h-28 sm:w-28"
                            src="/logo.png"
                            alt="Logo PT CITRA SARDELA ABADI"
                        />
                        <h1 className="text-center text-base font-semibold text-gray-800 sm:text-xl">
                            PT CITRA SARDELA ABADI
                        </h1>
                    </div>

                    <div className="mb-5 sm:mb-7">
                        <h1 className="mb-1.5 text-2xl font-bold text-gray-800 sm:mb-2 sm:text-3xl">Masuk</h1>
                        <p className="text-sm leading-relaxed text-gray-600 sm:text-base">
                            Masuk ke akun Anda untuk melanjutkan
                        </p>
                    </div>

                    {status && (
                        <div className="mb-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
                            {status}
                        </div>
                    )}

                    <form onSubmit={submit} className="space-y-4 sm:space-y-5">
                        <div className="space-y-2">
                            <label htmlFor="username" className="block text-sm font-semibold text-gray-700">
                                Username
                            </label>
                            <input
                                type="text"
                                id="username"
                                name="username"
                                value={data.username}
                                onChange={(e) => setData('username', e.target.value)}
                                className="h-11 w-full rounded-lg border border-gray-200 bg-white px-3.5 text-sm text-gray-700 placeholder:text-gray-400 focus:border-green-700 focus:outline-none focus:ring-2 focus:ring-green-200 sm:px-4"
                                placeholder="Masukkan Username Anda"
                                autoComplete="username"
                                autoFocus
                            />
                            <InputError message={errors.username} className="mt-2" />
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <label htmlFor="password" className="block text-sm font-semibold text-gray-700">
                                    Password
                                </label>
                            </div>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    id="password"
                                    name="password"
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                    className="h-11 w-full rounded-lg border border-gray-200 bg-white px-3.5 pr-11 text-sm text-gray-700 placeholder:text-gray-400 focus:border-green-700 focus:outline-none focus:ring-2 focus:ring-green-200 sm:px-4"
                                    placeholder="Masukkan password Anda"
                                    autoComplete="current-password"
                                />
                                <button
                                    type="button"
                                    onClick={togglePasswordVisibility}
                                    className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md text-gray-500 transition hover:bg-gray-100 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-200"
                                    aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
                                >
                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                            <InputError message={errors.password} className="mt-2" />
                        </div>

                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                id="remember"
                                name="remember"
                                checked={data.remember}
                                onChange={(e) => setData('remember', e.target.checked)}
                                className="h-4 w-4 rounded-sm border-gray-300 text-green-700 accent-green-600 focus:ring-green-600"
                            />
                            <label htmlFor="remember" className="ml-2 text-sm text-gray-700">
                                Ingat saya
                            </label>
                        </div>

                        <button
                            type="submit"
                            disabled={processing}
                            className="h-11 w-full rounded-lg bg-green-700 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-50 sm:h-12"
                        >
                            {processing ? 'Memproses...' : 'Masuk ke Akun'}
                        </button>
                    </form>
                </div>
            </div>
        </AuthLayout>
    );
}
