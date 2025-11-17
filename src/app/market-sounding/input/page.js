// Lokasi: src/app/market-sounding/input/page.js
'use client';
import { useState, useEffect } from 'react';
import MultiSelectDropdown from '../../../components/MultiSelectDropdown';

export default function InputMarketSoundingPage() {
  const [allFilterOptions, setAllFilterOptions] = useState({ provinsi: [], kategori_1: [] });
  
  // State Data
  const [selectedProvinsi, setSelectedProvinsi] = useState([]); 
  const [selectedKota, setSelectedKota] = useState([]); // State Baru untuk Kota
  const [selectedK1, setSelectedK1] = useState([]);
  const [selectedK2, setSelectedK2] = useState([]);
  
  // State Opsi Dinamis
  const [kotaOptions, setKotaOptions] = useState([]); // Opsi Kota
  const [k2Options, setK2Options] = useState([]); 
  
  // State Status
  const [status, setStatus] = useState({ loading: false, message: '', isError: false });
  const [loadingK2, setLoadingK2] = useState(false);
  const [loadingKota, setLoadingKota] = useState(false); // Loading Kota

  // 1. Load Provinsi & Kategori 1 saat awal
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const res = await fetch('/api/filter-options'); 
        const data = await res.json();
        setAllFilterOptions({ provinsi: data.provinsi, kategori_1: data.kategori_1 });
      } catch (error) { console.error("Gagal memuat opsi:", error); }
    };
    fetchOptions();
  }, []); 

  // 2. Load Kota saat Provinsi berubah
  useEffect(() => {
    const updateKotaOptions = async () => {
      if (selectedProvinsi.length === 0) {
        setKotaOptions([]);
        setSelectedKota([]);
        return;
      }
      setLoadingKota(true);
      const params = new URLSearchParams();
      selectedProvinsi.forEach(p => params.append('provinsi', p));
      
      try {
        const res = await fetch(`/api/city-options?${params.toString()}`);
        const data = await res.json();
        setKotaOptions(data.kota || []);
      } catch (error) { console.error("Gagal memuat kota:", error); } 
      finally { setLoadingKota(false); }
      
      // Reset pilihan kota saat provinsi berubah drastis
      setSelectedKota([]); 
    };
    updateKotaOptions();
  }, [selectedProvinsi]);

  // 3. Load Kategori 2 saat Kategori 1 berubah
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
        const res = await fetch(`/api/k2-options?${params.toString()}`);
        const data = await res.json();
        setK2Options(data.kategori_2);
      } catch (error) { console.error("Gagal memuat opsi K2:", error); } 
      finally { setLoadingK2(false); }
      setSelectedK2([]);
    };
    updateK2Options();
  }, [selectedK1]); 

  const handleMarketSoundingSubmit = async (event) => {
    event.preventDefault();
    setStatus({ loading: true, message: 'Menyimpan...', isError: false });
    
    const formData = {
      balai: event.target.balai.value,
      wilayah: selectedProvinsi, 
      kota: selectedKota, // Kirim data kota
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
      
      setStatus({ loading: false, message: 'Data berhasil disimpan!', isError: false });
      event.target.reset();
      setSelectedProvinsi([]);
      setSelectedKota([]);
      setSelectedK1([]);
      setSelectedK2([]);
    } catch (error) {
      setStatus({ loading: false, message: 'Gagal: ' + error.message, isError: true });
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <div className="h-16 lg:hidden" />
      <header>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Input Market Sounding</h1>
      </header>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 lg:p-8 max-w-6xl mx-auto">
        <form onSubmit={handleMarketSoundingSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Kolom Kiri: Mandatory */}
            <div className="space-y-4 p-6 rounded-xl shadow-sm bg-gradient-to-br from-blue-50 to-slate-100">
              <h3 className="font-semibold text-gray-900 border-b pb-2">Parameter Mandatory</h3>
              <div>
                <label htmlFor="balai" className="block text-sm font-medium text-gray-700">Balai</label>
                <input type="text" id="balai" name="balai" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"/>
              </div>
              
              <div>
                 <MultiSelectDropdown
                    label="Wilayah (Provinsi)"
                    options={allFilterOptions.provinsi}
                    selectedValues={selectedProvinsi}
                    onChange={setSelectedProvinsi}
                    placeholder="Pilih provinsi..."
                />
                {selectedProvinsi.length === 0 && <p className="text-xs text-amber-600 mt-1 ml-1">* Wajib pilih minimal satu</p>}
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
              
              {/* --- INPUT KOTA BARU --- */}
              <MultiSelectDropdown
                label="Kabupaten/Kota (Opsional)"
                options={kotaOptions}
                selectedValues={selectedKota}
                onChange={setSelectedKota}
                placeholder={loadingKota ? "Memuat kota..." : (selectedProvinsi.length === 0 ? "Pilih Provinsi dahulu" : "Pilih Kota/Kabupaten...")}
                disabled={loadingKota || selectedProvinsi.length === 0}
              />

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
          
          <div className="flex justify-end items-center space-x-4 pt-6 mt-6 border-t">
            {status.message && (
              <p className={`text-sm ${status.isError ? 'text-red-600' : 'text-green-600'}`}>{status.message}</p>
            )}
            <button 
              type="submit" 
              disabled={status.loading || selectedProvinsi.length === 0}
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