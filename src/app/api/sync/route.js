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

    // Perintah untuk mengosongkan tabel
    await db.prepare("DELETE FROM produk").run();
    
    // --- TAMBAHKAN BARIS DI BAWAH INI ---
    // Perintah untuk mereset nomor urut (sequence) ID kembali ke 0
    await db.prepare("DELETE FROM sqlite_sequence WHERE name = 'produk'").run();
    // --- ------------------------------- ---

    const stmt = db.prepare("INSERT INTO produk (nama_produk, perusahaan, provinsi, kategori_1, kategori_2, last_update) VALUES (?, ?, ?, ?, ?, ?)");
    
    const batch = dataToSync.map(row => {
      return stmt.bind(
        row['nama_produk'] || null,
        row['perusahaan'] || null,
        row['provinsi'] || null,
        row['kategori_1'] || null,
        row['kategori_2'] || null,
        row['last_update'] || null
      );
    });

    await db.batch(batch);
    return NextResponse.json({ message: `Sync successful, ${dataToSync.length} rows inserted.` });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}