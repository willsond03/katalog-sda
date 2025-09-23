'use client';
import { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic'; // <-- Tambahan untuk memuat peta

// --- KOMPONEN BARU UNTUK PETA ---
// Kita muat komponen Peta secara dinamis untuk mencegah error saat build di server
const Map = dynamic(
  () => import('../components/Map'), 
  { 
    ssr: false, // Memastikan peta hanya dirender di browser
    loading: () => <div className="flex items-center justify-center h-full"><p>Memuat peta...</p></div>
  }
);

// --- KOMPONEN PAGINASI (TETAP SAMA) ---
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


export default function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterOptions, setFilterOptions] = useState({ provinsi: [], kategori_1: [], kategori_2: [] });
  const [filters, setFilters] = useState({ provinsi: 'all', kategori_1: 'all', kategori_2: 'all' });
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, totalItems: 0 });
  const [mapData, setMapData] = useState({}); // <-- State baru untuk data peta

  // Fungsi fetchProducts tidak berubah
  const fetchProducts = useCallback(async (page, currentFilters) => {
    setLoading(true); setError(null);
    try {
      const params = new URLSearchParams({ page: page, ...currentFilters });
      const response = await fetch(`/api/products?${params}`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      setProducts(data.items);
      setPagination({ page: data.page, totalPages: data.totalPages, totalItems: data.totalItems });
    } catch (e) { setError(e.message); } finally { setLoading(false); }
  }, []);

  // useEffect dimodifikasi untuk mengambil data peta juga
  useEffect(() => {
    const fetchInitialData = async () => {
      setLoading(true);
      try {
        const [optionsRes, mapRes, productsRes] = await Promise.all([
          fetch('/api/filter-options'),
          fetch('/api/map-data'), // Panggil API data peta
          fetch('/api/products?page=1&provinsi=all&kategori_1=all&kategori_2=all')
        ]);
        const optionsData = await optionsRes.json();
        const mapJsonData = await mapRes.json();
        const productsData = await productsRes.json();
        
        setFilterOptions(optionsData);
        setMapData(mapJsonData); // Simpan data peta
        setProducts(productsData.items);
        setPagination({ page: productsData.page, totalPages: productsData.totalPages, totalItems: productsData.totalItems });
      } catch (error) {
        console.error("Gagal memuat data awal:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchInitialData();
  }, []); // Dijalankan sekali saja di awal

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
    <div className="bg-black text-gray-300 min-h-screen font-sans">
      <div className="container mx-auto p-4 md:p-8">
        <header className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">Dashboard E-Katalog SDA</h1>
          <p className="text-zinc-400">Menampilkan data produk dari Cloudflare D1</p>
        </header>

        {/* Filter Section (tidak berubah) */}
        <div className="mb-8 p-6 bg-zinc-900 border border-zinc-800 rounded-xl">
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

        {/* Layout Utama: Peta di kiri, Tabel di kanan */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-3 bg-zinc-900 border border-zinc-800 rounded-xl shadow p-4 h-[65vh]">
            <h2 className="text-lg font-semibold text-white mb-4">Persebaran Produk</h2>
            <Map mapData={mapData} /> {/* <-- PETA DITAMPILKAN DI SINI */}
          </div>

          <div className="lg:col-span-2 bg-zinc-900 border border-zinc-800 rounded-xl shadow">
            {loading && !products.length ? <div className="text-center py-20 text-zinc-400">Memuat data produk...</div> : 
             error ? <div className="text-center py-20 text-red-400">Error: {error}</div> : (
              <div className="p-6">
                <div className="mb-4 text-sm text-zinc-400">
                  Menampilkan {products.length} dari {pagination.totalItems.toLocaleString('id-ID')} produk. (Halaman {pagination.page} dari {pagination.totalPages})
                </div>
                <div className="overflow-auto max-h-[45vh]">
                  <table className="min-w-full">
                    <thead className="sticky top-0 bg-zinc-900">
                      <tr className="border-b border-zinc-700">
                        <th className="px-6 py-3 text-left text-xs font-semibold text-zinc-400 uppercase tracking-wider">Nama Produk</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-zinc-400 uppercase tracking-wider">Provinsi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800">
                      {products.length > 0 ? products.map(p => (
                        <tr key={p.id} className="hover:bg-zinc-800">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-white">{p.nama_produk}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-400">{p.provinsi}</td>
                        </tr>
                      )) : (
                        <tr><td colSpan="2" className="text-center py-10 text-zinc-500">Tidak ada data.</td></tr>
                      )}
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

      </div>
    </div>
  );
}