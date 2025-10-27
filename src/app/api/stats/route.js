// Lokasi: src/app/api/stats/route.js
export const runtime = 'edge';

export async function GET(request) {
  try {
    const db = process.env.DB;

    // PENTING: Ganti 'tanggal_diupdate' dengan nama kolom timestamp 
    // terakhir di tabel 'produk' Anda.
    const lastUpdateQuery = "SELECT MAX(last_update) as last_update FROM produk";

    // Jalankan semua query statistik secara paralel
    const [
      totalProduk,
      lastUpdate,
      totalK1,
      totalK2,
      totalHistory
    ] = await db.batch([
      db.prepare("SELECT COUNT(*) as total FROM produk"),
      db.prepare(lastUpdateQuery),
      db.prepare("SELECT COUNT(DISTINCT kategori_1) as total FROM produk"),
      db.prepare("SELECT COUNT(DISTINCT kategori_2) as total FROM produk"),
      db.prepare("SELECT COUNT(*) as total FROM market_sounding_logs") // Pastikan nama tabel ini benar
    ]);

    const stats = {
      total_produk: totalProduk.results[0].total || 0,
      last_update: lastUpdate.results[0].last_update || 'N/A',
      total_k1: totalK1.results[0].total || 0,
      total_k2: totalK2.results[0].total || 0,
      total_history: totalHistory.results[0].total || 0
    };

    return new Response(JSON.stringify(stats), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (e) {
    console.error('API Stats Error:', e);
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
}