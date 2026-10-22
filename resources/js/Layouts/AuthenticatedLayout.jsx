import { Link, usePage, router } from '@inertiajs/react';
import Swal from 'sweetalert2';
import { useState } from 'react';
import {
    LayoutDashboard,
    BarChart3,
    ShoppingCart,
    Banknote,
    Map,
    Users,
    FileText,
    Settings,
    LogOut,
    Calendar,
    ArrowUpCircle,
    PieChart as PieChartIcon,
    ChevronDown,
    ChevronRight,
    Tractor,
    ShoppingBag,
    TreePine,
    ClipboardList,
    CircleDot,
    Palmtree,
    Target,
    Archive,
    Sliders,
    UserCog,
    History,
    PieChart,
    FileSignature,
    Truck,
    CreditCard,
    Tags,
    Fuel,
    Wrench,
    FlaskConical,
    Square,
    Grid,
    Sprout,
    ClipboardCheck,
    Satellite,
    Clock,
    TrendingUp,
    GraduationCap,
    ShieldCheck,
    Briefcase,
    Factory,
    Landmark,
    Scale,
    Download,
    Menu,
    X,
    CheckCircle2
} from 'lucide-react';

export default function AuthenticatedLayout({ header, children }) {
    const user = usePage().props.auth.user;
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // Check if any produksi route is active to keep dropdown open by default
    const isProduksiActive = window.location.pathname.startsWith('/produksi');
    const [isProduksiOpen, setIsProduksiOpen] = useState(isProduksiActive);

    const isPenjualanActive = window.location.pathname.startsWith('/penjualan');
    const [isPenjualanOpen, setIsPenjualanOpen] = useState(isPenjualanActive);

    const isBiayaActive = window.location.pathname.startsWith('/biaya');
    const [isBiayaOpen, setIsBiayaOpen] = useState(isBiayaActive);

    const isArealActive = window.location.pathname.startsWith('/areal');
    const [isArealOpen, setIsArealOpen] = useState(isArealActive);

    const isSdmActive = window.location.pathname.startsWith('/sdm');
    const [isSdmOpen, setIsSdmOpen] = useState(isSdmActive);

    const isLaporanActive = window.location.pathname.startsWith('/laporan');
    const [isLaporanOpen, setIsLaporanOpen] = useState(isLaporanActive);

    const isPengaturanActive = window.location.pathname.startsWith('/pengaturan');
    const [isPengaturanOpen, setIsPengaturanOpen] = useState(isPengaturanActive);

    const baseNav = [
        {
            name: 'Dashboard',
            href: user.role === 'atasan' ? route('dashboard.atasan') : route('dashboard.admin'),
            icon: LayoutDashboard,
            active: route().current('dashboard.atasan') || route().current('dashboard.admin')
        },
    ];

    const produksiNav = [
        { name: 'Rekap Produksi', href: '/produksi/rekap', icon: BarChart3, active: window.location.pathname === '/produksi/rekap' },
        { name: 'Produksi Per Blok', href: '/produksi/blok', icon: Map, active: window.location.pathname === '/produksi/blok' },
        { name: 'Produksi Harian', href: '/produksi/harian', icon: Calendar, active: window.location.pathname === '/produksi/harian' },
        { name: 'Laporan', href: '/produksi/laporan', icon: FileText, active: window.location.pathname === '/produksi/laporan' },
        { name: 'Produktivitas', href: '/produksi/produktivitas', icon: ArrowUpCircle, active: window.location.pathname === '/produksi/produktivitas' },
        { name: 'Kualitas TBS', href: '/produksi/kualitas', icon: PieChartIcon, active: window.location.pathname === '/produksi/kualitas' },
    ];

    const penjualanNav = [
        { name: 'Rekap Penjualan', href: '/penjualan/rekap', icon: PieChart, active: window.location.pathname === '/penjualan/rekap' },
        { name: 'Penjualan per Pembeli', href: '/penjualan/pembeli', icon: Users, active: window.location.pathname === '/penjualan/pembeli' },
        { name: 'Harga & Kontrak', href: '/penjualan/harga', icon: FileSignature, active: window.location.pathname === '/penjualan/harga' },
        { name: 'Surat Jalan (DO)', href: '/penjualan/do', icon: Truck, active: window.location.pathname === '/penjualan/do' },
        { name: 'Piutang & Pembayaran', href: '/penjualan/piutang', icon: CreditCard, active: window.location.pathname === '/penjualan/piutang' },
    ];

    const biayaNav = [
        { name: 'Rekap Biaya', href: '/biaya/rekap', icon: PieChart, active: window.location.pathname === '/biaya/rekap' },
        { name: 'Biaya per Kategori', href: '/biaya/kategori', icon: Tags, active: window.location.pathname === '/biaya/kategori' },
        { name: 'Pembelian & Vendor', href: '/biaya/vendor', icon: ShoppingCart, active: window.location.pathname === '/biaya/vendor' },
        { name: 'BBM & Transportasi', href: '/biaya/bbm', icon: Fuel, active: window.location.pathname === '/biaya/bbm' },
        { name: 'Pemeliharaan Alat', href: '/biaya/alat', icon: Wrench, active: window.location.pathname === '/biaya/alat' },
        { name: 'Pupuk & Bahan Kimia', href: '/biaya/pupuk', icon: FlaskConical, active: window.location.pathname === '/biaya/pupuk' },
    ];

    const arealNav = [
        { name: 'Peta Interaktif', href: '/areal/peta', icon: Map, active: window.location.pathname === '/areal/peta' },
        { name: 'Data Areal', href: '/areal/data', icon: Square, active: window.location.pathname === '/areal/data' },
        { name: 'Data Blok', href: '/areal/blok', icon: Grid, active: window.location.pathname === '/areal/blok' },
        { name: 'Tanaman (TBM/TM)', href: '/areal/tanaman', icon: Sprout, active: window.location.pathname === '/areal/tanaman' },
        { name: 'Realisasi Pekerjaan', href: '/areal/realisasi', icon: ClipboardCheck, active: window.location.pathname === '/areal/realisasi' },
        { name: 'Monitoring Satelit', href: '/areal/satelit', icon: Satellite, active: window.location.pathname === '/areal/satelit' },
    ];

    const sdmNav = [
        { name: 'Data Karyawan', href: '/sdm/karyawan', icon: Users, active: window.location.pathname === '/sdm/karyawan' },
        { name: 'Absensi & Kehadiran', href: '/sdm/absensi', icon: Clock, active: window.location.pathname === '/sdm/absensi' },
        { name: 'Persetujuan Pulang', href: '/sdm/persetujuan-pulang', icon: CheckCircle2, active: window.location.pathname === '/sdm/persetujuan-pulang' },
        { name: 'Penggajian', href: '/sdm/penggajian', icon: Banknote, active: window.location.pathname === '/sdm/penggajian' },
        { name: 'Produktivitas Tenaga Kerja', href: '/sdm/produktivitas', icon: TrendingUp, active: window.location.pathname === '/sdm/produktivitas' },
        { name: 'Pelatihan & Sertifikasi', href: '/sdm/pelatihan', icon: GraduationCap, active: window.location.pathname === '/sdm/pelatihan' },
        { name: 'K3 & Keselamatan', href: '/sdm/k3', icon: ShieldCheck, active: window.location.pathname === '/sdm/k3' },
    ];

    const laporanNav = [
        { name: 'Laporan Manajemen', href: '/laporan/manajemen', icon: Briefcase, active: window.location.pathname === '/laporan/manajemen' },
        { name: 'Laporan Produksi', href: '/laporan/produksi', icon: Factory, active: window.location.pathname === '/laporan/produksi' },
        { name: 'Laporan Penjualan', href: '/laporan/penjualan', icon: TrendingUp, active: window.location.pathname === '/laporan/penjualan' },
        { name: 'Laporan Keuangan', href: '/laporan/keuangan', icon: Landmark, active: window.location.pathname === '/laporan/keuangan' },
        { name: 'Laporan SDM', href: '/laporan/sdm', icon: Users, active: window.location.pathname === '/laporan/sdm' },
        { name: 'Laporan Regulasi & Pajak', href: '/laporan/regulasi', icon: Scale, active: window.location.pathname === '/laporan/regulasi' },
        { name: 'Ekspor Data', href: '/laporan/ekspor', icon: Download, active: window.location.pathname === '/laporan/ekspor' },
    ];

    const pengaturanSuperAdminNav = [
        { name: 'Master Data', href: '/pengaturan/master', icon: Archive, active: window.location.pathname === '/pengaturan/master' },
        { name: 'Konfigurasi', href: '/pengaturan/konfigurasi', icon: Sliders, active: window.location.pathname === '/pengaturan/konfigurasi' },
        { name: 'Akun Pengguna', href: '/pengaturan/akun', icon: UserCog, active: window.location.pathname.startsWith('/pengaturan/akun') },
        { name: 'Audit Log', href: '/pengaturan/audit', icon: History, active: window.location.pathname === '/pengaturan/audit' },
    ];

    const renderDropdown = (title, icon, isOpen, setIsOpen, navItems, isActive = false) => (
        <div className="mb-1">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-200 ${isActive || isOpen
                    ? 'bg-white/15 text-white shadow-sm backdrop-blur-md border border-white/10'
                    : 'text-white/70 hover:bg-white/10 hover:text-white border border-transparent'
                    }`}
            >
                <div className="flex items-center gap-3">
                    <div className={`${isActive || isOpen ? 'text-green-300' : 'text-white/60 group-hover:text-white/90'}`}>
                        {icon}
                    </div>
                    <span className="text-sm font-medium tracking-wide">{title}</span>
                </div>
                {isOpen ? <ChevronDown size={16} className="text-white/60" /> : <ChevronRight size={16} className="text-white/40" />}
            </button>

            <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-96 opacity-100 mt-1' : 'max-h-0 opacity-0'}`}>
                <div className="space-y-0.5 ml-4 border-l-2 border-white/10 pl-2 py-1">
                    {navItems.map((item) => {
                        const Icon = item.icon || CircleDot;
                        const isSubActive = item.active;
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={`group flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 ${isSubActive
                                    ? 'bg-green-700/80 text-white font-semibold shadow-md backdrop-blur-sm'
                                    : 'text-white/60 hover:bg-white/10 hover:text-white'
                                    }`}
                            >
                                <Icon size={16} className={isSubActive ? 'text-green-300' : 'text-white/40 group-hover:text-white/80'} />
                                <span className="text-[13px]">{item.name}</span>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </div>
    );

    return (
        <div className="flex h-screen bg-gray-50 font-sans overflow-hidden relative">
            {/* Mobile Sidebar Overlay */}
            {isMobileMenuOpen && (
                <div
                    className="absolute inset-0 bg-black/60 z-40 md:hidden"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            {/* Sidebar */}
            <div
                className={`w-72 text-white flex-shrink-0 flex flex-col h-full shadow-2xl z-50 overflow-y-auto transform transition-transform duration-300 absolute inset-y-0 left-0 md:relative md:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}
                style={{
                    backgroundImage: 'url(/sawit-bg.jpg)',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                }}
            >
                {/* Dark overlay agar teks terbaca */}
                <div className="absolute inset-0 bg-[#061c10]/60 backdrop-blur-sm z-0" />
                {/* Konten sidebar — harus relative z-10 agar di atas overlay */}
                <div className="relative z-10 flex flex-col flex-1 overflow-y-auto">
                    <div className="p-6 flex items-center gap-4">
                        <div className="bg-white p-1.5 rounded-2xl shadow-lg border-2 border-white/20">
                            <img src="/logo.png" alt="Logo" className="h-10 w-10 object-contain" />
                        </div>
                        <div>
                            <span className="block font-extrabold text-[15px] tracking-wide text-white leading-tight">PT CITRA</span>
                            <span className="block font-extrabold text-[15px] tracking-wide text-white leading-tight">SARDELA ABADI</span>
                            <p className="text-[10px] text-green-300 font-medium mt-1 tracking-wider uppercase">Sistem Manajemen Terpadu</p>
                        </div>
                    </div>

                    <div className="mx-6 mb-4 border-t border-white/10" />

                    <nav className="flex-1 px-4 space-y-2">
                        {/* Base Nav */}
                        <div className="mb-2">
                            {baseNav.map((item) => {
                                const Icon = item.icon;
                                return (
                                    <Link
                                        key={item.name}
                                        href={item.href}
                                        className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 ${item.active
                                            ? 'bg-white/15 text-white shadow-sm backdrop-blur-md border border-white/10'
                                            : 'text-white/70 hover:bg-white/10 hover:text-white border border-transparent'
                                            }`}
                                    >
                                        <div className={`${item.active ? 'text-green-300' : 'text-white/60 group-hover:text-white/90'}`}>
                                            <Icon size={18} />
                                        </div>
                                        <span className="text-sm font-medium tracking-wide">{item.name}</span>
                                    </Link>
                                );
                            })}
                        </div>

                        {/* Modul Produksi - Only for Admin & Super Admin */}
                        {(user.role === 'admin' || user.role === 'super_admin') && (
                            <div className="space-y-1">
                                {renderDropdown('Produksi', <Tractor size={18} />, isProduksiOpen, setIsProduksiOpen, produksiNav, isProduksiActive)}
                                {renderDropdown('Penjualan', <ShoppingBag size={18} />, isPenjualanOpen, setIsPenjualanOpen, penjualanNav, isPenjualanActive)}
                                {renderDropdown('Biaya Operasional', <Banknote size={18} />, isBiayaOpen, setIsBiayaOpen, biayaNav, isBiayaActive)}
                                {renderDropdown('Areal & Blok', <Map size={18} />, isArealOpen, setIsArealOpen, arealNav, isArealActive)}
                                {renderDropdown('Sumber Daya Manusia', <Users size={18} />, isSdmOpen, setIsSdmOpen, sdmNav, isSdmActive)}
                                {renderDropdown('Laporan', <ClipboardList size={18} />, isLaporanOpen, setIsLaporanOpen, laporanNav, isLaporanActive)}
                                {user.role === 'super_admin' && renderDropdown('Pengaturan Sistem', <Settings size={18} />, isPengaturanOpen, setIsPengaturanOpen, pengaturanSuperAdminNav, isPengaturanActive)}
                            </div>
                        )}

                        {/* Profil Akun */}
                        <div className="mt-1">
                            <Link
                                href={route('profile.edit')}
                                className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 ${route().current('profile.edit')
                                    ? 'bg-white/15 text-white shadow-sm backdrop-blur-md border border-white/10'
                                    : 'text-white/70 hover:bg-white/10 hover:text-white border border-transparent'
                                    }`}
                            >
                                <div className={`${route().current('profile.edit') ? 'text-green-300' : 'text-white/60 group-hover:text-white/90'}`}>
                                    <UserCog size={18} />
                                </div>
                                <span className="text-sm font-medium tracking-wide">Profil Akun</span>
                            </Link>
                        </div>
                    </nav>

                    <div className="p-5 mt-4 border-t border-white/10 bg-black/20 backdrop-blur-md mt-auto">
                        <div className="flex flex-col gap-4">
                            <div className="text-center">
                                <p className="text-xs font-semibold tracking-wider text-white/80 uppercase">PT Citra Sardela Abadi</p>
                                <p className="text-[10px] text-white/50 mt-1">
                                    copyright &copy; 2026 Muhammad Raihan<br />All Rights Reserved
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
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col h-full overflow-hidden">
                {/* Mobile Header */}
                <div className="md:hidden bg-[#143d2c] p-4 flex justify-between items-center text-white relative z-30 shadow-md">
                    <div className="flex items-center gap-3">
                        <button onClick={() => setIsMobileMenuOpen(true)} className="p-1 -ml-1 text-white/80 hover:text-white hover:bg-white/10 rounded-md">
                            <Menu size={24} />
                        </button>
                        <div className="flex items-center gap-2">
                            <img src="/logo.png" alt="Logo" className="h-8 w-8 bg-white rounded-full p-0.5" />
                            <span className="font-bold text-[13px] tracking-widest">PT CSA</span>
                        </div>
                    </div>
                </div>

                {header && (
                    <header className="bg-white shadow-sm border-b border-gray-200 py-4 px-8 z-0">
                        {header}
                    </header>
                )}
                <main className="flex-1 overflow-y-auto p-4 md:p-8 bg-gray-50">
                    {children}
                </main>
            </div>
        </div>
    );
}
