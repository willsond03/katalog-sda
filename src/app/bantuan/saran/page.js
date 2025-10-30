// Lokasi: src/app/bantuan/saran/page.js
'use client';
import { useState } from 'react';

export default function SaranPage() {
  const [submitting, setSubmitting] = useState(false);
  const [succeeded, setSucceeded] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    setSucceeded(false);

    const formData = new FormData(event.target);

    try {
      const response = await fetch("https://formspree.io/f/meopkbbg", { // <-- GANTI DENGAN URL UNIK ANDA
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json'
        }
      });

      if (response.ok) {
        setSucceeded(true);
        event.target.reset(); // Kosongkan form
      } else {
        const data = await response.json();
        if (data.errors) {
          setError(data.errors.map(err => err.message).join(', '));
        } else {
          setError('Gagal mengirim saran. Silakan coba lagi.');
        }
      }
    } catch (err) {
      setError('Terjadi kesalahan. Silakan periksa koneksi Anda.');
    } finally {
      setSubmitting(false);
    }
  };

  if (succeeded) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 space-y-6">
        <div className="h-16 lg:hidden" />
        <header>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Saran dan Masukan</h1>
        </header>
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 lg:p-8">
          <h2 className="text-xl font-semibold text-emerald-600">Terima kasih!</h2>
          <p className="text-gray-700 mt-2">
            Saran dan masukan Anda telah berhasil terkirim. Kami sangat menghargai kontribusi Anda.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <div className="h-16 lg:hidden" />
      <header>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Saran dan Masukan</h1>
      </header>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 lg:p-8">
        <p className="text-gray-700 mb-6">
          Kami sangat menghargai masukan Anda untuk pengembangan dashboard ini. Silakan sampaikan saran atau laporkan bug melalui formulir di bawah ini.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Perihal */}
          <div>
            <label htmlFor="perihal" className="block text-sm font-medium text-gray-700 mb-1">
              Perihal
            </label>
            <input
              id="perihal"
              type="text"
              name="perihal" // 'name' ini penting untuk Formspree
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="Contoh: Ide untuk fitur peta"
            />
          </div>

          {/* Pesan */}
          <div>
            <label htmlFor="pesan" className="block text-sm font-medium text-gray-700 mb-1">
              Saran / Masukan
            </label>
            <textarea
              id="pesan"
              name="pesan" // 'name' ini penting untuk Formspree
              rows={6}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="Tuliskan saran Anda secara detail di sini..."
            />
          </div>
          
          {/* Email (Opsional tapi direkomendasikan Formspree) */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email Anda (Opsional)
            </label>
            <input
              id="email"
              type="email"
              name="email" // 'name' ini penting untuk Formspree
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="Anda@email.com (jika ingin dihubungi kembali)"
            />
          </div>

          {/* Tombol Submit */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-blue-400 disabled:cursor-wait"
            >
              {submitting ? 'Mengirim...' : 'Kirim Saran'}
            </button>
          </div>

          {/* Status Error */}
          {error && (
            <div className="text-red-600 text-sm font-medium text-right">
              Gagal mengirim: {error}
            </div>
          )}
        </form>
      </div>
    </div>
  );
}