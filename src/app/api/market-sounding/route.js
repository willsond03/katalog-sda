// Lokasi: src/app/api/market-sounding/route.js
export const runtime = 'edge';
import { NextResponse } from 'next/server';

// --- FUNGSI GET DIPERBARUI UNTUK MENANGANI 2 KASUS ---
export async function GET(request) {
  try {
    const db = process.env.DB;
    const { searchParams } = new URL(request.url);
    const pageParam = searchParams.get('page');

    if (pageParam) {
      // KASUS 1: Ada parameter 'page' (untuk halaman Histori)
      const page = parseInt(pageParam) || 1;
      const itemsPerPage = 10;
      const offset = (page - 1) * itemsPerPage;

      const countStmt = db.prepare("SELECT COUNT(*) as total FROM market_sounding_logs");
      const { results: countResult } = await countStmt.all();
      const totalItems = countResult[0].total;
      const totalPages = Math.ceil(totalItems / itemsPerPage);

      const dataStmt = db.prepare(
        "SELECT * FROM market_sounding_logs ORDER BY tanggal DESC LIMIT ? OFFSET ?"
      ).bind(itemsPerPage, offset);
      const { results: items } = await dataStmt.all();
      
      return NextResponse.json({
        items: items,
        totalItems: totalItems,
        page: page,
        totalPages: totalPages
      });

    } else {
      // KASUS 2: Tidak ada parameter 'page' (untuk dropdown Analisa)
      // Ambil SEMUA data event
      const dataStmt = db.prepare("SELECT id, tanggal, balai, wilayah, paket_pekerjaan FROM market_sounding_logs ORDER BY tanggal DESC");
      const { results: items } = await dataStmt.all();
      
      // Tetap kembalikan dalam format objek agar konsisten
      return NextResponse.json({ items: items });
    }
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// FUNGSI POST (Tidak berubah)
export async function POST(request) {
  try {
    const db = process.env.DB;
    const { 
      balai, wilayah, paket_pekerjaan, tanggal,
      kategori_1, kategori_2  
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

// FUNGSI DELETE (Tidak berubah)
export async function DELETE(request) {
  try {
    const db = process.env.DB;
    const { id, password } = await request.json();
    if (password !== "BatagorSimpangDago") {
      return NextResponse.json({ error: 'Password salah' }, { status: 401 });
    }
    if (!id) {
      return NextResponse.json({ error: 'ID event tidak ada' }, { status: 400 });
    }
    const stmt = db.prepare("DELETE FROM market_sounding_logs WHERE id = ?").bind(id);
    const { success } = await stmt.run();
    if (success) {
      return NextResponse.json({ message: 'Event berhasil dihapus' });
    } else {
      return NextResponse.json({ error: 'Gagal menghapus event' }, { status: 500 });
    }
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}