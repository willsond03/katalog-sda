// Lokasi: src/app/bantuan/panduan/page.js
'use client';

export default function PanduanPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <div className="h-16 lg:hidden" />
      <header>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Panduan Pengguna</h1>
      </header>

      {/* Grid untuk layout kiri-kanan di layar besar */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* --- Kolom Kiri: PDF Viewer --- */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm">
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Panduan Versi PDF
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              Gunakan dokumen ini sebagai referensi utama penggunaan dashboard.
            </p>
          </div>
          <div className="border-t border-slate-200 p-2">
            <iframe
              src="/panduan.pdf" // <-- PASTIKAN FILE INI ADA DI /public/panduan.pdf
              className="w-full h-[600px] rounded-b-lg border-0"
              title="Panduan Pengguna PDF"
            />
          </div>
        </div>

        {/* --- Kolom Kanan: Video Tutorial --- */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm">
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Video Tutorial
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              Tonton video berikut untuk panduan visual langkah-demi-langkah.
            </p>
          </div>
          <div className="border-t border-slate-200 p-2">
            {/* Wrapper untuk video responsif 16:9 */}
            <div className="relative w-full aspect-video">
              <iframe
                className="absolute top-0 left-0 w-full h-full rounded-b-lg"
                src="https://www.youtube.com/embed/D0UnqGm_miA" // <-- GANTI VIDEO_ID_ANDA
                title="YouTube video player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}