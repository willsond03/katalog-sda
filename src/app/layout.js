// Lokasi: src/app/layout.js
import { Inter } from "next/font/google";
import "./globals.css";
import "leaflet/dist/leaflet.css"; // <-- TAMBAHKAN IMPORT CSS LEAFLET DI SINI
import Sidebar from "../components/Sidebar"; // <-- 1. Impor komponen Sidebar

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Dashboard E-Katalog SDA",
  description: "Dashboard Monitoring E-Katalog Sumber Daya Air",
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body className={inter.className}>
		<div className="flex h-screen">
          <Sidebar /> {/* <-- 3. Tampilkan Sidebar di sini */}
          <main className="flex-1 overflow-y-auto">
            {children} {/* {children} adalah halaman Anda (Dashboard atau Market Sounding) */}
          </main>
        </div>
	  </body>
    </html>
  );
}