// Lokasi: src/app/api/run-comparison/route.js
export const runtime = 'edge';
import { NextResponse } from 'next/server';

/**
 * Helper function: Membangun query SQL secara dinamis untuk multi-filter
 */
function buildDynamicQuery(baseSelect, mandatoryConditions, mandatoryParams, optionalParams = {}) {
  let conditions = [...mandatoryConditions];
  let params = [...mandatoryParams];

  // 1. Filter Kota (Multi-Select)
  if (optionalParams.kota && optionalParams.kota.length > 0) {
    const ph = optionalParams.kota.map(() => '?').join(',');
    conditions.push(`kota IN (${ph})`);
    params.push(...optionalParams.kota);
  }

  // 2. Filter Kategori 1 (Multi-Select)
  if (optionalParams.kategori_1 && optionalParams.kategori_1.length > 0) {
    const ph = optionalParams.kategori_1.map(() => '?').join(',');
    conditions.push(`kategori_1 IN (${ph})`);
    params.push(...optionalParams.kategori_1);
  }

  // 3. Filter Kategori 2 (Multi-Select)
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

    // 1. Ambil Detail Event
    const eventStmt = db.prepare("SELECT * FROM market_sounding_logs WHERE id = ?");
    const eventResult = await eventStmt.bind(eventId).first();

    if (!eventResult) {
      return NextResponse.json({ error: 'Event tidak ditemukan.' }, { status: 404 });
    }

    const { 
      wilayah: wilayahRaw, 
      kota: kotaRaw, // Ambil data kota
      tanggal: eventDate, 
      kategori_1: k1_json, 
      kategori_2: k2_json 
    } = eventResult;
    
    // 2. Parsing Data JSON dari Database
    
    // Parsing Wilayah (Provinsi)
    let listProvinsi = [];
    try {
        // Cek apakah format JSON array atau string biasa (legacy data)
        const parsed = JSON.parse(wilayahRaw);
        listProvinsi = Array.isArray(parsed) ? parsed : [parsed];
    } catch (e) {
        // Jika gagal parse JSON, anggap string biasa
        listProvinsi = [wilayahRaw];
    }

    // Parsing Kota
    let listKota = [];
    try {
        if (kotaRaw) {
            const parsed = JSON.parse(kotaRaw);
            listKota = Array.isArray(parsed) ? parsed : [parsed];
        }
    } catch (e) { listKota = []; }

    // Parsing Kategori
    const optionalParams = {
      kota: listKota,
      kategori_1: k1_json ? JSON.parse(k1_json) : [],
      kategori_2: k2_json ? JSON.parse(k2_json) : []
    };

    // 3. Setup Tanggal Perbandingan
    const startDate = new Date(eventDate);
    const endDate = new Date(startDate);
    const daysToAddInt = parseInt(daysToAdd, 10);
    endDate.setDate(startDate.getDate() + daysToAddInt);
    
    const startDateString = startDate.toISOString().split('T')[0];
    const endDateString = endDate.toISOString().split('T')[0];
    
    // 4. Bangun Query SQL
    const selectFields = "SELECT nama_produk, perusahaan, product_link";
    
    // Buat placeholder untuk provinsi: (?,?,?)
    const provPlaceholders = listProvinsi.map(() => '?').join(',');
    
    // Kondisi Dasar: Provinsi ada di list DAN Tanggal <= X
    const baseCondition = `provinsi IN (${provPlaceholders}) AND DATE(last_update) <= ?`;
    
    // Parameter Dasar: [...Provinsi, Tanggal]
    const paramsBefore = [...listProvinsi, startDateString];
    const paramsAfter = [...listProvinsi, endDateString];

    // Generate Query "Before"
    const { query: beforeQueryStr, params: beforeAllParams } = buildDynamicQuery(
      selectFields, 
      [baseCondition], 
      paramsBefore, 
      optionalParams
    );
    const beforeStmt = db.prepare(beforeQueryStr).bind(...beforeAllParams);

    // Generate Query "After"
    const { query: afterQueryStr, params: afterAllParams } = buildDynamicQuery(
      selectFields,
      [baseCondition],
      paramsAfter,
      optionalParams
    );
    const afterStmt = db.prepare(afterQueryStr).bind(...afterAllParams);

    // 5. Eksekusi Batch Query
    const [beforeResult, afterResult] = await db.batch([beforeStmt, afterStmt]);

    // 6. Proses Hasil Analisis
    // Buat string unik untuk identifikasi produk (Nama + Perusahaan + Link)
    const createUniqueKey = (p) => `${p.nama_produk}::${p.perusahaan}::${p.product_link || ''}`;

    const beforeProducts = beforeResult.results.map(createUniqueKey);
    const afterProducts = afterResult.results.map(createUniqueKey);
    
    const beforeCount = beforeProducts.length;
    const afterCount = afterProducts.length;

    const beforeProductSet = new Set(beforeProducts);
    
    // Cari produk baru (yang ada di After tapi tidak ada di Before)
    const newProducts = afterProducts
        .filter(p => !beforeProductSet.has(p))
        .map(p => {
            const [nama, perusahaan, link] = p.split('::');
            return { nama_produk: nama, perusahaan: perusahaan, product_link: link };
        });

    // 7. Kirim Respons
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