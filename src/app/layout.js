// Lokasi: src/app/layout.js
import { Inter } from "next/font/google";
import "./globals.css";
import Sidebar from "../components/Sidebar"; // Impor Sidebar baru

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Dashboard E-Katalog SDA",
  description: "Dashboard Monitoring E-Katalog Sumber Daya Air",
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body className={`${inter.className} bg-gray-50 text-gray-800`}>
        <div className="flex h-screen">
          <Sidebar />
          {/* {children} adalah tempat halaman (Dashboard atau Market Sounding) akan ditampilkan */}
          <main className="flex-1 overflow-y-auto">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}