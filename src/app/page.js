// Lokasi: src/app/page.js
'use client';
import { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import FilterPanel from '../components/FilterPanel';
import FilterBreadcrumb from '../components/FilterBreadcrumb';
import StatCard from '../components/StatCard';
import CategoryModal from '../components/CategoryModal';

const Map = dynamic(() => import('../components/Map'), { ssr: false, loading: () => <div className="flex items-center justify-center h-full text-gray-500"><p>Memuat peta...</p></div> });
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
    const [mapData, setMapData] = useState({}); // Diinisialisasi sebagai objek
    const [loading, setLoading] = useState({ options: true, products: true, stats: true, map: true });
    const [error, setError] = useState(null);
    const [filterOptions, setFilterOptions] = useState({ provinsi: [], kategori_1: [], kategori_2: [] });
    const [filters, setFilters] = useState({ provinsi: 'all', kategori_1: 'all', kategori_2: 'all' });
    const [pagination, setPagination] = useState({ page: 1, totalPages: 1, totalItems: 0 });
    const [stats, setStats] = useState(null);
    const [modal, setModal] = useState({ isOpen: false, title: '', data: [] });

    // State baru untuk skala peta
    const [mapView, setMapView] = useState('provinsi');

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

    // useEffect untuk Statistik (KPI Cards)
    useEffect(() => {
        const fetchStats = async () => {
            setLoading(prev => ({ ...prev, stats: true }));
            try {
                const statsData = await fetchApiData('stats');
                setStats(statsData);
            } catch (error) {
                console.error("Gagal memuat stats:", error);
            } finally {
                setLoading(prev => ({ ...prev, stats: false }));
            }
        };
        fetchStats();
    }, [fetchApiData]);

    // useEffect untuk Opsi Filter (Dropdown)
    useEffect(() => {
        const fetchFilterOptions = async () => {
          setError(null);
          setLoading(prev => ({ ...prev, options: true }));
          try {
            const optionsData = await fetchApiData('filter-options', {});
            setFilterOptions(optionsData);
          } catch (error) { setError(error.message); } 
          finally { setLoading(prev => ({ ...prev, options: false })); }
        };
        fetchFilterOptions();
    }, [fetchApiData]);

    // useEffect untuk Opsi Filter Bertingkat (saat filter berubah)
    useEffect(() => {
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

    // useEffect untuk Data Tabel (saat filter atau halaman berubah)
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
        const debounceTimeout = setTimeout(() => updateProducts(), 300);
        return () => clearTimeout(debounceTimeout);
    }, [filters, pagination.page, fetchApiData]);

    // useEffect baru untuk Data Peta (saat filter atau skala peta berubah)
    useEffect(() => {
        const updateMapData = async () => {
          setLoading(prev => ({ ...prev, map: true }));
          try {
            const mapParams = { ...filters, view: mapView };
            const newMapData = await fetchApiData('map-data', mapParams);
            setMapData(newMapData);
          } catch (e) { setError(e.message); } 
          finally { setLoading(prev => ({ ...prev, map: false })); }
        };
        updateMapData();
    }, [filters, mapView, fetchApiData]); // <-- Dependensi ke filter & mapView

    // Handler untuk mengubah filter
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
        setPagination(prev => ({ ...prev, page: 1 }));
    };

    // Handler untuk pindah halaman tabel
    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= pagination.totalPages) {
            setPagination(prev => ({ ...prev, page: newPage }));
            const tableContainer = document.querySelector("#table-container");
            if (tableContainer) window.scrollTo(0, tableContainer.offsetTop);
        }
    };

    // Handler untuk modal KPI
    const handleOpenModal = (title, data) => {
        setModal({ isOpen: true, title, data });
    };
    const handleCloseModal = () => {
        setModal({ isOpen: false, title: '', data: [] });
    };

    return (
        <>
            <div className="p-4 sm:p-6 lg:p-8 space-y-6">
                <div className="h-16 lg:hidden" />
                <header>
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Dashboard Analitik Produk</h1>
                </header>
                
                {/* Blok KPI Card */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard 
                        title="Total Product" 
                        value={loading.stats ? '...' : (stats?.total_produk.toLocaleString('id-ID') || '0')}
                        className="bg-gradient-to-br from-blue-50 to-slate-100"
                    >
                        <span className="text-gray-500">Last update: {loading.stats ? '...' : (stats?.last_update || 'N/A')}</span>
                    </StatCard>
                    
                    <StatCard 
                        title="Kategori 1" 
                        value={loading.stats ? '...' : (stats?.total_k1.toLocaleString('id-ID') || '0')}
                        className="bg-gradient-to-br from-red-50 to-orange-100"
                    >
                        <button 
                            onClick={() => handleOpenModal('Kategori 1', filterOptions.kategori_1)}
                            disabled={loading.options}
                            className="font-medium text-blue-600 hover:text-blue-500 disabled:text-gray-400"
                        >
                            Klik lebih lanjut
                        </button>
                    </StatCard>
                    
                    <StatCard 
                        title="Kategori 2" 
                        value={loading.stats ? '...' : (stats?.total_k2.toLocaleString('id-ID') || '0')}
                        className="bg-gradient-to-br from-purple-50 to-indigo-100"
                    >
                         <button 
                            onClick={() => handleOpenModal('Kategori 2', filterOptions.kategori_2)}
                            disabled={loading.options}
                            className="font-medium text-blue-600 hover:text-blue-500 disabled:text-gray-400"
                        >
                            Klik lebih lanjut
                        </button>
                    </StatCard>
                    
                    <StatCard 
                        title="Histori Market Sounding" 
                        value={loading.stats ? '...' : (stats?.total_history.toLocaleString('id-ID') || '0')}
                        className="bg-gradient-to-br from-green-50 to-emerald-100"
                    >
                        <Link href="/market-sounding/history" className="font-medium text-blue-600 hover:text-blue-500">
                            Klik lebih lanjut
                        </Link>
                    </StatCard>
                </div>

                {/* Blok Breadcrumb Filter Aktif */}
                <FilterBreadcrumb
                    filters={filters}
                    onClear={handleFilterChange}
                />
                
                {/* Blok Grid Peta dan Filter */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    
                    {/* Kolom Kiri: Peta */}
                    <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl shadow-sm flex flex-col">
                        
                        {/* Header Kartu Peta (Request 1) */}
                        <div className="p-4 flex flex-col sm:flex-row justify-between sm:items-center gap-2 bg-gradient-to-br from-blue-50 to-slate-100 rounded-t-xl border-b border-slate-200">
                            <h2 className="text-lg font-semibold text-gray-900">Persebaran Produk</h2>
                            
                            {/* Toggle Skala Peta (Request 3) */}
                            <div className="flex items-center space-x-2">
                                <label htmlFor="mapView" className="text-sm font-medium text-gray-700">Skala:</label>
                                <select 
                                  id="mapView"
                                  value={mapView}
                                  onChange={(e) => setMapView(e.target.value)}
                                  className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm py-1"
                                >
                                    <option value="provinsi">Provinsi</option>
                                    <option value="kota">Kab/Kota</option>
                                </select>
                            </div>
                        </div>

                        {/* Konten Peta */}
                        <div className="h-[50vh] px-2 pb-2">
                            {loading.map ? <div className="flex items-center justify-center h-full text-gray-500"><p>Memuat data peta...</p></div> : <Map mapData={mapData} view={mapView} />}
                        </div>
                    </div>

                    {/* Kolom Kanan: Filter */}
                    <div className="lg:col-span-1">
                        <FilterPanel 
                            filterOptions={filterOptions}
                            currentFilters={filters}
                            onFilterChange={handleFilterChange}
                            isLoading={loading.options}
                            className="bg-gradient-to-br from-blue-50 to-slate-100"
                        />
                    </div>
                </div>
                
                {/* Blok Tabel Detail Produk */}
                <div id="table-container" className="bg-white border border-slate-200 rounded-xl shadow-sm">
                    <div className="p-6">
                        <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-4 gap-2">
                            <h2 className="text-lg font-semibold text-gray-900">Detail Produk</h2>
                            <p className="text-sm text-gray-600">Menampilkan {products.length > 0 ? `${(pagination.page - 1) * 20 + 1} - ${(pagination.page - 1) * 20 + products.length}` : 0} dari {pagination.totalItems.toLocaleString('id-ID')} produk</p>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="min-w-full">
                                <thead className="bg-slate-50"><tr className="border-b border-gray-200">
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Nama Produk</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Perusahaan</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Kota</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Provinsi</th>
                                </tr></thead>
                                
                                <tbody className="divide-y divide-gray-200">
                                    {loading.products ? <tr><td colSpan="4" className="text-center py-10 text-gray-500">Memuat data produk...</td></tr> : 
                                    error ? <tr><td colSpan="4" className="text-center py-10 text-red-500">Error: {error}</td></tr> :
                                    (products.length > 0 ? products.map(p => (
                                        <tr key={p.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                                                <a href={p.product_link} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                                                    {p.nama_produk}
                                                </a>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{p.perusahaan}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{p.kota}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{p.provinsi}</td>
                                        </tr>
                                    )) : (<tr><td colSpan="4" className="text-center py-10 text-gray-500">Tidak ada data yang cocok dengan filter Anda.</td></tr>))}
                                </tbody>
                            </table>
                        </div>
                        {pagination.totalPages > 1 && (<div className="mt-6"><Pagination currentPage={pagination.page} totalPages={pagination.totalPages} onPageChange={handlePageChange} /></div>)}
                    </div>
                </div>
            </div>

            {/* Modal untuk KPI */}
            <CategoryModal
                isOpen={modal.isOpen}
                onClose={handleCloseModal}
                title={modal.title}
                data={modal.data}
            />
        </>
    );
}