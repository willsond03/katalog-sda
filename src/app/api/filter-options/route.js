// File: src/app/api/filter-options/route.js
export const runtime = 'edge';

export async function GET(request) {
  try {
    const db = process.env.DB;

    // Jalankan beberapa query secara paralel untuk efisiensi
    const [provinsi, kategori_1, kategori_2] = await db.batch([
      db.prepare("SELECT DISTINCT provinsi FROM produk WHERE provinsi IS NOT NULL ORDER BY provinsi ASC"),
      db.prepare("SELECT DISTINCT kategori_1 FROM produk WHERE kategori_1 IS NOT NULL ORDER BY kategori_1 ASC"),
      db.prepare("SELECT DISTINCT kategori_2 FROM produk WHERE kategori_2 IS NOT NULL ORDER BY kategori_2 ASC")
    ]);

    const options = {
      provinsi: provinsi.results.map(row => row.provinsi),
      kategori_1: kategori_1.results.map(row => row.kategori_1),
      kategori_2: kategori_2.results.map(row => row.kategori_2)
    };

    return new Response(JSON.stringify(options), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
}