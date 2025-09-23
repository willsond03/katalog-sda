// Lokasi: src/components/Map.js
'use client';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect } from 'react';
import { useTheme } from 'next-themes';

const MapResizer = () => {
  const map = useMap();
  useEffect(() => {
    const resizeMap = () => map.invalidateSize();
    // Gunakan observer untuk mendeteksi perubahan ukuran kontainer
    const resizeObserver = new ResizeObserver(resizeMap);
    const mapContainer = map.getContainer();
    resizeObserver.observe(mapContainer);
    // Jalankan sekali di awal
    setTimeout(resizeMap, 100);
    return () => resizeObserver.unobserve(mapContainer);
  }, [map]);
  return null;
};

// PENTING: Pastikan objek 'indonesiaGeoJson' Anda sudah ada di sini
const indonesiaGeoJson = { "type": "FeatureCollection", "features": [ /* ... ISI LENGKAPNYA DI SINI ... */ ] };
const getColor = d => d > 500 ? '#800026' : d > 200 ? '#BD0026' : d > 50 ? '#E31A1C' : d > 10 ? '#FC4E2A' : '#FED976';
const getRadius = d => d > 500 ? 20 : d > 200 ? 16 : d > 50 ? 12 : d > 10 ? 8 : 5;

const Map = ({ mapData }) => {
  const { theme } = useTheme();
  if (typeof window === 'undefined') return null;

  const mapUrl = theme === 'dark'
    ? 'https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png'
    // Pilihan tile untuk light mode
    : 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager_labels_under/{z}/{x}/{y}{r}.png';

  return (
    <MapContainer key={theme} center={[-2.5, 118]} zoom={4.5} scrollWheelZoom={true} style={{ height: '100%', width: '100%', borderRadius: '0.75rem', backgroundColor: 'transparent' }}>
      <TileLayer url={mapUrl} />
      {/* ... (Kode .map untuk CircleMarker Anda tetap di sini) ... */}
      <MapResizer />
    </MapContainer>
  );
};
export default Map;