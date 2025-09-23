// Lokasi: src/app/api/market-sounding/route.js
export const runtime = 'edge';
import { NextResponse } from 'next/server';

// Mengambil data histori
export async function GET(request) {
  try {
    const db = process.env.DB;
    const stmt = db.prepare("SELECT * FROM market_sounding_logs ORDER BY tanggal DESC");
    const { results } = await stmt.all();
    return NextResponse.json(results);
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// Menyimpan data baru
export async function POST(request) {
  try {
    const db = process.env.DB;
    const { tanggal, balai, wilayah, paket_pekerjaan } = await request.json();
    const stmt = db.prepare(
      "INSERT INTO market_sounding_logs (tanggal, balai, wilayah, paket_pekerjaan) VALUES (?, ?, ?, ?)"
    ).bind(tanggal, balai, wilayah, paket_pekerjaan);
    await stmt.run();
    return NextResponse.json({ message: 'Data berhasil disimpan' });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}