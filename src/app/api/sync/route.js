export const runtime = 'edge';
import { NextResponse } from 'next/server';

export async function POST(request) {
  console.log("--- Sync API function started ---"); // LOG 1: Memastikan fungsi berjalan
  try {
    const secretKey = process.env.SYNC_SECRET_KEY;
    const authHeader = request.headers.get('authorization');

    if (authHeader !== `Bearer ${secretKey}`) {
      console.error("Authorization failed.");
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    console.log("Authorization successful."); // LOG 2: Memastikan otorisasi berhasil

    const dataToSync = await request.json();
    const db = process.env.DB;

    if (!db) {
      console.error("Database binding (DB) not found.");
      throw new Error("Database binding (DB) tidak ditemukan.");
    }

    console.log("Attempting to delete all rows from 'produk' table..."); // LOG 3: Memastikan kita akan menghapus
    const deleteResult = await db.prepare("DELETE FROM produk").run();
    console.log("Delete operation result:", JSON.stringify(deleteResult)); // LOG 4: BUKTI APAKAH DELETE BERHASIL

    console.log(`Attempting to insert ${dataToSync.length} new rows...`); // LOG 5: Memastikan kita akan insert
    const stmt = db.prepare("INSERT INTO produk (nama_produk, perusahaan, provinsi, kategori_1, kategori_2, last_update) VALUES (?, ?, ?, ?, ?, ?)");
    
    const batch = dataToSync.map(row => {
      return stmt.bind(
        row['nama_produk'] || null, row['perusahaan'] || null, row['provinsi'] || null,
        row['kategori_1'] || null, row['kategori_2'] || null, row['last_update'] || null
      );
    });

    await db.batch(batch);
    console.log("Batch insert successful."); // LOG 6: Memastikan insert berhasil

    return NextResponse.json({ message: `Sync successful, ${dataToSync.length} rows inserted.` });
  } catch (error) {
    console.error("An error occurred in the sync API:", error); // LOG 7: Menangkap error apa pun
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}