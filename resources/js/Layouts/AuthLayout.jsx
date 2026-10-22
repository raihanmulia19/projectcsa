export default function AuthLayout({ children }) {
    return (
        <div className="flex min-h-screen bg-white">
            {/* Bagian Kiri: Form Login */}
            <div className="flex w-full flex-col justify-center px-6 py-12 lg:w-1/2 lg:px-8 xl:px-12">
                <div className="mx-auto w-full max-w-sm lg:max-w-md">
                    {children}
                </div>
            </div>

            {/* Bagian Kanan: Branding (Hanya tampil di Desktop) */}
            <div className="relative hidden w-full flex-col justify-center items-center bg-gradient-to-br from-green-600 to-green-800 lg:flex lg:w-1/2 overflow-hidden">
                {/* Dekorasi latar belakang membulat seperti di screenshot */}
                <div className="absolute top-0 left-0 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-green-500 opacity-20 blur-3xl"></div>
                <div className="absolute bottom-0 right-0 h-[600px] w-[600px] translate-x-1/3 translate-y-1/3 rounded-full bg-green-900 opacity-40 blur-3xl"></div>
                <div className="absolute top-1/2 left-1/4 h-64 w-64 -translate-y-1/2 rounded-full bg-green-400 opacity-10 blur-2xl"></div>

                <div className="relative z-10 flex flex-col items-center px-12 text-center text-white">
                    <img 
                        src="/logo.png" 
                        alt="Logo PT CITRA SARDELA ABADI" 
                        className="mb-8 h-40 w-40 rounded-full bg-white p-3 shadow-2xl" 
                    />
                    <h2 className="mb-4 text-3xl font-bold leading-tight">
                        Selamat Datang di Website<br/>PT CITRA SARDELA ABADI
                    </h2>
                    <p className="text-lg text-green-100 max-w-md">
                        Kelola informasi perkebunan dan operasional sawit dengan mudah. Silakan login untuk melanjutkan.
                    </p>
                    
                    {/* Pagination dots (dekorasi) */}
                    <div className="mt-12 flex space-x-3">
                        <div className="h-2 w-2 rounded-full bg-white"></div>
                        <div className="h-2 w-2 rounded-full bg-white/40"></div>
                        <div className="h-2 w-2 rounded-full bg-white/40"></div>
                    </div>
                </div>
            </div>
        </div>
    );
}
