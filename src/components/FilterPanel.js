// Lokasi: src/components/FilterPanel.js
'use client';
import { useMemo } from 'react';
import SearchableSelect from './SearchableSelect';

export default function FilterPanel({ filterOptions, currentFilters, onFilterChange, isLoading }) {
  // --- PERUBAHAN UTAMA: Logika parsing dihapus ---
  // Data langsung diubah ke format {id, name} tanpa dipecah-pecah
  const k1Options = useMemo(() => filterOptions.kategori_1?.map(k1 => ({ id: k1, name: k1 })) || [], [filterOptions.kategori_1]);
  const k2Options = useMemo(() => filterOptions.kategori_2?.map(k2 => ({ id: k2, name: k2 })) || [], [filterOptions.kategori_2]);

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
        
        {/* Filter Provinsi */}
        <div>
          <label htmlFor="provinsi" className="block text-sm font-medium text-gray-700">Provinsi</label>
          <select
            id="provinsi"
            value={currentFilters.provinsi}
            onChange={(e) => onFilterChange('provinsi', e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
          >
            <option value="all">Semua Provinsi</option>
            {filterOptions.provinsi?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
          </select>
        </div>

        {/* Filter Kategori 1 */}
        <div className="relative">
           <SearchableSelect
              label="Kategori 1"
              options={k1Options}
              selectedValue={currentFilters.kategori_1}
              onChange={(value) => onFilterChange('kategori_1', value)}
              placeholder="Cari Kategori 1..."
              disabled={isLoading}
            />
        </div>
        
        {/* Filter Kategori 2 */}
        <div className="relative">
           <SearchableSelect
              label="Kategori 2"
              options={k2Options}
              selectedValue={currentFilters.kategori_2}
              onChange={(value) => onFilterChange('kategori_2', value)}
              placeholder="Cari Kategori 2..."
              disabled={isLoading || currentFilters.kategori_1 === 'all'}
            />
        </div>

      </div>
      {isLoading && <div className="text-sm text-gray-500 text-center pt-2">Memuat opsi...</div>}
    </div>
  );
}