import React, { useState, useEffect, useRef } from 'react';
import { usePage, Head, router } from '@inertiajs/react';
import KaryawanLayout from '@/Layouts/KaryawanLayout';
import Swal from 'sweetalert2';

export default function Absensi({ auth, absensi_hari_ini }) {
    const { errors, flash } = usePage().props;
    const [currentTime, setCurrentTime] = useState(new Date());
    const [location, setLocation] = useState({ latitude: null, longitude: null });
    const [stream, setStream] = useState(null);
    const [processing, setProcessing] = useState(false);
    const [tipeKehadiran, setTipeKehadiran] = useState(absensi_hari_ini?.tipe_kehadiran || 'wfo');
    const videoRef = useRef(null);
    const canvasRef = useRef(null);

    // Jam Digital Real-time
    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    // Akses Kamera
    useEffect(() => {
        navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } })
            .then((mediaStream) => {
                setStream(mediaStream);
                if (videoRef.current) {
                    videoRef.current.srcObject = mediaStream;
                }
            })
            .catch((err) => {
                Swal.fire('Akses Kamera Ditolak', 'Mohon izinkan akses kamera untuk melakukan absensi.', 'error');
            });

        return () => {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
        };
    }, []);

    // Akses Lokasi (Geofencing)
    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setLocation({
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude
                    });
                },
                (error) => {
                    Swal.fire('Akses Lokasi Ditolak', 'Mohon izinkan akses lokasi agar absensi dapat diproses.', 'error');
                }
            );
        } else {
            Swal.fire('Error', 'Browser tidak mendukung Geolocation.', 'error');
        }
    }, []);

    // Handle Pesan Flash
    useEffect(() => {
        if (flash?.success) {
            Swal.fire('Berhasil!', flash.success, 'success');
        }
        if (errors?.message) {
            Swal.fire('Gagal!', errors.message, 'error');
        }
    }, [flash, errors]);

    // Fungsi Capture & Submit
    const handleAbsen = (jenis) => {
        if (!location.latitude || !location.longitude) {
            Swal.fire('Lokasi Belum Ditemukan', 'Harap tunggu hingga sistem mendeteksi lokasi Anda, atau izinkan akses lokasi.', 'warning');
            return;
        }

        const video = videoRef.current;
        const canvas = canvasRef.current;

        if (video && canvas) {
            // Mengambil aspect ratio sesuai dengan yang dilihat user di layarnya
            const targetRatio = video.clientWidth / video.clientHeight;
            const videoRatio = video.videoWidth / video.videoHeight;
            let drawWidth = video.videoWidth;
            let drawHeight = video.videoHeight;
            let startX = 0;
            let startY = 0;

            if (videoRatio > targetRatio) {
                drawWidth = video.videoHeight * targetRatio;
                startX = (video.videoWidth - drawWidth) / 2;
            } else {
                drawHeight = video.videoWidth / targetRatio;
                startY = (video.videoHeight - drawHeight) / 2;
            }

            canvas.width = drawWidth;
            canvas.height = drawHeight;
            const context = canvas.getContext('2d');
            
            // Untuk memastikan foto yang diambil tidak mirror (sama seperti yang dilihat user)
            context.translate(canvas.width, 0);
            context.scale(-1, 1);
            context.drawImage(video, startX, startY, drawWidth, drawHeight, 0, 0, drawWidth, drawHeight);
            
            // Kembalikan scale ke normal untuk menulis teks (watermark) agar tidak terbalik
            context.translate(canvas.width, 0);
            context.scale(-1, 1);

            // Menambahkan background semi-transparan untuk watermark
            context.fillStyle = "rgba(0, 0, 0, 0.6)";
            context.fillRect(0, canvas.height - 80, canvas.width, 80);

            // Menambahkan teks watermark (Waktu & Lokasi)
            context.font = "bold 16px Arial";
            context.fillStyle = "white";
            
            const waktu = new Date().toLocaleString('id-ID', { dateStyle: 'full', timeStyle: 'long' });
            const titikLokasi = `Lat: ${location.latitude.toFixed(6)}, Long: ${location.longitude.toFixed(6)}`;
            const appName = "PT Citra Sardela Abadi";
            
            // Menggambar bayangan teks (stroke) agar lebih mudah dibaca
            context.shadowColor = "black";
            context.shadowBlur = 4;
            
            context.fillText(appName, 15, canvas.height - 55);
            context.font = "14px Arial";
            context.fillText(`Waktu  : ${waktu}`, 15, canvas.height - 35);
            context.fillText(`Lokasi : ${titikLokasi}`, 15, canvas.height - 15);

            // Hapus shadow untuk proses selanjutnya
            context.shadowBlur = 0;

            const imageBase64 = canvas.toDataURL('image/jpeg', 0.85);

            const formData = {
                foto: imageBase64,
                latitude: location.latitude,
                longitude: location.longitude,
                tipe_kehadiran: tipeKehadiran
            };

            const submitData = (dataToSend) => {
                setProcessing(true);
                if (jenis === 'datang') {
                    router.post(route('absensi.store'), dataToSend, {
                        onFinish: () => setProcessing(false),
                        onError: (err) => {
                            if(err.message) Swal.fire('Gagal!', err.message, 'error');
                        }
                    });
                } else if (jenis === 'pulang') {
                    router.post(route('absensi.update'), { ...dataToSend, _method: 'PUT' }, {
                        onFinish: () => setProcessing(false),
                        onError: (err) => {
                            if(err.message) Swal.fire('Gagal!', err.message, 'error');
                        }
                    });
                }
            };

            if (jenis === 'pulang') {
                const now = new Date();
                const limitTime = new Date();
                limitTime.setHours(17, 0, 0, 0);

                if (now < limitTime) {
                    Swal.fire({
                        title: 'Pulang Cepat?',
                        text: 'Anda absen sebelum jam pulang (17:00). Silakan masukkan alasan Pulang Cepat:',
                        input: 'textarea',
                        inputPlaceholder: 'Ketik alasan Anda di sini...',
                        icon: 'warning',
                        showCancelButton: true,
                        confirmButtonText: 'Kirim Absen',
                        cancelButtonText: 'Batal',
                        confirmButtonColor: '#16a34a',
                        cancelButtonColor: '#d33',
                        inputValidator: (value) => {
                            if (!value) {
                                return 'Alasan wajib diisi!'
                            }
                        }
                    }).then((result) => {
                        if (result.isConfirmed) {
                            formData.alasan_pulang_cepat = result.value;
                            submitData(formData);
                        }
                    });
                } else {
                    submitData(formData);
                }
            } else {
                submitData(formData);
            }
        }
    };

    return (
        <KaryawanLayout
            header={
                <div className="flex justify-between items-center">
                    <div>
                        <h2 className="text-xl font-bold text-[#143d2c] tracking-tight uppercase">ABSENSI & KEHADIRAN</h2>
                        <p className="text-xs text-gray-500 mt-0.5">Geofencing & Deteksi Wajah</p>
                    </div>
                </div>
            }
        >
            <Head title="Absensi Kehadiran" />

            <div className="flex items-center justify-center">
                <div className="bg-white p-6 md:p-8 rounded-3xl shadow-xl w-full max-w-md md:max-w-3xl border border-gray-100">
                    {/* Jam Digital */}
                    <div className="text-center mb-4">
                        <p className="text-3xl font-mono font-bold text-green-600 tracking-wider">
                            {currentTime.toLocaleTimeString('id-ID')}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                            {currentTime.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                        </p>
                    </div>

                    {/* Kamera Stream */}
                    <div className="relative rounded-2xl overflow-hidden bg-black aspect-[3/4] md:aspect-video mb-6 shadow-inner ring-4 ring-gray-50 mx-auto w-full max-w-sm md:max-w-2xl">
                        <video 
                            ref={videoRef} 
                            autoPlay 
                            playsInline 
                            muted 
                            className="w-full h-full object-cover transform -scale-x-100"
                        ></video>
                        <canvas ref={canvasRef} className="hidden"></canvas>
                        
                        {/* Overlay Panduan Wajah Premium */}
                        <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center">
                            <svg 
                                className="absolute inset-0 w-full h-full" 
                                viewBox="0 0 300 400" 
                                preserveAspectRatio="xMidYMid meet"
                            >
                                <defs>
                                    <mask id="face-mask">
                                        <rect x="-1000" y="-1000" width="2500" height="2500" fill="white" />
                                        <path
                                            d="M -45 360 C 20 350, 72 330, 85 310 C 98 280, 98 260, 92 240 C 79 230, 66 210, 66 180 C 46 180, 46 130, 66 130 C 66 70, 98 30, 150 30 C 202 30, 234 70, 234 130 C 254 130, 254 180, 234 180 C 234 210, 221 230, 208 240 C 202 260, 202 280, 215 310 C 228 330, 280 350, 345 360 L 350 400 L -50 400 Z"
                                            fill="black"
                                        />
                                    </mask>
                                </defs>
                                
                                {/* Latar Gelap dengan Lubang */}
                                <rect x="-1000" y="-1000" width="2500" height="2500" fill="rgba(0, 0, 0, 0.65)" mask="url(#face-mask)" />

                                {/* Garis Outline Putus-putus */}
                                <path
                                    d="M -45 360 C 20 350, 72 330, 85 310 C 98 280, 98 260, 92 240 C 79 230, 66 210, 66 180 C 46 180, 46 130, 66 130 C 66 70, 98 30, 150 30 C 202 30, 234 70, 234 130 C 254 130, 254 180, 234 180 C 234 210, 221 230, 208 240 C 202 260, 202 280, 215 310 C 228 330, 280 350, 345 360"
                                    fill="none"
                                    stroke="rgba(255, 255, 255, 0.9)"
                                    strokeWidth="2.5"
                                    strokeDasharray="8 6"
                                    strokeLinecap="round"
                                />
                            </svg>
                            
                            {/* Teks Instruksi */}
                            <div className="absolute top-4 bg-black/40 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/20 shadow-lg">
                                <p className="text-white text-[10px] sm:text-xs font-semibold tracking-wide">
                                    Posisikan wajah Anda di dalam garis
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Informasi Lokasi & Status */}
                    <div className="bg-gray-50 p-4 rounded-xl mb-6 border border-gray-200">
                        <p className="text-sm text-gray-600 mb-1 flex items-center justify-between">
                            <span className="font-semibold">Status Lokasi: </span> 
                            {location.latitude && location.longitude ? (
                                <span className="text-green-600 font-medium flex items-center gap-1">
                                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                    Ditemukan
                                </span>
                            ) : (
                                <span className="text-amber-500 font-medium flex items-center gap-1 animate-pulse">
                                    <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                                    Mencari GPS...
                                </span>
                            )}
                        </p>
                        {absensi_hari_ini && (
                            <div className="text-sm text-gray-600 mt-3 border-t border-gray-200 pt-3 space-y-2">
                                <p className="flex justify-between items-center">
                                    <span className="text-gray-500">Jam Datang</span>
                                    <span className="font-bold text-green-700 bg-green-100 px-3 py-1 rounded-md">{absensi_hari_ini.waktu_datang}</span>
                                </p>
                                {absensi_hari_ini.waktu_pulang && (
                                    <p className="flex justify-between items-center">
                                        <span className="text-gray-500">Jam Pulang</span>
                                        <span className="font-bold text-red-700 bg-red-100 px-3 py-1 rounded-md">{absensi_hari_ini.waktu_pulang}</span>
                                    </p>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Toggle WFO/WFH */}
                    {!absensi_hari_ini && (
                        <div className="flex bg-gray-100 p-1.5 rounded-xl mb-6 border border-gray-200">
                            <button 
                                onClick={() => setTipeKehadiran('wfo')}
                                className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all ${tipeKehadiran === 'wfo' ? 'bg-white text-green-700 shadow-sm border border-gray-200' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                Kantor (WFO)
                            </button>
                            <button 
                                onClick={() => setTipeKehadiran('wfh')}
                                className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all ${tipeKehadiran === 'wfh' ? 'bg-white text-blue-700 shadow-sm border border-gray-200' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                Rumah (WFH)
                            </button>
                        </div>
                    )}
                    
                    {absensi_hari_ini && (
                        <div className="mb-6 p-3 bg-blue-50 border border-blue-100 rounded-xl flex items-center justify-center">
                            <p className="text-sm font-bold text-blue-700 uppercase tracking-wide">
                                Tipe Absen: {tipeKehadiran === 'wfo' ? 'WFO (Kantor)' : 'WFH (Rumah)'}
                            </p>
                        </div>
                    )}

                    {/* Tombol Aksi */}
                    <div className="flex gap-3">
                        <button 
                            onClick={() => handleAbsen('datang')}
                            disabled={processing || (absensi_hari_ini && absensi_hari_ini.waktu_datang)}
                            className={`flex-1 py-3.5 rounded-xl font-bold text-white transition-all text-sm
                                ${absensi_hari_ini?.waktu_datang 
                                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                                    : 'bg-green-600 hover:bg-green-700 active:scale-95 shadow-[0_4px_12px_rgba(22,163,74,0.3)]'}`}
                        >
                            ABSEN DATANG
                        </button>
                        
                        <button 
                            onClick={() => handleAbsen('pulang')}
                            disabled={processing || !absensi_hari_ini || absensi_hari_ini.waktu_pulang}
                            className={`flex-1 py-3.5 rounded-xl font-bold text-white transition-all text-sm
                                ${(!absensi_hari_ini || absensi_hari_ini?.waktu_pulang)
                                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                                    : 'bg-red-600 hover:bg-red-700 active:scale-95 shadow-[0_4px_12px_rgba(220,38,38,0.3)]'}`}
                        >
                            ABSEN PULANG
                        </button>
                    </div>
                </div>
            </div>
        </KaryawanLayout>
    );
}
