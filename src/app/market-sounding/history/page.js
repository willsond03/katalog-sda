// Lokasi: src/app/market-sounding/history/page.js
'use client';
import { useState, useEffect } from 'react';

export default function HistoryMarketSoundingPage() {
  const [historyData, setHistoryData] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [deleteStatus, setDeleteStatus] = useState({ loading: false, error: null });

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

  // --- FUNGSI BARU UNTUK HAPUS ---
  const handleDelete = async (eventId, eventName) => {
    // 1. Minta konfirmasi dan password
    const confirmation = `Anda akan menghapus event:\n"${eventName}"\n\nOperasi ini tidak dapat dibatalkan. Masukkan password untuk melanjutkan:`;
    const password = window.prompt(confirmation);

    // 2. Jika user menekan "Cancel"
    if (password === null) {
      return;
    }

    // 3. Jika password salah
    if (password !== "BatagorSimpangDago") {
      alert("Password salah. Event tidak dihapus.");
      return;
    }

    // 4. Lanjutkan proses hapus
    setDeleteStatus({ loading: true, error: null });
    try {
      const response = await fetch('/api/market-sounding', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: eventId, password: password })
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || 'Gagal menghapus data');
      }

      // 5. Update UI jika berhasil
      setHistoryData(prevData => prevData.filter(item => item.id !== eventId));
      alert("Event berhasil dihapus.");

    } catch (error) {
      alert(`Error: ${error.message}`);
      setDeleteStatus({ loading: false, error: error.message });
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
                  {/* --- KOLOM BARU --- */}
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Aksi</th>
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
                      {/* --- TOMBOL BARU --- */}
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
                  ))
                ) : (
                  <tr>
                    {/* --- colspan diubah menjadi 5 --- */}
                    <td colSpan="5" className="text-center text-gray-500 py-10">
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