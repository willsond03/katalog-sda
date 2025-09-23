// File: src/components/Map.js
'use client';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

// PENTING: Salin objek 'indonesiaGeoJson' yang panjang dari file .html lama Anda ke sini
const indonesiaGeoJson = { "type": "FeatureCollection", "features": [{ "type": "Feature", "properties": { "name": "ACEH" }, "geometry": { "type": "Point", "coordinates": [96.92, 4.22] } }, { "type": "Feature", "properties": { "name": "SUMATERA UTARA" }, "geometry": { "type": "Point", "coordinates": [99.5, 2.5] } }, { "type": "Feature", "properties": { "name": "SUMATERA BARAT" }, "geometry": { "type": "Point", "coordinates": [100.47, -0.74] } }, { "type": "Feature", "properties": { "name": "RIAU" }, "geometry": { "type": "Point", "coordinates": [101.69, 0.51] } }, { "type": "Feature", "properties": { "name": "JAMBI" }, "geometry": { "type": "Point", "coordinates": [102.73, -1.61] } }, { "type": "Feature", "properties": { "name": "SUMATERA SELATAN" }, "geometry": { "type": "Point", "coordinates": [104.09, -3.32] } }, { "type": "Feature", "properties": { "name": "BENGKULU" }, "geometry": { "type": "Point", "coordinates": [102.34, -3.8] } }, { "type": "Feature", "properties": { "name": "LAMPUNG" }, "geometry": { "type": "Point", "coordinates": [105.02, -4.89] } }, { "type": "Feature", "properties": { "name": "KEPULAUAN BANGKA BELITUNG" }, "geometry": { "type": "Point", "coordinates": [106.51, -2.74] } }, { "type": "Feature", "properties": { "name": "KEPULAUAN RIAU" }, "geometry": { "type": "Point", "coordinates": [104.51, 0.92] } }, { "type": "Feature", "properties": { "name": "DKI JAKARTA" }, "geometry": { "type": "Point", "coordinates": [106.82, -6.21] } }, { "type": "Feature", "properties": { "name": "JAWA BARAT" }, "geometry": { "type": "Point", "coordinates": [107.62, -6.92] } }, { "type": "Feature", "properties": { "name": "JAWA TENGAH" }, "geometry": { "type": "Point", "coordinates": [110.2, -7.26] } }, { "type": "Feature", "properties": { "name": "DAERAH ISTIMEWA YOGYAKARTA" }, "geometry": { "type": "Point", "coordinates": [110.45, -7.87] } }, { "type": "Feature", "properties": { "name": "JAWA TIMUR" }, "geometry": { "type": "Point", "coordinates": [112.73, -7.54] } }, { "type": "Feature", "properties": { "name": "BANTEN" }, "geometry": { "type": "Point", "coordinates": [106.15, -6.44] } }, { "type": "Feature", "properties": { "name": "BALI" }, "geometry": { "type": "Point", "coordinates": [115.19, -8.41] } }, { "type": "Feature", "properties": { "name": "NUSA TENGGARA BARAT" }, "geometry": { "type": "Point", "coordinates": [117.56, -8.65] } }, { "type": "Feature", "properties": { "name": "NUSA TENGGARA TIMUR" }, "geometry": { "type": "Point", "coordinates": [121.08, -8.68] } }, { "type": "Feature", "properties": { "name": "KALIMANTAN BARAT" }, "geometry": { "type": "Point", "coordinates": [111.12, -0.02] } }, { "type": "Feature", "properties": { "name": "KALIMANTAN TENGAH" }, "geometry": { "type": "Point", "coordinates": [113.28, -1.69] } }, { "type": "Feature", "properties": { "name": "KALIMANTAN SELATAN" }, "geometry": { "type": "Point", "coordinates": [115.45, -3.09] } }, { "type": "Feature", "properties": { "name": "KALIMANTAN TIMUR" }, "geometry": { "type": "Point", "coordinates": [116.42, 0.58] } }, { "type": "Feature", "properties": { "name": "KALIMANTAN UTARA" }, "geometry": { "type": "Point", "coordinates": [116.47, 3.08] } }, { "type": "Feature", "properties": { "name": "SULAWESI UTARA" }, "geometry": { "type": "Point", "coordinates": [124.57, 1.34] } }, { "type": "Feature", "properties": { "name": "SULAWESI TENGAH" }, "geometry": { "type": "Point", "coordinates": [121.2, -1.4] } }, { "type": "Feature", "properties": { "name": "SULAWESI SELATAN" }, "geometry": { "type": "Point", "coordinates": [120.16, -4.14] } }, { "type": "Feature", "properties": { "name": "SULAWESI TENGGARA" }, "geometry": { "type": "Point", "coordinates": [122.07, -4.14] } }, { "type": "Feature", "properties": { "name": "GORONTALO" }, "geometry": { "type": "Point", "coordinates": [122.45, 0.7] } }, { "type": "Feature", "properties": { "name": "SULAWESI BARAT" }, "geometry": { "type": "Point", "coordinates": [119.35, -2.6] } }, { "type": "Feature", "properties": { "name": "MALUKU" }, "geometry": { "type": "Point", "coordinates": [129.41, -3.24] } }, { "type": "Feature", "properties": { "name": "MALUKU UTARA" }, "geometry": { "type": "Point", "coordinates": [127.53, 0.78] } }, { "type": "Feature", "properties": { "name": "PAPUA BARAT" }, "geometry": { "type": "Point", "coordinates": [132.96, -1.34] } }, { "type": "Feature", "properties": { "name": "PAPUA" }, "geometry": { "type": "Point", "coordinates": [138.8, -4.5] } }, { "type": "Feature", "properties": { "name": "PAPUA TENGAH" }, "geometry": { "type": "Point", "coordinates": [136.2, -4] } }, { "type": "Feature", "properties": { "name": "PAPUA PEGUNUNGAN" }, "geometry": { "type": "Point", "coordinates": [139.5, -4.3] } }, { "type": "Feature", "properties": { "name": "PAPUA SELATAN" }, "geometry": { "type": "Point", "coordinates": [139.5, -7] } }, { "type": "Feature", "properties": { "name": "PAPUA BARAT DAYA" }, "geometry": { "type": "Point", "coordinates": [131.5, -1] } }] };

const getColor = d => d > 500 ? '#800026' : d > 200 ? '#BD0026' : d > 50 ? '#E31A1C' : d > 10 ? '#FC4E2A' : '#FED976';
const getRadius = d => d > 500 ? 20 : d > 200 ? 16 : d > 50 ? 12 : d > 10 ? 8 : 5;

const Map = ({ mapData }) => {
  return (
    <MapContainer center={[-2.5, 118]} zoom={4.5} scrollWheelZoom={true} style={{ height: '100%', width: '100%', borderRadius: '0.75rem', backgroundColor: 'transparent' }}>
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png"
      />
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
    </MapContainer>
  );
};

export default Map;