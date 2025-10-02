'use client';
import { useState, useEffect } from 'react';

export default function FilterModal({ isOpen, onClose, onApply, filterOptions, currentFilters }) {
  // State sementara untuk menampung pilihan filter di dalam modal
  const [tempFilters, setTempFilters] = useState(currentFilters);
  const [selectedKategori1, setSelectedKategori1] = useState(currentFilters.kategori_1);

  // Sinkronkan state sementara dengan filter utama setiap kali modal dibuka
  useEffect(() => {
    if (isOpen) {
      setTempFilters(currentFilters);
      setSelectedKategori1(currentFilters.kategori_1);
    }
  }, [isOpen, currentFilters]);

  const handleApply = () => {
    onApply(tempFilters);
  };

  const handleSelectKategori1 = (kategori1) => {
    setSelectedKategori1(kategori1);
    // Saat Kategori 1 baru dipilih, reset pilihan Kategori 2 di state sementara
    setTempFilters(prev => ({ ...prev, kategori_1: kategori1, kategori_2: 'all' }));
  };

  const handleSelectKategori2 = (kategori2) => {
    setTempFilters(prev => ({ ...prev, kategori_2: kategori2 }));
  };

  if (!isOpen) return null;

  // Filter opsi Kategori 2 berdasarkan Kategori 1 yang dipilih
  const availableKategori2 = filterOptions.kategori_2?.filter(k2 => k2.startsWith(selectedKategori1.substring(0, 8))); // Cocokkan berdasarkan kode induk

  return (
    // Latar belakang overlay
    <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-center p-4">
      {/* Konten Modal */}
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl h-[80vh] flex flex-col overflow-hidden">
        {/* Header Modal */}
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-bold text-gray-800">Filter Data Lanjutan</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>

        {/* Body Modal */}
        <div className="flex-grow p-6 overflow-y-auto space-y-6">
          {/* Filter Provinsi */}
          <div>
            <label htmlFor="provinsi-modal" className="block text-sm font-medium text-gray-700 mb-1">Provinsi</label>
            <select
              id="provinsi-modal"
              value={tempFilters.provinsi}
              onChange={(e) => setTempFilters(prev => ({ ...prev, provinsi: e.target.value }))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
            >
              <option value="all">Semua Provinsi</option>
              {filterOptions.provinsi?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
          </div>

          {/* Filter Kategori (2 kolom) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-[calc(100%-100px)]">
            {/* Kolom Kiri: Kategori 1 */}
            <div className="border rounded-lg overflow-hidden flex flex-col">
              <div className="p-3 bg-gray-50 border-b"><h3 className="font-semibold text-gray-700">Kategori 1</h3></div>
              <div className="overflow-y-auto">
                {filterOptions.kategori_1?.map(k1 => (
                  <button
                    key={k1}
                    onClick={() => handleSelectKategori1(k1)}
                    className={`w-full text-left p-3 text-sm truncate ${selectedKategori1 === k1 ? 'bg-blue-600 text-white font-bold' : 'hover:bg-gray-100'}`}
                  >
                    {k1}
                  </button>
                ))}
              </div>
            </div>

            {/* Kolom Kanan: Kategori 2 */}
            <div className="border rounded-lg overflow-hidden flex flex-col">
              <div className="p-3 bg-gray-50 border-b"><h3 className="font-semibold text-gray-700">Kategori 2</h3></div>
              <div className="overflow-y-auto">
                {/* Opsi "Semua" untuk Kategori 2 */}
                <button
                  onClick={() => handleSelectKategori2('all')}
                  className={`w-full text-left p-3 text-sm truncate ${tempFilters.kategori_2 === 'all' ? 'bg-blue-600 text-white font-bold' : 'hover:bg-gray-100'}`}
                >
                  Semua Kategori 2
                </button>
                {availableKategori2?.map(k2 => (
                  <button
                    key={k2}
                    onClick={() => handleSelectKategori2(k2)}
                    className={`w-full text-left p-3 text-sm truncate ${tempFilters.kategori_2 === k2 ? 'bg-blue-600 text-white font-bold' : 'hover:bg-gray-100'}`}
                    title={k2}
                  >
                    {k2}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer Modal */}
        <div className="flex justify-end items-center p-4 bg-gray-50 border-t space-x-3">
          <button onClick={onClose} className="px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium hover:bg-gray-50">
            Batal
          </button>
          <button onClick={handleApply} className="px-4 py-2 bg-blue-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-blue-700">
            Terapkan Filter
          </button>
        </div>
      </div>
    </div>
  );
}