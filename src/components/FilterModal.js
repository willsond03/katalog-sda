// Lokasi: src/components/FilterModal.js
'use client';
import { useState, useEffect, useMemo } from 'react';
import SearchableSelect from './SearchableSelect';

export default function FilterModal({ isOpen, onClose, onApply, initialOptions, currentFilters, fetcher }) {
  const [tempFilters, setTempFilters] = useState(currentFilters);
  const [modalOptions, setModalOptions] = useState(initialOptions);
  const [isLoadingOptions, setIsLoadingOptions] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setTempFilters(currentFilters);
      setModalOptions(initialOptions);
    }
  }, [isOpen, currentFilters, initialOptions]);

  useEffect(() => {
    if (!isOpen) return;
    const updateOptionsInModal = async () => {
      setIsLoadingOptions(true);
      try {
        const newOptions = await fetcher('filter-options', { provinsi: tempFilters.provinsi, kategori_1: tempFilters.kategori_1 });
        setModalOptions(newOptions);
      } catch (error) { console.error("Failed to fetch modal options:", error); } 
      finally { setIsLoadingOptions(false); }
    };
    updateOptionsInModal();
  }, [tempFilters.provinsi, tempFilters.kategori_1, fetcher, isOpen]);

  const handleApply = () => { onApply(tempFilters); };

  const handleProvinsiChange = (provinsi) => {
    setTempFilters({ provinsi: provinsi, kategori_1: 'all', kategori_2: 'all' });
  };
  
  const handleKategori1Change = (kategori1) => {
    setTempFilters(prev => ({ ...prev, kategori_1: kategori1, kategori_2: 'all' }));
  };

  const handleKategori2Change = (kategori2) => {
    setTempFilters(prev => ({ ...prev, kategori_2: kategori2 }));
  };

  const k1Options = useMemo(() => modalOptions.kategori_1?.map(k1 => ({ id: k1, name: k1 })) || [], [modalOptions.kategori_1]);
  const k2Options = useMemo(() => modalOptions.kategori_2?.map(k2 => ({ id: k2, name: k2 })) || [], [modalOptions.kategori_2]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg flex flex-col overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-bold text-gray-800">Filter Data Lanjutan</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
             <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>

        <div className="p-6 space-y-4 overflow-y-auto">
          <div>
            <label htmlFor="provinsi-modal" className="block text-sm font-medium text-gray-700 mb-1">Provinsi</label>
            <select
              id="provinsi-modal"
              value={tempFilters.provinsi}
              onChange={(e) => handleProvinsiChange(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
            >
              <option value="all">Semua Provinsi</option>
              {initialOptions.provinsi?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
          </div>

          <div className="relative">
             <SearchableSelect
                label="Kategori 1"
                options={k1Options}
                selectedValue={tempFilters.kategori_1}
                onChange={handleKategori1Change}
                placeholder="Cari Kategori 1..."
                disabled={isLoadingOptions}
              />
          </div>
          
          <div className="relative">
             <SearchableSelect
                label="Kategori 2"
                options={k2Options}
                selectedValue={tempFilters.kategori_2}
                onChange={handleKategori2Change}
                placeholder="Cari Kategori 2..."
                disabled={isLoadingOptions || tempFilters.kategori_1 === 'all'}
              />
          </div>
          {isLoadingOptions && <div className="text-sm text-gray-500 text-center">Memuat opsi...</div>}
        </div>

        <div className="flex justify-end items-center p-4 bg-gray-50 border-t space-x-3">
          <button onClick={onClose} className="px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium hover:bg-gray-50">Batal</button>
          <button onClick={handleApply} className="px-4 py-2 bg-blue-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-blue-700">Terapkan Filter</button>
        </div>
      </div>
    </div>
  );
}