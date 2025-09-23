// Lokasi: src/app/page.js
'use client';

import { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { ThemeSwitcher } from '../components/ThemeSwitcher'; // Pastikan file ini ada

// --- KOMPONEN-KOMPONEN ---
const Map = dynamic(() => import('../components/Map'), { ssr: false, loading: () => <p>Memuat peta...</p> });

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  return (
    <div className="flex justify-center mt-4 space-x-2">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-3 py-1 rounded bg-gray-200 dark:bg-zinc-700 disabled:opacity-50"
      >
        Prev
      </button>
      <span className="px-3 py-1">{currentPage} / {totalPages}</span>
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-3 py-1 rounded bg-gray-200 dark:bg-zinc-700 disabled:opacity-50"
      >
        Next
      </button>
    </div>
  );
};

const Sidebar = ({ onOpenModal }) => {
  return (
    <aside className="w-64 bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800 flex flex-col">
      <div className="p-4 border-b border-zinc-200 dark:border-zinc-800">
        <h1 className="text-xl font-bold text-zinc-800 dark:text-white">E-Katalog SDA</h1>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">Dashboard Monitoring</p>
      </div>
      <nav className="flex-1 p-4 space-y-2">
        <a href="#" className="flex items-center p-2 rounded-lg bg-blue-100 dark:bg-zinc-800 text-blue-700 dark:text-white font-semibold"><span>Dashboard</span></a>
        <a href="#" onClick={() => onOpenModal('marketSounding')} className="flex items-center p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-300"><span>Input Market Sounding</span></a>
        <a href="#" onClick={() => onOpenModal('history')} className="flex items-center p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-300"><span>Histori Market Sounding</span></a>
      </nav>
      <div className="p-4 border-t border-zinc-200 dark:border-zinc-800">
        <ThemeSwitcher />
      </div>
    </aside>
  );
};

// --- HALAMAN UTAMA ---
export default function Home() {
  // STATE dari script lama
  const [products, setProducts] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({ provinsi: '', kabupaten: '', jenisProduk: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // STATE untuk modal + history
  const [modals, setModals] = useState({ marketSounding: false, history: false, analysisResult: false });
  const [historyData, setHistoryData] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // --- HANDLER MODAL ---
  const openModal = (modalName) => setModals(prev => ({ ...prev, [modalName]: true }));
  const closeModal = (modalName) => setModals(prev => ({ ...prev, [modalName]: false }));

  // --- FETCH PRODUK ---
  const fetchProducts = useCallback(async (page = 1, appliedFilters = filters) => {
    setLoading(true);
    setError(null);
    try {
      const query = new URLSearchParams({ page, ...appliedFilters });
      const response = await fetch(`/api/products?${query.toString()}`);
      if (!response.ok) throw new Error("Gagal mengambil data produk");

      const data = await response.json();
      setProducts(data.items);
      setTotalItems(data.totalItems);
      setTotalPages(data.totalPages);
      setCurrentPage(data.currentPage);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchProducts(currentPage, filters);
  }, [fetchProducts, currentPage, filters]);

  // --- HANDLER FILTER ---
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // --- FETCH HISTORY ---
  const fetchHistory = async () => {
    setLoadingHistory(true);
    try {
      const response = await fetch('/api/market-sounding');
      const data = await response.json();
      setHistoryData(data);
    } catch (error) {
      console.error("Gagal mengambil histori:", error);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    if (modals.history) fetchHistory();
  }, [modals.history]);

  // --- SUBMIT MARKET SOUNDING ---
  const handleMarketSoundingSubmit = async (event) => {
    event.preventDefault();
    try {
      const formData = new FormData(event.target);
      const body = Object.fromEntries(formData.entries());

      const response = await fetch('/api/market-sounding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!response.ok) throw new Error("Gagal menyimpan market sounding");
      closeModal('marketSounding');
    } catch (error) {
      console.error(error);
    }
  };

  // --- RENDER ---
  return (
    <div className="flex h-screen bg-zinc-50 dark:bg-black text-zinc-800 dark:text-gray-300">
      <Sidebar onOpenModal={openModal} />
      <main className="flex-1 p-4 md:p-8 overflow-y-auto">
        
        {/* HEADER + FILTER */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-4">Daftar Produk</h2>
          <div className="flex space-x-4 mb-4">
            <input type="text" name="provinsi" placeholder="Provinsi" value={filters.provinsi} onChange={handleFilterChange} className="border rounded p-2" />
            <input type="text" name="kabupaten" placeholder="Kabupaten" value={filters.kabupaten} onChange={handleFilterChange} className="border rounded p-2" />
            <input type="text" name="jenisProduk" placeholder="Jenis Produk" value={filters.jenisProduk} onChange={handleFilterChange} className="border rounded p-2" />
          </div>
        </div>

        {/* MAP */}
        <div className="mb-6">
          <Map products={products} />
        </div>

        {/* TABEL PRODUK */}
        {loading ? (
          <p>Memuat data...</p>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full border border-gray-200 dark:border-zinc-700">
              <thead className="bg-gray-100 dark:bg-zinc-800">
                <tr>
                  <th className="p-2 border">Nama Produk</th>
                  <th className="p-2 border">Provinsi</th>
                  <th className="p-2 border">Kabupaten</th>
                  <th className="p-2 border">Harga</th>
                </tr>
              </thead>
              <tbody>
                {products.map((item, idx) => (
                  <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-zinc-700">
                    <td className="p-2 border">{item.nama}</td>
                    <td className="p-2 border">{item.provinsi}</td>
                    <td className="p-2 border">{item.kabupaten}</td>
                    <td className="p-2 border">{item.harga}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* PAGINATION */}
        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
      </main>

      {/* --- MODALS --- */}
      {modals.marketSounding && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white dark:bg-zinc-900 p-6 rounded w-96">
            <h2 className="text-xl font-bold mb-4">Input Market Sounding</h2>
            <form onSubmit={handleMarketSoundingSubmit} className="space-y-4">
              <input name="nama" placeholder="Nama Produk" className="border rounded p-2 w-full" />
              <input name="provinsi" placeholder="Provinsi" className="border rounded p-2 w-full" />
              <input name="kabupaten" placeholder="Kabupaten" className="border rounded p-2 w-full" />
              <input name="harga" placeholder="Harga" className="border rounded p-2 w-full" />
              <div className="flex justify-end space-x-2">
                <button type="button" onClick={() => closeModal('marketSounding')} className="px-3 py-1 border rounded">Batal</button>
                <button type="submit" className="px-3 py-1 bg-blue-600 text-white rounded">Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {modals.history && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white dark:bg-zinc-900 p-6 rounded w-3/4 max-h-[80vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Histori Market Sounding</h2>
            {loadingHistory ? <p>Memuat...</p> : (
              <ul>
                {historyData.map((item, idx) => (
                  <li key={idx} className="border-b py-2">{item.nama} - {item.provinsi} - {item.kabupaten}</li>
                ))}
              </ul>
            )}
            <div className="flex justify-end mt-4">
              <button onClick={() => closeModal('history')} className="px-3 py-1 border rounded">Tutup</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
