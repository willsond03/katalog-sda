// Lokasi: src/app/api/run-comparison/route.js
export const runtime = 'edge';
import { NextResponse } from 'next/server';

/**
 * Helper function untuk membangun query SQL secara dinamis dan aman
 */
function buildDynamicQuery(baseSelect, mandatoryConditions, mandatoryParams, optionalParams = {}) {
  let conditions = [...mandatoryConditions];
  let params = [...mandatoryParams];
  if (optionalParams.kategori_1 && optionalParams.kategori_1.length > 0) {
    const k1Placeholders = optionalParams.kategori_1.map(() => '?').join(',');
    conditions.push(`kategori_1 IN (${k1Placeholders})`);
    params.push(...optionalParams.kategori_1);
  }
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
    
    const eventStmt = db.prepare("SELECT * FROM market_sounding_logs WHERE id = ?");
    const eventResult = await eventStmt.bind(eventId).first();

    if (!eventResult) {
      return NextResponse.json({ error: 'Event market sounding tidak ditemukan.' }, { status: 404 });
    }

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

    const startDate = new Date(eventDate);
    const endDate = new Date(startDate);
    const daysToAddInt = parseInt(daysToAdd, 10);
    endDate.setDate(startDate.getDate() + daysToAddInt);
    
    const startDateString = startDate.toISOString().split('T')[0];
    const endDateString = endDate.toISOString().split('T')[0];
    
    // --- PERBAIKAN 1: Tambahkan 'product_link' ke SELECT ---
    const selectFields = "SELECT nama_produk, perusahaan, product_link";

    const beforeMandatory = ['provinsi = ?', 'DATE(last_update) <= ?'];
    const beforeParams = [provinsi, startDateString];
    const { query: beforeQueryStr, params: beforeAllParams } = buildDynamicQuery(
      selectFields, 
      beforeMandatory, 
      beforeParams, 
      optionalParams
    );
    const beforeStmt = db.prepare(beforeQueryStr).bind(...beforeAllParams);

    const afterMandatory = ['provinsi = ?', 'DATE(last_update) <= ?'];
    const afterParams = [provinsi, endDateString];
    const { query: afterQueryStr, params: afterAllParams } = buildDynamicQuery(
      selectFields,
      afterMandatory,
      afterParams,
      optionalParams
    );
    const afterStmt = db.prepare(afterQueryStr).bind(...afterAllParams);

    const [beforeResult, afterResult] = await db.batch([beforeStmt, afterStmt]);

    // --- PERBAIKAN 2: Gabungkan link ke dalam string unik ---
    const beforeProducts = beforeResult.results.map(p => `${p.nama_produk}::${p.perusahaan}::${p.product_link || ''}`);
    const afterProducts = afterResult.results.map(p => `${p.nama_produk}::${p.perusahaan}::${p.product_link || ''}`);
    
    const beforeCount = beforeProducts.length;
    const afterCount = afterProducts.length;

    const beforeProductSet = new Set(beforeProducts);
    
    // --- PERBAIKAN 3: Ekstrak link saat memetakan produk baru ---
    const newProducts = afterProducts
        .filter(p => !beforeProductSet.has(p))
        .map(p => {
            const [nama, perusahaan, link] = p.split('::');
            return { nama_produk: nama, perusahaan: perusahaan, product_link: link };
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