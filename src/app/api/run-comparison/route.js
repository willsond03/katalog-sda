// Lokasi: src/app/api/run-comparison/route.js
export const runtime = 'edge';
import { NextResponse } from 'next/server';

/**
 * Helper untuk query dinamis
 */
function buildDynamicQuery(baseSelect, mandatoryConditions, mandatoryParams, optionalParams = {}) {
  let conditions = [...mandatoryConditions];
  let params = [...mandatoryParams];

  if (optionalParams.kategori_1 && optionalParams.kategori_1.length > 0) {
    const ph = optionalParams.kategori_1.map(() => '?').join(',');
    conditions.push(`kategori_1 IN (${ph})`);
    params.push(...optionalParams.kategori_1);
  }
  if (optionalParams.kategori_2 && optionalParams.kategori_2.length > 0) {
    const ph = optionalParams.kategori_2.map(() => '?').join(',');
    conditions.push(`kategori_2 IN (${ph})`);
    params.push(...optionalParams.kategori_2);
  }

  const query = `${baseSelect} FROM produk WHERE ${conditions.join(' AND ')}`;
  return { query, params };
}

export async function POST(request) {
  try {
    const db = process.env.DB;
    const { eventId, daysToAdd } = await request.json();

    if (!eventId || !daysToAdd) {
      return NextResponse.json({ error: 'Parameter tidak lengkap.' }, { status: 400 });
    }

    const eventStmt = db.prepare("SELECT * FROM market_sounding_logs WHERE id = ?");
    const eventResult = await eventStmt.bind(eventId).first();

    if (!eventResult) {
      return NextResponse.json({ error: 'Event tidak ditemukan.' }, { status: 404 });
    }

    // 1. Parse Data Event
    let { wilayah: wilayahRaw, tanggal: eventDate, kategori_1: k1_json, kategori_2: k2_json } = eventResult;
    
    // 2. Handle Wilayah (bisa JSON array atau string biasa dari data lama)
    let listProvinsi = [];
    try {
        // Coba parse sebagai JSON
        const parsed = JSON.parse(wilayahRaw);
        if (Array.isArray(parsed)) {
            listProvinsi = parsed;
        } else {
            // Jika parse berhasil tapi bukan array (jarang terjadi), jadikan array
            listProvinsi = [parsed];
        }
    } catch (e) {
        // Jika gagal parse (berarti data lama format string biasa "ACEH"), masukkan langsung
        listProvinsi = [wilayahRaw];
    }

    const optionalParams = {
      kategori_1: k1_json ? JSON.parse(k1_json) : [],
      kategori_2: k2_json ? JSON.parse(k2_json) : []
    };

    // 3. Setup Tanggal
    const startDate = new Date(eventDate);
    const endDate = new Date(startDate);
    const daysToAddInt = parseInt(daysToAdd, 10);
    endDate.setDate(startDate.getDate() + daysToAddInt);
    const startDateString = startDate.toISOString().split('T')[0];
    const endDateString = endDate.toISOString().split('T')[0];
    
    // 4. Bangun Query dengan IN (...) untuk provinsi
    const selectFields = "SELECT nama_produk, perusahaan, product_link";
    
    // Buat placeholder (?,?,?) sejumlah provinsi
    const provPlaceholders = listProvinsi.map(() => '?').join(',');
    
    // Kondisi dasar: Provinsi ada di list DAN tanggal sesuai
    const baseCondition = `provinsi IN (${provPlaceholders}) AND DATE(last_update) <= ?`;
    
    // Parameter dasar: [...listProvinsi, tanggal]
    const paramsBefore = [...listProvinsi, startDateString];
    const paramsAfter = [...listProvinsi, endDateString];

    // Generate Query Lengkap
    const { query: beforeQueryStr, params: beforeAllParams } = buildDynamicQuery(
      selectFields, 
      [baseCondition], 
      paramsBefore, 
      optionalParams
    );
    const beforeStmt = db.prepare(beforeQueryStr).bind(...beforeAllParams);

    const { query: afterQueryStr, params: afterAllParams } = buildDynamicQuery(
      selectFields,
      [baseCondition],
      paramsAfter,
      optionalParams
    );
    const afterStmt = db.prepare(afterQueryStr).bind(...afterAllParams);

    // 5. Eksekusi
    const [beforeResult, afterResult] = await db.batch([beforeStmt, afterStmt]);

    // 6. Proses Hasil (Sama seperti sebelumnya)
    const beforeProducts = beforeResult.results.map(p => `${p.nama_produk}::${p.perusahaan}::${p.product_link || ''}`);
    const afterProducts = afterResult.results.map(p => `${p.nama_produk}::${p.perusahaan}::${p.product_link || ''}`);
    
    const beforeCount = beforeProducts.length;
    const afterCount = afterProducts.length;

    const beforeProductSet = new Set(beforeProducts);
    
    const newProducts = afterProducts
        .filter(p => !beforeProductSet.has(p))
        .map(p => {
            const [nama, perusahaan, link] = p.split('::');
            return { nama_produk: nama, perusahaan: perusahaan, product_link: link };
        });

    return NextResponse.json({
      beforeCount,
      afterCount,
      change: afterCount - beforeCount,
      newProducts,
      startDate: startDateString,
      endDate: endDateString,
      daysCompared: daysToAddInt
    });

  } catch (e) {
    console.error('API Error:', e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}