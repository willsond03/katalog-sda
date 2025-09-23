'use client';
import { useState, useEffect, useCallback } from 'react';

export default function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterOptions, setFilterOptions] = useState({ provinsi: [], kategori_1: [] });
  const [filters, setFilters] = useState({ provinsi: 'all', kategori_1: 'all' });
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, totalItems: 0 });

  const fetchProducts = useCallback(async (page, currentFilters) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ page: page, ...currentFilters });
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

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const optionsRes = await fetch('/api/filter-options');
        const optionsData = await optionsRes.json();
        setFilterOptions(optionsData);
        await fetchProducts(1, filters);
      } catch (error) {
        console.error("Gagal memuat data awal:", error);
        setError(error.message);
        setLoading(false);
      }
    };
    fetchInitialData();
  }, [fetchProducts, filters]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prevFilters => {
      const newFilters = { ...prevFilters, [name]: value };
      fetchProducts(1, newFilters); // Kembali ke halaman 1 saat filter diubah
      return newFilters;
    });
  };
  
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      fetchProducts(newPage, filters);
    }
  };

  return (
    <main className="p-8 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-semibold text-gray-800">Dashboard Katalog SDA</h1>
      
      <div className="mt-4 p-4 bg-white rounded-lg shadow grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="provinsi" className="block text-sm font-medium">Provinsi</label>
          <select name="provinsi" value={filters.provinsi} onChange={handleFilterChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm">
            <option value="all">Semua Provinsi</option>
            {filterOptions.provinsi.map(opt => <option key={opt} value={opt}>{opt}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="kategori_1" className="block text-sm font-medium">Kategori 1</label>
          <select name="kategori_1" value={filters.kategori_1} onChange={handleFilterChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm">
            <option value="all">Semua Kategori 1</option>
            {filterOptions.kategori_1.map(opt => <option key={opt} value={opt}>{opt}</option>)}
          </select>
        </div>
      </div>

      <div className="mt-6 bg-white p-4 rounded-lg shadow">
        {loading ? <div className="text-center py-10">Memuat data...</div> : 
         error ? <div className="text-center py-10 text-red-500">Error: {error}</div> : (
          <>
            <div className="text-sm text-gray-700 mb-2">
              Menampilkan {products.length} dari {pagination.totalItems.toLocaleString('id-ID')} produk (Halaman {pagination.page} dari {pagination.totalPages})
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase">Nama Produk</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase">Perusahaan</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase">Provinsi</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y">
                  {products.length > 0 ? products.map(p => (
                    <tr key={p.id}>
                      <td className="px-6 py-4 text-sm">{p.nama_produk}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">{p.perusahaan}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">{p.provinsi}</td>
                    </tr>
                  )) : (
                    <tr><td colSpan="3" className="text-center py-4 text-gray-500">Tidak ada data.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="flex justify-end items-center mt-4">
              <button onClick={() => handlePageChange(pagination.page - 1)} disabled={pagination.page <= 1} className="pagination-btn px-4 py-2 text-sm font-medium text-white bg-gray-800 rounded-l hover:bg-gray-900">Sebelumnya</button>
              <button onClick={() => handlePageChange(pagination.page + 1)} disabled={pagination.page >= pagination.totalPages} className="pagination-btn px-4 py-2 text-sm font-medium text-white bg-gray-800 border-0 border-l border-gray-700 rounded-r hover:bg-gray-900">Berikutnya</button>
            </div>
          </>
        )}
      </div>
    </main>
  );
}