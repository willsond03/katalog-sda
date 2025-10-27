// Lokasi: src/components/Map.js
'use client';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
import { useEffect } from 'react';
import L from 'leaflet'; // Import L untuk Legend
import 'leaflet/dist/leaflet.css'; // Impor CSS Leaflet di sini

const MapResizer = () => { /* ... (Kode tidak berubah dari file Anda) ... */ };

// --- DATA KOORDINAT (DARI FILE ANDA) ---
const indonesiaGeoJson = { "type": "FeatureCollection", "features": [{ "type": "Feature", "properties": { "name": "ACEH" }, "geometry": { "type": "Point", "coordinates": [96.92, 4.22] } }, { "type": "Feature", "properties": { "name": "SUMATERA UTARA" }, "geometry": { "type": "Point", "coordinates": [99.5, 2.5] } }, { "type": "Feature", "properties": { "name": "SUMATERA BARAT" }, "geometry": { "type": "Point", "coordinates": [100.47, -0.74] } }, { "type": "Feature", "properties": { "name": "RIAU" }, "geometry": { "type": "Point", "coordinates": [101.69, 0.51] } }, { "type": "Feature", "properties": { "name": "JAMBI" }, "geometry": { "type": "Point", "coordinates": [102.73, -1.61] } }, { "type": "Feature", "properties": { "name": "SUMATERA SELATAN" }, "geometry": { "type": "Point", "coordinates": [104.09, -3.32] } }, { "type": "Feature", "properties": { "name": "BENGKULU" }, "geometry": { "type": "Point", "coordinates": [102.34, -3.8] } }, { "type": "Feature", "properties": { "name": "LAMPUNG" }, "geometry": { "type": "Point", "coordinates": [105.02, -4.89] } }, { "type": "Feature", "properties": { "name": "KEPULAUAN BANGKA BELITUNG" }, "geometry": { "type": "Point", "coordinates": [106.51, -2.74] } }, { "type": "Feature", "properties": { "name": "KEPULAUAN RIAU" }, "geometry": { "type": "Point", "coordinates": [104.51, 0.92] } }, { "type": "Feature", "properties": { "name": "DKI JAKARTA" }, "geometry": { "type": "Point", "coordinates": [106.82, -6.21] } }, { "type": "Feature", "properties": { "name": "JAWA BARAT" }, "geometry": { "type": "Point", "coordinates": [107.62, -6.92] } }, { "type": "Feature", "properties": { "name": "JAWA TENGAH" }, "geometry": { "type": "Point", "coordinates": [110.2, -7.26] } }, { "type": "Feature", "properties": { "name": "DAERAH ISTIMEWA YOGYAKARTA" }, "geometry": { "type": "Point", "coordinates": [110.45, -7.87] } }, { "type": "Feature", "properties": { "name": "JAWA TIMUR" }, "geometry": { "type": "Point", "coordinates": [112.73, -7.54] } }, { "type": "Feature", "properties": { "name": "BANTEN" }, "geometry": { "type": "Point", "coordinates": [106.15, -6.44] } }, { "type": "Feature", "properties": { "name": "BALI" }, "geometry": { "type": "Point", "coordinates": [115.19, -8.41] } }, { "type": "Feature", "properties": { "name": "NUSA TENGGARA BARAT" }, "geometry": { "type": "Point", "coordinates": [117.56, -8.65] } }, { "type": "Feature", "properties": { "name": "NUSA TENGGARA TIMUR" }, "geometry": { "type": "Point", "coordinates": [121.08, -8.68] } }, { "type": "Feature", "properties": { "name": "KALIMANTAN BARAT" }, "geometry": { "type": "Point", "coordinates": [111.12, -0.02] } }, { "type": "Feature", "properties": { "name": "KALIMANTAN TENGAH" }, "geometry": { "type": "Point", "coordinates": [113.28, -1.69] } }, { "type": "Feature", "properties": { "name": "KALIMANTAN SELATAN" }, "geometry": { "type": "Point", "coordinates": [115.45, -3.09] } }, { "type": "Feature", "properties": { "name": "KALIMANTAN TIMUR" }, "geometry": { "type": "Point", "coordinates": [116.42, 0.58] } }, { "type": "Feature", "properties": { "name": "KALIMANTAN UTARA" }, "geometry": { "type": "Point", "coordinates": [116.47, 3.08] } }, { "type": "Feature", "properties": { "name": "SULAWESI UTARA" }, "geometry": { "type": "Point", "coordinates": [124.57, 1.34] } }, { "type": "Feature", "properties": { "name": "SULAWESI TENGAH" }, "geometry": { "type": "Point", "coordinates": [121.2, -1.4] } }, { "type": "Feature", "properties": { "name": "SULAWESI SELATAN" }, "geometry": { "type": "Point", "coordinates": [120.16, -4.14] } }, { "type": "Feature", "properties": { "name": "SULAWESI TENGGARA" }, "geometry": { "type": "Point", "coordinates": [122.07, -4.14] } }, { "type": "Feature", "properties": { "name": "GORONTALO" }, "geometry": { "type": "Point", "coordinates": [122.45, 0.7] } }, { "type": "Feature", "properties": { "name": "SULAWESI BARAT" }, "geometry": { "type": "Point", "coordinates": [119.35, -2.6] } }, { "type": "Feature", "properties": { "name": "MALUKU" }, "geometry": { "type": "Point", "coordinates": [129.41, -3.24] } }, { "type": "Feature", "properties": { "name": "MALUKU UTARA" }, "geometry": { "type": "Point", "coordinates": [127.53, 0.78] } }, { "type": "Feature", "properties": { "name": "PAPUA BARAT" }, "geometry": { "type": "Point", "coordinates": [132.96, -1.34] } }, { "type": "Feature", "properties": { "name": "PAPUA" }, "geometry": { "type": "Point", "coordinates": [138.8, -4.5] } }, { "type": "Feature", "properties": { "name": "PAPUA TENGAH" }, "geometry": { "type": "Point", "coordinates": [136.2, -4] } }, { "type": "Feature", "properties": { "name": "PAPUA PEGUNUNGAN" }, "geometry": { "type": "Point", "coordinates": [139.5, -4.3] } }, { "type": "Feature", "properties": { "name": "PAPUA SELATAN" }, "geometry": { "type": "Point", "coordinates": [139.5, -7] } }, { "type": "Feature", "properties": { "name": "PAPUA BARAT DAYA" }, "geometry": { "type": "Point", "coordinates": [131.5, -1] } }] };

// --- 1. KOORDINAT BARU KAB/KOTA (SAMPEL) ---
// **PENTING**: Anda harus melengkapi daftar ini secara manual 
// berdasarkan daftar yang Anda berikan.
// Lokasi: src/components/Map.js (Ganti objek kabKotaGeoJson yang lama dengan ini)

const kabKotaGeoJson = {
  "type": "FeatureCollection",
  "features": [
    { "type": "Feature", "properties": { "name": "KAB. BANJAR" }, "geometry": { "type": "Point", "coordinates": [115.0000, -3.2500] } },
    { "type": "Feature", "properties": { "name": "KAB. BULUNGAN" }, "geometry": { "type": "Point", "coordinates": [117.3853, 2.7240] } },
    { "type": "Feature", "properties": { "name": "KAB. TANGERANG" }, "geometry": { "type": "Point", "coordinates": [106.6300, -6.1783] } },
    { "type": "Feature", "properties": { "name": "KOTA SURABAYA" }, "geometry": { "type": "Point", "coordinates": [112.7521, -7.2575] } },
    { "type": "Feature", "properties": { "name": "KAB. TANAH BUMBU" }, "geometry": { "type": "Point", "coordinates": [115.7500, -3.4500] } },
    { "type": "Feature", "properties": { "name": "KAB. PADANG PARIAMAN" }, "geometry": { "type": "Point", "coordinates": [100.1833, -0.6167] } },
    { "type": "Feature", "properties": { "name": "KAB. PROBOLINGGO" }, "geometry": { "type": "Point", "coordinates": [113.2167, -7.7500] } },
    { "type": "Feature", "properties": { "name": "KAB. MANDAILING NATAL" }, "geometry": { "type": "Point", "coordinates": [99.5000, 0.7500] } },
    { "type": "Feature", "properties": { "name": "KOTA BANDA ACEH" }, "geometry": { "type": "Point", "coordinates": [95.3238, 5.5539] } },
    { "type": "Feature", "properties": { "name": "KOTA MEDAN" }, "geometry": { "type": "Point", "coordinates": [98.6722, 3.5952] } },
    { "type": "Feature", "properties": { "name": "KAB. PASAMAN BARAT" }, "geometry": { "type": "Point", "coordinates": [99.7500, 0.5000] } },
    { "type": "Feature", "properties": { "name": "KOTA PADANG" }, "geometry": { "type": "Point", "coordinates": [100.3543, -0.9471] } },
    { "type": "Feature", "properties": { "name": "KOTA JAYAPURA" }, "geometry": { "type": "Point", "coordinates": [140.7167, -2.5333] } },
    { "type": "Feature", "properties": { "name": "KOTA PONTIANAK" }, "geometry": { "type": "Point", "coordinates": [109.3333, -0.0167] } },
    { "type": "Feature", "properties": { "name": "KOTA MAKASSAR" }, "geometry": { "type": "Point", "coordinates": [119.4327, -5.1477] } },
    { "type": "Feature", "properties": { "name": "KOTA BUKITTINGGI" }, "geometry": { "type": "Point", "coordinates": [100.3667, -0.3000] } },
    { "type": "Feature", "properties": { "name": "KOTA PARIAMAN" }, "geometry": { "type": "Point", "coordinates": [100.1167, -0.6167] } },
    { "type": "Feature", "properties": { "name": "KOTA PAYAKUMBUH" }, "geometry": { "type": "Point", "coordinates": [100.6333, -0.2167] } },
    { "type": "Feature", "properties": { "name": "KAB. AGAM" }, "geometry": { "type": "Point", "coordinates": [100.0000, -0.2500] } },
    { "type": "Feature", "properties": { "name": "KAB. SOLOK SELATAN" }, "geometry": { "type": "Point", "coordinates": [101.4000, -1.2000] } },
    { "type": "Feature", "properties": { "name": "KAB. BONE" }, "geometry": { "type": "Point", "coordinates": [120.3333, -4.5333] } },
    { "type": "Feature", "properties": { "name": "KAB. BULUKUMBA" }, "geometry": { "type": "Point", "coordinates": [120.1667, -5.3333] } },
    { "type": "Feature", "properties": { "name": "KAB. WAJO" }, "geometry": { "type": "Point", "coordinates": [120.0333, -4.0833] } },
    { "type": "Feature", "properties": { "name": "KAB. BANGKA" }, "geometry": { "type": "Point", "coordinates": [105.9167, -1.8333] } },
    { "type": "Feature", "properties": { "name": "KOTA MATARAM" }, "geometry": { "type": "Point", "coordinates": [116.1167, -8.5833] } },
    { "type": "Feature", "properties": { "name": "KAB. CIANJUR" }, "geometry": { "type": "Point", "coordinates": [107.1333, -6.8167] } },
    { "type": "Feature", "properties": { "name": "KAB. NGANJUK" }, "geometry": { "type": "Point", "coordinates": [111.9000, -7.6000] } },
    { "type": "Feature", "properties": { "name": "KAB. SUMEDANG" }, "geometry": { "type": "Point", "coordinates": [107.9167, -6.8500] } },
    { "type": "Feature", "properties": { "name": "KAB. KAMPAR" }, "geometry": { "type": "Point", "coordinates": [101.0000, 0.5000] } },
    { "type": "Feature", "properties": { "name": "KAB. PANDEGLANG" }, "geometry": { "type": "Point", "coordinates": [106.1000, -6.3167] } },
    { "type": "Feature", "properties": { "name": "KOTA BANDUNG" }, "geometry": { "type": "Point", "coordinates": [107.6186, -6.9039] } },
    { "type": "Feature", "properties": { "name": "KAB. PESISIR SELATAN" }, "geometry": { "type": "Point", "coordinates": [100.8000, -1.5000] } },
    { "type": "Feature", "properties": { "name": "KAB. KEBUMEN" }, "geometry": { "type": "Point", "coordinates": [109.6667, -7.6667] } },
    { "type": "Feature", "properties": { "name": "KAB. WONOSOBO" }, "geometry": { "type": "Point", "coordinates": [109.9000, -7.3667] } },
    { "type": "Feature", "properties": { "name": "KAB. KAPUAS" }, "geometry": { "type": "Point", "coordinates": [114.3833, -3.0000] } },
    { "type": "Feature", "properties": { "name": "KAB. KUANTAN SINGINGI" }, "geometry": { "type": "Point", "coordinates": [101.5333, -0.5000] } },
    { "type": "Feature", "properties": { "name": "KAB. MINAHASA UTARA" }, "geometry": { "type": "Point", "coordinates": [124.9667, 1.4333] } },
    { "type": "Feature", "properties": { "name": "KAB. KOTAWARINGIN TIMUR" }, "geometry": { "type": "Point", "coordinates": [112.7500, -2.0833] } },
    { "type": "Feature", "properties": { "name": "KAB. BADUNG" }, "geometry": { "type": "Point", "coordinates": [115.1667, -8.5000] } },
    { "type": "Feature", "properties": { "name": "KAB. TOBA" }, "geometry": { "type": "Point", "coordinates": [99.1667, 2.3333] } },
    { "type": "Feature", "properties": { "name": "KAB. KEPULAUAN ANAMBAS" }, "geometry": { "type": "Point", "coordinates": [106.0000, 3.0000] } },
    { "type": "Feature", "properties": { "name": "KAB. PINRANG" }, "geometry": { "type": "Point", "coordinates": [119.5000, -3.7500] } },
    { "type": "Feature", "properties": { "name": "KOTA BALIKPAPAN" }, "geometry": { "type": "Point", "coordinates": [116.8289, -1.2653] } },
    { "type": "Feature", "properties": { "name": "KOTA DEPOK" }, "geometry": { "type": "Point", "coordinates": [106.8242, -6.3939] } },
    { "type": "Feature", "properties": { "name": "KOTA SUKABUMI" }, "geometry": { "type": "Point", "coordinates": [106.9167, -6.9167] } },
    { "type": "Feature", "properties": { "name": "KAB. ROKAN HULU" }, "geometry": { "type": "Point", "coordinates": [100.5000, 1.0000] } },
    { "type": "Feature", "properties": { "name": "KAB. MADIUN" }, "geometry": { "type": "Point", "coordinates": [111.6667, -7.6333] } },
    { "type": "Feature", "properties": { "name": "KOTA BANJARMASIN" }, "geometry": { "type": "Point", "coordinates": [114.5900, -3.3167] } },
    { "type": "Feature", "properties": { "name": "KOTA TARAKAN" }, "geometry": { "type": "Point", "coordinates": [117.5833, 3.3000] } },
    { "type": "Feature", "properties": { "name": "KOTA PALANGKA RAYA" }, "geometry": { "type": "Point", "coordinates": [113.9167, -2.2000] } },
    { "type": "Feature", "properties": { "name": "KOTA MALANG" }, "geometry": { "type": "Point", "coordinates": [112.6300, -7.9786] } },
    { "type": "Feature", "properties": { "name": "KAB. SIDOARJO" }, "geometry": { "type": "Point", "coordinates": [112.7167, -7.4500] } },
    { "type": "Feature", "properties": { "name": "KAB. KEPULAUAN SELAYAR" }, "geometry": { "type": "Point", "coordinates": [120.5000, -6.5000] } },
    { "type": "Feature", "properties": { "name": "KAB. SLEMAN" }, "geometry": { "type": "Point", "coordinates": [110.3667, -7.7000] } },
    { "type": "Feature", "properties": { "name": "KAB. JAYAPURA" }, "geometry": { "type": "Point", "coordinates": [140.0000, -3.0000] } },
    { "type": "Feature", "properties": { "name": "KOTA ADM. JAKARTA PUSAT" }, "geometry": { "type": "Point", "coordinates": [106.8272, -6.1754] } },
    { "type": "Feature", "properties": { "name": "KAB. BANYUMAS" }, "geometry": { "type": "Point", "coordinates": [109.2500, -7.4167] } },
    { "type": "Feature", "properties": { "name": "KOTA ADM. JAKARTA SELATAN" }, "geometry": { "type": "Point", "coordinates": [106.8167, -6.2500] } },
    { "type": "Feature", "properties": { "name": "KOTA BEKASI" }, "geometry": { "type": "Point", "coordinates": [106.9925, -6.2347] } },
    { "type": "Feature", "properties": { "name": "KOTA BANJARBARU" }, "geometry": { "type": "Point", "coordinates": [114.8333, -3.4333] } },
    { "type": "Feature", "properties": { "name": "KAB. BANDUNG" }, "geometry": { "type": "Point", "coordinates": [107.6667, -7.0167] } },
    { "type": "Feature", "properties": { "name": "KOTA SERANG" }, "geometry": { "type": "Point", "coordinates": [106.1500, -6.1167] } },
    { "type": "Feature", "properties": { "name": "KOTA ADM. JAKARTA BARAT" }, "geometry": { "type": "Point", "coordinates": [106.7500, -6.1667] } },
    { "type": "Feature", "properties": { "name": "KOTA ADM. JAKARTA TIMUR" }, "geometry": { "type": "Point", "coordinates": [106.9000, -6.2333] } },
    { "type": "Feature", "properties": { "name": "KAB. DHARMASRAYA" }, "geometry": { "type": "Point", "coordinates": [101.3667, -1.0000] } },
    { "type": "Feature", "properties": { "name": "KAB. SIJUNJUNG" }, "geometry": { "type": "Point", "coordinates": [100.9500, -0.6833] } },
    { "type": "Feature", "properties": { "name": "KOTA KENDARI" }, "geometry": { "type": "Point", "coordinates": [122.5167, -3.9833] } },
    { "type": "Feature", "properties": { "name": "KAB. BANTAENG" }, "geometry": { "type": "Point", "coordinates": [120.0000, -5.5000] } },
    { "type": "Feature", "properties": { "name": "KAB. GRESIK" }, "geometry": { "type": "Point", "coordinates": [112.6500, -7.1667] } },
    { "type": "Feature", "properties": { "name": "KAB. BULELENG" }, "geometry": { "type": "Point", "coordinates": [115.0833, -8.1167] } },
    { "type": "Feature", "properties": { "name": "KOTA PALEMBANG" }, "geometry": { "type": "Point", "coordinates": [104.7569, -2.9761] } },
    { "type": "Feature", "properties": { "name": "KAB. SORONG" }, "geometry": { "type": "Point", "coordinates": [131.2500, -0.8833] } },
    { "type": "Feature", "properties": { "name": "KAB. SIKKA" }, "geometry": { "type": "Point", "coordinates": [122.2167, -8.6667] } },
    { "type": "Feature", "properties": { "name": "KOTA PEKANBARU" }, "geometry": { "type": "Point", "coordinates": [101.4500, 0.5333] } },
    { "type": "Feature", "properties": { "name": "KAB. BOGOR" }, "geometry": { "type": "Point", "coordinates": [106.8000, -6.5833] } },
    { "type": "Feature", "properties": { "name": "KAB. SUKABUMI" }, "geometry": { "type": "Point", "coordinates": [106.9167, -6.9167] } },
    { "type": "Feature", "properties": { "name": "KAB. FLORES TIMUR" }, "geometry": { "type": "Point", "coordinates": [122.9667, -8.3000] } },
    { "type": "Feature", "properties": { "name": "KAB. ACEH BESAR" }, "geometry": { "type": "Point", "coordinates": [95.4167, 5.3333] } },
    { "type": "Feature", "properties": { "name": "KOTA PALU" }, "geometry": { "type": "Point", "coordinates": [119.8500, -0.8833] } },
    { "type": "Feature", "properties": { "name": "KAB. POHUWATO" }, "geometry": { "type": "Point", "coordinates": [121.7500, 0.7500] } },
    { "type": "Feature", "properties": { "name": "KOTA PANGKAL PINANG" }, "geometry": { "type": "Point", "coordinates": [106.1167, -2.1333] } },
    { "type": "Feature", "properties": { "name": "KAB. SIGI" }, "geometry": { "type": "Point", "coordinates": [120.0000, -1.3333] } },
    { "type": "Feature", "properties": { "name": "KAB. LUWU" }, "geometry": { "type": "Point", "coordinates": [120.1667, -3.4167] } },
    { "type": "Feature", "properties": { "name": "KOTA PEMATANGSIANTAR" }, "geometry": { "type": "Point", "coordinates": [99.0667, 2.9667] } },
    { "type": "Feature", "properties": { "name": "KAB. INDRAMAYU" }, "geometry": { "type": "Point", "coordinates": [108.3167, -6.3333] } },
    { "type": "Feature", "properties": { "name": "KAB. CIREBON" }, "geometry": { "type": "Point", "coordinates": [108.5500, -6.7167] } },
    { "type": "Feature", "properties": { "name": "KAB. PASURUAN" }, "geometry": { "type": "Point", "coordinates": [112.9000, -7.6500] } },
    { "type": "Feature", "properties": { "name": "KAB. HULU SUNGAI UTARA" }, "geometry": { "type": "Point", "coordinates": [115.1667, -2.4167] } },
    { "type": "Feature", "properties": { "name": "KAB. MAMUJU" }, "geometry": { "type": "Point", "coordinates": [118.8833, -2.6667] } },
    { "type": "Feature", "properties": { "name": "KAB. PASAMAN" }, "geometry": { "type": "Point", "coordinates": [100.0000, 0.5000] } },
    { "type": "Feature", "properties": { "name": "KOTA BANDAR LAMPUNG" }, "geometry": { "type": "Point", "coordinates": [105.2667, -5.4500] } },
    { "type": "Feature", "properties": { "name": "KAB. MESUJI" }, "geometry": { "type": "Point", "coordinates": [105.4000, -4.0833] } },
    { "type": "Feature", "properties": { "name": "KAB. GARUT" }, "geometry": { "type": "Point", "coordinates": [107.9000, -7.2000] } },
    { "type": "Feature", "properties": { "name": "KAB. TANAH DATAR" }, "geometry": { "type": "Point", "coordinates": [100.5667, -0.4500] } },
    { "type": "Feature", "properties": { "name": "KAB. MUNA BARAT" }, "geometry": { "type": "Point", "coordinates": [122.4667, -4.9667] } },
    { "type": "Feature", "properties": { "name": "KOTA KUPANG" }, "geometry": { "type": "Point", "coordinates": [123.5833, -10.1667] } },
    { "type": "Feature", "properties": { "name": "KOTA LANGSA" }, "geometry": { "type": "Point", "coordinates": [97.9667, 4.4667] } },
    { "type": "Feature", "properties": { "name": "KAB. SAMOSIR" }, "geometry": { "type": "Point", "coordinates": [98.7000, 2.6333] } },
    { "type": "Feature", "properties": { "name": "KAB. BUTON" }, "geometry": { "type": "Point", "coordinates": [122.6000, -5.3333] } },
    { "type": "Feature", "properties": { "name": "KAB. BIREUEN" }, "geometry": { "type": "Point", "coordinates": [96.6667, 5.0000] } },
    { "type": "Feature", "properties": { "name": "KAB. MAROS" }, "geometry": { "type": "Point", "coordinates": [119.5667, -5.0000] } },
    { "type": "Feature", "properties": { "name": "KAB. LUWU TIMUR" }, "geometry": { "type": "Point", "coordinates": [121.1667, -2.5833] } },
    { "type": "Feature", "properties": { "name": "KAB. KONAWE SELATAN" }, "geometry": { "type": "Point", "coordinates": [122.4167, -4.1667] } },
    { "type": "Feature", "properties": { "name": "KAB. SOLOK" }, "geometry": { "type": "Point", "coordinates": [100.6500, -0.7833] } },
    { "type": "Feature", "properties": { "name": "KAB. REJANG LEBONG" }, "geometry": { "type": "Point", "coordinates": [102.5333, -3.4667] } },
    { "type": "Feature", "properties": { "name": "KOTA PALOPO" }, "geometry": { "type": "Point", "coordinates": [120.1833, -3.0000] } },
    { "type": "Feature", "properties": { "name": "KOTA MANADO" }, "geometry": { "type": "Point", "coordinates": [124.8333, 1.4833] } },
    { "type": "Feature", "properties": { "name": "KOTA SOLOK" }, "geometry": { "type": "Point", "coordinates": [100.6500, -0.7833] } },
    { "type": "Feature", "properties": { "name": "KOTA PASURUAN" }, "geometry": { "type": "Point", "coordinates": [112.9000, -7.6500] } },
    { "type": "Feature", "properties": { "name": "KAB. TEGAL" }, "geometry": { "type": "Point", "coordinates": [109.1333, -6.8667] } },
    { "type": "Feature", "properties": { "name": "KOTA LUBUK LINGGAU" }, "geometry": { "type": "Point", "coordinates": [102.8500, -3.3000] } },
    { "type": "Feature", "properties": { "name": "KOTA MADIUN" }, "geometry": { "type": "Point", "coordinates": [111.5167, -7.6167] } },
    { "type": "Feature", "properties": { "name": "KAB. GOWA" }, "geometry": { "type": "Point", "coordinates": [119.6667, -5.3333] } },
    { "type": "Feature", "properties": { "name": "KAB. JENEPONTO" }, "geometry": { "type": "Point", "coordinates": [119.7500, -5.6667] } },
    { "type": "Feature", "properties": { "name": "KAB. SINJAI" }, "geometry": { "type": "Point", "coordinates": [120.2500, -5.2500] } },
    { "type": "Feature", "properties": { "name": "KOTA GORONTALO" }, "geometry": { "type": "Point", "coordinates": [123.0500, 0.5333] } },
    { "type": "Feature", "properties": { "name": "KOTA ADM. JAKARTA UTARA" }, "geometry": { "type": "Point", "coordinates": [106.8833, -6.1333] } },
    { "type": "Feature", "properties": { "name": "KAB. TAKALAR" }, "geometry": { "type": "Point", "coordinates": [119.4333, -5.4167] } },
    { "type": "Feature", "properties": { "name": "KAB. LOMBOK TIMUR" }, "geometry": { "type": "Point", "coordinates": [116.5000, -8.5000] } },
    { "type": "Feature", "properties": { "name": "KAB. SIMEULUE" }, "geometry": { "type": "Point", "coordinates": [96.0833, 2.5833] } },
    { "type": "Feature", "properties": { "name": "KAB. MUARO JAMBI" }, "geometry": { "type": "Point", "coordinates": [103.5833, -1.5833] } },
    { "type": "Feature", "properties": { "name": "KAB. NAGAN RAYA" }, "geometry": { "type": "Point", "coordinates": [96.5000, 4.3333] } },
    { "type": "Feature", "properties": { "name": "KAB. SERANG" }, "geometry": { "type": "Point", "coordinates": [106.1500, -6.1167] } },
    { "type": "Feature", "properties": { "name": "KAB. JOMBANG" }, "geometry": { "type": "Point", "coordinates": [112.2333, -7.5500] } },
    { "type": "Feature", "properties": { "name": "KAB. MAJALENGKA" }, "geometry": { "type": "Point", "coordinates": [108.2167, -6.8333] } },
    { "type": "Feature", "properties": { "name": "KOTA PROBOLINGGO" }, "geometry": { "type": "Point", "coordinates": [113.2167, -7.7500] } },
    { "type": "Feature", "properties": { "name": "KAB BEKASI" }, "geometry": { "type": "Point", "coordinates": [107.0833, -6.2333] } },
    { "type": "Feature", "properties": { "name": "KAB. TRENGGALEK" }, "geometry": { "type": "Point", "coordinates": [111.7167, -8.0667] } },
    { "type": "Feature", "properties": { "name": "KAB. LEBAK" }, "geometry": { "type": "Point", "coordinates": [106.2500, -6.5500] } },
    { "type": "Feature", "properties": { "name": "KAB. MAGETAN" }, "geometry": { "type": "Point", "coordinates": [111.3333, -7.6500] } },
    { "type": "Feature", "properties": { "name": "KAB. BANTUL" }, "geometry": { "type": "Point", "coordinates": [110.3333, -7.8833] } },
    { "type": "Feature", "properties": { "name": "KAB. PAMEKASAN" }, "geometry": { "type": "Point", "coordinates": [113.4833, -7.1500] } },
    { "type": "Feature", "properties": { "name": "KAB. MAGELANG" }, "geometry": { "type": "Point", "coordinates": [110.2167, -7.4667] } },
    { "type": "Feature", "properties": { "name": "KAB. KARANGANYAR" }, "geometry": { "type": "Point", "coordinates": [110.9500, -7.6000] } },
    { "type": "Feature", "properties": { "name": "KAB. GORONTALO" }, "geometry": { "type": "Point", "coordinates": [123.0500, 0.5333] } },
    { "type": "Feature", "properties": { "name": "KAB. GORONTALO UTARA" }, "geometry": { "type": "Point", "coordinates": [122.3333, 0.7500] } },
    { "type": "Feature", "properties": { "name": "KAB. GIANYAR" }, "geometry": { "type": "Point", "coordinates": [115.3167, -8.5333] } },
    { "type": "Feature", "properties": { "name": "KAB. MAJENE" }, "geometry": { "type": "Point", "coordinates": [118.9667, -3.5333] } },
    { "type": "Feature", "properties": { "name": "KAB. BOALEMO" }, "geometry": { "type": "Point", "coordinates": [122.3333, 0.5000] } },
    { "type": "Feature", "properties": { "name": "KAB. MOJOKERTO" }, "geometry": { "type": "Point", "coordinates": [112.4333, -7.4667] } },
    { "type": "Feature", "properties": { "name": "KOTA TANJUNG PINANG" }, "geometry": { "type": "Point", "coordinates": [104.4500, 0.9167] } },
    { "type": "Feature", "properties": { "name": "KOTA LHOKSEUMAWE" }, "geometry": { "type": "Point", "coordinates": [97.1500, 5.1833] } },
    { "type": "Feature", "properties": { "name": "KAB. MANOKWARI" }, "geometry": { "type": "Point", "coordinates": [134.0500, -0.8667] } },
    { "type": "Feature", "properties": { "name": "KOTA BATAM" }, "geometry": { "type": "Point", "coordinates": [104.0167, 1.0500] } },
    { "type": "Feature", "properties": { "name": "KAB. BLITAR" }, "geometry": { "type": "Point", "coordinates": [112.1667, -8.1000] } },
    { "type": "Feature", "properties": { "name": "KAB. BINTAN" }, "geometry": { "type": "Point", "coordinates": [104.4500, 0.9167] } },
    { "type": "Feature", "properties": { "name": "KAB. BANYUWANGI" }, "geometry": { "type": "Point", "coordinates": [114.3667, -8.2167] } },
    { "type": "Feature", "properties": { "name": "KAB. SEMARANG" }, "geometry": { "type": "Point", "coordinates": [110.4167, -7.1000] } },
    { "type": "Feature", "properties": { "name": "KAB. GROBOGAN" }, "geometry": { "type": "Point", "coordinates": [110.9167, -7.0833] } },
    { "type": "Feature", "properties": { "name": "KAB. SIMALUNGUN" }, "geometry": { "type": "Point", "coordinates": [99.0667, 2.9667] } },
    { "type": "Feature", "properties": { "name": "KOTA TANGERANG" }, "geometry": { "type": "Point", "coordinates": [106.6300, -6.1783] } },
    { "type": "Feature", "properties": { "name": "KAB. KUDUS" }, "geometry": { "type": "Point", "coordinates": [110.8333, -6.8167] } },
    { "type": "Feature", "properties": { "name": "KAB. BELITUNG" }, "geometry": { "type": "Point", "coordinates": [107.6333, -2.7500] } },
    { "type": "Feature", "properties": { "name": "KOTA SEMARANG" }, "geometry": { "type": "Point", "coordinates": [110.4167, -7.0000] } },
    { "type": "Feature", "properties": { "name": "KAB. KUTAI TIMUR" }, "geometry": { "type": "Point", "coordinates": [117.5000, 0.5000] } },
    { "type": "Feature", "properties": { "name": "KAB. PANGKAJENE KEPULAUAN" }, "geometry": { "type": "Point", "coordinates": [119.5500, -4.8333] } },
    { "type": "Feature", "properties": { "name": "KAB. BENGKALIS" }, "geometry": { "type": "Point", "coordinates": [102.0833, 1.4667] } },
    { "type": "Feature", "properties": { "name": "KOTA PADANG PANJANG" }, "geometry": { "type": "Point", "coordinates": [100.4000, -0.4667] } },
    { "type": "Feature", "properties": { "name": "KAB. PURWAKARTA" }, "geometry": { "type": "Point", "coordinates": [107.4500, -6.5500] } },
    { "type": "Feature", "properties": { "name": "KOTA SAMARINDA" }, "geometry": { "type": "Point", "coordinates": [117.1500, -0.5000] } },
    { "type": "Feature", "properties": { "name": "KOTA BAU BAU" }, "geometry": { "type": "Point", "coordinates": [122.6167, -5.4667] } },
    { "type": "Feature", "properties": { "name": "KAB. KARAWANG" }, "geometry": { "type": "Point", "coordinates": [107.3000, -6.3000] } },
    { "type": "Feature", "properties": { "name": "KOTA YOGYAKARTA" }, "geometry": { "type": "Point", "coordinates": [110.3667, -7.8000] } },
    { "type": "Feature", "properties": { "name": "KOTA AMBON" }, "geometry": { "type": "Point", "coordinates": [128.1667, -3.7000] } },
    { "type": "Feature", "properties": { "name": "KAB. ACEH UTARA" }, "geometry": { "type": "Point", "coordinates": [97.1500, 5.1833] } },
    { "type": "Feature", "properties": { "name": "KAB. ACEH TENGAH" }, "geometry": { "type": "Point", "coordinates": [96.8500, 4.6333] } },
    { "type": "Feature", "properties": { "name": "KAB. TOLI TOLI" }, "geometry": { "type": "Point", "coordinates": [120.8167, 1.0500] } },
    { "type": "Feature", "properties": { "name": "KAB. ENREKANG" }, "geometry": { "type": "Point", "coordinates": [119.7667, -3.5667] } },
    { "type": "Feature", "properties": { "name": "KOTA DENPASAR" }, "geometry": { "type": "Point", "coordinates": [115.2167, -8.6500] } },
    { "type": "Feature", "properties": { "name": "KAB. JEMBRANA" }, "geometry": { "type": "Point", "coordinates": [114.6667, -8.3500] } },
    { "type": "Feature", "properties": { "name": "KOTA PARE PARE" }, "geometry": { "type": "Point", "coordinates": [119.6167, -4.0167] } },
    { "type": "Feature", "properties": { "name": "KAB. KUBU RAYA" }, "geometry": { "type": "Point", "coordinates": [109.3333, -0.0167] } },
    { "type": "Feature", "properties": { "name": "KAB. SUKOHARJO" }, "geometry": { "type": "Point", "coordinates": [110.8333, -7.6833] } },
    { "type": "Feature", "properties": { "name": "KAB. JEPARA" }, "geometry": { "type": "Point", "coordinates": [110.6667, -6.5833] } },
    { "type": "Feature", "properties": { "name": "KOTA TASIKMALAYA" }, "geometry": { "type": "Point", "coordinates": [108.2167, -7.3333] } },
    { "type": "Feature", "properties": { "name": "KAB. KUPANG" }, "geometry": { "type": "Point", "coordinates": [123.5833, -10.1667] } },
    { "type": "Feature", "properties": { "name": "KOTA BANJAR" }, "geometry": { "type": "Point", "coordinates": [108.5333, -7.3667] } },
    { "type": "Feature", "properties": { "name": "KAB. BOJONEGORO" }, "geometry": { "type": "Point", "coordinates": [111.8833, -7.1500] } },
    { "type": "Feature", "properties": { "name": "KAB. KENDAL" }, "geometry": { "type": "Point", "coordinates": [110.1667, -7.0333] } },
    { "type": "Feature", "properties": { "name": "KAB. PANGANDARAN" }, "geometry": { "type": "Point", "coordinates": [108.6500, -7.6833] } },
    { "type": "Feature", "properties": { "name": "KAB. ACEH BARAT DAYA" }, "geometry": { "type": "Point", "coordinates": [96.8333, 3.8333] } },
    { "type": "Feature", "properties": { "name": "KAB. INDRAGIRI HULU" }, "geometry": { "type": "Point", "coordinates": [102.2667, -0.5000] } },
    { "type": "Feature", "properties": { "name": "KAB. PIDIE" }, "geometry": { "type": "Point", "coordinates": [95.9500, 5.3833] } },
    { "type": "Feature", "properties": { "name": "KAB. PATI" }, "geometry": { "type": "Point", "coordinates": [111.0333, -6.7500] } },
    { "type": "Feature", "properties": { "name": "KAB. PEKALONGAN" }, "geometry": { "type": "Point", "coordinates": [109.6667, -6.8833] } },
    { "type": "Feature", "properties": { "name": "KAB. KUNINGAN" }, "geometry": { "type": "Point", "coordinates": [108.4833, -6.9667] } },
    { "type": "Feature", "properties": { "name": "KOTA CIREBON" }, "geometry": { "type": "Point", "coordinates": [108.5500, -6.7167] } },
    { "type": "Feature", "properties": { "name": "KAB. BREBES" }, "geometry": { "type": "Point", "coordinates": [109.0333, -6.8667] } },
    { "type": "Feature", "properties": { "name": "KAB. MINAHASA" }, "geometry": { "type": "Point", "coordinates": [124.8333, 1.4833] } },
    { "type": "Feature", "properties": { "name": "KOTA TANGERANG SELATAN" }, "geometry": { "type": "Point", "coordinates": [106.7167, -6.2833] } },
    { "type": "Feature", "properties": { "name": "KAB. MALINAU" }, "geometry": { "type": "Point", "coordinates": [116.5333, 3.5833] } },
    { "type": "Feature", "properties": { "name": "KAB. MALANG" }, "geometry": { "type": "Point", "coordinates": [112.6300, -7.9786] } },
    { "type": "Feature", "properties": { "name": "KAB. TANAH LAUT" }, "geometry": { "type": "Point", "coordinates": [114.7500, -3.8333] } },
    { "type": "Feature", "properties": { "name": "KAB. BARITO KUALA" }, "geometry": { "type": "Point", "coordinates": [114.5000, -3.0000] } },
    { "type": "Feature", "properties": { "name": "KAB. KULON PROGO" }, "geometry": { "type": "Point", "coordinates": [110.1667, -7.8167] } },
    { "type": "Feature", "properties": { "name": "KAB. MANGGARAI BARAT" }, "geometry": { "type": "Point", "coordinates": [120.0000, -8.5000] } },
    { "type": "Feature", "properties": { "name": "KAB. LIMA PULUH KOTA" }, "geometry": { "type": "Point", "coordinates": [100.6333, -0.2167] } },
    { "type": "Feature", "properties": { "name": "KAB. CIAMIS" }, "geometry": { "type": "Point", "coordinates": [108.3500, -7.3333] } },
    { "type": "Feature", "properties": { "name": "KAB. BANDUNG BARAT" }, "geometry": { "type": "Point", "coordinates": [107.4167, -6.8333] } },
    { "type": "Feature", "properties": { "name": "KAB. TASIKMALAYA" }, "geometry": { "type": "Point", "coordinates": [108.2167, -7.3333] } },
    { "type": "Feature", "properties": { "name": "KOTA CIMAHI" }, "geometry": { "type": "Point", "coordinates": [107.5333, -6.8833] } },
    { "type": "Feature", "properties": { "name": "KAB. KARIMUN" }, "geometry": { "type": "Point", "coordinates": [103.4167, 1.0000] } },
    { "type": "Feature", "properties": { "name": "KOTA DUMAI" }, "geometry": { "type": "Point", "coordinates": [101.4500, 1.6667] } },
    { "type": "Feature", "properties": { "name": "KAB. LAMPUNG TENGAH" }, "geometry": { "type": "Point", "coordinates": [105.2667, -4.8500] } },
    { "type": "Feature", "properties": { "name": "KAB. LAMONGAN" }, "geometry": { "type": "Point", "coordinates": [112.4167, -7.1167] } },
    { "type": "Feature", "properties": { "name": "KAB. TABALONG" }, "geometry": { "type": "Point", "coordinates": [115.4167, -1.9167] } },
    { "type": "Feature", "properties": { "name": "KAB. KOTAWARINGIN BARAT" }, "geometry": { "type": "Point", "coordinates": [111.7500, -2.5000] } },
    { "type": "Feature", "properties": { "name": "KOTA BOGOR" }, "geometry": { "type": "Point", "coordinates": [106.8000, -6.5833] } },
    { "type": "Feature", "properties": { "name": "KAB. LINGGA" }, "geometry": { "type": "Point", "coordinates": [104.5833, -0.1667] } },
    { "type": "Feature", "properties": { "name": "KAB. SUMBA TIMUR" }, "geometry": { "type": "Point", "coordinates": [120.3333, -9.6667] } },
    { "type": "Feature", "properties": { "name": "KAB. SAMBAS" }, "geometry": { "type": "Point", "coordinates": [109.3000, 1.3333] } },
    { "type": "Feature", "properties": { "name": "KAB. BARITO UTARA" }, "geometry": { "type": "Point", "coordinates": [114.9167, -0.9667] } },
    { "type": "Feature", "properties": { "name": "KAB. BONDOWOSO" }, "geometry": { "type": "Point", "coordinates": [113.8167, -7.9167] } },
    { "type": "Feature", "properties": { "name": "KAB. TULUNGAGUNG" }, "geometry": { "type": "Point", "coordinates": [111.9000, -8.0667] } },
    { "type": "Feature", "properties": { "name": "KAB. MOROWALI" }, "geometry": { "type": "Point", "coordinates": [121.8333, -2.0000] } },
    { "type": "Feature", "properties": { "name": "KAB. KATINGAN" }, "geometry": { "type": "Point", "coordinates": [113.3333, -2.0000] } },
    { "type": "Feature", "properties": { "name": "KAB. BELITUNG TIMUR" }, "geometry": { "type": "Point", "coordinates": [108.1667, -2.8333] } },
    { "type": "Feature", "properties": { "name": "KAB. KOTABARU" }, "geometry": { "type": "Point", "coordinates": [116.0000, -3.0000] } },
    { "type": "Feature", "properties": { "name": "KAB. PURBALINGGA" }, "geometry": { "type": "Point", "coordinates": [109.3667, -7.3833] } },
    { "type": "Feature", "properties": { "name": "KOTA TERNATE" }, "geometry": { "type": "Point", "coordinates": [127.3667, 0.7833] } },
    { "type": "Feature", "properties": { "name": "KOTA BATU" }, "geometry": { "type": "Point", "coordinates": [112.5167, -7.8667] } },
    { "type": "Feature", "properties": { "name": "KAB. MAHAKAM ULU" }, "geometry": { "type": "Point", "coordinates": [115.5000, 0.5000] } },
    { "type": "Feature", "properties": { "name": "KAB. PURWOREJO" }, "geometry": { "type": "Point", "coordinates": [110.0167, -7.7167] } },
    { "type": "Feature", "properties": { "name": "KAB. NGAWI" }, "geometry": { "type": "Point", "coordinates": [111.4500, -7.4000] } },
    { "type": "Feature", "properties": { "name": "KAB. ACEH TIMUR" }, "geometry": { "type": "Point", "coordinates": [97.5833, 4.6333] } },
    { "type": "Feature", "properties": { "name": "KAB. SUMENEP" }, "geometry": { "type": "Point", "coordinates": [113.8667, -7.0167] } },
    { "type": "Feature", "properties": { "name": "KAB. KUTAI KARTANEGARA" }, "geometry": { "type": "Point", "coordinates": [116.9833, -0.4167] } },
    { "type": "Feature", "properties": { "name": "KAB. DELI SERDANG" }, "geometry": { "type": "Point", "coordinates": [98.6667, 3.5833] } },
    { "type": "Feature", "properties": { "name": "KAB. SUBANG" }, "geometry": { "type": "Point", "coordinates": [107.7500, -6.5667] } },
    { "type": "Feature", "properties": { "name": "KOTA MOJOKERTO" }, "geometry": { "type": "Point", "coordinates": [112.4333, -7.4667] } },
    { "type": "Feature", "properties": { "name": "KAB. BANGGAI" }, "geometry": { "type": "Point", "coordinates": [122.9167, -1.0833] } },
    { "type": "Feature", "properties": { "name": "KOTA JAMBI" }, "geometry": { "type": "Point", "coordinates": [103.5833, -1.5833] } },
    { "type": "Feature", "properties": { "name": "KOTA TIDORE KEPULAUAN" }, "geometry": { "type": "Point", "coordinates": [127.4000, 0.6667] } },
    { "type": "Feature", "properties": { "name": "KAB. ASAHAN" }, "geometry": { "type": "Point", "coordinates": [99.6167, 2.9667] } },
    { "type": "Feature", "properties": { "name": "KAB. KEDIRI" }, "geometry": { "type": "Point", "coordinates": [112.0167, -7.8167] } },
    { "type": "Feature", "properties": { "name": "KAB. MERAUKE" }, "geometry": { "type": "Point", "coordinates": [140.3333, -8.5000] } },
    { "type": "Feature", "properties": { "name": "KOTA BLITAR" }, "geometry": { "type": "Point", "coordinates": [112.1667, -8.1000] } },
    { "type": "Feature", "properties": { "name": "KAB. PULANG PISAU" }, "geometry": { "type": "Point", "coordinates": [114.0833, -2.7500] } },
    { "type": "Feature", "properties": { "name": "KAB. ROTE NDAO" }, "geometry": { "type": "Point", "coordinates": [123.1333, -10.5000] } },
    { "type": "Feature", "properties": { "name": "KAB. TULANG BAWANG" }, "geometry": { "type": "Point", "coordinates": [105.5833, -4.5000] } },
    { "type": "Feature", "properties": { "name": "KAB. INDRAGIRI HILIR" }, "geometry": { "type": "Point", "coordinates": [103.0000, -0.3333] } },
    { "type": "Feature", "properties": { "name": "KAB. SIDENRENG RAPPANG" }, "geometry": { "type": "Point", "coordinates": [119.8333, -3.9167] } },
    { "type": "Feature", "properties": { "name": "KAB. WONOGIRI" }, "geometry": { "type": "Point", "coordinates": [110.9167, -7.8167] } },
    { "type": "Feature", "properties": { "name": "KAB. BANGKA BARAT" }, "geometry": { "type": "Point", "coordinates": [105.4167, -2.0000] } },
    { "type": "Feature", "properties": { "name": "KAB. BOVEN DIGOEL" }, "geometry": { "type": "Point", "coordinates": [140.3333, -5.5000] } },
    { "type": "Feature", "properties": { "name": "KAB. DEMAK" }, "geometry": { "type": "Point", "coordinates": [110.6333, -6.8833] } },
    { "type": "Feature", "properties": { "name": "KAB. MANGGARAI TIMUR" }, "geometry": { "type": "Point", "coordinates": [120.6667, -8.5833] } },
    { "type": "Feature", "properties": { "name": "KAB. JEMBER" }, "geometry": { "type": "Point", "coordinates": [113.7000, -8.1667] } },
    { "type": "Feature", "properties": { "name": "KAB. BONE BOLANGO" }, "geometry": { "type": "Point", "coordinates": [123.1333, 0.4833] } }
  ]
};

// --- 2. SKALA WARNA (Request 4) ---
// (Menggunakan fungsi getColor dari file Anda)
const getColor = d => d > 500 ? '#800026' : d > 200 ? '#BD0026' : d > 50 ? '#E31A1C' : d > 10 ? '#FC4E2A' : '#FED976';
// Hapus getRadius, kita gunakan ukuran seragam

// --- 3. KOMPONEN LEGEND (Request 4) ---
const Legend = () => {
  const map = useMap();
  useEffect(() => {
    const legend = L.control({ position: 'bottomright' });
    legend.onAdd = () => {
      const div = L.DomUtil.create('div', 'info legend');
      div.style.backgroundColor = 'white';
      div.style.padding = '10px';
      div.style.borderRadius = '5px';
      div.style.boxShadow = '0 0 10px rgba(0,0,0,0.2)';
      
      const grades = [0, 10, 50, 200, 500];
      let labels = ['<strong>Total Produk</strong>'];
      for (let i = 0; i < grades.length; i++) {
        labels.push(
          '<i style="background:' + getColor(grades[i] + 1) + '; width:18px; height:18px; float:left; margin-right:8px; opacity:0.8;"></i> ' +
          grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] : '+')
        );
      }
      div.innerHTML = labels.join('<br>');
      return div;
    };
    legend.addTo(map);
    return () => { legend.remove(); };
  }, [map]);
  return null;
};

// --- 4. KOMPONEN PETA UTAMA ---
const Map = ({ mapData, view }) => { // Terima prop 'view'
  if (typeof window === 'undefined') {
    return null;
  }

  // Tentukan data GeoJSON mana yang akan digunakan
  const geoJson = view === 'kota' ? kabKotaGeoJson : indonesiaGeoJson;

  return (
    <MapContainer center={[-2.5, 118]} zoom={4.5} scrollWheelZoom={true} style={{ height: '100%', width: '100%', borderRadius: '0.75rem', backgroundColor: 'transparent' }}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
      />
      
      {geoJson.features.map(feature => {
        // Ambil count dari mapData menggunakan nama (sudah di-uppercase oleh API)
        const count = mapData[feature.properties.name.toUpperCase()] || 0;
        if (count === 0) return null;
        
        return (
          <CircleMarker
            key={feature.properties.name}
            center={[feature.geometry.coordinates[1], feature.geometry.coordinates[0]]}
            // Request 4: Gunakan warna dan ukuran seragam
            pathOptions={{ color: 'white', weight: 1, fillColor: getColor(count), fillOpacity: 0.7 }}
            radius={12} // Ukuran seragam
          >
            <Popup><b>{feature.properties.name}</b><br />{count.toLocaleString('id-ID')} produk</Popup>
          </CircleMarker>
        );
      })}
      <Legend />
      <MapResizer />
    </MapContainer>
  );
};

export default Map;