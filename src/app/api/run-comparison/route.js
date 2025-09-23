// Lokasi file: src/app/api/run-comparison/route.js
export const runtime = 'edge';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const db = process.env.DB;
    const { eventDate, provinsi, daysToAdd } = await request.json();

    if (!eventDate || !provinsi || !daysToAdd) {
      return NextResponse.json({ error: 'Parameter tidak lengkap.' }, { status: 400 });
    }

    // Hitung tanggal akhir untuk perbandingan
    const startDate = new Date(eventDate);
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + parseInt(daysToAdd, 10));
    
    // Format tanggal ke YYYY-MM-DD untuk query SQL
    const startDateString = startDate.toISOString().split('T')[0];
    const endDateString = endDate.toISOString().split('T')[0];

    // Query untuk menghitung produk sebelum/pada tanggal event
    const beforeStmt = db.prepare(
      "SELECT nama_produk, perusahaan FROM produk WHERE provinsi = ? AND DATE(last_update) <= ?"
    ).bind(provinsi, startDateString);

    // Query untuk menghitung produk hingga H+sekian hari
    const afterStmt = db.prepare(
      "SELECT nama_produk, perusahaan FROM produk WHERE provinsi = ? AND DATE(last_update) <= ?"
    ).bind(provinsi, endDateString);

    const [beforeResult, afterResult] = await db.batch([beforeStmt, afterStmt]);

    const beforeProducts = beforeResult.results.map(p => `${p.nama_produk}::${p.perusahaan}`);
    const afterProducts = afterResult.results.map(p => `${p.nama_produk}::${p.perusahaan}`);
    
    const beforeCount = beforeProducts.length;
    const afterCount = afterProducts.length;

    // Cari produk baru
    const beforeProductSet = new Set(beforeProducts);
    const newProducts = afterProducts
        .filter(p => !beforeProductSet.has(p))
        .map(p => {
            const [nama, perusahaan] = p.split('::');
            return { nama_produk: nama, perusahaan: perusahaan };
        });

    const response = {
      beforeCount: beforeCount,
      afterCount: afterCount,
      change: afterCount - beforeCount,
      newProducts: newProducts,
      startDate: startDateString,
      endDate: endDateString
    };

    return NextResponse.json(response);
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}