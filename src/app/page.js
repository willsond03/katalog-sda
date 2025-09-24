'use client';
import { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';

const Map = dynamic(
  () => import('../components/Map'), 
  { ssr: false, loading: () => <div className="flex items-center justify-center h-full"><p>Memuat peta...</p></div> }
);

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  const getPaginationRange = () => {
    const delta = 2; const range = [];
    for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) { range.push(i); }
    if (currentPage - delta > 2) { range.unshift('...'); }
    if (currentPage + delta < totalPages - 1) { range.push('...'); }
    range.unshift(1);
    if (totalPages > 1) { range.push(totalPages); }
    return range;
  };
  const pages = getPaginationRange();
  return (
    <div className="flex items-center justify-center space-x-2">
      <button onClick={() => onPageChange(currentPage - 1)} disabled={currentPage <= 1} className="px-3 py-1 rounded-md bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed">&laquo;</button>
      {pages.map((page, index) => ( <button key={index} onClick={() => typeof page === 'number' && onPageChange(page)} disabled={typeof page !== 'number'} className={`px-3 py-1 rounded-md ${currentPage === page ? 'bg-blue-600 text-white' : 'bg-zinc-800 hover:bg-zinc-700'} ${typeof page !== 'number' ? 'cursor-default' : ''}`}>{page}</button>))}
      <button onClick={() => onPageChange(currentPage + 1)} disabled={currentPage >= totalPages} className="px-3 py-1 rounded-md bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed">&raquo;</button>
    </div>
  );
};

const Sidebar = ({ onOpenModal }) => {
    return (
        <aside className="w-64 bg-zinc-900 border-r border-zinc-800 flex-col hidden lg:flex">
            <div className="p-4 border-b border-zinc-800">
                <h1 className="text-xl font-bold text-white">E-Katalog SDA</h1>
                <p className="text-xs text-zinc-400">Dashboard Monitoring</p>
            </div>
            <nav className="flex-1 p-4 space-y-2">
                <a href="#" className="flex items-center p-2 rounded-lg bg-zinc-800 text-white font-semibold"><span>Dashboard</span></a>
                <a href="#" onClick={() => onOpenModal('marketSounding')} className="flex items-center p-2 rounded-lg hover:bg-zinc-800 text-zinc-300"><span>Input Market Sounding</span></a>
                <a href="#" onClick={() => onOpenModal('history')} className="flex items-center p-2 rounded-lg hover:bg-zinc-800 text-zinc-300"><span>Histori Market Sounding</span></a>
            </nav>
        </aside>
    );
};

export default function Home() {
  const [products, setProducts] = useState([]);
  const [mapData, setMapData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterOptions, setFilterOptions] = useState({ provinsi: [], kategori_1: [], kategori_2: [] });
  const [filters, setFilters] = useState({ provinsi: 'all', kategori_1: 'all', kategori_2: 'all' });
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, totalItems: 0 });
  const [modals, setModals] = useState({ marketSounding: false, history: false, analysisResult: false });
  const [historyData, setHistoryData] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);

  const fetchProducts = useCallback(async (page, currentFilters) => { /* ... Kode ini sudah benar ... */ }, []);

  useEffect(() => { /* ... Kode ini sudah benar ... */ }, []);
  
  const openModal = (modalName) => setModals(prev => ({ ...prev, [modalName]: true }));
  const closeModal = (modalName) => setModals(prev => ({ ...prev, [modalName]: false }));

  const fetchHistory = async () => {
    setLoadingHistory(true);
    try {
      const response = await fetch(`/api/market-sounding?t=${new Date().getTime()}`);
      const data = await response.json();
      setHistoryData(data);
    } catch (error) { console.error("Gagal mengambil histori:", error); } 
    finally { setLoadingHistory(false); }
  };

  const handleMarketSoundingSubmit = async (event) => { /* ... Kode ini sudah benar ... */ };
  const runComparison = async () => { /* ... Kode ini sudah benar ... */ };

  useEffect(() => {
    if (modals.history) {
      fetchHistory();
    }
  }, [modals.history]);

  const handleFilterChange = (e) => { /* ... Kode ini sudah benar ... */ };
  const handlePageChange = (newPage) => { /* ... Kode ini sudah benar ... */ };

  // --- TAMBAHKAN LOG DIAGNOSTIK INI ---
  console.log("Render Check -> History Data:", historyData);

  return (
    <>
      <div className="flex h-screen bg-black text-gray-300 font-sans">
        <Sidebar onOpenModal={openModal} />
        <main className="flex-1 p-4 md:p-8 overflow-y-auto">
          {/* ... Sisa JSX Anda yang sudah benar ... */}
        </main>
      </div>
      
      {/* --- MODAL HISTORI (VERSI FINAL & PERBAIKAN) --- */}
      {modals.history && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-zinc-900 p-8 rounded-xl border border-zinc-800 w-full max-w-5xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-white">Histori Market Sounding</h2>
              <button onClick={() => closeModal('history')} className="text-zinc-400 text-2xl font-bold">&times;</button>
            </div>
            <div className="overflow-y-auto max-h-[70vh]">
              {loadingHistory ? <p className="text-center py-10">Memuat histori...</p> : 
                (historyData && historyData.length > 0 ? (
                  <table className="min-w-full">
                    <thead className="bg-zinc-800 sticky top-0">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-zinc-400 uppercase">Tanggal</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-zinc-400 uppercase">Balai</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-zinc-400 uppercase">Wilayah</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-zinc-400 uppercase">Paket Pekerjaan</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800">
                      {historyData.map((log) => (
                        <tr key={log.id}>
                          <td className="px-6 py-4 text-sm whitespace-nowrap">{log.tanggal}</td>
                          <td className="px-6 py-4 text-sm whitespace-nowrap">{log.balai}</td>
                          <td className="px-6 py-4 text-sm whitespace-nowrap">{log.wilayah}</td>
                          <td className="px-6 py-4 text-sm">{log.paket_pekerjaan}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p className="text-center text-zinc-500 py-10">Tidak ada data histori.</p>
                ))
              }
            </div>
          </div>
        </div>
      )}

      {/* ... Sisa Modal Anda yang lain ... */}
    </>
  );
}

// NOTE: Saya menyembunyikan beberapa blok kode yang sudah benar dengan /* ... */ agar Anda bisa fokus pada perubahannya.
// Silakan salin seluruh kode dari `page.js` Anda yang stabil dan tambahkan/ganti bagian yang relevan.