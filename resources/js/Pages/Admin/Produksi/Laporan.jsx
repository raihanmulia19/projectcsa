import { useState, useRef } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router } from '@inertiajs/react';
import Modal from '@/Components/Modal';
import SecondaryButton from '@/Components/SecondaryButton';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import Swal from 'sweetalert2';

export default function Laporan({ auth, data, filters = {}, isLocked = false }) {
    const listData = data?.laporan || [];

    const currentBulan = filters?.bulan || (new Date().getMonth() + 1).toString();
    const currentTahun = filters?.tahun || new Date().getFullYear().toString();
    const currentMinggu = filters?.minggu || 'all';
    const currentKategori = filters?.kategori || 'Inti CSA';

    const handleFilterChange = (key, value) => {
        router.get('/produksi/laporan', {
            bulan: key === 'bulan' ? value : currentBulan,
            tahun: key === 'tahun' ? value : currentTahun,
            minggu: key === 'minggu' ? value : currentMinggu,
            kategori: key === 'kategori' ? value : currentKategori
        }, { preserveState: true });
    };

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [exportType, setExportType] = useState('hari');

    const formatNumberID = (val) => {
        if (val === null || val === undefined || val === '') return '';
        let str = val.toString().replace(/[^0-9,]/g, '');
        let parts = str.split(',');
        let bulat = parts[0];
        let desimal = parts.length > 1 ? ',' + parts.slice(1).join('') : '';
        if (bulat) {
            bulat = bulat.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
        }
        return bulat + desimal;
    };

    const parseNumberID = (val) => {
        if (val === null || val === undefined || val === '') return 0;
        if (typeof val === 'number') return val;
        let str = val.toString().trim();
        str = str.replace(/\./g, '').replace(/,/g, '.');
        return parseFloat(str) || 0;
    };

    const { data: formData, setData, post, processing, reset, transform: transformData } = useForm({
        tanggal: new Date().toISOString().split('T')[0],
        kategori: currentKategori,
        harga_per_kg: '',
        tonase: '',
        total: ''
    });

    transformData((data) => {
        const harga = parseNumberID(data.harga_per_kg);
        const tonase = parseNumberID(data.tonase);
        return {
            ...data,
            harga_per_kg: harga,
            tonase: tonase,
            total: Math.round(harga * tonase * 100) / 100
        };
    });

    const handleCalculateTotal = (field, rawValue) => {
        const formatted = formatNumberID(rawValue);
        setData(prevData => {
            const newData = { ...prevData, [field]: formatted };
            const harga = parseNumberID(newData.harga_per_kg);
            const tns = parseNumberID(newData.tonase);
            newData.total = (harga > 0 && tns > 0) ? Math.round(harga * tns * 100) / 100 : '';
            return newData;
        });
    };

    const handleOpenInputModal = () => {
        setData(prevData => ({
            ...prevData,
            tanggal: new Date().toISOString().split('T')[0],
            kategori: currentKategori,
            harga_per_kg: '',
            tonase: '',
            total: ''
        }));
        setIsModalOpen(true);
    };

    const submit = (e) => {
        e.preventDefault();
        
        post('/produksi/laporan', {
            onSuccess: (page) => {
                if (page.props.flash?.error) {
                    Swal.fire({
                        title: 'Gagal!',
                        text: page.props.flash.error,
                        icon: 'error',
                        confirmButtonText: 'OK',
                        confirmButtonColor: '#ef4444'
                    });
                } else {
                    reset();
                    setIsModalOpen(false);
                    const msg = page.props.flash?.success || 'Data Laporan berhasil disimpan.';
                    Swal.fire({
                        title: 'Berhasil!',
                        text: msg,
                        icon: 'success',
                        confirmButtonText: 'OK',
                        confirmButtonColor: '#10b981'
                    });
                }
            },
        });
    };

    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const { data: editData, setData: setEditData, put, processing: editProcessing, reset: resetEdit, transform: transformEditData } = useForm({
        id: '',
        tanggal: '',
        kategori: '',
        harga_per_kg: '',
        tonase: '',
        total: ''
    });

    transformEditData((data) => {
        const harga = parseNumberID(data.harga_per_kg);
        const tonase = parseNumberID(data.tonase);
        return {
            ...data,
            harga_per_kg: harga,
            tonase: tonase,
            total: Math.round(harga * tonase * 100) / 100
        };
    });

    const handleEditClick = (item) => {
        const formatForEdit = (val) => {
            if (!val) return '';
            let str = String(val).replace('.', ',');
            return formatNumberID(str);
        };
        
        setEditData({
            id: item.id,
            tanggal: item.tanggal,
            kategori: item.kategori,
            harga_per_kg: formatForEdit(item.harga_per_kg),
            tonase: formatForEdit(item.tonase),
            total: item.total
        });
        setIsEditModalOpen(true);
    };

    const handleCalculateEditTotal = (field, rawValue) => {
        const formatted = formatNumberID(rawValue);
        setEditData(prevData => {
            const newData = { ...prevData, [field]: formatted };
            const harga = parseNumberID(newData.harga_per_kg);
            const tns = parseNumberID(newData.tonase);
            newData.total = (harga > 0 && tns > 0) ? Math.round(harga * tns * 100) / 100 : '';
            return newData;
        });
    };

    const submitEdit = (e) => {
        e.preventDefault();

        put(`/produksi/laporan/${editData.id}`, {
            onSuccess: (page) => {
                if (page.props.flash?.error) {
                    Swal.fire({
                        title: 'Gagal!',
                        text: page.props.flash.error,
                        icon: 'error',
                        confirmButtonText: 'OK',
                        confirmButtonColor: '#ef4444'
                    });
                } else {
                    resetEdit();
                    setIsEditModalOpen(false);
                    const msg = page.props.flash?.success || 'Data Laporan berhasil diperbarui.';
                    Swal.fire({
                        title: 'Berhasil!',
                        text: msg,
                        icon: 'success',
                        confirmButtonText: 'OK',
                        confirmButtonColor: '#10b981'
                    });
                }
            },
        });
    };

    const handleDeleteClick = (id) => {
        Swal.fire({
            title: 'Hapus Data?',
            text: "Data laporan yang dihapus tidak dapat dikembalikan!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#9ca3af',
            confirmButtonText: 'Ya, Hapus!',
            cancelButtonText: 'Batal'
        }).then((result) => {
            if (result.isConfirmed) {
                router.delete(`/produksi/laporan/${id}`, {
                    onSuccess: (page) => {
                        const msg = page.props.flash?.success || 'Data Laporan berhasil dihapus.';
                        Swal.fire({
                            title: 'Terhapus!',
                            text: msg,
                            icon: 'success',
                            confirmButtonText: 'OK',
                            confirmButtonColor: '#10b981'
                        });
                    }
                });
            }
        });
    };

    const handleToggleLock = () => {
        if (currentBulan === 'all') {
            Swal.fire({
                title: 'Perhatian!',
                text: 'Pilih bulan spesifik untuk mengunci data.',
                icon: 'warning'
            });
            return;
        }

        Swal.fire({
            title: isLocked ? 'Buka Kunci Data?' : 'Kunci Data?',
            text: isLocked ? "Data pada bulan ini akan dapat diubah kembali." : "Data pada bulan ini tidak akan dapat diubah, ditambah, atau dihapus setelah dikunci!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: isLocked ? '#10b981' : '#ef4444',
            cancelButtonColor: '#9ca3af',
            confirmButtonText: isLocked ? 'Ya, Buka!' : 'Ya, Kunci!',
            cancelButtonText: 'Batal'
        }).then((result) => {
            if (result.isConfirmed) {
                router.post('/produksi/laporan/toggle-lock', {
                    bulan: currentBulan,
                    tahun: currentTahun
                }, {
                    preserveScroll: true,
                    onSuccess: (page) => {
                        const msg = page.props.flash?.success;
                        if (msg) {
                            Swal.fire({
                                title: 'Berhasil!',
                                text: msg,
                                icon: 'success',
                                confirmButtonText: 'OK',
                                confirmButtonColor: '#10b981'
                            });
                        }
                    }
                });
            }
        });
    };

    const fileInputRef = useRef(null);

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const XLSX = await import('xlsx');
        const reader = new FileReader();
        reader.onload = (evt) => {
            const bstr = evt.target.result;
            const wb = XLSX.read(bstr, { type: 'binary' });
            
            const monthsMap = {
                'januari': '01', 'jan': '01', '1': '01', '01': '01',
                'februari': '02', 'febuari': '02', 'pebruari': '02', 'feb': '02', '2': '02', '02': '02',
                'maret': '03', 'mar': '03', '3': '03', '03': '03',
                'april': '04', 'apr': '04', '4': '04', '04': '04',
                'mei': '05', 'may': '05', '5': '05', '05': '05',
                'juni': '06', 'jun': '06', '6': '06', '06': '06',
                'juli': '07', 'jul': '07', '7': '07', '07': '07',
                'agustus': '08', 'agu': '08', 'aug': '08', '8': '08', '08': '08',
                'september': '09', 'sep': '09', '9': '09', '09': '09',
                'oktober': '10', 'okt': '10', 'oct': '10', '10': '10',
                'november': '11', 'nopember': '11', 'nov': '11', '11': '11',
                'desember': '12', 'des': '12', 'dec': '12', '12': '12'
            };

            let allFormattedData = [];

            wb.SheetNames.forEach(wsname => {
                const lowerWsName = wsname.toLowerCase().trim();
                let sheetMonth = String(currentBulan).padStart(2, '0');
                
                if (monthsMap[lowerWsName]) {
                    sheetMonth = monthsMap[lowerWsName];
                } else {
                    for (const [key, val] of Object.entries(monthsMap)) {
                        if (key.length > 2 && lowerWsName.includes(key)) {
                            sheetMonth = val;
                            break;
                        }
                    }
                }

                const ws = wb.Sheets[wsname];
                
                // Gunakan header: 1 agar menjadi array 2 dimensi, memudahkan pencarian kolom yang berdekatan
                const data = XLSX.utils.sheet_to_json(ws, { header: 1 });
                if (data.length < 2) return;

                // Cari baris header yang mengandung kata 'tanggal' atau 'tgl' (maksimal cari di 10 baris pertama)
                let headerRowIdx = -1;
                let tanggalIdx = -1;
                for (let i = 0; i < Math.min(10, data.length); i++) {
                    const row = data[i];
                    if (!Array.isArray(row)) continue;
                    tanggalIdx = row.findIndex(cell => typeof cell === 'string' && (cell.toLowerCase().trim() === 'tanggal' || cell.toLowerCase().trim() === 'tgl'));
                    if (tanggalIdx !== -1) {
                        headerRowIdx = i;
                        break;
                    }
                }

                if (headerRowIdx === -1) return; // Abaikan sheet jika tidak ada kolom tanggal

                const headers = data[headerRowIdx].map(c => typeof c === 'string' ? c.toLowerCase().trim() : '');
                
                // Cari index harga dan tonase yang posisinya berada di kanan (atau sama) dengan kolom tanggal 
                // Ini mencegah sistem mengambil kolom 'tonase' dari tabel lain di sebelah kiri
                let hargaIdx = headers.indexOf('harga', tanggalIdx);
                if (hargaIdx === -1) hargaIdx = headers.findIndex((h, idx) => idx >= tanggalIdx && h.includes('harga'));

                let tonaseIdx = headers.indexOf('tonase', tanggalIdx);
                if (tonaseIdx === -1) tonaseIdx = headers.findIndex((h, idx) => idx >= tanggalIdx && h.includes('tonase'));

                const formattedData = [];
                for (let i = headerRowIdx + 1; i < data.length; i++) {
                    const row = data[i];
                    if (!row || !Array.isArray(row)) continue;

                    let tgl = row[tanggalIdx];
                    
                    if (typeof tgl === 'number' && tgl > 1000) {
                        // Excel serial date (e.g. 45000)
                        const excelDate = new Date((tgl - (25567 + 2)) * 86400 * 1000);
                        const m = String(excelDate.getMonth() + 1).padStart(2, '0');
                        const d = String(excelDate.getDate()).padStart(2, '0');
                        const y = excelDate.getFullYear();
                        tgl = `${y}-${m}-${d}`;
                    } else if (typeof tgl === 'number' || (typeof tgl === 'string' && !String(tgl).includes('-') && !String(tgl).includes('/'))) {
                        const dayNum = parseInt(tgl, 10);
                        if (dayNum >= 1 && dayNum <= 31) {
                            const testDate = new Date(parseInt(currentTahun), parseInt(sheetMonth) - 1, dayNum);
                            if (testDate.getMonth() === parseInt(sheetMonth) - 1) {
                                const day = String(dayNum).padStart(2, '0');
                                tgl = `${currentTahun}-${sheetMonth}-${day}`;
                            } else {
                                tgl = null;
                            }
                        } else {
                            tgl = null;
                        }
                    } else if (typeof tgl === 'string') {
                        // Handle dd/mm/yyyy or yyyy/mm/dd
                        const parts = tgl.split(/[-/]/);
                        if (parts.length === 3) {
                            if (parts[0].length === 4) {
                                tgl = `${parts[0]}-${parts[1].padStart(2,'0')}-${parts[2].padStart(2,'0')}`;
                            } else if (parts[2].length === 4) {
                                tgl = `${parts[2]}-${parts[1].padStart(2,'0')}-${parts[0].padStart(2,'0')}`;
                            }
                        }
                    }

                    if (tgl && typeof tgl === 'string' && !tgl.match(/^\d{4}-\d{2}-\d{2}$/)) {
                        tgl = null;
                    }

                    if (!tgl) continue; // Skip baris yang tidak memiliki tanggal valid (seperti baris TOTAL)

                    let harga = hargaIdx !== -1 ? row[hargaIdx] : 0;
                    let tonase = tonaseIdx !== -1 ? row[tonaseIdx] : 0;

                    if (typeof harga === 'string') harga = harga.replace(/\./g, '').replace(/,/g, '.');
                    if (typeof tonase === 'string') tonase = tonase.replace(/\./g, '').replace(/,/g, '.');

                    if (harga === '-' || isNaN(parseFloat(harga))) harga = 0;
                    if (tonase === '-' || isNaN(parseFloat(tonase))) tonase = 0;

                    formattedData.push({
                        tanggal: tgl,
                        harga_per_kg: parseFloat(harga),
                        tonase: parseFloat(tonase)
                    });
                }

                allFormattedData.push(...formattedData);
            });

            router.post('/produksi/laporan/import', { 
                data: allFormattedData, 
                kategori: currentKategori,
                bulan: currentBulan,
                tahun: currentTahun
            }, {
                onSuccess: (page) => {
                    if (fileInputRef.current) fileInputRef.current.value = '';
                    const msg = page.props.flash?.success || `Berhasil import data Excel untuk kategori ${currentKategori}!`;
                    
                    Swal.fire({
                        title: 'Berhasil!',
                        text: msg,
                        icon: 'success',
                        confirmButtonText: 'OK',
                        confirmButtonColor: '#10b981'
                    });
                }
            });
        };
        reader.readAsBinaryString(file);
    };

    const exportPDF = async () => {
        const { jsPDF } = await import('jspdf');
        const autoTable = (await import('jspdf-autotable')).default;
        const { kopSuratBase64 } = await import('@/utils/kopSuratBase64');
        const doc = new jsPDF();
        
        // --- KOP SURAT ---
        doc.addImage(kopSuratBase64, 'PNG', 0, 0, 210, 297);
        
        // --- JUDUL LAPORAN ---
        let reportTitle = `LAPORAN PRODUKSI HARIAN (${currentKategori.toUpperCase()})`;
        if (exportType === 'minggu') reportTitle = `LAPORAN PRODUKSI MINGGUAN (${currentKategori.toUpperCase()})`;
        if (exportType === 'bulan') reportTitle = `LAPORAN PRODUKSI BULANAN (${currentKategori.toUpperCase()})`;
        
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.text(reportTitle, 105, 52, { align: "center" });
        doc.setFontSize(11);
        doc.setFont("helvetica", "normal");
        const monthNames = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
        const namaBulan = currentBulan === 'all' ? "Semua Bulan" : monthNames[parseInt(currentBulan) - 1];
        const namaMinggu = currentMinggu === 'all' ? "" : `(Minggu ${currentMinggu})`;
        doc.text(`Periode: ${namaBulan} ${currentTahun} ${namaMinggu}`, 105, 58, { align: "center" });
        
        const tableRows = [];
        let totalTonasePdf = 0;
        let totalPendapatanPdf = 0;
        let tableColumn = [];
        let columnStyles = {};

        if (exportType === 'hari') {
            tableColumn = ["No", "Tanggal", "Harga/Kg (Rp)", "Tonase (Kg)", "Total (Rp)"];
            columnStyles = { 0: { halign: 'center' }, 2: { halign: 'center' }, 3: { halign: 'center' }, 4: { halign: 'right' } };
            
            listData.forEach((item, index) => {
                const tonaseVal = parseFloat(String(item.tonase).replace(/[^0-9.-]/g, '')) || 0;
                const totalVal = parseFloat(String(item.total).replace(/[^0-9.-]/g, '')) || 0;
                const hargaVal = parseFloat(String(item.harga_per_kg).replace(/[^0-9.-]/g, '')) || 0;
                
                totalTonasePdf += tonaseVal;
                totalPendapatanPdf += totalVal;
                
                tableRows.push([
                    index + 1,
                    item.tanggal,
                    new Intl.NumberFormat('id-ID').format(hargaVal),
                    new Intl.NumberFormat('id-ID').format(tonaseVal),
                    new Intl.NumberFormat('id-ID').format(totalVal)
                ]);
            });

            tableRows.push([
                { content: 'TOTAL', colSpan: 3, styles: { fontStyle: 'bold', halign: 'right' } },
                { content: new Intl.NumberFormat('id-ID').format(totalTonasePdf), styles: { fontStyle: 'bold', halign: 'center' } },
                { content: new Intl.NumberFormat('id-ID').format(totalPendapatanPdf), styles: { fontStyle: 'bold', halign: 'right' } }
            ]);
        } else if (exportType === 'minggu') {
            // Sesuai permintaan: No, Tanggal, Minggu Ke, Tonase
            tableColumn = ["No", "Tanggal", "Minggu Ke", "Tonase (Kg)", "Total Pendapatan (Rp)"];
            columnStyles = { 0: { halign: 'center' }, 2: { halign: 'center' }, 3: { halign: 'center' }, 4: { halign: 'right' } };
            
            const weeklyData = {};
            listData.forEach(item => {
                const tonaseVal = parseFloat(String(item.tonase).replace(/[^0-9.-]/g, '')) || 0;
                const totalVal = parseFloat(String(item.total).replace(/[^0-9.-]/g, '')) || 0;
                const dateObj = new Date(item.tanggal);
                const day = dateObj.getDate();
                const week = Math.ceil(day / 7);
                if (!weeklyData[week]) {
                    const itemMonth = monthNames[dateObj.getMonth()];
                    let dateRange = "";
                    if (week === 1) dateRange = `1 - 7 ${itemMonth}`;
                    else if (week === 2) dateRange = `8 - 14 ${itemMonth}`;
                    else if (week === 3) dateRange = `15 - 21 ${itemMonth}`;
                    else if (week === 4) dateRange = `22 - 28 ${itemMonth}`;
                    else if (week === 5) {
                        const lastDay = new Date(dateObj.getFullYear(), dateObj.getMonth() + 1, 0).getDate();
                        dateRange = `29 - ${lastDay} ${itemMonth}`;
                    }
                    weeklyData[week] = { tonase: 0, total: 0, dateRange };
                }
                weeklyData[week].tonase += tonaseVal;
                weeklyData[week].total += totalVal;
            });
            
            let index = 1;
            for (const [week, data] of Object.entries(weeklyData).sort((a,b) => a[0] - b[0])) {
                totalTonasePdf += data.tonase;
                totalPendapatanPdf += data.total;
                tableRows.push([
                    index++,
                    data.dateRange,
                    `Minggu ${week}`,
                    new Intl.NumberFormat('id-ID').format(data.tonase),
                    new Intl.NumberFormat('id-ID').format(data.total)
                ]);
            }
            
            tableRows.push([
                { content: 'TOTAL', colSpan: 3, styles: { fontStyle: 'bold', halign: 'right' } },
                { content: new Intl.NumberFormat('id-ID').format(totalTonasePdf), styles: { fontStyle: 'bold', halign: 'center' } },
                { content: new Intl.NumberFormat('id-ID').format(totalPendapatanPdf), styles: { fontStyle: 'bold', halign: 'right' } }
            ]);
        } else if (exportType === 'bulan') {
            tableColumn = ["No", "Bulan", "Tonase (Kg)", "Total Pendapatan (Rp)"];
            columnStyles = { 0: { halign: 'center' }, 2: { halign: 'center' }, 3: { halign: 'right' } };
            
            const monthlyData = {};
            listData.forEach(item => {
                const tonaseVal = parseFloat(String(item.tonase).replace(/[^0-9.-]/g, '')) || 0;
                const totalVal = parseFloat(String(item.total).replace(/[^0-9.-]/g, '')) || 0;
                const dateObj = new Date(item.tanggal);
                const month = dateObj.getMonth();
                const year = dateObj.getFullYear();
                const key = `${monthNames[month]} ${year}`;
                if (!monthlyData[key]) monthlyData[key] = { tonase: 0, total: 0 };
                monthlyData[key].tonase += tonaseVal;
                monthlyData[key].total += totalVal;
            });
            
            let index = 1;
            for (const [monthKey, data] of Object.entries(monthlyData)) {
                totalTonasePdf += data.tonase;
                totalPendapatanPdf += data.total;
                tableRows.push([
                    index++,
                    monthKey,
                    new Intl.NumberFormat('id-ID').format(data.tonase),
                    new Intl.NumberFormat('id-ID').format(data.total)
                ]);
            }
            
            tableRows.push([
                { content: 'TOTAL', colSpan: 2, styles: { fontStyle: 'bold', halign: 'right' } },
                { content: new Intl.NumberFormat('id-ID').format(totalTonasePdf), styles: { fontStyle: 'bold', halign: 'center' } },
                { content: new Intl.NumberFormat('id-ID').format(totalPendapatanPdf), styles: { fontStyle: 'bold', halign: 'right' } }
            ]);
        }

        autoTable(doc, {
            head: [tableColumn],
            body: tableRows,
            startY: 65,
            margin: { top: 60, bottom: 35, left: 14, right: 14 },
            theme: 'grid',
            willDrawPage: function (data) {
                // Tambahkan kop surat sebagai background di setiap halaman tambahan jika diperlukan
                if (data.pageNumber > 1) {
                    doc.addImage(kopSuratBase64, 'PNG', 0, 0, 210, 297);
                }
            },
            styles: {
                lineWidth: 0.3,
                lineColor: [0, 0, 0]
            },
            headStyles: { 
                fillColor: [255, 255, 255], 
                textColor: [0, 0, 0], 
                fontStyle: 'bold',
                halign: 'center'
            },
            bodyStyles: {
                textColor: [0, 0, 0],
            },
            columnStyles: columnStyles
        });
        
        const fileNamePdf = `Laporan_${exportType.charAt(0).toUpperCase() + exportType.slice(1)}_${currentBulan}_${currentTahun}.pdf`;
        doc.save(fileNamePdf);

        // Catat Audit Log Ekspor PDF
        router.post('/audit-log/export', {
            module: 'Laporan Produksi',
            file_type: 'PDF',
            description: `Mengunduh file PDF Laporan Produksi (${currentKategori}) - Periode: ${namaBulan} ${currentTahun} ${namaMinggu} (${exportType})`.trim()
        }, { preserveScroll: true, preserveState: true });
    };

    const exportExcel = async () => {
        const XLSX = await import('xlsx');
        const monthNames = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
        const namaBulan = currentBulan === 'all' ? "Semua Bulan" : monthNames[parseInt(currentBulan) - 1];
        const namaMinggu = currentMinggu === 'all' ? "" : `(Minggu ${currentMinggu})`;

        let excelRows = [];
        if (exportType === 'hari') {
            excelRows = listData.map((item, index) => ({
                'No': index + 1,
                'Tanggal': item.tanggal,
                'Harga/Kg (Rp)': parseFloat(String(item.harga_per_kg).replace(/[^0-9.-]/g, '')) || 0,
                'Tonase (Kg)': parseFloat(String(item.tonase).replace(/[^0-9.-]/g, '')) || 0,
                'Total (Rp)': parseFloat(String(item.total).replace(/[^0-9.-]/g, '')) || 0
            }));
        } else if (exportType === 'minggu') {
            const weeklyData = {};
            listData.forEach(item => {
                const tonaseVal = parseFloat(String(item.tonase).replace(/[^0-9.-]/g, '')) || 0;
                const totalVal = parseFloat(String(item.total).replace(/[^0-9.-]/g, '')) || 0;
                const dateObj = new Date(item.tanggal);
                const day = dateObj.getDate();
                const week = Math.ceil(day / 7);
                if (!weeklyData[week]) {
                    weeklyData[week] = { tonase: 0, total: 0, minDate: item.tanggal, maxDate: item.tanggal };
                }
                weeklyData[week].tonase += tonaseVal;
                weeklyData[week].total += totalVal;
                if (item.tanggal < weeklyData[week].minDate) weeklyData[week].minDate = item.tanggal;
                if (item.tanggal > weeklyData[week].maxDate) weeklyData[week].maxDate = item.tanggal;
            });

            let idx = 1;
            for (const [weekNum, data] of Object.entries(weeklyData)) {
                excelRows.push({
                    'No': idx++,
                    'Tanggal': `${data.minDate} s/d ${data.maxDate}`,
                    'Minggu Ke': `Minggu ${weekNum}`,
                    'Tonase (Kg)': data.tonase,
                    'Total Pendapatan (Rp)': data.total
                });
            }
        } else {
            const monthlyData = {};
            listData.forEach(item => {
                const tonaseVal = parseFloat(String(item.tonase).replace(/[^0-9.-]/g, '')) || 0;
                const totalVal = parseFloat(String(item.total).replace(/[^0-9.-]/g, '')) || 0;
                const dateObj = new Date(item.tanggal);
                const m = dateObj.getMonth();
                const y = dateObj.getFullYear();
                const key = `${monthNames[m]} ${y}`;
                if (!monthlyData[key]) {
                    monthlyData[key] = { tonase: 0, total: 0, count: 0, sumHarga: 0 };
                }
                monthlyData[key].tonase += tonaseVal;
                monthlyData[key].total += totalVal;
                monthlyData[key].sumHarga += (parseFloat(String(item.harga_per_kg).replace(/[^0-9.-]/g, '')) || 0);
                monthlyData[key].count += 1;
            });

            let idx = 1;
            for (const [monthKey, data] of Object.entries(monthlyData)) {
                const avgHarga = data.count > 0 ? (data.sumHarga / data.count) : 0;
                excelRows.push({
                    'No': idx++,
                    'Bulan': monthKey,
                    'Rata-rata Harga/Kg (Rp)': Math.round(avgHarga),
                    'Total Tonase (Kg)': data.tonase,
                    'Total Pendapatan (Rp)': data.total
                });
            }
        }

        const ws = XLSX.utils.json_to_sheet(excelRows);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Laporan Produksi");
        const fileNameExcel = `Laporan_${exportType.charAt(0).toUpperCase() + exportType.slice(1)}_${currentKategori.replace(/\s+/g, '_')}_${currentBulan}_${currentTahun}.xlsx`;
        XLSX.writeFile(wb, fileNameExcel);

        // Catat Audit Log Ekspor Excel
        router.post('/audit-log/export', {
            module: 'Laporan Produksi',
            file_type: 'Excel',
            description: `Mengunduh file Excel Laporan Produksi (${currentKategori}) - Periode: ${namaBulan} ${currentTahun} ${namaMinggu} (${exportType})`.trim()
        }, { preserveScroll: true, preserveState: true });
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Laporan Produksi" />

            <div className="py-4 sm:py-12">
                <div className="w-full mx-auto sm:px-6 lg:px-8 space-y-6">
                    
                    {/* Area Chart Container */}
                    <div className="bg-white overflow-hidden shadow-sm border border-gray-100 sm:rounded-2xl p-6">
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h2 className="text-xl font-extrabold text-gray-900 tracking-tight">Tren Berat</h2>
                                <p className="text-sm text-gray-600 mt-1">Perkembangan total berat (Kg) selama periode terpilih.</p>
                            </div>
                        </div>
                        <div className="w-full h-[350px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart
                                    data={listData}
                                    margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                                >
                                    <defs>
                                        <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                                            <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis 
                                        dataKey="tanggal" 
                                        axisLine={false} 
                                        tickLine={false} 
                                        tick={{ fill: '#475569', fontSize: 12 }} 
                                        dy={10}
                                    />
                                    <YAxis 
                                        axisLine={false} 
                                        tickLine={false} 
                                        tick={{ fill: '#475569', fontSize: 12 }} 
                                        tickFormatter={(value) => new Intl.NumberFormat('id-ID').format(value) + ' Kg'}
                                        width={90}
                                    />
                                    <Tooltip 
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)' }}
                                        formatter={(value) => [new Intl.NumberFormat('id-ID').format(value) + ' Kg', 'Berat']}
                                        labelStyle={{ fontWeight: 'bold', color: '#1f2937', marginBottom: '4px' }}
                                    />
                                    <Area 
                                        type="monotone" 
                                        dataKey="tonase" 
                                        stroke="#10b981" 
                                        strokeWidth={4}
                                        fillOpacity={1} 
                                        fill="url(#colorTotal)" 
                                        dot={{ r: 4, fill: '#f97316', strokeWidth: 2, stroke: '#fff' }}
                                        activeDot={{ r: 6, strokeWidth: 2, fill: '#ea580c', stroke: '#fff' }}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Data Table Laporan */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        {/* Tabs Kategori */}
                        <div className="border-b border-gray-200">
                            <nav className="flex -mb-px px-6" aria-label="Tabs">
                                {['Inti CSA', 'Agrinas', 'Brondol'].map((tab) => (
                                    <button
                                        key={tab}
                                        onClick={() => handleFilterChange('kategori', tab)}
                                        className={`whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm transition-colors duration-200 ${
                                            currentKategori === tab
                                                ? 'border-emerald-500 text-emerald-700'
                                                : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                                        }`}
                                    >
                                        {tab}
                                    </button>
                                ))}
                            </nav>
                        </div>
                        <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 xl:gap-0 px-6 py-5 border-b border-gray-100 bg-white mb-0">
                            <div>
                                <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Data Laporan Produksi</h1>
                                <p className="mt-1 text-sm text-gray-600">Rekapitulasi nilai dan tonase harian.</p>
                            </div>
                            
                            <div className="flex flex-col xl:flex-row gap-3 xl:gap-2 w-full xl:w-auto xl:items-center">
                                {/* Filter Card */}
                                <div className="bg-white border xl:border-none border-gray-200 rounded-xl p-3 sm:p-4 xl:p-0 w-full xl:w-auto">
                                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 xl:gap-2">
                                        <div className="grid grid-cols-2 gap-3 sm:flex sm:flex-row sm:gap-4 xl:gap-2 w-full sm:w-auto">
                                            <div className="flex flex-col w-full sm:w-36 xl:w-auto">
                                                <label htmlFor="filter-bulan" className="text-xs font-semibold text-gray-700 mb-1 ml-1 xl:sr-only">Bulan</label>
                                                <select 
                                                    id="filter-bulan" 
                                                    name="bulan"
                                                    aria-label="Filter Bulan"
                                                    value={currentBulan} 
                                                    onChange={(e) => handleFilterChange('bulan', e.target.value)} 
                                                    className="w-full xl:w-auto border-gray-300 rounded-xl shadow-sm focus:ring-emerald-500 focus:border-emerald-500 text-sm font-medium text-gray-700 bg-white"
                                                >
                                                    <option value="1">Januari</option>
                                                    <option value="2">Februari</option>
                                                    <option value="3">Maret</option>
                                                    <option value="4">April</option>
                                                    <option value="5">Mei</option>
                                                    <option value="6">Juni</option>
                                                    <option value="7">Juli</option>
                                                    <option value="8">Agustus</option>
                                                    <option value="9">September</option>
                                                    <option value="10">Oktober</option>
                                                    <option value="11">November</option>
                                                    <option value="12">Desember</option>
                                                </select>
                                            </div>
                                            <div className="flex flex-col w-full sm:w-28 xl:w-auto">
                                                <label htmlFor="filter-tahun" className="text-xs font-semibold text-gray-700 mb-1 ml-1 xl:sr-only">Tahun</label>
                                                <select 
                                                    id="filter-tahun" 
                                                    name="tahun"
                                                    aria-label="Filter Tahun"
                                                    value={currentTahun} 
                                                    onChange={(e) => handleFilterChange('tahun', e.target.value)} 
                                                    className="w-full xl:w-auto border-gray-300 rounded-xl shadow-sm focus:ring-emerald-500 focus:border-emerald-500 text-sm font-medium text-gray-700 bg-white"
                                                >
                                                    <option value="2024">2024</option>
                                                    <option value="2025">2025</option>
                                                    <option value="2026">2026</option>
                                                    <option value="2027">2027</option>
                                                </select>
                                            </div>
                                        </div>
                                        <div className="flex flex-col w-full sm:w-36 xl:w-auto">
                                            <label htmlFor="filter-minggu" className="text-xs font-semibold text-gray-700 mb-1 ml-1 xl:sr-only">Minggu</label>
                                            <select 
                                                id="filter-minggu" 
                                                name="minggu"
                                                aria-label="Filter Minggu"
                                                value={currentMinggu} 
                                                onChange={(e) => handleFilterChange('minggu', e.target.value)} 
                                                className="w-full xl:w-auto border-gray-300 rounded-xl shadow-sm focus:ring-emerald-500 focus:border-emerald-500 text-sm font-medium text-gray-700 bg-white"
                                            >
                                                <option value="all">Semua Minggu</option>
                                                <option value="1">Minggu 1</option>
                                                <option value="2">Minggu 2</option>
                                                <option value="3">Minggu 3</option>
                                                <option value="4">Minggu 4</option>
                                                <option value="5">Minggu 5</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                {/* Buttons */}
                                <div className="flex flex-col sm:flex-row sm:justify-end xl:items-center gap-3 xl:gap-2 w-full xl:w-auto">
                                    {currentBulan !== 'all' && (
                                        <button onClick={handleToggleLock} className={`w-full sm:w-auto justify-center xl:justify-start inline-flex items-center px-4 py-2.5 border rounded-xl font-bold text-xs uppercase tracking-wider shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-200 ${isLocked ? 'bg-red-50 border-red-200 text-red-700 hover:bg-red-100 focus:ring-red-500' : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-emerald-500'}`}>
                                            {isLocked ? (
                                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                                            ) : (
                                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z"></path></svg>
                                            )}
                                            {isLocked ? 'Buka Kunci' : 'Kunci Data'}
                                        </button>
                                    )}

                                    <input type="file" accept=".xlsx, .xls" ref={fileInputRef} onChange={handleFileUpload} className="hidden" disabled={isLocked} />
                                    <button onClick={() => fileInputRef.current?.click()} disabled={isLocked} className={`w-full sm:w-auto justify-center xl:justify-start inline-flex items-center px-4 py-2.5 bg-white border border-gray-300 rounded-xl font-bold text-xs text-gray-700 uppercase tracking-wider shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition-all duration-200 ${isLocked ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'}`}>
                                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>
                                        Import Excel
                                    </button>
                                    
                                    <div className="flex w-full sm:w-auto items-center space-x-1 border border-gray-200 xl:border-transparent rounded-xl bg-gray-50 xl:bg-transparent overflow-hidden shadow-sm xl:shadow-none">
                                        <label htmlFor="export-type" className="sr-only">Format Periode Ekspor</label>
                                        <select 
                                            id="export-type"
                                            name="export_type"
                                            aria-label="Format Periode Ekspor"
                                            value={exportType} 
                                            onChange={(e) => setExportType(e.target.value)} 
                                            className="flex-1 sm:flex-none border-none xl:border xl:border-gray-300 xl:rounded-l-xl bg-transparent xl:bg-white py-2.5 pl-3 pr-8 text-sm font-bold text-gray-700 focus:ring-0 uppercase tracking-wider cursor-pointer"
                                        >
                                            <option value="hari">Hari</option>
                                            <option value="minggu">Minggu</option>
                                            <option value="bulan">Bulan</option>
                                        </select>
                                        <button onClick={exportPDF} title="Unduh format PDF" aria-label="Unduh format PDF" className="justify-center inline-flex items-center px-3 py-2.5 border-l border-gray-200 xl:border xl:border-l-0 xl:bg-rose-50 text-rose-700 font-bold text-xs uppercase tracking-wider hover:bg-rose-100 focus:outline-none transition-all duration-200">
                                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                                            PDF
                                        </button>
                                        <button onClick={exportExcel} title="Unduh format Excel" aria-label="Unduh format Excel" className="justify-center inline-flex items-center px-3 py-2.5 border-l border-gray-200 xl:border xl:border-l-0 xl:rounded-r-xl xl:bg-emerald-50 text-emerald-800 font-bold text-xs uppercase tracking-wider hover:bg-emerald-100 focus:outline-none transition-all duration-200">
                                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                                            Excel
                                        </button>
                                    </div>
                                    
                                    <button onClick={handleOpenInputModal} disabled={isLocked} className={`w-full sm:w-auto justify-center xl:justify-start inline-flex items-center px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-green-600 border border-transparent rounded-xl font-bold text-xs text-white uppercase tracking-wider shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transform transition-all duration-200 ${isLocked ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-md hover:from-emerald-600 hover:to-green-700 hover:-translate-y-0.5'}`}>
                                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
                                        Input Laporan
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div className="overflow-x-auto w-full">
                            <table className="w-full text-sm text-left text-gray-700">
                                <thead className="text-xs font-semibold text-gray-700 uppercase tracking-wider border-b border-gray-200 bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-4 w-16">No</th>
                                        <th className="px-6 py-4">Tanggal</th>
                                        <th className="px-6 py-4 text-center">Harga/Kg (Rp)</th>
                                        <th className="px-6 py-4 text-center">Tonase (Kg)</th>
                                        <th className="px-6 py-4 text-center">Total (Rp)</th>
                                        <th className="px-6 py-4 text-center">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {listData.length === 0 ? (
                                        <tr>
                                            <td colSpan="6" className="px-6 py-12 text-center text-gray-600 font-medium">
                                                Belum ada data laporan untuk bulan ini.
                                            </td>
                                        </tr>
                                    ) : (
                                        listData.map((item, index) => (
                                            <tr key={index} className="hover:bg-emerald-50/30 transition-colors duration-150 border-b border-gray-100">
                                                <td className="px-6 py-4">{index + 1}</td>
                                                <td className="px-6 py-4 font-bold text-gray-800">{item.tanggal}</td>
                                                <td className="px-6 py-4 text-center font-medium text-gray-900">{new Intl.NumberFormat('id-ID').format(item.harga_per_kg)}</td>
                                                <td className="px-6 py-4 text-center font-medium text-gray-900">{new Intl.NumberFormat('id-ID').format(item.tonase)}</td>
                                                <td className="px-6 py-4 text-center font-bold text-emerald-800">{new Intl.NumberFormat('id-ID').format(item.total)}</td>
                                                <td className="px-6 py-4 text-center space-x-2">
                                                    <button onClick={() => handleEditClick(item)} disabled={isLocked} className={`text-emerald-700 ${isLocked ? 'opacity-50 cursor-not-allowed' : 'hover:text-emerald-900'}`} title="Edit" aria-label={`Edit data tanggal ${item.tanggal}`}>
                                                        <svg className="w-5 h-5 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                                                    </button>
                                                    <button onClick={() => handleDeleteClick(item.id)} disabled={isLocked} className={`text-rose-700 ${isLocked ? 'opacity-50 cursor-not-allowed' : 'hover:text-rose-900'}`} title="Hapus" aria-label={`Hapus data tanggal ${item.tanggal}`}>
                                                        <svg className="w-5 h-5 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                                {listData.length > 0 && (
                                    <tfoot>
                                        <tr className="bg-gray-50 border-t-2 border-gray-300">
                                            <td colSpan="3" className="px-6 py-4 text-right font-bold text-gray-800 uppercase tracking-wider text-sm">Total</td>
                                            <td className="px-6 py-4 text-center font-extrabold text-emerald-800 text-base">
                                                {new Intl.NumberFormat('id-ID').format(
                                                    listData.reduce((sum, item) => sum + (parseFloat(item.tonase) || 0), 0)
                                                )} Kg
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <div className="font-extrabold text-emerald-800 text-base">
                                                    Rp {new Intl.NumberFormat('id-ID').format(
                                                        listData.reduce((sum, item) => sum + (parseFloat(item.total) || 0), 0)
                                                    )}
                                                </div>
                                                <div className="text-xs text-gray-600 mt-1 font-normal normal-case leading-tight">
                                                    *Akumulatif pendapatan sebelum pengurangan SPSI (upah bongkar) dll
                                                </div>
                                            </td>
                                            <td className="px-6 py-4"></td>
                                        </tr>
                                    </tfoot>
                                )}
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal Form */}
            <Modal show={isModalOpen} onClose={() => setIsModalOpen(false)}>
                <div className="p-6">
                    <h2 id="modal-input-title" className="text-lg font-bold text-gray-900 mb-4">Input Data Laporan</h2>
                    <form onSubmit={submit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="input-kategori" className="block text-sm font-medium text-gray-700">Kategori</label>
                                <input id="input-kategori" type="text" value={formData.kategori} className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 shadow-sm sm:text-sm text-gray-700" readOnly />
                            </div>
                            <div>
                                <label htmlFor="input-tanggal" className="block text-sm font-medium text-gray-700">Tanggal</label>
                                <input id="input-tanggal" type="date" value={formData.tanggal} onChange={e => setData('tanggal', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm text-gray-800" required />
                            </div>
                            <div>
                                <label htmlFor="input-harga" className="block text-sm font-medium text-gray-700">Harga/Kg (Rp)</label>
                                <input id="input-harga" type="text" value={formData.harga_per_kg} onChange={e => handleCalculateTotal('harga_per_kg', e.target.value)} onInvalid={e => e.target.setCustomValidity('Mohon isi kolom Harga/Kg.')} onInput={e => e.target.setCustomValidity('')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm text-gray-800" required />
                            </div>
                            <div>
                                <label htmlFor="input-tonase" className="block text-sm font-medium text-gray-700">Tonase (Kg)</label>
                                <input id="input-tonase" type="text" value={formData.tonase} onChange={e => handleCalculateTotal('tonase', e.target.value)} onInvalid={e => e.target.setCustomValidity('Mohon isi kolom Tonase.')} onInput={e => e.target.setCustomValidity('')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm text-gray-800" required />
                            </div>
                            <div>
                                <label htmlFor="input-total" className="block text-sm font-medium text-gray-700">Total (Auto-hitung)</label>
                                <input id="input-total" type="text" value={formData.total ? 'Rp ' + new Intl.NumberFormat('id-ID').format(formData.total) : ''} className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm font-bold text-emerald-800" required readOnly />
                            </div>
                        </div>
                        <div className="mt-6 flex justify-end gap-3">
                            <SecondaryButton onClick={() => setIsModalOpen(false)}>
                                Batal
                            </SecondaryButton>
                            <button type="submit" disabled={processing} className="inline-flex items-center px-4 py-2 bg-emerald-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-emerald-700 focus:bg-emerald-700 active:bg-emerald-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition ease-in-out duration-150 disabled:opacity-50">
                                Simpan Data
                            </button>
                        </div>
                    </form>
                </div>
            </Modal>

            {/* Modal Edit Form */}
            <Modal show={isEditModalOpen} onClose={() => setIsEditModalOpen(false)}>
                <div className="p-6">
                    <h2 id="modal-edit-title" className="text-lg font-bold text-gray-900 mb-4">Edit Data Laporan</h2>
                    <form onSubmit={submitEdit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="edit-kategori" className="block text-sm font-medium text-gray-700">Kategori</label>
                                <input id="edit-kategori" type="text" value={editData.kategori} className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 shadow-sm sm:text-sm text-gray-700" readOnly />
                            </div>
                            <div>
                                <label htmlFor="edit-tanggal" className="block text-sm font-medium text-gray-700">Tanggal</label>
                                <input id="edit-tanggal" type="date" value={editData.tanggal} onChange={e => setEditData('tanggal', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm text-gray-800" required />
                            </div>
                            <div>
                                <label htmlFor="edit-harga" className="block text-sm font-medium text-gray-700">Harga/Kg (Rp)</label>
                                <input id="edit-harga" type="text" value={editData.harga_per_kg} onChange={e => handleCalculateEditTotal('harga_per_kg', e.target.value)} onInvalid={e => e.target.setCustomValidity('Mohon isi kolom Harga/Kg.')} onInput={e => e.target.setCustomValidity('')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm text-gray-800" required />
                            </div>
                            <div>
                                <label htmlFor="edit-tonase" className="block text-sm font-medium text-gray-700">Tonase (Kg)</label>
                                <input id="edit-tonase" type="text" value={editData.tonase} onChange={e => handleCalculateEditTotal('tonase', e.target.value)} onInvalid={e => e.target.setCustomValidity('Mohon isi kolom Tonase.')} onInput={e => e.target.setCustomValidity('')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm text-gray-800" required />
                            </div>
                            <div>
                                <label htmlFor="edit-total" className="block text-sm font-medium text-gray-700">Total (Auto-hitung)</label>
                                <input id="edit-total" type="text" value={editData.total ? 'Rp ' + new Intl.NumberFormat('id-ID').format(editData.total) : ''} className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm font-bold text-emerald-800" required readOnly />
                            </div>
                        </div>
                        <div className="mt-6 flex justify-end gap-3">
                            <SecondaryButton onClick={() => setIsEditModalOpen(false)}>
                                Batal
                            </SecondaryButton>
                            <button type="submit" disabled={editProcessing} className="inline-flex items-center px-4 py-2 bg-indigo-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-indigo-700 focus:bg-indigo-700 active:bg-indigo-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition ease-in-out duration-150 disabled:opacity-50">
                                Simpan Perubahan
                            </button>
                        </div>
                    </form>
                </div>
            </Modal>
        </AuthenticatedLayout>
    );
}
