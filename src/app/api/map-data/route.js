// File: src/app/api/map-data/route.js
export const runtime = 'edge';
import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const db = process.env.DB;

    // Query ini menghitung jumlah produk dan mengelompokkannya per provinsi
    const stmt = db.prepare("SELECT provinsi, COUNT(*) as total FROM produk WHERE provinsi IS NOT NULL GROUP BY provinsi");
    const { results } = await stmt.all();

    // Ubah hasil array menjadi objek sederhana agar mudah digunakan di frontend
    // Contoh: { "JAWA BARAT": 500, "ACEH": 150 }
    const provinceCounts = results.reduce((acc, row) => {
      // Pastikan nama provinsi di-uppercase agar cocok dengan data GeoJSON
      if (row.provinsi) {
        acc[row.provinsi.toUpperCase()] = row.total;
      }
      return acc;
    }, {});

    return NextResponse.json(provinceCounts);
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}