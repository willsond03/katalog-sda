'use client';
import { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';

// --- Komponen-komponen ---
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

  const fetchProducts = useCallback(async (page, currentFilters) => {
    const tableContainer = document.querySelector("#table-container");
    if(tableContainer) tableContainer.style.opacity = '0.5';
    try {
      const params = new URLSearchParams({ page: page, ...currentFilters });
      const response = await fetch(`/api/products?${params}`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      setProducts(data.items);
      setPagination({ page: data.page, totalPages: data.totalPages, totalItems: data.totalItems });
    } catch (e) { setError(e.message); } 
    finally { if(tableContainer) tableContainer.style.opacity = '1'; }
  }, []);

  useEffect(() => {
    const fetchInitialData = async () => {
      setLoading(true);
      try {
        const [optionsRes, mapRes, productsRes, historyRes] = await Promise.all([
          fetch('/api/filter-options'),
          fetch('/api/map-data'),
          fetch('/api/products?page=1&provinsi=all&kategori_1=all&kategori_2=all'),
          fetch('/api/market-sounding')
        ]);
        const optionsData = await optionsRes.json();
        const mapJsonData = await mapRes.json();
        const productsData = await productsRes.json();
        const historyLogs = await historyRes.json();
        
        setFilterOptions(optionsData);
        setMapData(mapJsonData);
        setProducts(productsData.items);
        setPagination({ page: productsData.page, totalPages: productsData.totalPages, totalItems: productsData.totalItems });
        setHistoryData(historyLogs);
      } catch (error) { setError(error.message); } 
      finally { setLoading(false); }
    };
    fetchInitialData();
  }, [fetchProducts]);
  
  const openModal = (modalName) => setModals(prev => ({ ...prev, [modalName]: true }));
  const closeModal = (modalName) => setModals(prev => ({ ...prev, [modalName]: false }));

  const fetchHistory = async () => {
    setLoadingHistory(true);
    try {
      const response = await fetch('/api/market-sounding');
      const data = await response.json();
      setHistoryData(data);
    } catch (error) { console.error("Gagal mengambil histori:", error); } 
    finally { setLoadingHistory(false); }
  };

  const handleMarketSoundingSubmit = async (event) => {
    event.preventDefault();
    const btn = event.nativeEvent.submitter;
    btn.disabled = true;
    btn.textContent = "Menyimpan...";
    const formData = {
      balai: event.target.balai.value,
      wilayah: event.target.provinsi.value,
      paket_pekerjaan: event.target.paket_pekerjaan.value,
      tanggal: event.target.tanggal.value,
    };
    try {
      const response = await fetch('/api/market-sounding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      alert('Data Market Sounding berhasil disimpan!');
      closeModal('marketSounding');
      event.target.reset();
      fetchHistory();
    } catch (error) {
      alert('Gagal mengirim data: ' + error.message);
    } finally {
      btn.disabled = false;
      btn.textContent = "Simpan";
    }
  };
  
  const runComparison = async () => {
    const eventSelect = document.getElementById('comparisonDate');
    const daysInput = document.getElementById('comparisonDay');
    if (!eventSelect.value) { alert("Silakan pilih event terlebih dahulu."); return; }
    
    setLoadingAnalysis(true);
    openModal('analysisResult');
    const [eventDate, provinsi] = eventSelect.value.split(';');
    try {
      const response = await fetch('/api/run-comparison', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventDate, provinsi, daysToAdd: daysInput.value })
      });
      const result = await response.json();
      setAnalysisResult(result);
    } catch (error) { setAnalysisResult({ error: error.message }); } 
    finally { setLoadingAnalysis(false); }
  };

  useEffect(() => {
    if (modals.history) fetchHistory();
  }, [modals.history]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prevFilters => {
      const newFilters = { ...prevFilters, [name]: value };
      fetchProducts(1, newFilters);
      return newFilters;
    });
  };
  
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      fetchProducts(newPage, filters);
    }
  };

  return (
    <>
      <div className="flex h-screen bg-black text-gray-300 font-sans">
        <Sidebar onOpenModal={openModal} />
        <main className="flex-1 p-4 md:p-8 overflow-y-auto">
          <header className="mb-8 space-y-8">
            <h1 className="text-3xl md:text-4xl font-bold text-white">Dashboard Analitik Produk</h1>
            
            <div className="p-6 bg-zinc-900 border border-zinc-800 rounded-xl">
              <h3 className="text-lg font-semibold text-white mb-4">Analisis Market Sounding</h3>
              <div className="flex flex-col md:flex-row gap-4 items-end">
                <div className="flex-1">
                  <label htmlFor="comparisonDate" className="block text-sm font-medium text-zinc-400">Pilih Event</label>
                  <select id="comparisonDate" className="mt-1 block w-full bg-zinc-800 border-zinc-700 rounded-md shadow-sm text-white h-10 px-3">
                    <option value="">Pilih Event</option>
                    {historyData.map(log => <option key={log.id} value={`${log.tanggal};${log.wilayah}`}>{`${log.balai}: ${log.paket_pekerjaan} (${log.tanggal})`}</option>)}
                  </select>
                </div>
                <div className="flex-1">
                  <label htmlFor="comparisonDay" className="block text-sm font-medium text-zinc-400">Analisis Perubahan (H+)</label>
                  <input type="number" id="comparisonDay" defaultValue="7" className="mt-1 block w-full bg-zinc-800 border-zinc-700 rounded-md shadow-sm text-white h-10 px-3"/>
                </div>
                <button onClick={runComparison} className="w-full md:w-auto bg-emerald-600 text-white px-4 h-10 rounded-lg hover:bg-emerald-700">Jalankan Analisis</button>
              </div>
            </div>
            
            <div className="p-6 bg-zinc-900 border border-zinc-800 rounded-xl">
              <h2 className="text-lg font-semibold text-white mb-4">Filter Data</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                    <label htmlFor="provinsi" className="block text-sm font-medium text-zinc-400">Provinsi</label>
                    <select name="provinsi" value={filters.provinsi} onChange={handleFilterChange} className="mt-1 block w-full bg-zinc-800 border-zinc-700 rounded-md shadow-sm text-white h-10 px-3">
                    <option value="all">Semua Provinsi</option>
                    {filterOptions.provinsi && filterOptions.provinsi.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                </div>
                <div>
                    <label htmlFor="kategori_1" className="block text-sm font-medium text-zinc-400">Kategori 1</label>
                    <select name="kategori_1" value={filters.kategori_1} onChange={handleFilterChange} className="mt-1 block w-full bg-zinc-800 border-zinc-700 rounded-md shadow-sm text-white h-10 px-3">
                    <option value="all">Semua Kategori 1</option>
                    {filterOptions.kategori_1 && filterOptions.kategori_1.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                </div>
                <div>
                    <label htmlFor="kategori_2" className="block text-sm font-medium text-zinc-400">Kategori 2</label>
                    <select name="kategori_2" value={filters.kategori_2} onChange={handleFilterChange} className="mt-1 block w-full bg-zinc-800 border-zinc-700 rounded-md shadow-sm text-white h-10 px-3">
                    <option value="all">Semua Kategori 2</option>
                    {filterOptions.kategori_2 && filterOptions.kategori_2.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                </div>
              </div>
            </div>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            <div className="lg:col-span-3 bg-zinc-900 border border-zinc-800 rounded-xl shadow p-4 h-[65vh]">
              <h2 className="text-lg font-semibold text-white mb-4">Persebaran Produk</h2>
              {!loading && <Map mapData={mapData} />}
              {loading && <div className="flex items-center justify-center h-full"><p>Memuat data peta...</p></div>}
            </div>
            <div id="table-container" className="lg:col-span-2 bg-zinc-900 border border-zinc-800 rounded-xl shadow transition-opacity duration-300">
              {loading && !products.length ? <div className="text-center py-20 text-zinc-400">Memuat data produk...</div> : 
               error ? <div className="text-center py-20 text-red-400">Error: {error}</div> : (
                <div className="p-6">
                  <div className="mb-4 text-sm text-zinc-400">
                    Menampilkan {products.length} dari {pagination.totalItems.toLocaleString('id-ID')} produk. (Halaman {pagination.page} dari {pagination.totalPages})
                  </div>
                  <div className="overflow-auto max-h-[45vh]">
                    <table className="min-w-full"><thead className="sticky top-0 bg-zinc-900"><tr className="border-b border-zinc-700"><th className="px-6 py-3 text-left text-xs font-semibold text-zinc-400 uppercase tracking-wider">Nama Produk</th><th className="px-6 py-3 text-left text-xs font-semibold text-zinc-400 uppercase tracking-wider">Perusahaan</th><th className="px-6 py-3 text-left text-xs font-semibold text-zinc-400 uppercase tracking-wider">Provinsi</th></tr></thead>
                      <tbody className="divide-y divide-zinc-800">
                        {products.length > 0 ? products.map(p => (<tr key={p.id} className="hover:bg-zinc-800"><td className="px-6 py-4 whitespace-nowrap text-sm text-white">{p.nama_produk}</td><td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-400">{p.perusahaan}</td><td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-400">{p.provinsi}</td></tr>)) : (<tr><td colSpan="3" className="text-center py-10 text-zinc-500">Tidak ada data.</td></tr>)}
                      </tbody>
                    </table>
                  </div>
                  <div className="mt-6">
                    <Pagination currentPage={pagination.page} totalPages={pagination.totalPages} onPageChange={handlePageChange} />
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
      
      {/* --- MODALS --- */}
      {modals.marketSounding && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-zinc-900 p-8 rounded-xl border border-zinc-800 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4 text-white">Catat Market Sounding</h2>
            <form onSubmit={handleMarketSoundingSubmit} className="space-y-4">
              <div><label htmlFor="balai" className="block text-sm text-zinc-400">Balai</label><input type="text" id="balai" name="balai" required className="mt-1 block w-full bg-zinc-800 border-zinc-700 rounded-md shadow-sm text-white h-10 px-3"/></div>
              <div><label htmlFor="provinsi-modal" className="block text-sm text-zinc-400">Wilayah</label><select id="provinsi-modal" name="provinsi" required className="mt-1 block w-full bg-zinc-800 border-zinc-700 rounded-md shadow-sm text-white h-10 px-3">{filterOptions.provinsi && filterOptions.provinsi.map(opt => <option key={opt} value={opt}>{opt}</option>)}</select></div>
              <div><label htmlFor="paket_pekerjaan" className="block text-sm text-zinc-400">Paket Pekerjaan</label><input type="text" id="paket_pekerjaan" name="paket_pekerjaan" required className="mt-1 block w-full bg-zinc-800 border-zinc-700 rounded-md shadow-sm text-white h-10 px-3"/></div>
              <div><label htmlFor="tanggal" className="block text-sm text-zinc-400">Tanggal</label><input type="date" id="tanggal" name="tanggal" required className="mt-1 block w-full bg-zinc-800 border-zinc-700 rounded-md shadow-sm text-white h-10 px-3"/></div>
              <div className="flex justify-end space-x-4 pt-4"><button type="button" onClick={() => closeModal('marketSounding')} className="py-2 px-4 bg-zinc-700 rounded-lg">Batal</button><button type="submit" className="py-2 px-4 bg-blue-600 rounded-lg">Simpan</button></div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL HISTORI (VERSI FINAL) --- */}
      {modals.history && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-zinc-900 p-8 rounded-xl border border-zinc-800 w-full max-w-5xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-white">Histori Market Sounding</h2>
              <button onClick={() => closeModal('history')} className="text-zinc-400 text-2xl font-bold">&times;</button>
            </div>
            <div className="overflow-y-auto max-h-[70vh]">
              {loadingHistory ? <p className="text-center">Memuat histori...</p> : 
                (historyData.length > 0 ? (
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

      {modals.analysisResult && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-zinc-900 p-8 rounded-xl border border-zinc-800 w-full max-w-2xl">
             <div className="flex justify-between items-center mb-4"><h2 className="text-xl font-bold text-white">Hasil Perbandingan</h2><button onClick={() => closeModal('analysisResult')} className="text-zinc-400 text-2xl font-bold">&times;</button></div>
             {loadingAnalysis ? <p>Menganalisa data...</p> : 
              analysisResult && !analysisResult.error ? (
                <div className="space-y-4 text-white">
                    <p>Perbandingan kondisi pada <strong>{analysisResult.startDate}</strong> dengan H+{(new Date(analysisResult.endDate) - new Date(analysisResult.startDate)) / (1000 * 60 * 60 * 24)} hari setelahnya.</p>
                    <div className="grid grid-cols-3 gap-4 text-center">
                        <div className="p-4 bg-zinc-800 rounded-lg"><h4 className="font-semibold">Produk Awal</h4><p className="text-2xl">{analysisResult.beforeCount}</p></div>
                        <div className="p-4 bg-zinc-800 rounded-lg"><h4 className="font-semibold">Produk Akhir</h4><p className="text-2xl">{analysisResult.afterCount}</p></div>
                        <div className={`p-4 rounded-lg ${analysisResult.change >= 0 ? 'bg-emerald-900' : 'bg-red-900'}`}><h4 className="font-semibold">Perubahan</h4><p className="text-2xl">{analysisResult.change >= 0 ? '+' : ''}{analysisResult.change}</p></div>
                    </div>
                    <div>
                        <h4 className="font-semibold">Produk Baru ({analysisResult.newProducts.length}):</h4>
                        <ul className="list-disc pl-5 text-sm text-emerald-400 max-h-40 overflow-y-auto">
                            {analysisResult.newProducts.length > 0 ? analysisResult.newProducts.map((p, i) => <li key={i}>{p.nama_produk} <span className="text-zinc-400">- {p.perusahaan}</span></li>) : 'Tidak ada.'}
                        </ul>
                    </div>
                </div>
              ) : <p className="text-red-400">Gagal memuat hasil analisa: {analysisResult?.error || 'Unknown error'}</p>
             }
          </div>
        </div>
      )}
    </>
  );
}