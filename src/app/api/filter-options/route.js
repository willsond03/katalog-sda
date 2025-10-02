// Lokasi: src/app/api/filter-options/route.js
export const runtime = 'edge';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const provinsiParam = searchParams.get('provinsi');
    const kategori1Param = searchParams.get('kategori_1');
    
    const db = process.env.DB;

    // --- Query Dinamis ---
    let provinsiQuery = "SELECT DISTINCT provinsi FROM produk WHERE provinsi IS NOT NULL ORDER BY provinsi ASC";
    let kategori1Query = "SELECT DISTINCT kategori_1 FROM produk WHERE kategori_1 IS NOT NULL";
    let kategori2Query = "SELECT DISTINCT kategori_2 FROM produk WHERE kategori_2 IS NOT NULL";
    
    const paramsKategori1 = [];
    const paramsKategori2 = [];

    if (provinsiParam && provinsiParam !== 'all') {
      kategori1Query += " AND provinsi = ?";
      kategori2Query += " AND provinsi = ?";
      paramsKategori1.push(provinsiParam);
      paramsKategori2.push(provinsiParam);
    }
    
    if (kategori1Param && kategori1Param !== 'all') {
      kategori2Query += " AND kategori_1 = ?";
      paramsKategori2.push(kategori1Param);
    }

    kategori1Query += " ORDER BY kategori_1 ASC";
    kategori2Query += " ORDER BY kategori_2 ASC";

    const [provinsi, kategori_1, kategori_2] = await db.batch([
      db.prepare(provinsiQuery),
      db.prepare(kategori1Query).bind(...paramsKategori1),
      db.prepare(kategori2Query).bind(...paramsKategori2)
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
    console.error('API Error:', e);
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
}