// Di dalam file src/app/api/sync/route.js
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

    if (!db) {
      throw new Error("Database binding (DB) tidak ditemukan.");
    }

    await db.prepare("DELETE FROM produk").run();

    const stmt = db.prepare("INSERT INTO produk (nama_produk, perusahaan, provinsi, kategori_1, kategori_2, last_update) VALUES (?, ?, ?, ?, ?, ?)");
    
    // --- PERUBAHAN UTAMA DI SINI ---
    const batch = dataToSync.map(row => {
      // Sekarang kita gunakan nama kolom yang sudah bersih dan seragam
      return stmt.bind(
        row['nama_produk'] || null,
        row['perusahaan'] || null,
        row['provinsi'] || null,
        row['kategori_1'] || null,
        row['kategori_2'] || null,
        row['last_update'] || null
      );
    });
    // --- --------------------------- ---

    await db.batch(batch);
    return NextResponse.json({ message: `Sync successful, ${dataToSync.length} rows inserted.` });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}