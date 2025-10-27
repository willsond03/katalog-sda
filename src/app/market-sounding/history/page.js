// Lokasi: src/app/market-sounding/history/page.js
'use client';
import { useState, useEffect } from 'react';

// Helper untuk memberi warna pada angka perubahan
const formatChange = (value) => {
  if (typeof value !== 'number') return <span className="text-red-500 font-medium text-xs">{value}</span>;
  if (value > 0) return <span className="text-green-600 font-medium">+{value}</span>;
  if (value < 0) return <span className="text-red-600 font-medium">{value}</span>;
  return <span className="text-gray-500">{value}</span>;
};

export default function HistoryMarketSoundingPage() {
  const [historyData, setHistoryData] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [deleteStatus, setDeleteStatus] = useState({ loading: false, error: null });
  const [changes, setChanges] = useState({}); 

  useEffect(() => {
    const fetchHistory = async () => {
      setLoadingHistory(true);
      try {
        // --- PERBAIKAN: Ambil SEMUA kolom, termasuk ID ---
        const response = await fetch(`/api/market-sounding?t=${new Date().getTime()}`);
        if (!response.ok) throw new Error('Gagal mengambil data');
        const data = await response.json();
        setHistoryData(data);
      } catch (error) { console.error("Gagal mengambil histori:", error); } 
      finally { setLoadingHistory(false); }
    };
    fetchHistory();
  }, []);

  // --- FUNGSI DIPERBAIKI: Mengirim parameter yang benar ---
  const handleCalculateChange = async (logId) => {
    // Set loading state untuk baris ini
    setChanges(prev => ({ ...prev, [logId]: { loading: true, value: null } }));

    try {
      const response = await fetch('/api/run-comparison', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          // --- INI PERBAIKANNYA ---
          // Kita hanya perlu mengirim eventId, API akan mencari sisanya
          eventId: logId,
          daysToAdd: 7 
        })
      });
      
      if (!response.ok) {
        const err = await response.json();
        // Berikan pesan error yang lebih spesifik jika ada
        throw new Error(err.error || 'Gagal menghitung');
      }

      const result = await response.json();
      
      // Set nilai akhir ke state
      setChanges(prev => ({ ...prev, [logId]: { loading: false, value: result.change } }));

    } catch (error) {
      console.error("Gagal kalkulasi:", error);
      // Tampilkan error di UI
      setChanges(prev => ({ ...prev, [logId]: { loading: false, value: error.message } }));
    }
  };

  // Fungsi untuk hapus data (tidak berubah)
  const handleDelete = async (eventId, eventName) => {
    const password = window.prompt(`Anda akan menghapus event:\n"${eventName}"\n\nMasukkan password:`);
    if (password === null) return;
    if (password !== "BatagorSimpangDago") {
      alert("Password salah.");
      return;
    }
    setDeleteStatus({ loading: true, error: null });
    try {
      const response = await fetch('/api/market-sounding', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: eventId, password: password })
      });
      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || 'Gagal menghapus');
      }
      setHistoryData(prevData => prevData.filter(item => item.id !== eventId));
      alert("Event berhasil dihapus.");
    } catch (error) {
      alert(`Error: ${error.message}`);
    } finally {
      setDeleteStatus({ loading: false });
    }
  };

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
                  <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Perubahan Produk (H+7)</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {historyData && historyData.length > 0 ? (
                  historyData.map((log) => {
                    const changeData = changes[log.id]; 
                    return (
                      <tr key={log.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm whitespace-nowrap">{log.tanggal}</td>
                        <td className="px-6 py-4 text-sm whitespace-nowrap">{log.balai}</td>
                        <td className="px-6 py-4 text-sm whitespace-nowrap">{log.wilayah}</td>
                        <td className="px-6 py-4 text-sm">{log.paket_pekerjaan}</td>
                        
                        <td className="px-6 py-4 text-sm text-center align-middle">
                          {changeData?.loading ? (
                            <span className="text-gray-500 text-xs italic">Menghitung...</span>
                          ) : changeData?.value != null ? (
                            formatChange(changeData.value)
                          ) : (
                            // --- TOMBOL DIPERBAIKI ---
                            <button
                              onClick={() => handleCalculateChange(log.id)}
                              className="text-blue-600 hover:text-blue-800 text-xs font-medium"
                            >
                              Hitung
                            </button>
                          )}
                        </td>
                        
                        <td className="px-6 py-4 text-sm whitespace-nowrap">
                          <button
                            onClick={() => handleDelete(log.id, `${log.balai}: ${log.paket_pekerjaan}`)}
                            disabled={deleteStatus.loading}
                            className="text-red-600 hover:text-red-800 font-medium disabled:text-gray-400"
                          >
                            Hapus
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="6" className="text-center text-gray-500 py-10">
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