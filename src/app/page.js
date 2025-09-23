'use client';
import { useState, useEffect, useCallback } from 'react';

// Komponen Paginasi Baru
const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  const getPaginationRange = () => {
    const delta = 2;
    const range = [];
    for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
      range.push(i);
    }
    if (currentPage - delta > 2) {
      range.unshift('...');
    }
    if (currentPage + delta < totalPages - 1) {
      range.push('...');
    }
    range.unshift(1);
    if (totalPages > 1) {
      range.push(totalPages);
    }
    return range;
  };

  const pages = getPaginationRange();

  return (
    <div className="flex items-center justify-center space-x-2">
      <button onClick={() => onPageChange(currentPage - 1)} disabled={currentPage <= 1} className="px-3 py-1 rounded-md bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed">
        &laquo;
      </button>
      {pages.map((page, index) => (
        <button 
          key={index} 
          onClick={() => typeof page === 'number' && onPageChange(page)}
          disabled={typeof page !== 'number'}
          className={`px-3 py-1 rounded-md ${currentPage === page ? 'bg-blue-600 text-white' : 'bg-zinc-800 hover:bg-zinc-700'} ${typeof page !== 'number' ? 'cursor-default' : ''}`}
        >
          {page}
        </button>
      ))}
      <button onClick={() => onPageChange(currentPage + 1)} disabled={currentPage >= totalPages} className="px-3 py-1 rounded-md bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed">
        &raquo;
      </button>
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

  // Fungsi untuk mengambil data produk dari API internal Next.js
  const fetchProducts = useCallback(async (page, currentFilters) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ page: page, ...currentFilters });
      // MEMANGGIL URL RELATIF
      const response = await fetch(`/api/products?${params}`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      setProducts(data.items);
      setPagination({ page: data.page, totalPages: data.totalPages, totalItems: data.totalItems });
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // useEffect untuk mengambil data awal
  useEffect(() => {
    const fetchInitialData = async () => {
      setLoading(true);
      try {
        // MEMANGGIL URL RELATIF
        const optionsRes = await fetch('/api/filter-options');
        const optionsData = await optionsRes.json();
        setFilterOptions(optionsData);
        await fetchProducts(1, { provinsi: 'all', kategori_1: 'all', kategori_2: 'all' });
      } catch (error) {
        console.error("Gagal memuat data awal:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchInitialData();
  }, [fetchProducts]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    const newFilters = { ...filters, [name]: value };
    setFilters(newFilters);
    fetchProducts(1, newFilters);
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
          <h1 className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">
            Dashboard E-Katalog SDA
          </h1>
          <p className="text-zinc-400">Menampilkan data produk dari Cloudflare D1</p>
        </header>

        {/* Filter Section */}
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

        {/* Tabel Data Section */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl shadow">
          {loading ? <div className="text-center py-20 text-zinc-400">Memuat data produk...</div> : 
           error ? <div className="text-center py-20 text-red-400">Error: {error}</div> : (
            <div className="p-6">
              <div className="mb-4 text-sm text-zinc-400">
                Menampilkan {products.length} dari {pagination.totalItems.toLocaleString('id-ID')} produk. (Halaman {pagination.page} dari {pagination.totalPages})
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead >
                    <tr className="border-b border-zinc-700">
                      <th className="px-6 py-3 text-left text-xs font-semibold text-zinc-400 uppercase tracking-wider">Nama Produk</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-zinc-400 uppercase tracking-wider">Perusahaan</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-zinc-400 uppercase tracking-wider">Provinsi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800">
                    {products.length > 0 ? products.map(p => (
                      <tr key={p.id} className="hover:bg-zinc-800">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-white">{p.nama_produk}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-400">{p.perusahaan}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-400">{p.provinsi}</td>
                      </tr>
                    )) : (
                      <tr><td colSpan="3" className="text-center py-10 text-zinc-500">Tidak ada data yang cocok dengan filter Anda.</td></tr>
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
  );
}