export const runtime = 'edge';

import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const secretKey = process.env.SYNC_SECRET_KEY;
    const authHeader = request.headers.get('authorization');

    if (authHeader !== `Bearer ${secretKey}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const dataToSync = await request.json();
    const db = process.env.DB;

    await db.prepare("DELETE FROM produk").run();

    const stmt = db.prepare("INSERT INTO produk (nama_produk, perusahaan, provinsi, kategori_1, kategori_2, last_update) VALUES (?, ?, ?, ?, ?, ?)");

    const batch = dataToSync.map(row => {
      return stmt.bind(
        row['Nama Produk'] || null, row['Perusahaan'] || null, row['Provinsi'] || null,
        row['Kategori 1'] || null, row['Kategori 2'] || null, row['Last Update'] || null
      );
    });

    await db.batch(batch);
    return NextResponse.json({ message: `Sync successful, ${dataToSync.length} rows inserted.` });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}