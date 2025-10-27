// Lokasi: src/app/api/run-comparison/route.js
export const runtime = 'edge';
import { NextResponse } from 'next/server';

/**
 * Helper function untuk membangun query SQL secara dinamis dan aman
 */
function buildDynamicQuery(baseSelect, mandatoryConditions, mandatoryParams, optionalParams = {}) {
  let conditions = [...mandatoryConditions];
  let params = [...mandatoryParams];

  // Tambahkan Kategori 1 jika ada
  if (optionalParams.kategori_1 && optionalParams.kategori_1.length > 0) {
    const k1Placeholders = optionalParams.kategori_1.map(() => '?').join(',');
    conditions.push(`kategori_1 IN (${k1Placeholders})`);
    params.push(...optionalParams.kategori_1);
  }

  // Tambahkan Kategori 2 jika ada
  if (optionalParams.kategori_2 && optionalParams.kategori_2.length > 0) {
    const k2Placeholders = optionalParams.kategori_2.map(() => '?').join(',');
    conditions.push(`kategori_2 IN (${k2Placeholders})`);
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
    
    // 1. Ambil detail event (termasuk parameter opsional) dari DB
    const eventStmt = db.prepare("SELECT * FROM market_sounding_logs WHERE id = ?");
    const eventResult = await eventStmt.bind(eventId).first();

    if (!eventResult) {
      return NextResponse.json({ error: 'Event market sounding tidak ditemukan.' }, { status: 404 });
    }

    // 2. Ekstrak parameter dari event
    const { 
      wilayah: provinsi, 
      tanggal: eventDate, 
      kategori_1: k1_json, 
      kategori_2: k2_json 
    } = eventResult;
    
    const optionalParams = {
      kategori_1: k1_json ? JSON.parse(k1_json) : [],
      kategori_2: k2_json ? JSON.parse(k2_json) : []
    };

    // 3. Hitung rentang tanggal
    const startDate = new Date(eventDate);
    const endDate = new Date(startDate);
    const daysToAddInt = parseInt(daysToAdd, 10);
    endDate.setDate(startDate.getDate() + daysToAddInt);
    
    const startDateString = startDate.toISOString().split('T')[0];
    const endDateString = endDate.toISOString().split('T')[0];

    // 4. Bangun query dinamis berdasarkan parameter event
    // Menggunakan DATE(last_update) sesuai file route.js yang Anda lampirkan
    
    // Query 'Before'
    const beforeMandatory = ['provinsi = ?', 'DATE(last_update) <= ?'];
    const beforeParams = [provinsi, startDateString];
    const { query: beforeQueryStr, params: beforeAllParams } = buildDynamicQuery(
      "SELECT nama_produk, perusahaan", 
      beforeMandatory, 
      beforeParams, 
      optionalParams
    );
    const beforeStmt = db.prepare(beforeQueryStr).bind(...beforeAllParams);

    // Query 'After'
    const afterMandatory = ['provinsi = ?', 'DATE(last_update) <= ?'];
    const afterParams = [provinsi, endDateString];
    const { query: afterQueryStr, params: afterAllParams } = buildDynamicQuery(
      "SELECT nama_produk, perusahaan",
      afterMandatory,
      afterParams,
      optionalParams
    );
    const afterStmt = db.prepare(afterQueryStr).bind(...afterAllParams);

    // 5. Jalankan batch query
    const [beforeResult, afterResult] = await db.batch([beforeStmt, afterStmt]);

    const beforeProducts = beforeResult.results.map(p => `${p.nama_produk}::${p.perusahaan}`);
    const afterProducts = afterResult.results.map(p => `${p.nama_produk}::${p.perusahaan}`);
    
    const beforeCount = beforeProducts.length;
    const afterCount = afterProducts.length;

    const beforeProductSet = new Set(beforeProducts);
    const newProducts = afterProducts
        .filter(p => !beforeProductSet.has(p))
        .map(p => {
            const [nama, perusahaan] = p.split('::');
            return { nama_produk: nama, perusahaan: perusahaan };
        });

    const response = {
      beforeCount,
      afterCount,
      change: afterCount - beforeCount,
      newProducts,
      startDate: startDateString,
      endDate: endDateString,
      daysCompared: daysToAddInt
    };

    return NextResponse.json(response);
  } catch (e) {
    console.error('API Error:', e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}