// Lokasi: src/app/market-sounding/history/page.js
'use client';
import { useState, useEffect } from 'react';

export default function HistoryMarketSoundingPage() {
  const [historyData, setHistoryData] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      setLoadingHistory(true);
      try {
        const response = await fetch(`/api/market-sounding?t=${new Date().getTime()}`);
        const data = await response.json();
        setHistoryData(data);
      } catch (error) { console.error("Gagal mengambil histori:", error); } 
      finally { setLoadingHistory(false); }
    };
    fetchHistory();
  }, []);

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <div className="h-16 lg:hidden" />
      <header>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Histori Market Sounding</h1>
      </header>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm">
        <div className="overflow-x-auto">
          {loadingHistory ? (
            <p className="text-center text-gray-500 py-10">Memuat histori...</p>
          ) : (
            <table className="min-w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Tanggal</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Balai</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Wilayah</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Paket Pekerjaan</th>
                  {/* Tambahkan kolom untuk K1 dan K2 jika ingin ditampilkan */}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {historyData && historyData.length > 0 ? (
                  historyData.map((log) => (
                    <tr key={log.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm whitespace-nowrap">{log.tanggal}</td>
                      <td className="px-6 py-4 text-sm whitespace-nowrap">{log.balai}</td>
                      <td className="px-6 py-4 text-sm whitespace-nowrap">{log.wilayah}</td>
                      <td className="px-6 py-4 text-sm">{log.paket_pekerjaan}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="text-center text-gray-500 py-10">
                      Tidak ada data histori.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}