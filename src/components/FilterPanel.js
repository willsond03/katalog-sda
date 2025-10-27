// Lokasi: src/components/FilterPanel.js
'use client';
import { useState, useMemo, useEffect, Fragment } from 'react';
import { Transition } from '@headlessui/react';
import SearchableSelect from './SearchableSelect';

// 1. Terima prop 'className' dan berikan 'bg-white' sebagai default
export default function FilterPanel({ 
  filterOptions, 
  currentFilters, 
  onFilterChange, 
  isLoading, 
  className = 'bg-white' 
}) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (window.innerWidth >= 768) {
      setIsOpen(true);
    }
  }, []);

  const provinsiOptions = useMemo(() => filterOptions.provinsi?.map(p => ({ id: p, name: p })) || [], [filterOptions.provinsi]);
  const k1Options = useMemo(() => filterOptions.kategori_1?.map(k1 => ({ id: k1, name: k1 })) || [], [filterOptions.kategori_1]);
  const k2Options = useMemo(() => filterOptions.kategori_2?.map(k2 => ({ id: k2, name: k2 })) || [], [filterOptions.kategori_2]);

  return (
    // 2. Terapkan 'className' di sini dan tambahkan style kartu dasar
    <div className={`border border-slate-200 rounded-xl shadow-sm ${className}`}>
      <div className="flex justify-between items-center p-4">
        <h2 className="text-lg font-semibold text-gray-900">Filter Data</h2>
        <button 
          onClick={() => setIsOpen(!isOpen)} 
          className="md:hidden px-3 py-1 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
        >
          {isOpen ? 'Sembunyikan' : 'Tampilkan'}
        </button>
      </div>

      <Transition
        as={Fragment}
        show={isOpen}
        enter="transition ease-out duration-200"
        enterFrom="opacity-0 -translate-y-1"
        enterTo="opacity-100 translate-y-0"
        leave="transition ease-in duration-150"
        leaveFrom="opacity-100 translate-y-0"
        leaveTo="opacity-0 -translate-y-1"
      >
        <div className="border-t border-slate-200 p-4">
          <div className="grid grid-cols-1 gap-4 items-end">
            <div className="relative">
               <SearchableSelect
                  label="Provinsi"
                  options={provinsiOptions}
                  selectedValue={currentFilters.provinsi}
                  onChange={(value) => onFilterChange('provinsi', value)}
                  placeholder="Cari Provinsi..."
                  disabled={isLoading}
                />
            </div>
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
      </Transition>
    </div>
  );
}