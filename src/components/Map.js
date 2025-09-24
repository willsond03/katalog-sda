// Lokasi file: src/components/Map.js
'use client';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect } from 'react';
import { useTheme } from 'next-themes'; // Kita akan butuh ini untuk dark mode nanti

// KOMPONEN KECIL UNTUK MEMPERBAIKI MASALAH UKURAN PETA
const MapResizer = () => {
  const map = useMap();
  useEffect(() => {
    // Memberi jeda 100ms untuk memastikan container sudah dirender sebelum mengukur ulang
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 100);
    
    // Membersihkan timer saat komponen dilepas
    return () => clearTimeout(timer);
  }, [map]);
  return null;
};

// PENTING: Salin objek 'indonesiaGeoJson' yang panjang dari file .html lama Anda ke sini
const indonesiaGeoJson = { "type": "FeatureCollection", "features": [ /* ... ISI LENGKAPNYA DI SINI ... */ ] };

const getColor = d => d > 500 ? '#800026' : d > 200 ? '#BD0026' : d > 50 ? '#E31A1C' : d > 10 ? '#FC4E2A' : '#FED976';
const getRadius = d => d > 500 ? 20 : d > 200 ? 16 : d > 50 ? 12 : d > 10 ? 8 : 5;

const Map = ({ mapData }) => {
  // Mengecek tema saat ini, agar bisa ganti tile peta nanti
  const { theme } = useTheme(); 
  
  if (typeof window === 'undefined') {
    return null; // Mencegah peta dirender di server
  }

  // Pilih tile peta berdasarkan tema (dark/light)
  const mapUrl = theme === 'dark'
    ? 'https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png'
    : 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager_labels_under/{z}/{x}/{y}{r}.png';

  return (
    // 'key={theme}' adalah trik untuk memaksa peta render ulang saat tema berubah
    <MapContainer key={theme} center={[-2.5, 118]} zoom={4.5} scrollWheelZoom={true} style={{ height: '100%', width: '100%', borderRadius: '0.75rem', backgroundColor: 'transparent' }}>
      <TileLayer url={mapUrl} />
      
      {indonesiaGeoJson.features.map(provinsi => {
        const count = mapData[provinsi.properties.name] || 0;
        if (count === 0) return null;

        return (
          <CircleMarker
            key={provinsi.properties.name}
            center={[provinsi.geometry.coordinates[1], provinsi.geometry.coordinates[0]]}
            pathOptions={{ color: 'white', weight: 1, fillColor: getColor(count), fillOpacity: 0.7 }}
            radius={getRadius(count)}
          >
            <Popup>
              <b>{provinsi.properties.name}</b><br />
              {count.toLocaleString('id-ID')} produk
            </Popup>
          </CircleMarker>
        );
      })}

      <MapResizer /> {/* <-- Tambahkan komponen perbaikan di sini */}
    </MapContainer>
  );
};

export default Map;