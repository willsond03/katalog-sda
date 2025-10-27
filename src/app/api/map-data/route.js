// Lokasi: src/app/api/map-data/route.js
export const runtime = 'edge';
import { NextResponse } from 'next/server';

/**
 * Helper untuk membangun query WHERE secara dinamis dan aman
 */
function buildWhereClause(params) {
  const { searchParams } = params;
  // Kondisi 'IS NOT NULL' penting untuk data yang bersih
  let conditions = ["provinsi IS NOT NULL", "kota IS NOT NULL"]; 
  let queryParams = [];

  if (searchParams.get('provinsi') && searchParams.get('provinsi') !== 'all') {
    conditions.push("provinsi = ?");
    queryParams.push(searchParams.get('provinsi'));
  }
  if (searchParams.get('kategori_1') && searchParams.get('kategori_1') !== 'all') {
    conditions.push("kategori_1 = ?");
    queryParams.push(searchParams.get('kategori_1'));
  }
  if (searchParams.get('kategori_2') && searchParams.get('kategori_2') !== 'all') {
    conditions.push("kategori_2 = ?");
    queryParams.push(searchParams.get('kategori_2'));
  }

  return {
    whereClause: `WHERE ${conditions.join(" AND ")}`,
    params: queryParams
  };
}

export async function GET(request) {
  try {
    const db = process.env.DB;
    const { searchParams } = new URL(request.url);
    const view = searchParams.get('view') || 'provinsi'; // default 'provinsi'
    
    // Tentukan kolom untuk GROUP BY
    const groupColumn = view === 'kota' ? 'kota' : 'provinsi';

    // Buat WHERE clause dari filter
    const { whereClause, params } = buildWhereClause(new URL(request.url));

    // Bangun query SQL lengkap
    const query = `
      SELECT 
        ${groupColumn} as name, 
        COUNT(*) as total
      FROM produk
      ${whereClause} 
      GROUP BY name
    `;

    const stmt = db.prepare(query).bind(...params);
    const { results } = await stmt.all();

    // Ubah hasil array menjadi objek (sesuai baseline Anda)
    // Contoh: { "JAWA BARAT": 500, "ACEH": 150 }
    const countsObject = results.reduce((acc, row) => {
      if (row.name) {
        // Uppercase untuk mencocokkan data GeoJSON
        acc[row.name.toUpperCase()] = row.total;
      }
      return acc;
    }, {});

    return NextResponse.json(countsObject);
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}