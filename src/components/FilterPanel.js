// Lokasi: src/components/FilterPanel.js
'use client';
import { useState, useMemo } from 'react';

// Icon kecil untuk panah expand/collapse
const ChevronIcon = ({ expanded }) => (
  <svg className={`w-5 h-5 text-gray-500 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
  </svg>
);

export default function FilterPanel({ filterOptions, filters, onFilterChange }) {
  const [expandedKategori, setExpandedKategori] = useState(null);

  // Mengelompokkan Kategori 2 berdasarkan kode induknya, misal: (A.1.01)
  const groupedKategori2 = useMemo(() => {
    if (!filterOptions.kategori_2) return {};
    return filterOptions.kategori_2.reduce((acc, item) => {
      const match = item.match(/\(A\.[.0-9a-zA-Z]+\)/); // Regex yang lebih baik untuk kode
      const key = match ? match[0] : 'Lain-lain';
      
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(item);
      return acc;
    }, {});
  }, [filterOptions.kategori_2]);

  const handleKategoriToggle = (kategori) => {
    setExpandedKategori(expandedKategori === kategori ? null : kategori);
  };
  
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Filter Data</h2>
      <div className="space-y-4">
        
        {/* Filter Provinsi */}
        <div>
          <label htmlFor="provinsi" className="block text-sm font-medium text-gray-700">Provinsi</label>
          <select 
            id="provinsi"
            name="provinsi" 
            value={filters.provinsi} 
            onChange={(e) => onFilterChange('provinsi', e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
          >
            <option value="all">Semua Provinsi</option>
            {filterOptions.provinsi?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
          </select>
        </div>

        {/* Filter Kategori 1 */}
        <div>
          <label htmlFor="kategori_1" className="block text-sm font-medium text-gray-700">Kategori 1</label>
          <select 
            id="kategori_1"
            name="kategori_1" 
            value={filters.kategori_1} 
            onChange={(e) => onFilterChange('kategori_1', e.target.value)}
            disabled={!filterOptions.kategori_1 || filterOptions.kategori_1.length === 0}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
          >
            <option value="all">Semua Kategori 1</option>
            {filterOptions.kategori_1?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
          </select>
        </div>

        {/* Filter Kategori 2 (Akordeon) */}
        <div>
           <label className="block text-sm font-medium text-gray-700 mb-1">Kategori 2</label>
           <div className={`border rounded-md divide-y ${(!filterOptions.kategori_2 || filterOptions.kategori_2.length === 0) ? 'bg-gray-100 opacity-50' : ''}`}>
              {Object.keys(groupedKategori2).length > 0 ? Object.keys(groupedKategori2).map(kategoriInduk => (
                <div key={kategoriInduk}>
                  <button 
                    onClick={() => handleKategoriToggle(kategoriInduk)}
                    className="w-full flex justify-between items-center p-3 text-left text-sm font-medium text-gray-800 hover:bg-gray-50 focus:outline-none"
                  >
                    <span className="truncate">{kategoriInduk}</span>
                    <ChevronIcon expanded={expandedKategori === kategoriInduk} />
                  </button>
                  {expandedKategori === kategoriInduk && (
                    <div className="p-2 bg-gray-50 max-h-60 overflow-y-auto">
                      <button 
                        onClick={() => onFilterChange('kategori_2', 'all')}
                        className={`block w-full text-left p-2 rounded-md text-sm ${filters.kategori_2 === 'all' ? 'bg-blue-600 text-white font-semibold' : 'text-gray-700 hover:bg-gray-200'}`}
                      >
                        Semua Kategori 2
                      </button>
                      {groupedKategori2[kategoriInduk].map(subKategori => (
                        <button 
                          key={subKategori}
                          onClick={() => onFilterChange('kategori_2', subKategori)}
                          className={`block w-full text-left p-2 rounded-md text-sm truncate ${filters.kategori_2 === subKategori ? 'bg-blue-600 text-white font-semibold' : 'text-gray-700 hover:bg-gray-200'}`}
                          title={subKategori}
                        >
                          {subKategori}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )) : (
                <div className="p-3 text-sm text-gray-500">Tidak ada opsi tersedia.</div>
              )}
           </div>
        </div>
      </div>
    </div>
  );
}