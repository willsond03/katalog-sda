// Lokasi: src/app/market-sounding/input/page.js
'use client';
import { useState, useEffect, useMemo } from 'react';
import SearchableSelect from '../../../components/SearchableSelect';
import MultiSelectDropdown from '../../../components/MultiSelectDropdown';

export default function InputMarketSoundingPage() {
  const [filterOptions, setFilterOptions] = useState({ provinsi: [], kategori_1: [], kategori_2: [] });
  const [selectedProvinsi, setSelectedProvinsi] = useState('');
  const [selectedK1, setSelectedK1] = useState([]);
  const [selectedK2, setSelectedK2] = useState([]);
  const [status, setStatus] = useState({ loading: false, message: '', isError: false });

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const optionsRes = await fetch('/api/filter-options');
        const optionsData = await optionsRes.json();
        setFilterOptions(optionsData);
        if (optionsData.provinsi.length > 0) {
            setSelectedProvinsi(optionsData.provinsi[0]);
        }
      } catch (error) { console.error("Gagal memuat opsi:", error); }
    };
    fetchOptions();
  }, []);

  const provinsiOptionsForSelect = useMemo(() => {
    return filterOptions.provinsi.map(opt => ({ id: opt, name: opt }));
  }, [filterOptions.provinsi]);

  const handleMarketSoundingSubmit = async (event) => {
    event.preventDefault();
    setStatus({ loading: true, message: 'Menyimpan...', isError: false });
    
    const formData = {
      balai: event.target.balai.value,
      wilayah: selectedProvinsi,
      paket_pekerjaan: event.target.paket_pekerjaan.value,
      tanggal: event.target.tanggal.value,
      kategori_1: selectedK1, // Data opsional baru
      kategori_2: selectedK2  // Data opsional baru
    };

    try {
      const response = await fetch('/api/market-sounding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      
      setStatus({ loading: false, message: 'Data Market Sounding berhasil disimpan!', isError: false });
      event.target.reset();
      setSelectedProvinsi(filterOptions.provinsi.length > 0 ? filterOptions.provinsi[0] : '');
      setSelectedK1([]);
      setSelectedK2([]);
    } catch (error) {
      setStatus({ loading: false, message: 'Gagal mengirim data: ' + error.message, isError: true });
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <div className="h-16 lg:hidden" />
      <header>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Input Market Sounding</h1>
      </header>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 lg:p-8 max-w-3xl mx-auto">
        <form onSubmit={handleMarketSoundingSubmit} className="space-y-6">
          
          <fieldset className="space-y-4 p-4 border rounded-lg">
            <legend className="text-lg font-semibold text-gray-900 px-2">Parameter Mandatory</legend>
            <div>
              <label htmlFor="balai" className="block text-sm font-medium text-gray-700">Balai</label>
              <input type="text" id="balai" name="balai" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"/>
            </div>
            <div>
              <SearchableSelect
                  label="Wilayah (Provinsi)"
                  options={provinsiOptionsForSelect}
                  selectedValue={selectedProvinsi}
                  onChange={setSelectedProvinsi}
                  placeholder="Cari Wilayah..."
              />
            </div>
            <div>
              <label htmlFor="paket_pekerjaan" className="block text-sm font-medium text-gray-700">Paket Pekerjaan</label>
              <input type="text" id="paket_pekerjaan" name="paket_pekerjaan" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"/>
            </div>
            <div>
              <label htmlFor="tanggal" className="block text-sm font-medium text-gray-700">Tanggal</label>
              <input type="date" id="tanggal" name="tanggal" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"/>
            </div>
          </fieldset>
          
          <fieldset className="space-y-4 p-4 border rounded-lg">
            <legend className="text-lg font-semibold text-gray-900 px-2">Parameter Opsional</legend>
            <MultiSelectDropdown
              label="Kategori 1 (Opsional)"
              options={filterOptions.kategori_1}
              selectedValues={selectedK1}
              onChange={setSelectedK1}
              placeholder="Semua Kategori 1"
            />
            <MultiSelectDropdown
              label="Kategori 2 (Opsional)"
              options={filterOptions.kategori_2}
              selectedValues={selectedK2}
              onChange={setSelectedK2}
              placeholder="Semua Kategori 2"
            />
          </fieldset>
          
          <div className="flex justify-end items-center space-x-4 pt-4">
            {status.message && (
              <p className={`text-sm ${status.isError ? 'text-red-600' : 'text-green-600'}`}>
                {status.message}
              </p>
            )}
            <button 
              type="submit" 
              disabled={status.loading}
              className="py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium shadow-sm disabled:bg-blue-400 disabled:cursor-wait"
            >
              {status.loading ? 'Menyimpan...' : 'Simpan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}