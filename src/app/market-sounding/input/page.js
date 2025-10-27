// Lokasi: src/app/market-sounding/input/page.js
'use client';
import { useState, useEffect, useMemo } from 'react';
import SearchableSelect from '../../../components/SearchableSelect';

export default function InputMarketSoundingPage() {
  const [provinsiOptions, setProvinsiOptions] = useState([]);
  const [modalProvinsi, setModalProvinsi] = useState('');
  const [status, setStatus] = useState({ loading: false, message: '', isError: false });

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const optionsRes = await fetch('/api/filter-options');
        const optionsData = await optionsRes.json();
        setProvinsiOptions(optionsData.provinsi);
        if (optionsData.provinsi.length > 0) {
            setModalProvinsi(optionsData.provinsi[0]);
        }
      } catch (error) { console.error("Gagal memuat opsi provinsi:", error); }
    };
    fetchOptions();
  }, []);

  const provinsiOptionsForSelect = useMemo(() => {
    return provinsiOptions.map(opt => ({ id: opt, name: opt }));
  }, [provinsiOptions]);

  const handleMarketSoundingSubmit = async (event) => {
    event.preventDefault();
    setStatus({ loading: true, message: 'Menyimpan...', isError: false });
    
    const formData = {
      balai: event.target.balai.value,
      wilayah: modalProvinsi,
      paket_pekerjaan: event.target.paket_pekerjaan.value,
      tanggal: event.target.tanggal.value,
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
      setModalProvinsi(provinsiOptions.length > 0 ? provinsiOptions[0] : '');
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

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 max-w-2xl mx-auto">
        <form onSubmit={handleMarketSoundingSubmit} className="space-y-4">
          <div>
            <label htmlFor="balai" className="block text-sm font-medium text-gray-700">Balai</label>
            <input type="text" id="balai" name="balai" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"/>
          </div>
          <div>
            <SearchableSelect
                label="Wilayah"
                options={provinsiOptionsForSelect}
                selectedValue={modalProvinsi}
                onChange={setModalProvinsi}
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