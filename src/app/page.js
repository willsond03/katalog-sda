// Lokasi: src/app/page.js
'use client';
import { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import FilterPanel from '../components/FilterPanel';

// Komponen Peta
const Map = dynamic(() => import('../components/Map'), { 
  ssr: false, 
  loading: () => <div className="flex items-center justify-center h-full text-gray-500"><p>Memuat peta...</p></div> 
});

// Komponen Paginasi
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
  // --- STATES ---
  const [products, setProducts] = useState([]);
  const [mapData, setMapData] = useState({});
  const [loading, setLoading] = useState({ options: true, products: true });
  const [error, setError] = useState(null);
  
  const [filterOptions, setFilterOptions] = useState({ provinsi: [], kategori_1: [], kategori_2: [] });
  const [filters, setFilters] = useState({ provinsi: 'all', kategori_1: 'all', kategori_2: 'all' });

  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, totalItems: 0 });

  // --- DATA FETCHING ---
  const fetchApiData = useCallback(async (endpoint, paramsObj = {}) => {
    const cleanedParams = Object.fromEntries(Object.entries(paramsObj).filter(([_, v]) => v != null));
    const params = new URLSearchParams(cleanedParams);
    const response = await fetch(`/api/${endpoint}?${params}`);
    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || `HTTP error! status: ${response.status}`);
    }
    return response.json();
  }, []);

  // useEffect HANYA untuk memuat data awal (peta dan filter)
  useEffect(() => {
    const fetchInitialData = async () => {
      setError(null);
      setLoading(prev => ({ ...prev, options: true, products: true }));
      try {
        const [optionsData, mapJsonData] = await Promise.all([
          fetchApiData('filter-options', {}),
          fetchApiData('map-data', {}),
        ]);
        setFilterOptions(optionsData);
        setMapData(mapJsonData);
      } catch (error) { setError(error.message); } 
      finally { setLoading(prev => ({ ...prev, options: false })); }
    };
    fetchInitialData();
  }, [fetchApiData]);

  // useEffect untuk MEMPERBARUI OPSI FILTER saat filter induk berubah (cascading)
  useEffect(() => {
    // Abaikan render awal, karena data sudah diambil di useEffect pertama
    if (filters.provinsi === 'all' && filters.kategori_1 === 'all') return;
    
    const updateFilterOptions = async () => {
       setLoading(prev => ({ ...prev, options: true }));
       try {
         const newOptions = await fetchApiData('filter-options', { provinsi: filters.provinsi, kategori_1: filters.kategori_1 });
         setFilterOptions(newOptions);
       } catch (e) { setError(e.message); }
       finally { setLoading(prev => ({ ...prev, options: false })); }
    };
    updateFilterOptions();
  }, [filters.provinsi, filters.kategori_1, fetchApiData]);

  // useEffect untuk MEMPERBARUI DATA PRODUK (TABEL) setiap kali filter atau halaman berubah
  useEffect(() => {
    const updateProducts = async () => {
      setLoading(prev => ({...prev, products: true}));
      setError(null);
      const tableContainer = document.querySelector("#table-container");
      if(tableContainer) tableContainer.style.opacity = '0.5';

      try {
        const newProducts = await fetchApiData('products', { page: pagination.page, ...filters });
        setProducts(newProducts.items);
        setPagination(prev => ({ ...prev, totalPages: newProducts.totalPages, totalItems: newProducts.totalItems }));
      } catch (e) { setError(e.message); } 
      finally {
        setLoading(prev => ({...prev, products: false}));
        if(tableContainer) tableContainer.style.opacity = '1';
      }
    };
    updateProducts();
  }, [filters, pagination.page, fetchApiData]);


  // --- EVENT HANDLERS ---
  const handleFilterChange = (name, value) => {
    setFilters(prevFilters => {
      const newFilters = { ...prevFilters, [name]: value };
      if (name === 'provinsi') {
        newFilters.kategori_1 = 'all';
        newFilters.kategori_2 = 'all';
      }
      if (name === 'kategori_1') {
        newFilters.kategori_2 = 'all';
      }
      return newFilters;
    });
    // Reset ke halaman 1 setiap kali filter diubah
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setPagination(prev => ({ ...prev, page: newPage }));
      const tableContainer = document.querySelector("#table-container");
      if (tableContainer) window.scrollTo(0, tableContainer.offsetTop);
    }
  };

  // --- RENDER ---
  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <div className="lg:hidden h-16" />
      <header>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Dashboard Analitik Produk</h1>
      </header>
      
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">
        <div className="lg:col-span-3 bg-white border border-gray-200 rounded-lg shadow-sm p-4 h-[65vh] flex flex-col">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex-shrink-0">Persebaran Produk</h2>
          <div className="flex-grow min-h-0">
            {loading.options ? <div className="flex items-center justify-center h-full text-gray-500"><p>Memuat data peta...</p></div> : <Map mapData={mapData} />}
          </div>
        </div>
        
        <div className="lg:col-span-2">
          <FilterPanel 
            filterOptions={filterOptions}
            filters={filters}
            onFilterChange={handleFilterChange}
          />
        </div>
      </div>

      <div id="table-container" className="bg-white border border-gray-200 rounded-lg shadow-sm transition-opacity duration-300">
        <div className="p-6">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-4 gap-2">
            <h2 className="text-lg font-semibold text-gray-900">Detail Produk</h2>
            <p className="text-sm text-gray-600">
              Menampilkan {products.length > 0 ? `${(pagination.page - 1) * 20 + 1} - ${(pagination.page - 1) * 20 + products.length}` : 0} dari {pagination.totalItems.toLocaleString('id-ID')} produk
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50"><tr className="border-b border-gray-200"><th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Nama Produk</th><th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Perusahaan</th><th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Provinsi</th></tr></thead>
              <tbody className="divide-y divide-gray-200">
                {loading.products ? <tr><td colSpan="3" className="text-center py-10 text-gray-500">Memuat data produk...</td></tr> : 
                 error ? <tr><td colSpan="3" className="text-center py-10 text-red-500">Error: {error}</td></tr> :
                 (products.length > 0 ? products.map(p => (<tr key={p.id} className="hover:bg-gray-50"><td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">{p.nama_produk}</td><td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{p.perusahaan}</td><td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{p.provinsi}</td></tr>)) : (<tr><td colSpan="3" className="text-center py-10 text-gray-500">Tidak ada data yang cocok dengan filter Anda.</td></tr>))}
              </tbody>
            </table>
          </div>
          {pagination.totalPages > 1 && (
            <div className="mt-6">
              <Pagination currentPage={pagination.page} totalPages={pagination.totalPages} onPageChange={handlePageChange} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}