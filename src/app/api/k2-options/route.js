// Lokasi: src/app/api/k2-options/route.js
export const runtime = 'edge';
import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const db = process.env.DB;
    
    // Ambil SEMUA nilai parameter 'kategori_1'
    const kategori1Params = searchParams.getAll('kategori_1');

    if (kategori1Params.length === 0) {
      // Jika tidak ada K1 yang dipilih, kembalikan array kosong
      // Halaman frontend akan menangani logika untuk menonaktifkan K2
      return NextResponse.json({ kategori_2: [] });
    }

    // Buat query dinamis
    let k2Query = "SELECT DISTINCT kategori_2 FROM produk WHERE kategori_2 IS NOT NULL";
    const k2Params = [];
    
    // Buat placeholder '?' sejumlah parameter K1
    const k1Placeholders = kategori1Params.map(() => '?').join(',');
    k2Query += ` AND kategori_1 IN (${k1Placeholders})`;
    k2Params.push(...kategori1Params);
    
    k2Query += " ORDER BY kategori_2 ASC";
    
    const { results } = await db.prepare(k2Query).bind(...k2Params).all();

    return NextResponse.json({
      kategori_2: results.map(row => row.kategori_2)
    });

  } catch (e) {
    console.error('API k2-options Error:', e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}