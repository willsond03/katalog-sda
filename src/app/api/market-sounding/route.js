// Lokasi: src/app/api/market-sounding/route.js
export const runtime = 'edge';
import { NextResponse } from 'next/server';

// FUNGSI UNTUK MENGAMBIL DATA HISTORI (METHOD GET)
export async function GET(request) {
  try {
    const db = process.env.DB;
    // Memilih kolom yang diperlukan + id
    const stmt = db.prepare(
      "SELECT id, tanggal, balai, wilayah, paket_pekerjaan FROM market_sounding_logs ORDER BY tanggal DESC"
    );
    const { results } = await stmt.all();
    return NextResponse.json(results);
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// FUNGSI UNTUK MENYIMPAN DATA BARU (METHOD POST)
export async function POST(request) {
  try {
    const db = process.env.DB;
    // Ambil data baru
    const { 
      tanggal, 
      balai, 
      wilayah, 
      paket_pekerjaan,
      kategori_1, // Data opsional baru
      kategori_2  // Data opsional baru
    } = await request.json();

    if (!tanggal || !balai || !wilayah || !paket_pekerjaan) {
        return NextResponse.json({ error: 'Parameter mandatory tidak lengkap.' }, { status: 400 });
    }

    // Ubah array menjadi string JSON untuk disimpan di D1
    const k1_json = JSON.stringify(kategori_1 || []);
    const k2_json = JSON.stringify(kategori_2 || []);

    const stmt = db.prepare(
      "INSERT INTO market_sounding_logs (tanggal, balai, wilayah, paket_pekerjaan, kategori_1, kategori_2) VALUES (?, ?, ?, ?, ?, ?)"
    ).bind(tanggal, balai, wilayah, paket_pekerjaan, k1_json, k2_json);

    await stmt.run();

    return NextResponse.json({ message: 'Data berhasil disimpan' });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}