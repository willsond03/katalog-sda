// File: src/app/api/products/route.js
export const runtime = 'edge';

export async function GET(request) {
  try {
    const db = process.env.DB;
    const { searchParams } = new URL(request.url);

    const page = parseInt(searchParams.get('page')) || 1;
    const itemsPerPage = 20; // Tampilkan 20 data per halaman
    const offset = (page - 1) * itemsPerPage;

    // Bangun query SQL secara dinamis dan aman
    let baseQuery = "FROM produk";
    let conditions = [];
    let queryParams = [];

    if (searchParams.get('provinsi') && searchParams.get('provinsi') !== 'all') {
      conditions.push("provinsi = ?");
      queryParams.push(searchParams.get('provinsi'));
    }
    if (searchParams.get('kategori_1') && searchParams.get('kategori_1') !== 'all') {
      conditions.push("kategori_1 = ?");
      queryParams.push(searchParams.get('kategori_1'));
    }
    // Tambahkan filter lain di sini jika perlu

    if (conditions.length > 0) {
      baseQuery += " WHERE " + conditions.join(" AND ");
    }

    // 1. Query untuk menghitung total item yang cocok dengan filter
    const countStmt = db.prepare(`SELECT COUNT(*) as total ${baseQuery}`).bind(...queryParams);
    const { results: countResult } = await countStmt.all();
    const totalItems = countResult[0].total;

    // 2. Query untuk mengambil data per halaman yang sudah terfilter
    const dataStmt = db.prepare(`SELECT id, nama_produk, perusahaan, provinsi ${baseQuery} ORDER BY id LIMIT ? OFFSET ?`)
      .bind(...queryParams, itemsPerPage, offset);
    const { results: items } = await dataStmt.all();

    const response = {
      items: items,
      totalItems: totalItems,
      page: page,
      totalPages: Math.ceil(totalItems / itemsPerPage)
    };

    return new Response(JSON.stringify(response), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch(e) {
    return new Response(JSON.stringify({error: e.message}), { status: 500 });
  }
}