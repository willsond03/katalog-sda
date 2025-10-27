// Lokasi: src/app/market-sounding/input/page.js
'use client';
import { useState, useEffect, useMemo } from 'react';
import SearchableSelect from '../../../components/SearchableSelect';
import MultiSelectDropdown from '../../../components/MultiSelectDropdown';

export default function InputMarketSoundingPage() {
  const [allFilterOptions, setAllFilterOptions] = useState({ provinsi: [], kategori_1: [] });
  const [k2Options, setK2Options] = useState([]); 
  const [selectedProvinsi, setSelectedProvinsi] = useState('');
  const [selectedK1, setSelectedK1] = useState([]);
  const [selectedK2, setSelectedK2] = useState([]);
  const [status, setStatus] = useState({ loading: false, message: '', isError: false });
  const [loadingK2, setLoadingK2] = useState(false);

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const optionsRes = await fetch('/api/filter-options'); 
        const optionsData = await optionsRes.json();
        setAllFilterOptions({
          provinsi: optionsData.provinsi,
          kategori_1: optionsData.kategori_1
        });
        if (optionsData.provinsi.length > 0) {
            setSelectedProvinsi(optionsData.provinsi[0]);
        }
      } catch (error) { console.error("Gagal memuat opsi:", error); }
    };
    fetchOptions();
  }, []); 

  useEffect(() => {
    const updateK2Options = async () => {
      if (selectedK1.length === 0) {
        setK2Options([]); 
        setSelectedK2([]);
        return;
      }
      setLoadingK2(true);
      const params = new URLSearchParams();
      selectedK1.forEach(k1 => params.append('kategori_1', k1));
      try {
        const optionsRes = await fetch(`/api/k2-options?${params.toString()}`);
        const optionsData = await optionsRes.json();
        setK2Options(optionsData.kategori_2);
      } catch (error) {
        console.error("Gagal memuat opsi K2:", error);
      } finally {
        setLoadingK2(false);
      }
      setSelectedK2([]);
    };
    updateK2Options();
  }, [selectedK1]); 

  const provinsiOptionsForSelect = useMemo(() => {
    return allFilterOptions.provinsi.map(opt => ({ id: opt, name: opt }));
  }, [allFilterOptions.provinsi]);

  const handleMarketSoundingSubmit = async (event) => {
    event.preventDefault();
    setStatus({ loading: true, message: 'Menyimpan...', isError: false });
    
    const formData = {
      balai: event.target.balai.value,
      wilayah: selectedProvinsi,
      paket_pekerjaan: event.target.paket_pekerjaan.value,
      tanggal: event.target.tanggal.value,
      kategori_1: selectedK1,
      kategori_2: selectedK2
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
      setSelectedProvinsi(allFilterOptions.provinsi.length > 0 ? allFilterOptions.provinsi[0] : '');
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

      {/* REVISI 1: Kontainer utama dibuat lebih lebar */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 lg:p-8 max-w-6xl mx-auto">
        <form onSubmit={handleMarketSoundingSubmit}>
          {/* REVISI 2: Grid 2 kolom */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Kolom Kiri: Mandatory */}
            <div className="space-y-4 p-6 rounded-xl shadow-sm bg-gradient-to-br from-blue-50 to-slate-100">
              <div className="text-lg font-semibold text-gray-900 mb-2">Parameter Mandatory</div>
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
            </div>
            
            {/* Kolom Kanan: Opsional */}
            <div className="space-y-4 p-6 rounded-xl shadow-sm bg-gradient-to-br from-red-50 to-orange-100">
              <div className="text-lg font-semibold text-gray-900 mb-2">Parameter Opsional</div>
              <MultiSelectDropdown
                label="Kategori 1 (Opsional)"
                options={allFilterOptions.kategori_1}
                selectedValues={selectedK1}
                onChange={setSelectedK1}
                placeholder="Pilih Kategori 1..."
              />
              <MultiSelectDropdown
                label="Kategori 2 (Opsional)"
                options={k2Options} 
                selectedValues={selectedK2}
                onChange={setSelectedK2}
                placeholder={loadingK2 ? "Memuat..." : (selectedK1.length === 0 ? "Pilih Kategori 1 dahulu" : "Pilih Kategori 2...")}
                disabled={loadingK2 || selectedK1.length === 0}
              />
            </div>
          </div>
          
          {/* Tombol Aksi */}
          <div className="flex justify-end items-center space-x-4 pt-6 mt-6 border-t">
            {status.message && (
              <p className={`text-sm ${status.isError ? 'text-red-600' : 'text-green-600'}`}>
                {status.message}
              </p>
            )}
            <button 
              type="submit" 
              disabled={status.loading}
              className="py-2 px-6 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium shadow-sm disabled:bg-blue-400 disabled:cursor-wait"
            >
              {status.loading ? 'Menyimpan...' : 'Simpan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}