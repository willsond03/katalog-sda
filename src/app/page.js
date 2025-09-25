// Lokasi: src/app/page.js
'use client';
import { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';

const Map = dynamic(() => import('../components/Map'), { 
  ssr: false, 
  loading: () => <div className="flex items-center justify-center h-full"><p>Memuat peta...</p></div> 
});

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
    <div className="flex items-center justify-center space-x-1">
      <button onClick={() => onPageChange(currentPage - 1)} disabled={currentPage <= 1} className="px-3 py-1 rounded-md bg-gray-200 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed">&laquo;</button>
      {pages.map((page, index) => ( <button key={index} onClick={() => typeof page === 'number' && onPageChange(page)} disabled={typeof page !== 'number'} className={`px-3 py-1 rounded-md ${currentPage === page ? 'bg-blue-600 text-white' : 'bg-gray-200 hover:bg-gray-300'} ${typeof page !== 'number' ? 'cursor-default' : ''}`}>{page}</button>))}
      <button onClick={() => onPageChange(currentPage + 1)} disabled={currentPage >= totalPages} className="px-3 py-1 rounded-md bg-gray-200 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed">&raquo;</button>
    </div>
  );
};

export default function DashboardPage() {
  const [products, setProducts] = useState([]);
  const [mapData, setMapData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterOptions, setFilterOptions] = useState({ provinsi: [], kategori_1: [], kategori_2: [] });
  const [filters, setFilters] = useState({ provinsi: 'all', kategori_1: 'all', kategori_2: 'all' });
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, totalItems: 0 });

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
        const [optionsRes, mapRes, productsRes] = await Promise.all([
          fetch('/api/filter-options'),
          fetch('/api/map-data'),
          fetch('/api/products?page=1&provinsi=all&kategori_1=all&kategori_2=all')
        ]);
        const optionsData = await optionsRes.json();
        const mapJsonData = await mapRes.json();
        const productsData = await productsRes.json();
        setFilterOptions(optionsData);
        setMapData(mapJsonData);
        setProducts(productsData.items);
        setPagination({ page: productsData.page, totalPages: productsData.totalPages, totalItems: productsData.totalItems });
      } catch (error) { setError(error.message); } 
      finally { setLoading(false); }
    };
    fetchInitialData();
  }, [fetchProducts]);

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
    <div className="p-4 md:p-8 space-y-8">
      <header>
        <h1 className="text-3xl font-bold text-gray-800">Dashboard Analitik Produk</h1>
      </header>
      
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
        <div className="lg:col-span-3 bg-white border border-gray-200 rounded-xl shadow-sm p-4 h-[60vh] flex flex-col">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Persebaran Produk</h2>
          <div className="flex-grow min-h-0">
            {!loading && <Map mapData={mapData} />}
            {loading && <div className="flex items-center justify-center h-full text-gray-500"><p>Memuat data peta...</p></div>}
          </div>
        </div>
        <div className="lg:col-span-2 bg-white border border-gray-200 rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Filter Data</h2>
          <div className="space-y-4">
            <div>
              <label htmlFor="provinsi" className="block text-sm font-medium text-gray-700">Provinsi</label>
              <select name="provinsi" value={filters.provinsi} onChange={handleFilterChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm h-10 px-3 focus:border-blue-500 focus:ring-blue-500">
                <option value="all">Semua Provinsi</option>
                {filterOptions.provinsi && filterOptions.provinsi.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="kategori_1" className="block text-sm font-medium text-gray-700">Kategori 1</label>
              <select name="kategori_1" value={filters.kategori_1} onChange={handleFilterChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm h-10 px-3 focus:border-blue-500 focus:ring-blue-500">
                <option value="all">Semua Kategori 1</option>
                {filterOptions.kategori_1 && filterOptions.kategori_1.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="kategori_2" className="block text-sm font-medium text-gray-700">Kategori 2</label>
              <select name="kategori_2" value={filters.kategori_2} onChange={handleFilterChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm h-10 px-3 focus:border-blue-500 focus:ring-blue-500">
                <option value="all">Semua Kategori 2</option>
                {filterOptions.kategori_2 && filterOptions.kategori_2.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            </div>
          </div>
        </div>
      </div>

      <div id="table-container" className="bg-white border border-gray-200 rounded-xl shadow-sm transition-opacity duration-300">
        {loading && !products.length ? <div className="text-center py-20 text-gray-500">Memuat data produk...</div> : 
         error ? <div className="text-center py-20 text-red-500">Error: {error}</div> : (
          <div className="p-6">
            <div className="mb-4 text-sm text-gray-600">
              Menampilkan {products.length} dari {pagination.totalItems.toLocaleString('id-ID')} produk. (Halaman {pagination.page} dari {pagination.totalPages})
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-50"><tr className="border-b border-gray-200"><th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Nama Produk</th><th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Perusahaan</th><th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Provinsi</th></tr></thead>
                <tbody className="divide-y divide-gray-200">
                  {products.length > 0 ? products.map(p => (<tr key={p.id} className="hover:bg-gray-50"><td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">{p.nama_produk}</td><td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{p.perusahaan}</td><td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{p.provinsi}</td></tr>)) : (<tr><td colSpan="3" className="text-center py-10 text-gray-500">Tidak ada data yang cocok dengan filter Anda.</td></tr>)}
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
  );
}