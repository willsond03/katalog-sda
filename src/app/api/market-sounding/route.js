// Lokasi: src/app/api/market-sounding/route.js
export const runtime = 'edge';
import { NextResponse } from 'next/server';

// FUNGSI UNTUK MENGAMBIL DATA HISTORI (METHOD GET)
export async function GET(request) {
  try {
    const db = process.env.DB;
    // Menggunakan query dari file Anda
    const stmt = db.prepare(
      "SELECT id, tanggal, balai, wilayah, paket_pekerjaan FROM market_sounding_logs ORDER BY tanggal DESC"
    );
    const { results } = await stmt.all();
    return NextResponse.json(results);
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// FUNGSI UNTUK MENYIMPAN DATA BARU (METHOD POST)
export async function POST(request) {
  try {
    const db = process.env.DB;
    const { 
      balai, 
      wilayah, 
      paket_pekerjaan, 
      tanggal,
      kategori_1, 
      kategori_2  
    } = await request.json();

    if (!balai || !wilayah || !paket_pekerjaan || !tanggal) {
        return NextResponse.json({ error: 'Parameter mandatory tidak lengkap.' }, { status: 400 });
    }

    const k1_json = JSON.stringify(kategori_1 || []);
    const k2_json = JSON.stringify(kategori_2 || []);

    const stmt = db.prepare(
      "INSERT INTO market_sounding_logs (balai, wilayah, paket_pekerjaan, tanggal, kategori_1, kategori_2) VALUES (?, ?, ?, ?, ?, ?)"
    ).bind(balai, wilayah, paket_pekerjaan, tanggal, k1_json, k2_json);

    await stmt.run();

    return NextResponse.json({ message: 'Data berhasil disimpan' });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// --- FUNGSI BARU UNTUK HAPUS DATA (METHOD DELETE) ---
export async function DELETE(request) {
  try {
    const db = process.env.DB;
    const { id, password } = await request.json();

    // 1. Validasi Password
    if (password !== "BatagorSimpangDago") {
      return NextResponse.json({ error: 'Password salah' }, { status: 401 }); // 401 Unauthorized
    }

    // 2. Validasi ID
    if (!id) {
      return NextResponse.json({ error: 'ID event tidak ada' }, { status: 400 }); // 400 Bad Request
    }

    // 3. Eksekusi Hapus
    const stmt = db.prepare(
      "DELETE FROM market_sounding_logs WHERE id = ?"
    ).bind(id);

    const { success } = await stmt.run();

    if (success) {
      return NextResponse.json({ message: 'Event berhasil dihapus' });
    } else {
      return NextResponse.json({ error: 'Gagal menghapus event dari database' }, { status: 500 });
    }

  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}