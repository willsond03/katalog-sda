// Lokasi: src/app/api/run-comparison/route.js
export const runtime = 'edge';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const db = process.env.DB;
    const { eventDate, provinsi, daysToAdd } = await request.json();

    if (!eventDate || !provinsi || !daysToAdd) {
      return NextResponse.json({ error: 'Parameter tidak lengkap.' }, { status: 400 });
    }

    const startDate = new Date(eventDate);
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + parseInt(daysToAdd, 10));
    
    const startDateString = startDate.toISOString().split('T')[0];
    const endDateString = endDate.toISOString().split('T')[0];

    const beforeStmt = db.prepare(
      "SELECT nama_produk, perusahaan FROM produk WHERE provinsi = ? AND DATE(last_update) <= ?"
    ).bind(provinsi, startDateString);

    const afterStmt = db.prepare(
      "SELECT nama_produk, perusahaan FROM produk WHERE provinsi = ? AND DATE(last_update) <= ?"
    ).bind(provinsi, endDateString);

    const [beforeResult, afterResult] = await db.batch([beforeStmt, afterStmt]);

    const beforeProducts = beforeResult.results.map(p => `${p.nama_produk}::${p.perusahaan}`);
    const afterProducts = afterResult.results.map(p => `${p.nama_produk}::${p.perusahaan}`);
    
    const beforeCount = beforeProducts.length;
    const afterCount = afterProducts.length;

    const beforeProductSet = new Set(beforeProducts);
    const newProducts = afterProducts
        .filter(p => !beforeProductSet.has(p))
        .map(p => {
            const [nama, perusahaan] = p.split('::');
            return { nama_produk: nama, perusahaan: perusahaan };
        });

    const response = {
      beforeCount,
      afterCount,
      change: afterCount - beforeCount,
      newProducts,
      startDate: startDateString,
      endDate: endDateString
    };

    return NextResponse.json(response);
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}