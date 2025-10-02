// Lokasi: src/components/FilterModal.js
'use client';
import { useState, useEffect, useMemo } from 'react';

export default function FilterModal({ isOpen, onClose, onApply, initialOptions, currentFilters, fetcher }) {
  const [tempFilters, setTempFilters] = useState(currentFilters);
  const [modalOptions, setModalOptions] = useState(initialOptions);
  const [selectedKategori1, setSelectedKategori1] = useState(currentFilters.kategori_1);
  const [isLoadingOptions, setIsLoadingOptions] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setTempFilters(currentFilters);
      setModalOptions(initialOptions);
      setSelectedKategori1(currentFilters.kategori_1);
    }
  }, [isOpen, currentFilters, initialOptions]);

  useEffect(() => {
    if (!isOpen) return;

    const updateOptionsInModal = async () => {
      setIsLoadingOptions(true);
      try {
        const newOptions = await fetcher('filter-options', { provinsi: tempFilters.provinsi, kategori_1: tempFilters.kategori_1 });
        setModalOptions(newOptions);
      } catch (error) {
        console.error("Failed to fetch modal options:", error);
      } finally {
        setIsLoadingOptions(false);
      }
    };
    
    updateOptionsInModal();
  }, [tempFilters.provinsi, tempFilters.kategori_1, fetcher, isOpen]);

  const handleApply = () => { onApply(tempFilters); };

  const handleSelectKategori1 = (kategori1) => {
    setSelectedKategori1(kategori1);
    setTempFilters(prev => ({ ...prev, kategori_1: kategori1, kategori_2: 'all' }));
  };
  
  const handleSelectProvinsi = (provinsi) => {
    setTempFilters({ provinsi: provinsi, kategori_1: 'all', kategori_2: 'all' });
    setSelectedKategori1('all');
  };

  const availableKategori2 = useMemo(() => {
    if (selectedKategori1 === 'all') return modalOptions.kategori_2;
    const parentCode = selectedKategori1.split(' ')[0];
    if (!parentCode) return [];
    return modalOptions.kategori_2?.filter(k2 => k2.startsWith(parentCode));
  }, [selectedKategori1, modalOptions.kategori_2]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-center p-4 transition-opacity duration-300">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl h-[80vh] flex flex-col overflow-hidden transform transition-all duration-300 scale-95 opacity-0 animate-fade-in-scale">
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
              onChange={(e) => handleSelectProvinsi(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
            >
              <option value="all">Semua Provinsi</option>
              {initialOptions.provinsi?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-[calc(100%-100px)]">
            <div className={`border rounded-lg overflow-hidden flex flex-col relative ${isLoadingOptions ? 'opacity-50' : ''}`}>
              <div className="p-3 bg-gray-50 border-b"><h3 className="font-semibold text-gray-700">Kategori 1</h3></div>
              <div className="overflow-y-auto">
                <button onClick={() => handleSelectKategori1('all')} className={`w-full text-left p-3 text-sm truncate ${selectedKategori1 === 'all' ? 'bg-blue-600 text-white font-bold' : 'hover:bg-gray-100'}`}>Semua Kategori 1</button>
                {modalOptions.kategori_1?.map(k1 => (<button key={k1} onClick={() => handleSelectKategori1(k1)} className={`w-full text-left p-3 text-sm truncate ${selectedKategori1 === k1 ? 'bg-blue-600 text-white font-bold' : 'hover:bg-gray-100'}`}>{k1}</button>))}
              </div>
              {isLoadingOptions && <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-50"><p>Loading...</p></div>}
            </div>

            <div className={`border rounded-lg overflow-hidden flex flex-col relative ${isLoadingOptions ? 'opacity-50' : ''}`}>
              <div className="p-3 bg-gray-50 border-b"><h3 className="font-semibold text-gray-700">Kategori 2</h3></div>
              <div className="overflow-y-auto">
                <button onClick={() => setTempFilters(p => ({...p, kategori_2: 'all'}))} className={`w-full text-left p-3 text-sm truncate ${tempFilters.kategori_2 === 'all' ? 'bg-blue-600 text-white font-bold' : 'hover:bg-gray-100'}`}>Semua Kategori 2</button>
                {availableKategori2?.map(k2 => (<button key={k2} onClick={() => setTempFilters(p => ({...p, kategori_2: k2}))} className={`w-full text-left p-3 text-sm truncate ${tempFilters.kategori_2 === k2 ? 'bg-blue-600 text-white font-bold' : 'hover:bg-gray-100'}`} title={k2}>{k2}</button>))}
              </div>
               {isLoadingOptions && <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-50"><p>Loading...</p></div>}
            </div>
          </div>
        </div>

        <div className="flex justify-end items-center p-4 bg-gray-50 border-t space-x-3">
          <button onClick={onClose} className="px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium hover:bg-gray-50">Batal</button>
          <button onClick={handleApply} className="px-4 py-2 bg-blue-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-blue-700">Terapkan Filter</button>
        </div>
      </div>
      <style jsx>{`
        @keyframes fade-in-scale {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        .animate-fade-in-scale {
          animation: fade-in-scale 0.2s ease-out forwards;
        }
      `}</style>
    </div>
  );
}