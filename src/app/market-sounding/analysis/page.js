// Lokasi: src/app/market-sounding/analysis/page.js
'use client';
import { useState, useEffect, useMemo } from 'react';
import SearchableSelect from '../../../components/SearchableSelect';

export default function AnalysisMarketSoundingPage() {
  const [historyData, setHistoryData] = useState([]);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState('');

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await fetch(`/api/market-sounding?t=${new Date().getTime()}`);
        const data = await response.json();
        setHistoryData(data);
      } catch (error) { console.error("Gagal mengambil histori:", error); }
    };
    fetchHistory();
  }, []);

  const eventOptions = useMemo(() => {
    return historyData.map(log => ({
      id: log.id, // Gunakan ID event sebagai value
      name: `${log.balai}: ${log.paket_pekerjaan} (${log.tanggal})`
    }));
  }, [historyData]);

  const runComparison = async () => {
    const daysInput = document.getElementById('comparisonDay');
    if (!selectedEvent) { // selectedEvent sekarang adalah ID
        alert("Silakan pilih event terlebih dahulu."); 
        return; 
    }
    
    setLoadingAnalysis(true);
    setAnalysisResult(null);
    
    try {
      const response = await fetch('/api/run-comparison', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          eventId: selectedEvent, // Kirim ID event
          daysToAdd: daysInput.value
        })
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Gagal menjalankan analisis');
      setAnalysisResult(result);
    } catch (error) { setAnalysisResult({ error: error.message }); } 
    finally { setLoadingAnalysis(false); }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <div className="h-16 lg:hidden" />
      <header>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Analisa Market Sounding</h1>
      </header>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 lg:p-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Panel Analisis</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div className="md:col-span-2">
            <SearchableSelect
              label="Pilih Event (Mandatory)"
              options={eventOptions}
              selectedValue={selectedEvent}
              onChange={setSelectedEvent}
              placeholder="Pilih Event dari Histori..."
            />
          </div>
          <div>
            <label htmlFor="comparisonDay" className="block text-sm font-medium text-gray-700">Analisis Perubahan (H+)</label>
            <input type="number" id="comparisonDay" defaultValue="7" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"/>
          </div>
          <button onClick={runComparison} disabled={loadingAnalysis} className="md:col-start-3 w-full md:w-auto bg-emerald-600 text-white px-6 py-2 rounded-lg hover:bg-emerald-700 shadow-sm disabled:bg-emerald-400 disabled:cursor-wait">
              {loadingAnalysis ? 'Menganalisa...' : 'Jalankan Analisis'}
          </button>
        </div>
      </div>

      {loadingAnalysis && <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 text-center text-gray-600">Menganalisa data...</div>}
      
      {analysisResult && (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 lg:p-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Hasil Analisa</h3>
          {analysisResult.error ? <p className="text-red-500">Gagal memuat hasil: {analysisResult.error}</p> :
            <div className="space-y-4">
              <p className="text-sm text-gray-600">Perbandingan kondisi pada <strong>{analysisResult.startDate}</strong> dengan H+{analysisResult.daysCompared} hari setelahnya.</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                  <div className="p-4 bg-slate-100 rounded-lg"><h4 className="font-semibold text-gray-700">Produk Awal</h4><p className="text-2xl font-bold">{analysisResult.beforeCount}</p></div>
                  <div className="p-4 bg-slate-100 rounded-lg"><h4 className="font-semibold text-gray-700">Produk Akhir</h4><p className="text-2xl font-bold">{analysisResult.afterCount}</p></div>
                  <div className={`p-4 rounded-lg ${analysisResult.change >= 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}><h4 className="font-semibold">Perubahan</h4><p className="text-2xl font-bold">{analysisResult.change >= 0 ? '+' : ''}{analysisResult.change}</p></div>
              </div>
              <div>
                  <h4 className="font-semibold text-gray-700">Produk Baru ({analysisResult.newProducts.length}):</h4>
                  <div className="overflow-auto max-h-48 mt-2 border rounded-lg">
                      <table className="min-w-full"><thead className="bg-slate-50 sticky top-0"><tr><th className="px-4 py-2 text-left text-xs font-semibold uppercase">Nama Produk</th><th className="px-4 py-2 text-left text-xs font-semibold uppercase">Perusahaan</th></tr></thead>
                      <tbody className="divide-y">{analysisResult.newProducts.length > 0 ? analysisResult.newProducts.map((p, i) => <tr key={i}><td className="px-4 py-2 text-sm">{p.nama_produk}</td><td className="px-4 py-2 text-sm text-gray-600">{p.perusahaan}</td></tr>) : <tr><td colSpan="2" className="text-center py-4 text-gray-500">Tidak ada.</td></tr>}</tbody></table>
                  </div>
              </div>
            </div>
          }
        </div>
      )}
    </div>
  );
}