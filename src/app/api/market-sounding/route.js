// Lokasi: src/app/api/market-sounding/route.js
export const runtime = 'edge';
import { NextResponse } from 'next/server';

// --- METHOD GET: MENANGANI 2 KASUS (PAGINASI & DROPDOWN) ---
export async function GET(request) {
  try {
    const db = process.env.DB;
    const { searchParams } = new URL(request.url);
    const pageParam = searchParams.get('page');

    if (pageParam) {
      // KASUS 1: Mode Paginasi (Untuk Halaman Histori)
      const page = parseInt(pageParam) || 1;
      const itemsPerPage = 10;
      const offset = (page - 1) * itemsPerPage;

      // Hitung total data
      const countStmt = db.prepare("SELECT COUNT(*) as total FROM market_sounding_logs");
      const { results: countResult } = await countStmt.all();
      const totalItems = countResult[0].total;
      const totalPages = Math.ceil(totalItems / itemsPerPage);

      // Ambil data per halaman
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
      // KASUS 2: Mode List Semua (Untuk Dropdown di Halaman Analisa)
      const dataStmt = db.prepare("SELECT id, tanggal, balai, wilayah, paket_pekerjaan FROM market_sounding_logs ORDER BY tanggal DESC");
      const { results: items } = await dataStmt.all();
      
      return NextResponse.json({ items: items });
    }
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// --- METHOD POST: SIMPAN DATA BARU (SUPPORT MULTI-SELECT) ---
export async function POST(request) {
  try {
    const db = process.env.DB;
    const { 
      balai, wilayah, kota, // 'kota' adalah field baru
      paket_pekerjaan, tanggal,
      kategori_1, kategori_2  
    } = await request.json();

    // Validasi Mandatory (Kota opsional, jadi tidak dicek di sini)
    if (!balai || !wilayah || !paket_pekerjaan || !tanggal) {
        return NextResponse.json({ error: 'Parameter mandatory tidak lengkap.' }, { status: 400 });
    }

    // Konversi Array ke JSON String agar bisa disimpan di SQLite
    // Contoh: ["ACEH", "SUMUT"] -> '["ACEH","SUMUT"]'
    const wilayahStr = Array.isArray(wilayah) ? JSON.stringify(wilayah) : JSON.stringify([wilayah]);
    
    // Handle kota (bisa null/undefined, jadi default ke empty array string)
    const kotaStr = Array.isArray(kota) ? JSON.stringify(kota) : JSON.stringify(kota ? [kota] : []);
    
    const k1Str = JSON.stringify(kategori_1 || []);
    const k2Str = JSON.stringify(kategori_2 || []);

    // Simpan ke Database
    const stmt = db.prepare(
      "INSERT INTO market_sounding_logs (balai, wilayah, kota, paket_pekerjaan, tanggal, kategori_1, kategori_2) VALUES (?, ?, ?, ?, ?, ?, ?)"
    ).bind(balai, wilayahStr, kotaStr, paket_pekerjaan, tanggal, k1Str, k2Str);

    await stmt.run();
    return NextResponse.json({ message: 'Data berhasil disimpan' });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// --- METHOD DELETE: HAPUS DATA (DENGAN PASSWORD) ---
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