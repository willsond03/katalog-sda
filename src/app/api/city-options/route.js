// Lokasi: src/app/api/city-options/route.js
export const runtime = 'edge';
import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const db = process.env.DB;
    const { searchParams } = new URL(request.url);
    const provinsiParams = searchParams.getAll('provinsi'); // Ambil semua parameter 'provinsi'

    if (!provinsiParams || provinsiParams.length === 0) {
      return NextResponse.json({ kota: [] });
    }

    // Buat placeholder (?, ?, ?) sesuai jumlah provinsi
    const placeholders = provinsiParams.map(() => '?').join(',');
    
    // Query ambil kota unik berdasarkan provinsi
    const stmt = db.prepare(
      `SELECT DISTINCT kota FROM produk WHERE provinsi IN (${placeholders}) AND kota IS NOT NULL ORDER BY kota ASC`
    ).bind(...provinsiParams);

    const { results } = await stmt.all();
    
    return NextResponse.json({ kota: results.map(row => row.kota) });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}