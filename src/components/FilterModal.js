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
        const newOptions = await fetcher('filter-options', { provinsi: tempFilters.provinsi });
        setModalOptions(newOptions);
      } catch (error) { console.error("Failed to fetch modal options:", error); } 
      finally { setIsLoadingOptions(false); }
    };
    updateOptionsInModal();
  }, [tempFilters.provinsi, fetcher, isOpen]);
  
  const categoryData = useMemo(() => {
    if (!modalOptions.kategori_1) return [];
    const data = [];
    modalOptions.kategori_1.forEach(k1 => {
      data.push({ id: k1, name: k1, isHeader: true, parent: null });
      const parentCode = k1.split(' ')[0];
      modalOptions.kategori_2?.forEach(k2 => {
        if (k2.startsWith(parentCode)) {
          data.push({ id: k2, name: k2, isHeader: false, parent: k1 });
        }
      });
    });
    return data;
  }, [modalOptions]);

  const handleApply = () => { onApply(tempFilters); };

  const handleSelectCategory = (selectedId) => {
    if (selectedId === 'all') {
      setTempFilters(prev => ({ ...prev, kategori_1: 'all', kategori_2: 'all' }));
      return;
    }
    const selectedItem = categoryData.find(item => item.id === selectedId);
    if (!selectedItem || selectedItem.isHeader) return;
    setTempFilters(prev => ({ ...prev, kategori_1: selectedItem.parent, kategori_2: selectedItem.id }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg flex flex-col overflow-hidden transform transition-all duration-300 scale-95 opacity-0 animate-fade-in-scale">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-bold text-gray-800">Filter Data Lanjutan</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>

        <div className="flex-grow p-6 overflow-y-auto space-y-6">
          <div>
            <label htmlFor="provinsi-modal" className="block text-sm font-medium text-gray-700 mb-1">Provinsi</label>
            <select
              id="provinsi-modal"
              value={tempFilters.provinsi}
              onChange={(e) => setTempFilters({ provinsi: e.target.value, kategori_1: 'all', kategori_2: 'all' })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
            >
              <option value="all">Semua Provinsi</option>
              {initialOptions.provinsi?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
          </div>

          <div className={`relative ${isLoadingOptions ? 'opacity-50 pointer-events-none' : ''}`}>
            <SearchableSelect
              label="Kategori Produk"
              data={categoryData}
              selected={tempFilters.kategori_2}
              onChange={handleSelectCategory}
              placeholder="Cari Kategori 1 atau 2..."
            />
             {isLoadingOptions && <div className="absolute inset-0 flex items-center justify-center -top-5"><p>Memuat kategori...</p></div>}
          </div>
        </div>

        <div className="flex justify-end items-center p-4 bg-gray-50 border-t space-x-3">
          <button onClick={onClose} className="px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium hover:bg-gray-50">Batal</button>
          <button onClick={handleApply} className="px-4 py-2 bg-blue-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-blue-700">Terapkan Filter</button>
        </div>
        <style jsx>{`
          @keyframes fade-in-scale {
            from { transform: scale(0.95); opacity: 0; }
            to { transform: scale(1); opacity: 1; }
          }
          .animate-fade-in-scale { animation: fade-in-scale 0.2s ease-out forwards; }
        `}</style>
      </div>
    </div>
  );
}