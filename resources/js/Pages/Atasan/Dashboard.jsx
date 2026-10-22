import { useState, useMemo, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { 
    Palmtree, 
    Calendar, 
    ArrowUpCircle, 
    ArrowDownCircle, 
    Weight,
    BarChart3,
    PieChart as PieChartIcon,
    Coins
} from 'lucide-react';
import { 
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
    BarChart, Bar,
    PieChart, Pie, Cell, Legend
} from 'recharts';

export default function Dashboard({ data = {} }) {
    const { 
        totalProduksi = 0, 
        rataRata = 0, 
        maxProduksi = 0, 
        maxBulan = '-', 
        minProduksi = 0, 
        minBulan = '-',
        monthlyData = [],
        quarterlyData = [],
        currentYear = new Date().getFullYear(),
        rawChartData = [],
        rataRataHarga = 0,
        kategori = 'Global'
    } = data;

    const labelProduksi = kategori === 'Brondol' ? 'Brondolan' : (kategori === 'Global' ? 'Global' : 'TBS');

    const handleKategoriChange = (e) => {
        router.get(window.location.pathname, { kategori: e.target.value }, { preserveState: true, preserveScroll: true });
    };

    const [chartType, setChartType] = useState('tahunan');
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
    const [selectedWeek, setSelectedWeek] = useState(1);

    const monthNames = useMemo(() => ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"], []);

    useEffect(() => {
        if (rawChartData.length > 0) {
            const dates = rawChartData.map(item => new Date(item.tanggal).getTime());
            const latest = new Date(Math.max(...dates));
            setSelectedMonth(latest.getMonth());
            let week = Math.ceil(latest.getDate() / 7);
            if (week > 5) week = 5;
            setSelectedWeek(week);
        }
    }, [rawChartData]);

    const availableMonths = useMemo(() => {
        const months = new Set();
        rawChartData.forEach(item => {
            months.add(new Date(item.tanggal).getMonth());
        });
        return Array.from(months).sort((a,b) => b - a);
    }, [rawChartData]);

    const chartData = useMemo(() => {
        if (!rawChartData.length) return monthlyData;

        if (chartType === 'mingguan') {
            const daily = {};
            const daysName = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"];
            daysName.forEach(day => {
                daily[day] = { name: day, produksi: 0, pendapatan: 0, _order: daysName.indexOf(day) };
            });

            rawChartData.forEach(item => {
                const d = new Date(item.tanggal);
                if (d.getFullYear() == currentYear && d.getMonth() == selectedMonth) {
                    const firstDay = new Date(d.getFullYear(), d.getMonth(), 1);
                    const firstDayWeekday = firstDay.getDay() === 0 ? 7 : firstDay.getDay();
                    const offsetDate = d.getDate() + firstDayWeekday - 2;
                    let w = Math.floor(offsetDate / 7) + 1;
                    
                    if (w === selectedWeek) {
                        const dayNameIndex = d.getDay() === 0 ? 6 : d.getDay() - 1;
                        const dayName = daysName[dayNameIndex];
                        daily[dayName].produksi += parseFloat(item.tonase) || 0;
                        daily[dayName].pendapatan += parseFloat(item.total) || 0;
                    }
                }
            });
            return Object.values(daily).sort((a,b) => a._order - b._order);

        } else if (chartType === 'bulanan') {
            const weekly = {};
            for (let i = 1; i <= 6; i++) {
                weekly[i] = { name: `Minggu ${i}`, produksi: 0, pendapatan: 0, _w: i, _count: 0 };
            }

            rawChartData.forEach(item => {
                const d = new Date(item.tanggal);
                if (d.getFullYear() == currentYear && d.getMonth() == selectedMonth) {
                    const firstDay = new Date(d.getFullYear(), d.getMonth(), 1);
                    const firstDayWeekday = firstDay.getDay() === 0 ? 7 : firstDay.getDay();
                    const offsetDate = d.getDate() + firstDayWeekday - 2;
                    let week = Math.floor(offsetDate / 7) + 1;
                    
                    if (weekly[week]) {
                        const tonase = parseFloat(item.tonase) || 0;
                        const total = parseFloat(item.total) || 0;
                        if (tonase > 0 || total > 0) {
                            weekly[week].produksi += tonase;
                            weekly[week].pendapatan += total;
                            weekly[week]._count += 1;
                        }
                    }
                }
            });
            return Object.values(weekly).filter(w => w._count > 0 || w._w <= 4).sort((a,b) => a._w - b._w);

        } else if (chartType === 'harian') {
            const daily = {};
            const daysInMonth = new Date(currentYear, selectedMonth + 1, 0).getDate();
            for (let i = 1; i <= daysInMonth; i++) {
                const d = new Date(currentYear, selectedMonth, i);
                const dateStr = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
                daily[dateStr] = { name: `${i}`, produksi: 0, pendapatan: 0, _d: dateStr };
            }

            rawChartData.forEach(item => {
                const d = new Date(item.tanggal);
                if (d.getFullYear() == currentYear && d.getMonth() == selectedMonth) {
                    const itemDateStr = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
                    if (daily[itemDateStr]) {
                        daily[itemDateStr].produksi += parseFloat(item.tonase) || 0;
                        daily[itemDateStr].pendapatan += parseFloat(item.total) || 0;
                    }
                }
            });
            return Object.values(daily).sort((a,b) => a._d.localeCompare(b._d));

        } else if (chartType === 'tahunan') {
            return monthlyData;
        }
        
        return monthlyData;
    }, [rawChartData, chartType, monthlyData, currentYear, selectedMonth, selectedWeek]);

    const COLORS = ['#0284c7', '#16a34a', '#eab308', '#dc2626', '#8b5cf6', '#f97316', '#14b8a6'];

    const formatNumber = (num) => {
        return new Intl.NumberFormat('id-ID').format(num);
    };

    const activeStats = useMemo(() => {
        const active = chartData.filter(d => d.produksi > 0 || d.pendapatan > 0);
        const count = active.length;
        const total = active.reduce((sum, d) => sum + (Number(d.produksi) || 0), 0);
        const totalPendapatan = active.reduce((sum, d) => sum + (Number(d.pendapatan) || 0), 0);
        const avg = count > 0 ? total / count : 0;
        const avgPendapatan = count > 0 ? totalPendapatan / count : 0;
        
        let median = 0;
        let stdDev = 0;
        let cv = 0;
        
        let max = 0, maxName = '-';
        let min = Number.MAX_VALUE, minName = '-';

        if (count > 0) {
            let sorted = [...active].map(d => d.produksi).sort((a, b) => a - b);
            let mid = Math.floor(count / 2);
            median = count % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;

            let sumSqr = active.reduce((sum, d) => sum + Math.pow(d.produksi - avg, 2), 0);
            stdDev = Math.sqrt(sumSqr / count);
            cv = avg > 0 ? (stdDev / avg) * 100 : 0;
            
            active.forEach(d => {
                if (d.produksi > max) { max = d.produksi; maxName = d.name; }
                if (d.produksi < min) { min = d.produksi; minName = d.name; }
            });
        }
        if (min === Number.MAX_VALUE) min = 0;

        return { avg, avgPendapatan, median, stdDev, cv, count, totalCount: chartData.length, total, max, maxName, min, minName, totalPendapatan };
    }, [chartData]);

    
    const chartTitle = useMemo(() => {
        if (!rawChartData.length) return `Tahun ${currentYear}`;
        
        if (chartType === 'mingguan') {
            return `Minggu ${selectedWeek} (${monthNames[selectedMonth]} ${currentYear})`;
        } else if (chartType === 'harian') {
            return `Harian (${monthNames[selectedMonth]} ${currentYear})`;
        } else if (chartType === 'bulanan') {
            return `Bulan ${monthNames[selectedMonth]} ${currentYear}`;
        } else {
            return `Tahun ${currentYear}`;
        }
    }, [chartType, rawChartData, currentYear, selectedMonth, selectedWeek, monthNames]);

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0">
                    <div>
                        <h2 className="text-2xl font-bold text-[#143d2c] tracking-tight uppercase">DASHBOARD ATASAN</h2>
                        <p className="text-sm text-gray-500 mt-1">Monitoring Produksi {labelProduksi}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        { (chartType === 'bulanan' || chartType === 'mingguan' || chartType === 'harian') && (
                            <select 
                                value={selectedMonth} 
                                onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                                className="text-sm border-gray-200 bg-white rounded-lg shadow-sm focus:ring-green-500 focus:border-green-500 py-2 pl-4 pr-10 font-medium text-gray-700 cursor-pointer"
                            >
                                {availableMonths.map(m => (
                                    <option key={m} value={m}>{monthNames[m]}</option>
                                ))}
                            </select>
                        )}
                        { chartType === 'mingguan' && (
                            <select 
                                value={selectedWeek} 
                                onChange={(e) => setSelectedWeek(parseInt(e.target.value))}
                                className="text-sm border-gray-200 bg-white rounded-lg shadow-sm focus:ring-green-500 focus:border-green-500 py-2 pl-4 pr-10 font-medium text-gray-700 cursor-pointer"
                            >
                                <option value={1}>Minggu 1</option>
                                <option value={2}>Minggu 2</option>
                                <option value={3}>Minggu 3</option>
                                <option value={4}>Minggu 4</option>
                                <option value={5}>Minggu 5</option>
                                <option value={6}>Minggu 6</option>
                            </select>
                        )}
                        <select 
                            value={chartType} 
                            onChange={(e) => setChartType(e.target.value)}
                            className="text-sm border-gray-200 bg-white rounded-lg shadow-sm focus:ring-green-500 focus:border-green-500 py-2 pl-4 pr-10 font-medium text-gray-700 cursor-pointer"
                        >
                            <option value="harian">Harian</option>
                            <option value="mingguan">Mingguan</option>
                            <option value="bulanan">Bulanan</option>
                            <option value="tahunan">Tahunan</option>
                        </select>
                        <select 
                            value={kategori} 
                            onChange={handleKategoriChange}
                            className="text-sm border-gray-200 bg-white rounded-lg shadow-sm focus:ring-green-500 focus:border-green-500 py-2 pl-4 pr-10 font-medium text-gray-700 cursor-pointer bg-green-50 text-green-700 border-green-200"
                        >
                            <option value="Global">Global</option>
                            <option value="Inti CSA">Inti CSA</option>
                            <option value="Agrinas">Agrinas</option>
                            <option value="Brondol">Brondol</option>
                        </select>
                    </div>
                </div>
            }
        >
            <Head title="Dashboard Atasan" />

            <div className="space-y-6">
                {/* Stat Cards */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3 sm:gap-4">
                    <div className="bg-white rounded-xl p-4 sm:p-5 shadow-sm border border-gray-100 flex items-center gap-3 sm:gap-4 overflow-hidden">
                        <div className="bg-green-50 p-2 sm:p-3 rounded-lg text-green-600 shrink-0">
                            <Palmtree size={24} />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-xs text-gray-500 font-medium truncate">Total Produksi {labelProduksi}</p>
                            <h3 className="text-lg sm:text-xl font-bold text-gray-800 truncate" title={formatNumber(activeStats.total)}>{formatNumber(activeStats.total)}</h3>
                            <p className="text-xs text-gray-400 truncate">Kg</p>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl p-4 sm:p-5 shadow-sm border border-gray-100 flex items-center gap-3 sm:gap-4 overflow-hidden">
                        <div className="bg-green-50 p-2 sm:p-3 rounded-lg text-green-600 shrink-0">
                            <Calendar size={24} />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-xs text-gray-500 font-medium truncate" title={`Rata-rata Produksi/${chartType === 'mingguan' ? 'Hari' : chartType === 'harian' ? 'Tanggal' : chartType === 'bulanan' ? 'Minggu' : 'Bulan'}`}>Rata-rata Produksi/{chartType === 'mingguan' ? 'Hari' : chartType === 'harian' ? 'Tanggal' : chartType === 'bulanan' ? 'Minggu' : 'Bulan'}</p>
                            <h3 className="text-lg sm:text-xl font-bold text-gray-800 truncate" title={formatNumber(activeStats.avg)}>{formatNumber(activeStats.avg)}</h3>
                            <p className="text-xs text-gray-400 truncate">Kg</p>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl p-4 sm:p-5 shadow-sm border border-gray-100 flex items-center gap-3 sm:gap-4 overflow-hidden">
                        <div className="bg-green-50 p-2 sm:p-3 rounded-lg text-green-600 shrink-0">
                            <ArrowUpCircle size={24} />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-xs text-gray-500 font-medium truncate">Produksi Tertinggi</p>
                            <h3 className="text-lg sm:text-xl font-bold text-gray-800 truncate" title={formatNumber(activeStats.max)}>{formatNumber(activeStats.max)}</h3>
                            <p className="text-xs text-gray-400 truncate">Kg ({activeStats.maxName})</p>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl p-4 sm:p-5 shadow-sm border border-gray-100 flex items-center gap-3 sm:gap-4 overflow-hidden">
                        <div className="bg-red-50 p-2 sm:p-3 rounded-lg text-red-500 shrink-0">
                            <ArrowDownCircle size={24} />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-xs text-gray-500 font-medium truncate">Produksi Terendah</p>
                            <h3 className="text-lg sm:text-xl font-bold text-gray-800 truncate" title={formatNumber(activeStats.min)}>{formatNumber(activeStats.min)}</h3>
                            <p className="text-xs text-gray-400 truncate">Kg ({activeStats.minName})</p>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl p-4 sm:p-5 shadow-sm border border-gray-100 flex items-center gap-3 sm:gap-4 overflow-hidden col-span-2 md:col-span-1">
                        <div className="bg-emerald-50 p-2 sm:p-3 rounded-lg text-emerald-600 shrink-0">
                            <Coins size={24} />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-xs text-gray-500 font-medium truncate">Rata-rata Pendapatan</p>
                            <h3 className="text-lg sm:text-xl font-bold text-gray-800 truncate" title={`Rp ${formatNumber(Math.round(activeStats.avgPendapatan))}`}>Rp {formatNumber(Math.round(activeStats.avgPendapatan))}</h3>
                            <p className="text-xs text-gray-400 truncate" title={`Harga rata-rata: Rp ${formatNumber(Math.round(rataRataHarga))}/Kg`}>Harga rata-rata: Rp {formatNumber(Math.round(rataRataHarga))}/Kg</p>
                        </div>
                    </div>
                </div>

                {/* Charts Row 1 */}
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-semibold text-gray-800">Tren Produksi {labelProduksi} ({chartTitle})</h3>
                        </div>
                        <div className="h-72 text-xs">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af' }} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9ca3af' }} tickFormatter={(value) => (value / 1000) + ' Ton'} width={60} />
                                    <RechartsTooltip formatter={(value) => [formatNumber(value) + ' Kg', 'Produksi']} />
                                    <Line type="monotone" dataKey="produksi" stroke="#16a34a" strokeWidth={3} dot={{ r: 4, fill: '#f97316', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6, fill: '#ea580c', stroke: '#fff', strokeWidth: 2 }} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                    
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-semibold text-gray-800">Pendapatan {labelProduksi} ({chartTitle})</h3>
                        </div>
                        <div className="h-72 text-xs">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af' }} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9ca3af' }} tickFormatter={(value) => {
                                        if (value >= 1000000000) return (value / 1000000000).toFixed(1).replace('.0', '') + ' Miliar';
                                        if (value >= 1000000) return (value / 1000000).toFixed(0) + ' Juta';
                                        return value;
                                    }} width={70} />
                                    <RechartsTooltip cursor={{ fill: '#f3f4f6' }} formatter={(value) => ['Rp ' + formatNumber(value), 'Pendapatan']} />
                                    <Bar dataKey="pendapatan" radius={[4, 4, 0, 0]} maxBarSize={40}>
                                        {chartData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* Bottom Row */}
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                    {/* Table */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 xl:col-span-1 flex flex-col h-[400px]">
                        <h3 className="font-semibold text-gray-800 mb-4 sticky top-0 bg-white pb-2">Tabel Produksi {labelProduksi} ({chartTitle})</h3>
                        <div className="flex-1 overflow-auto rounded-md">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-gray-500 bg-gray-50 border-b border-t border-gray-100 sticky top-0">
                                <tr>
                                    <th className="px-3 py-3 font-medium">
                                        {chartType === 'mingguan' ? 'Hari' : chartType === 'harian' ? 'Tanggal' : chartType === 'bulanan' ? 'Minggu' : 'Bulan'}
                                    </th>
                                    <th className="px-3 py-3 font-medium text-right">Produksi (Kg)</th>
                                    <th className="px-3 py-3 font-medium text-right">Ton</th>
                                </tr>
                            </thead>
                            <tbody>
                                {chartData.map((row, i) => (
                                    <tr key={i} className="border-b border-gray-50 hover:bg-gray-50/50">
                                        <td className="px-3 py-2.5 font-medium text-gray-700">{row.name}</td>
                                        <td className="px-3 py-2.5 text-right font-medium">{formatNumber(row.produksi)}</td>
                                        <td className="px-3 py-2.5 text-right text-gray-500">{(row.produksi / 1000).toFixed(2)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        </div>
                    </div>

                    {/* Pie Chart */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 xl:col-span-1 flex flex-col h-[400px]">
                        <h3 className="font-semibold text-gray-800 mb-2">Pendapatan {labelProduksi} per {chartType === 'mingguan' ? 'Hari' : chartType === 'harian' ? 'Tanggal' : chartType === 'bulanan' ? 'Minggu' : 'Kuartal'} ({chartTitle})</h3>
                        <div className="flex-1 flex items-center justify-center relative">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={chartType === 'tahunan' ? quarterlyData : chartData.filter(d => d.pendapatan > 0)}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={0}
                                        outerRadius="75%"
                                        dataKey={chartType === 'tahunan' ? "value" : "pendapatan"}
                                        labelLine={false}
                                        label={({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }) => {
                                            if (percent < 0.04) return null;
                                            const RADIAN = Math.PI / 180;
                                            const radius = innerRadius + (outerRadius - innerRadius) * 0.6;
                                            const x = cx + radius * Math.cos(-midAngle * RADIAN);
                                            const y = cy + radius * Math.sin(-midAngle * RADIAN);
                                            return (
                                                <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" fontSize={11} fontWeight="bold">
                                                    {`${(percent * 100).toFixed(1)}%`}
                                                </text>
                                            );
                                        }}
                                    >
                                        {(chartType === 'tahunan' ? quarterlyData : chartData.filter(d => d.pendapatan > 0)).map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <RechartsTooltip formatter={(value) => ['Rp ' + formatNumber(value), 'Pendapatan']} />
                                    {chartType !== 'harian' && (
                                        <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                                    )}
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Stats List */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 xl:col-span-1 h-[400px] flex flex-col">
                        <h3 className="font-semibold text-gray-800 mb-6">Statistik Produksi ({chartTitle})</h3>
                        <div className="space-y-6 flex-1 flex flex-col justify-center">
                            <div className="flex items-start gap-4">
                                <div className="bg-green-50 p-3 rounded-lg text-green-600">
                                    <Palmtree size={20} />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 font-medium">Rata-rata Produksi/{chartType === 'mingguan' ? 'Hari' : chartType === 'harian' ? 'Tanggal' : chartType === 'bulanan' ? 'Minggu' : 'Bulan'}</p>
                                    <p className="text-base font-bold text-gray-800">{formatNumber(activeStats.avg)} Kg</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <div className="bg-green-50 p-3 rounded-lg text-green-600">
                                    <ArrowUpCircle size={20} />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 font-medium">Produksi Tertinggi</p>
                                    <p className="text-base font-bold text-gray-800">{activeStats.maxName} ({formatNumber(activeStats.max)} Kg)</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <div className="bg-green-50 p-3 rounded-lg text-green-600">
                                    <ArrowDownCircle size={20} />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 font-medium">Produksi Terendah</p>
                                    <p className="text-base font-bold text-gray-800">{activeStats.minName} ({formatNumber(activeStats.min)} Kg)</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <div className="bg-green-50 p-3 rounded-lg text-green-600">
                                    <Calendar size={20} />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 font-medium">Status Data</p>
                                    <p className="text-base font-bold text-gray-800">
                                        {activeStats.count} / {activeStats.totalCount} {chartType === 'mingguan' ? 'Hari' : chartType === 'harian' ? 'Tanggal' : chartType === 'bulanan' ? 'Minggu' : 'Bulan'} Aktif
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
