// Lokasi: src/app/api/market-sounding/route.js
export const runtime = 'edge';
import { NextResponse } from 'next/server';

// --- FUNGSI GET DIPERBARUI UNTUK PAGINASI ---
export async function GET(request) {
  try {
    const db = process.env.DB;
    const { searchParams } = new URL(request.url);

    const page = parseInt(searchParams.get('page')) || 1;
    const itemsPerPage = 10; // Sesuai permintaan Anda
    const offset = (page - 1) * itemsPerPage;

    // 1. Query untuk menghitung total item
    const countStmt = db.prepare("SELECT COUNT(*) as total FROM market_sounding_logs");
    const { results: countResult } = await countStmt.all();
    const totalItems = countResult[0].total;
    const totalPages = Math.ceil(totalItems / itemsPerPage);

    // 2. Query untuk mengambil data per halaman
    const dataStmt = db.prepare(
      "SELECT * FROM market_sounding_logs ORDER BY tanggal DESC LIMIT ? OFFSET ?"
    ).bind(itemsPerPage, offset);
    const { results: items } = await dataStmt.all();
    
    // 3. Kembalikan objek terstruktur
    const response = {
      items: items,
      totalItems: totalItems,
      page: page,
      totalPages: totalPages
    };

    return NextResponse.json(response);
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

// FUNGSI UNTUK HAPUS DATA (METHOD DELETE)
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