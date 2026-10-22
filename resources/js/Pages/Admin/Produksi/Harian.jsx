import { useState, useRef } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router } from '@inertiajs/react';
import Modal from '@/Components/Modal';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function Harian({ auth, data, masterBloks = [], filters = {} }) {
    const listData = data?.harian || [];

    const currentBulan = filters?.bulan || (new Date().getMonth() + 1).toString();
    const currentTahun = filters?.tahun || new Date().getFullYear().toString();

    const handleFilterChange = (key, value) => {
        router.get('/produksi/harian', {
            bulan: key === 'bulan' ? value : currentBulan,
            tahun: key === 'tahun' ? value : currentTahun,
        }, { preserveState: true });
    };

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [exportType, setExportType] = useState('hari');

    const { data: formData, setData, post, processing, reset } = useForm({
        blok_id: masterBloks.length > 0 ? masterBloks[0].id : '',
        tanggal: new Date().toISOString().split('T')[0],
        janjang: '',
        tonase: '',
        bjrHarian: ''
    });

    const handleCalculateBjr = (field, value) => {
        const newData = { ...formData, [field]: value };
        const jjg = Number(newData.janjang || 0);
        const tns = Number(newData.tonase || 0);
        
        newData.bjrHarian = jjg > 0 ? (tns / jjg).toFixed(2) : '';
        setData(newData);
    };

    const submit = (e) => {
        e.preventDefault();
        post('/produksi/harian', {
            onSuccess: () => {
                reset();
                setIsModalOpen(false);
            },
        });
    };

    const fileInputRef = useRef(null);

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (evt) => {
            const bstr = evt.target.result;
            const wb = XLSX.read(bstr, { type: 'binary' });
            const wsname = wb.SheetNames[0];
            const ws = wb.Sheets[wsname];
            const data = XLSX.utils.sheet_to_json(ws);

            const formattedData = data.map(row => ({
                blok: row['Blok'] || row['blok'],
                tanggal: row['Tanggal'] || row['tanggal'],
                janjang: row['Janjang'] || row['janjang'],
                tonase: row['Tonase'] || row['tonase']
            }));

            router.post('/produksi/harian/import', { data: formattedData }, {
                onSuccess: () => {
                    if (fileInputRef.current) fileInputRef.current.value = '';
                    alert('Data Excel berhasil di-import!');
                }
            });
        };
        reader.readAsBinaryString(file);
    };

    const exportPDF = () => {
        const doc = new jsPDF();
        
        // --- KOP SURAT ---
        doc.setFontSize(18);
        doc.setFont("helvetica", "bold");
        doc.text("PT. CITRA SAWIT ABADI", 105, 15, { align: "center" });
        
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.text("Perkebunan Kelapa Sawit", 105, 21, { align: "center" });
        doc.text("Jl. Lintas Utama No. 123, Kabupaten, Provinsi - Kode Pos 12345", 105, 26, { align: "center" });
        
        // Garis Pembatas Kop Surat
        doc.setLineWidth(0.5);
        doc.line(14, 30, 196, 30);
        doc.setLineWidth(1.0);
        doc.line(14, 31.5, 196, 31.5);
        
        // --- JUDUL LAPORAN ---
        let reportTitle = "LAPORAN PRODUKSI HARIAN";
        if (exportType === 'minggu') reportTitle = "LAPORAN PRODUKSI MINGGUAN";
        if (exportType === 'bulan') reportTitle = "LAPORAN PRODUKSI BULANAN";
        
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.text(reportTitle, 105, 42, { align: "center" });
        doc.setFontSize(11);
        doc.setFont("helvetica", "normal");
        const monthNames = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
        const namaBulan = currentBulan === 'all' ? "Semua Bulan" : monthNames[parseInt(currentBulan) - 1];
        doc.text(`Periode: ${namaBulan} ${currentTahun}`, 105, 48, { align: "center" });
        
        const tableRows = [];
        let totalTonasePdf = 0;
        let tableColumn = [];
        let columnStyles = {};

        if (exportType === 'hari') {
            tableColumn = ["No", "Tanggal", "Blok", "Tonase (Kg)"];
            columnStyles = { 0: { halign: 'center' }, 3: { halign: 'center' } };
            
            listData.forEach((item, index) => {
                const tonaseVal = parseFloat(String(item.tonase).replace(/[^0-9.-]/g, '')) || 0;
                totalTonasePdf += tonaseVal;
                tableRows.push([
                    index + 1,
                    item.tanggal,
                    item.blok || '-',
                    item.tonase
                ]);
            });

            tableRows.push([
                { content: 'TOTAL', colSpan: 3, styles: { fontStyle: 'bold', halign: 'right' } },
                { content: new Intl.NumberFormat('id-ID').format(totalTonasePdf), styles: { fontStyle: 'bold', halign: 'center' } }
            ]);
        } else if (exportType === 'minggu') {
            tableColumn = ["No", "Tanggal", "Minggu Ke", "Tonase (Kg)"];
            columnStyles = { 0: { halign: 'center' }, 2: { halign: 'center' }, 3: { halign: 'center' } };
            
            const weeklyData = {};
            listData.forEach(item => {
                const tonaseVal = parseFloat(String(item.tonase).replace(/[^0-9.-]/g, '')) || 0;
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
                    weeklyData[week] = { tonase: 0, dateRange };
                }
                weeklyData[week].tonase += tonaseVal;
            });
            
            let index = 1;
            for (const [week, data] of Object.entries(weeklyData).sort((a,b) => a[0] - b[0])) {
                totalTonasePdf += data.tonase;
                tableRows.push([
                    index++,
                    data.dateRange,
                    `Minggu ${week}`,
                    new Intl.NumberFormat('id-ID').format(data.tonase)
                ]);
            }
            
            tableRows.push([
                { content: 'TOTAL', colSpan: 3, styles: { fontStyle: 'bold', halign: 'right' } },
                { content: new Intl.NumberFormat('id-ID').format(totalTonasePdf), styles: { fontStyle: 'bold', halign: 'center' } }
            ]);
        } else if (exportType === 'bulan') {
            tableColumn = ["No", "Bulan", "Tonase (Kg)"];
            columnStyles = { 0: { halign: 'center' }, 2: { halign: 'center' } };
            
            const monthlyData = {};
            listData.forEach(item => {
                const tonaseVal = parseFloat(String(item.tonase).replace(/[^0-9.-]/g, '')) || 0;
                const dateObj = new Date(item.tanggal);
                const month = dateObj.getMonth();
                const year = dateObj.getFullYear();
                const key = `${monthNames[month]} ${year}`;
                if (!monthlyData[key]) monthlyData[key] = 0;
                monthlyData[key] += tonaseVal;
            });
            
            let index = 1;
            for (const [monthKey, tonase] of Object.entries(monthlyData)) {
                totalTonasePdf += tonase;
                tableRows.push([
                    index++,
                    monthKey,
                    new Intl.NumberFormat('id-ID').format(tonase)
                ]);
            }
            
            tableRows.push([
                { content: 'TOTAL', colSpan: 2, styles: { fontStyle: 'bold', halign: 'right' } },
                { content: new Intl.NumberFormat('id-ID').format(totalTonasePdf), styles: { fontStyle: 'bold', halign: 'center' } }
            ]);
        }

        autoTable(doc, {
            head: [tableColumn],
            body: tableRows,
            startY: 55,
            theme: 'grid',
            headStyles: { 
                fillColor: [255, 255, 255], 
                textColor: [0, 0, 0], 
                lineColor: [0, 0, 0], 
                lineWidth: 0.1,
                fontStyle: 'bold',
                halign: 'center'
            },
            bodyStyles: {
                textColor: [0, 0, 0],
                lineColor: [0, 0, 0],
                lineWidth: 0.1
            },
            columnStyles: columnStyles
        });
        
        const fileNamePdf = `Laporan_Harian_${exportType.charAt(0).toUpperCase() + exportType.slice(1)}_${currentBulan}_${currentTahun}.pdf`;
        doc.save(fileNamePdf);

        // Catat Audit Log Ekspor PDF
        router.post('/audit-log/export', {
            module: 'Produksi Harian',
            file_type: 'PDF',
            description: `Mengunduh file PDF Data Produksi Harian - Periode: ${namaBulan} ${currentTahun} (${exportType})`.trim()
        }, { preserveScroll: true, preserveState: true });
    };

    const exportExcel = () => {
        const monthNames = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
        const namaBulan = currentBulan === 'all' ? "Semua Bulan" : monthNames[parseInt(currentBulan) - 1];

        let excelRows = [];
        if (exportType === 'hari') {
            excelRows = listData.map((item, index) => ({
                'No': index + 1,
                'Tanggal': item.tanggal,
                'Blok': item.blok || '-',
                'Tonase (Kg)': parseFloat(String(item.tonase).replace(/[^0-9.-]/g, '')) || 0
            }));
        } else if (exportType === 'minggu') {
            const weeklyData = {};
            listData.forEach(item => {
                const tonase = parseFloat(String(item.tonase).replace(/[^0-9.-]/g, '')) || 0;
                const dateObj = new Date(item.tanggal);
                const day = dateObj.getDate();
                const week = Math.ceil(day / 7);
                if (!weeklyData[week]) {
                    weeklyData[week] = { tonase: 0, minDate: item.tanggal, maxDate: item.tanggal };
                }
                weeklyData[week].tonase += tonase;
                if (item.tanggal < weeklyData[week].minDate) weeklyData[week].minDate = item.tanggal;
                if (item.tanggal > weeklyData[week].maxDate) weeklyData[week].maxDate = item.tanggal;
            });

            let idx = 1;
            for (const [weekNum, data] of Object.entries(weeklyData)) {
                excelRows.push({
                    'No': idx++,
                    'Tanggal': `${data.minDate} s/d ${data.maxDate}`,
                    'Minggu Ke': `Minggu ${weekNum}`,
                    'Tonase (Kg)': data.tonase
                });
            }
        } else {
            const monthlyData = {};
            listData.forEach(item => {
                const tonase = parseFloat(String(item.tonase).replace(/[^0-9.-]/g, '')) || 0;
                const dateObj = new Date(item.tanggal);
                const m = dateObj.getMonth();
                const y = dateObj.getFullYear();
                const key = `${monthNames[m]} ${y}`;
                if (!monthlyData[key]) monthlyData[key] = 0;
                monthlyData[key] += tonase;
            });

            let idx = 1;
            for (const [monthKey, tonase] of Object.entries(monthlyData)) {
                excelRows.push({
                    'No': idx++,
                    'Bulan': monthKey,
                    'Tonase (Kg)': tonase
                });
            }
        }

        const ws = XLSX.utils.json_to_sheet(excelRows);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Produksi Harian");
        const fileNameExcel = `Laporan_Harian_${exportType.charAt(0).toUpperCase() + exportType.slice(1)}_${currentBulan}_${currentTahun}.xlsx`;
        XLSX.writeFile(wb, fileNameExcel);

        // Catat Audit Log Ekspor Excel
        router.post('/audit-log/export', {
            module: 'Produksi Harian',
            file_type: 'Excel',
            description: `Mengunduh file Excel Data Produksi Harian - Periode: ${namaBulan} ${currentTahun} (${exportType})`.trim()
        }, { preserveScroll: true, preserveState: true });
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
        >
            <Head title="Produksi Harian" />

            <div className="py-4 sm:py-12">
                <div className="w-full mx-auto sm:px-6 lg:px-8 space-y-6">
                    
                    {/* Area Chart Container */}
                    <div className="bg-white overflow-hidden shadow-sm border border-gray-100 sm:rounded-2xl p-6">
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h3 className="text-xl font-extrabold text-gray-900 tracking-tight">Tren Tonase Harian</h3>
                                <p className="text-sm text-gray-500 mt-1">Perkembangan hasil panen selama periode terpilih.</p>
                            </div>
                        </div>
                        <div className="w-full h-[350px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart
                                    data={listData}
                                    margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                                >
                                    <defs>
                                        <linearGradient id="colorTonase" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                                            <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis 
                                        dataKey="tanggal" 
                                        axisLine={false} 
                                        tickLine={false} 
                                        tick={{ fill: '#94a3b8', fontSize: 12 }} 
                                        dy={10}
                                    />
                                    <YAxis 
                                        axisLine={false} 
                                        tickLine={false} 
                                        tick={{ fill: '#94a3b8', fontSize: 12 }} 
                                        tickFormatter={(value) => new Intl.NumberFormat('id-ID').format(value)}
                                        dx={-10}
                                    />
                                    <Tooltip 
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)' }}
                                        formatter={(value) => [new Intl.NumberFormat('id-ID').format(value) + ' Kg', 'Tonase']}
                                        labelStyle={{ fontWeight: 'bold', color: '#1f2937', marginBottom: '4px' }}
                                    />
                                    <Area 
                                        type="monotone" 
                                        dataKey="tonase" 
                                        stroke="#10b981" 
                                        strokeWidth={4}
                                        fillOpacity={1} 
                                        fill="url(#colorTonase)" 
                                        activeDot={{ r: 6, strokeWidth: 0, fill: '#10b981' }}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Data Table Harian */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 xl:gap-0 px-6 py-5 border-b border-gray-100 bg-white mb-0">
                            <div>
                                <h3 className="text-2xl font-extrabold text-gray-900 tracking-tight">Data Produksi Harian</h3>
                                <p className="mt-1 text-sm text-gray-500">Rekapitulasi hasil panen harian seluruh blok.</p>
                            </div>
                            
                            <div className="flex flex-col xl:flex-row gap-3 xl:gap-2 w-full xl:w-auto xl:items-center">
                                {/* Filter Card */}
                                <div className="bg-white border xl:border-none border-gray-200 rounded-xl p-3 sm:p-4 xl:p-0 w-full xl:w-auto">
                                    <div className="grid grid-cols-2 gap-3 sm:flex sm:flex-row sm:gap-4 xl:gap-2 w-full xl:w-auto">
                                        <div className="flex flex-col w-full sm:w-36 xl:w-auto">
                                            <label className="xl:hidden text-[11px] font-medium text-slate-500 mb-1 ml-1">Bulan</label>
                                            <select value={currentBulan} onChange={(e) => handleFilterChange('bulan', e.target.value)} className="w-full xl:w-auto border-gray-300 rounded-xl shadow-sm focus:ring-emerald-500 focus:border-emerald-500 text-sm font-medium text-gray-700 bg-white">
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
                                            <label className="xl:hidden text-[11px] font-medium text-slate-500 mb-1 ml-1">Tahun</label>
                                            <select value={currentTahun} onChange={(e) => handleFilterChange('tahun', e.target.value)} className="w-full xl:w-auto border-gray-300 rounded-xl shadow-sm focus:ring-emerald-500 focus:border-emerald-500 text-sm font-medium text-gray-700 bg-white">
                                                <option value="2024">2024</option>
                                                <option value="2025">2025</option>
                                                <option value="2026">2026</option>
                                                <option value="2027">2027</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                {/* Buttons */}
                                <div className="flex flex-col sm:flex-row sm:justify-end gap-3 xl:items-center xl:gap-2 w-full xl:w-auto">
                                    <input type="file" accept=".xlsx, .xls" ref={fileInputRef} onChange={handleFileUpload} className="hidden" />
                                    <button onClick={() => fileInputRef.current?.click()} className="w-full sm:w-auto justify-center xl:justify-start inline-flex items-center px-4 py-2.5 bg-white border border-gray-300 rounded-xl font-bold text-xs text-gray-700 uppercase tracking-wider shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-200">
                                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>
                                        Import Excel
                                    </button>
                                    <div className="flex w-full sm:w-auto items-center space-x-1 border border-gray-200 xl:border-transparent rounded-xl bg-gray-50 xl:bg-transparent overflow-hidden shadow-sm xl:shadow-none">
                                        <select 
                                            value={exportType} 
                                            onChange={(e) => setExportType(e.target.value)} 
                                            className="flex-1 sm:flex-none border-none xl:border xl:border-gray-300 xl:rounded-l-xl bg-transparent xl:bg-white py-2.5 pl-3 pr-8 text-sm font-bold text-gray-700 focus:ring-0 uppercase tracking-wider cursor-pointer"
                                        >
                                            <option value="hari">Hari</option>
                                            <option value="minggu">Minggu</option>
                                            <option value="bulan">Bulan</option>
                                        </select>
                                        <button onClick={exportPDF} title="Unduh format PDF" className="justify-center inline-flex items-center px-3 py-2.5 border-l border-gray-200 xl:border xl:border-l-0 xl:bg-rose-50 text-rose-600 font-bold text-xs uppercase tracking-wider hover:bg-rose-100 focus:outline-none transition-all duration-200">
                                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                                            PDF
                                        </button>
                                        <button onClick={exportExcel} title="Unduh format Excel" className="justify-center inline-flex items-center px-3 py-2.5 border-l border-gray-200 xl:border xl:border-l-0 xl:rounded-r-xl xl:bg-emerald-50 text-emerald-700 font-bold text-xs uppercase tracking-wider hover:bg-emerald-100 focus:outline-none transition-all duration-200">
                                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                                            Excel
                                        </button>
                                    </div>
                                    <button onClick={() => setIsModalOpen(true)} className="w-full sm:w-auto justify-center xl:justify-start inline-flex items-center px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-green-600 border border-transparent rounded-xl font-bold text-xs text-white uppercase tracking-wider shadow-sm hover:shadow-md hover:from-emerald-600 hover:to-green-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transform transition-all duration-200 hover:-translate-y-0.5">
                                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
                                        Input Data
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div className="overflow-x-auto w-full">
                            <table className="w-full text-sm text-left text-gray-500">
                                <thead className="text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-200 bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-4 w-16">No</th>
                                        <th className="px-6 py-4">Tanggal</th>
                                        <th className="px-6 py-4 text-center">Blok</th>
                                        <th className="px-6 py-4 text-center">Tonase (Kg)</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {listData.length === 0 ? (
                                        <tr>
                                            <td colSpan="4" className="px-6 py-12 text-center text-gray-500 font-medium">
                                                Belum ada data panen harian untuk bulan ini.
                                            </td>
                                        </tr>
                                    ) : (
                                        listData.map((item, index) => (
                                            <tr key={index} className="hover:bg-indigo-50/30 transition-colors duration-150 border-b border-gray-100">
                                                <td className="px-6 py-4">{index + 1}</td>
                                                <td className="px-6 py-4 font-bold text-gray-800">{item.tanggal}</td>
                                                <td className="px-6 py-4 text-center">{item.blok || '-'}</td>
                                                <td className="px-6 py-4 text-center font-bold text-gray-900">{item.tonase}</td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                                {listData.length > 0 && (
                                    <tfoot>
                                        <tr className="bg-gray-50 border-t-2 border-gray-300">
                                            <td colSpan="3" className="px-6 py-4 text-right font-bold text-gray-800 uppercase tracking-wider text-sm">Total</td>
                                            <td className="px-6 py-4 text-center font-extrabold text-emerald-700 text-base">
                                                {new Intl.NumberFormat('id-ID').format(
                                                    listData.reduce((sum, item) => sum + (parseFloat(String(item.tonase).replace(/[^0-9.-]/g, '')) || 0), 0)
                                                )} Kg
                                            </td>
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
                    <h2 className="text-lg font-medium text-gray-900 mb-4">Input Data Harian</h2>
                    <form onSubmit={submit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Pilih Blok</label>
                                <select value={formData.blok_id} onChange={e => setData('blok_id', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" required>
                                    <option value="">-- Pilih Blok --</option>
                                    {masterBloks.map(blok => (
                                        <option key={blok.id} value={blok.id}>{blok.kode_blok}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Tanggal</label>
                                <input type="date" value={formData.tanggal} onChange={e => setData('tanggal', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Janjang</label>
                                <input type="number" value={formData.janjang} onChange={e => handleCalculateBjr('janjang', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Tonase (Kg)</label>
                                <input type="number" step="0.01" value={formData.tonase} onChange={e => handleCalculateBjr('tonase', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" required />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700">BJR Harian (Auto-hitung)</label>
                                <input type="number" step="0.01" value={formData.bjrHarian} className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" required readOnly />
                            </div>
                        </div>
                        <div className="mt-6 flex justify-end gap-3">
                            <SecondaryButton onClick={() => setIsModalOpen(false)}>
                                Batal
                            </SecondaryButton>
                            <button type="submit" disabled={processing} className="inline-flex items-center px-4 py-2 bg-green-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-green-700 focus:bg-green-700 active:bg-green-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition ease-in-out duration-150 disabled:opacity-50">
                                Simpan Data
                            </button>
                        </div>
                    </form>
                </div>
            </Modal>
        </AuthenticatedLayout>
    );
}
