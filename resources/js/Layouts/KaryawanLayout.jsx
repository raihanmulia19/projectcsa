import { Link, usePage, router } from '@inertiajs/react';
import Swal from 'sweetalert2';
import { useState } from 'react';
import { Camera, Clock, LogOut, User, Menu, X } from 'lucide-react';

export default function KaryawanLayout({ header, children }) {
    const { url } = usePage();
    const user = usePage().props.auth.user;
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    return (
        <div className="h-screen bg-gray-50 flex flex-col font-sans pb-16 md:pb-0 overflow-hidden">
            {/* Top Navbar (Mobile Only) */}
            <nav className="bg-[#143d2c] text-white p-4 flex justify-between items-center shadow-md z-30 relative flex-shrink-0 md:hidden">
                <div className="flex items-center gap-3">
                    <div className="bg-white p-1 rounded-full shadow-inner">
                        <img src="/logo.png" alt="Logo" className="h-7 w-7 object-contain" />
                    </div>
                    <div>
                        <h1 className="font-bold text-[13px] tracking-widest leading-none">PT CSA</h1>
                        <span className="text-[11px] text-green-300 font-medium">Halo, {user.name}</span>
                    </div>
                </div>
            </nav>

            <div className="flex-1 flex w-full overflow-hidden relative">
                {/* Mobile Sidebar Overlay */}
                {isMobileMenuOpen && (
                    <div 
                        className="absolute inset-0 bg-black/60 z-40 md:hidden"
                        onClick={() => setIsMobileMenuOpen(false)}
                    />
                )}

                {/* Sidebar */}
                <div 
                    className={`w-72 flex-col flex-shrink-0 h-full shadow-2xl absolute md:relative z-50 md:z-10 transition-transform duration-300 flex ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}
                    style={{
                        backgroundImage: 'url(/sawit-bg.jpg)',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                    }}
                >
                    {/* Dark overlay */}
                    <div className="absolute inset-0 bg-[#061c10]/60 backdrop-blur-sm z-0" />
                    
                    {/* Content */}
                    <div className="relative z-10 flex flex-col flex-1 overflow-y-auto">
                        <div className="p-6 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="bg-white p-1.5 rounded-2xl shadow-lg border-2 border-white/20">
                                    <img src="/logo.png" alt="Logo" className="h-10 w-10 object-contain" />
                                </div>
                                <div>
                                    <h1 className="font-extrabold text-[15px] tracking-wide text-white leading-tight">PT CITRA</h1>
                                    <h1 className="font-extrabold text-[15px] tracking-wide text-white leading-tight">SARDELA ABADI</h1>
                                    <p className="text-[10px] text-green-300 font-medium mt-1 tracking-wider uppercase">Sistem Karyawan</p>
                                </div>
                            </div>
                            <button onClick={() => setIsMobileMenuOpen(false)} className="md:hidden text-white/50 hover:text-white">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="mx-6 mb-4 border-t border-white/10" />

                        <nav className="flex-1 px-4 space-y-2">
                            {/* Menu Karyawan Text Removed */}
                            <Link 
                                href={route('karyawan.absensi')} 
                                className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 ${url.startsWith('/karyawan/absensi') ? 'bg-white/15 text-white shadow-sm backdrop-blur-md border border-white/10' : 'text-white/70 hover:bg-white/10 hover:text-white border border-transparent'}`}
                            >
                                <div className={`${url.startsWith('/karyawan/absensi') ? 'text-green-300' : 'text-white/60 group-hover:text-white/90'}`}>
                                    <Camera size={18} />
                                </div>
                                <span className="text-sm font-medium tracking-wide">Absen</span>
                            </Link>

                            <Link 
                                href={route('karyawan.riwayat')} 
                                className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 ${url.startsWith('/karyawan/riwayat-absen') ? 'bg-white/15 text-white shadow-sm backdrop-blur-md border border-white/10' : 'text-white/70 hover:bg-white/10 hover:text-white border border-transparent'}`}
                            >
                                <div className={`${url.startsWith('/karyawan/riwayat-absen') ? 'text-green-300' : 'text-white/60 group-hover:text-white/90'}`}>
                                    <Clock size={18} />
                                </div>
                                <span className="text-sm font-medium tracking-wide">Riwayat Kehadiran</span>
                            </Link>

                            <Link 
                                href={route('profile.edit')} 
                                className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 ${url.startsWith('/profile') ? 'bg-white/15 text-white shadow-sm backdrop-blur-md border border-white/10' : 'text-white/70 hover:bg-white/10 hover:text-white border border-transparent'}`}
                            >
                                <div className={`${url.startsWith('/profile') ? 'text-green-300' : 'text-white/60 group-hover:text-white/90'}`}>
                                    <User size={18} />
                                </div>
                                <span className="text-sm font-medium tracking-wide">Profile</span>
                            </Link>
                        </nav>
                        
                        <div className="p-5 mt-4 border-t border-white/10 bg-black/20 backdrop-blur-md mt-auto">
                            <div className="text-center mb-4">
                                <p className="text-xs font-semibold tracking-wider text-white/80 uppercase">PT Citra Sardela Abadi</p>
                                <p className="text-[10px] text-white/50 mt-1">
                                    copyright &copy; 2026 Muhammad Raihan<br/>All Rights Reserved
                                </p>
                            </div>
                            <Link
                                href={route('logout')}
                                method="post"
                                as="button"
                                className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-2.5 text-sm font-medium text-red-400 transition-all hover:bg-red-500/20 hover:text-red-300 hover:border-red-500/30"
                                onClick={(e) => {
                                    e.preventDefault();
                                    Swal.fire({
                                        title: 'Yakin ingin keluar?',
                                        icon: 'warning',
                                        showCancelButton: true,
                                        confirmButtonColor: '#ef4444',
                                        cancelButtonColor: '#3b82f6',
                                        confirmButtonText: 'Ya',
                                        cancelButtonText: 'Batal'
                                    }).then((result) => {
                                        if (result.isConfirmed) {
                                            router.post(route('logout'));
                                        }
                                    });
                                }}
                            >
                                <LogOut size={16} />
                                <span>Logout</span>
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="flex-1 flex flex-col w-full min-w-0">
                    {/* Optional Header Area */}
                    {header && (
                        <header className="hidden md:block bg-white shadow-sm border-b border-gray-200 py-4 px-4 sm:px-6 z-20 relative">
                            {header}
                        </header>
                    )}

                    <main className="flex-1 overflow-y-auto p-4 md:p-8 bg-gray-50 w-full max-w-xl mx-auto md:max-w-none flex justify-center">
                        <div className="w-full">
                            {children}
                        </div>
                    </main>
                </div>
            </div>

            {/* Bottom Navigation (Mobile friendly) */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around items-center z-40 shadow-[0_-4px_15px_-3px_rgba(0,0,0,0.1)] pb-safe rounded-t-xl">
                <Link 
                    href={route('karyawan.absensi')} 
                    className={`flex-1 flex flex-col items-center py-3 transition-colors relative ${url.startsWith('/karyawan/absensi') ? 'text-[#143d2c]' : 'text-gray-400 hover:text-gray-600'}`}
                >
                    {url.startsWith('/karyawan/absensi') && (
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-1 bg-[#143d2c] rounded-b-full"></div>
                    )}
                    <Camera size={22} className={`mb-1 ${url.startsWith('/karyawan/absensi') ? 'text-green-600' : ''}`} />
                    <span className="text-[10px] font-semibold tracking-wide">Absen</span>
                </Link>

                <Link 
                        href={route('karyawan.riwayat')} 
                        className={`flex-1 flex flex-col items-center py-3 transition-colors relative ${url.startsWith('/karyawan/riwayat-absen') ? 'text-[#143d2c]' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                        {url.startsWith('/karyawan/riwayat-absen') && (
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-1 bg-[#143d2c] rounded-b-full"></div>
                        )}
                        <Clock size={22} className={`mb-1 ${url.startsWith('/karyawan/riwayat-absen') ? 'text-green-600' : ''}`} />
                        <span className="text-[10px] font-semibold tracking-wide">Riwayat</span>
                    </Link>

                    <Link 
                        href={route('profile.edit')} 
                        className={`flex-1 flex flex-col items-center py-3 transition-colors relative ${url.startsWith('/profile') ? 'text-[#143d2c]' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                        {url.startsWith('/profile') && (
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-1 bg-[#143d2c] rounded-b-full"></div>
                        )}
                        <User size={22} className={`mb-1 ${url.startsWith('/profile') ? 'text-green-600' : ''}`} />
                        <span className="text-[10px] font-semibold tracking-wide">Profile</span>
                    </Link>
            </div>
        </div>
    );
}
