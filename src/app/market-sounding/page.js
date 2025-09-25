// Lokasi: src/app/market-sounding/page.js
'use client';
import { useState, useEffect } from 'react';

export default function MarketSoundingPage() {
  const [modals, setModals] = useState({ marketSounding: false, history: false });
  const [historyData, setHistoryData] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);
  const [provinsiOptions, setProvinsiOptions] = useState([]);

  const openModal = (modalName) => setModals(prev => ({ ...prev, [modalName]: true }));
  const closeModal = (modalName) => setModals(prev => ({ ...prev, [modalName]: false }));

  const fetchHistory = async () => {
    setLoadingHistory(true);
    try {
      const response = await fetch(`/api/market-sounding?t=${new Date().getTime()}`);
      const data = await response.json();
      setHistoryData(data);
    } catch (error) { console.error("Gagal mengambil histori:", error); } 
    finally { setLoadingHistory(false); }
  };

  const handleMarketSoundingSubmit = async (event) => {
    event.preventDefault();
    const btn = event.nativeEvent.submitter;
    btn.disabled = true;
    btn.textContent = "Menyimpan...";
    const formData = {
      balai: event.target.balai.value,
      wilayah: event.target.provinsi.value,
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
      alert('Data Market Sounding berhasil disimpan!');
      closeModal('marketSounding');
      event.target.reset();
      fetchHistory();
    } catch (error) {
      alert('Gagal mengirim data: ' + error.message);
    } finally {
      btn.disabled = false;
      btn.textContent = "Simpan";
    }
  };
  
  const runComparison = async () => {
    const eventSelect = document.getElementById('comparisonDate');
    const daysInput = document.getElementById('comparisonDay');
    if (!eventSelect.value) { alert("Silakan pilih event terlebih dahulu."); return; }
    
    setLoadingAnalysis(true);
    setAnalysisResult(null);
    const [eventDate, provinsi] = eventSelect.value.split(';');
    try {
      const response = await fetch('/api/run-comparison', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventDate, provinsi, daysToAdd: daysInput.value })
      });
      const result = await response.json();
      setAnalysisResult(result);
    } catch (error) { setAnalysisResult({ error: error.message }); } 
    finally { setLoadingAnalysis(false); }
  };

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [historyRes, optionsRes] = await Promise.all([
          fetch(`/api/market-sounding?t=${new Date().getTime()}`),
          fetch('/api/filter-options')
        ]);
        const historyLogs = await historyRes.json();
        setHistoryData(historyLogs);
        const optionsData = await optionsRes.json();
        setProvinsiOptions(optionsData.provinsi);
      } catch (error) { console.error("Gagal memuat data awal:", error); }
    };
    fetchInitialData();
  }, []);
  
  useEffect(() => {
    if (modals.history) fetchHistory();
  }, [modals.history]);

  return (
    <>
      <div className="p-4 sm:p-6 lg:p-8 space-y-6">
        <header>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Market Sounding</h1>
        </header>

        <div className="flex space-x-4">
          <button onClick={() => openModal('marketSounding')} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg shadow-sm">Input Market Sounding</button>
          <button onClick={() => openModal('history')} className="bg-white hover:bg-gray-50 text-gray-700 font-bold py-2 px-4 rounded-lg border border-gray-300 shadow-sm">Lihat Histori</button>
        </div>

        <div className="p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Analisis Market Sounding</h3>
          <div className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1">
              <label htmlFor="comparisonDate" className="block text-sm font-medium text-gray-700">Pilih Event</label>
              <select id="comparisonDate" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
                <option value="">Pilih Event</option>
                {historyData.map(log => <option key={log.id} value={`${log.tanggal};${log.wilayah}`}>{`${log.balai}: ${log.paket_pekerjaan} (${log.tanggal})`}</option>)}
              </select>
            </div>
            <div className="flex-1 md:max-w-xs">
              <label htmlFor="comparisonDay" className="block text-sm font-medium text-gray-700">Analisis Perubahan (H+)</label>
              <input type="number" id="comparisonDay" defaultValue="7" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"/>
            </div>
            <button onClick={runComparison} className="w-full md:w-auto bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 shadow-sm">Jalankan Analisis</button>
          </div>
        </div>

        {loadingAnalysis && <div className="p-6 bg-white border border-gray-200 rounded-lg shadow-sm text-center text-gray-600">Menganalisa data...</div>}
        {analysisResult && (
          <div className="p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Hasil Analisa</h3>
            {analysisResult.error ? <p className="text-red-500">Gagal memuat hasil: {analysisResult.error}</p> :
              <div className="space-y-4">
                <p className="text-sm text-gray-600">Perbandingan kondisi pada <strong>{analysisResult.startDate}</strong> dengan H+{(new Date(analysisResult.endDate) - new Date(analysisResult.startDate)) / (1000 * 60 * 60 * 24)} hari setelahnya.</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                    <div className="p-4 bg-gray-100 rounded-lg"><h4 className="font-semibold text-gray-700">Produk Awal</h4><p className="text-2xl font-bold">{analysisResult.beforeCount}</p></div>
                    <div className="p-4 bg-gray-100 rounded-lg"><h4 className="font-semibold text-gray-700">Produk Akhir</h4><p className="text-2xl font-bold">{analysisResult.afterCount}</p></div>
                    <div className={`p-4 rounded-lg ${analysisResult.change >= 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}><h4 className="font-semibold">Perubahan</h4><p className="text-2xl font-bold">{analysisResult.change >= 0 ? '+' : ''}{analysisResult.change}</p></div>
                </div>
                <div>
                    <h4 className="font-semibold text-gray-700">Produk Baru ({analysisResult.newProducts.length}):</h4>
                    <div className="overflow-auto max-h-48 mt-2 border rounded-lg">
                        <table className="min-w-full"><thead className="bg-gray-50 sticky top-0"><tr><th className="px-4 py-2 text-left text-xs font-semibold uppercase">Nama Produk</th><th className="px-4 py-2 text-left text-xs font-semibold uppercase">Perusahaan</th></tr></thead>
                        <tbody className="divide-y">{analysisResult.newProducts.length > 0 ? analysisResult.newProducts.map((p, i) => <tr key={i}><td className="px-4 py-2 text-sm">{p.nama_produk}</td><td className="px-4 py-2 text-sm text-gray-600">{p.perusahaan}</td></tr>) : <tr><td colSpan="2" className="text-center py-4 text-gray-500">Tidak ada.</td></tr>}</tbody></table>
                    </div>
                </div>
              </div>
            }
          </div>
        )}
      </div>

      {modals.marketSounding && ( <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50"><div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-md"><h2 className="text-xl font-bold mb-4 text-gray-800">Catat Market Sounding</h2><form onSubmit={handleMarketSoundingSubmit} className="space-y-4"><div><label htmlFor="balai" className="block text-sm text-gray-700">Balai</label><input type="text" id="balai" name="balai" required className="mt-1 block w-full rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500"/></div><div><label htmlFor="provinsi-modal" className="block text-sm text-gray-700">Wilayah</label><select id="provinsi-modal" name="provinsi" required className="mt-1 block w-full rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500">{provinsiOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}</select></div><div><label htmlFor="paket_pekerjaan" className="block text-sm text-gray-700">Paket Pekerjaan</label><input type="text" id="paket_pekerjaan" name="paket_pekerjaan" required className="mt-1 block w-full rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500"/></div><div><label htmlFor="tanggal" className="block text-sm text-gray-700">Tanggal</label><input type="date" id="tanggal" name="tanggal" required className="mt-1 block w-full rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500"/></div><div className="flex justify-end space-x-4 pt-4"><button type="button" onClick={() => closeModal('marketSounding')} className="py-2 px-4 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg">Batal</button><button type="submit" className="py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg">Simpan</button></div></form></div></div> )}
      {modals.history && ( <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50"><div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-5xl"><div className="flex justify-between items-center mb-4"><h2 className="text-xl font-bold text-gray-800">Histori Market Sounding</h2><button onClick={() => closeModal('history')} className="text-gray-500 text-2xl font-bold">&times;</button></div><div className="overflow-y-auto max-h-[70vh]">{loadingHistory ? <p className="text-center py-10">Memuat histori...</p> : (historyData && historyData.length > 0 ? (<table className="min-w-full"><thead className="bg-gray-100 sticky top-0"><tr><th className="px-6 py-3 text-left text-xs font-semibold uppercase">Tanggal</th><th className="px-6 py-3 text-left text-xs font-semibold uppercase">Balai</th><th className="px-6 py-3 text-left text-xs font-semibold uppercase">Wilayah</th><th className="px-6 py-3 text-left text-xs font-semibold uppercase">Paket Pekerjaan</th></tr></thead><tbody className="divide-y divide-gray-200">{historyData.map((log) => (<tr key={log.id}><td className="px-6 py-4 text-sm whitespace-nowrap">{log.tanggal}</td><td className="px-6 py-4 text-sm whitespace-nowrap">{log.balai}</td><td className="px-6 py-4 text-sm whitespace-nowrap">{log.wilayah}</td><td className="px-6 py-4 text-sm">{log.paket_pekerjaan}</td></tr>))}</tbody></table>) : (<p className="text-center text-gray-500 py-10">Tidak ada data histori.</p>))}</div></div></div> )}
    </>
  );
}