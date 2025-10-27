// Lokasi: src/app/layout.js
import { Inter } from "next/font/google";
import "./globals.css";
import "leaflet/dist/leaflet.css"; 
import Sidebar from "../components/Sidebar";
import Footer from "../components/Footer"; // Impor Footer

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Dashboard E-Katalog SDA",
  description: "Dashboard Monitoring E-Katalog Sumber Daya Air",
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body className={inter.className}>
        {/* Latar belakang abu-abu dihapus dari sini */}
		<div className="flex h-screen">
          <Sidebar /> 
          
          {/* Wrapper untuk main content + footer */}
          <div className="flex-1 flex flex-col overflow-hidden">
            
            {/* Area konten yang bisa di-scroll */}
            <main className="flex-1 overflow-x-hidden overflow-y-auto">
              {children}
            </main>
            
            {/* Footer */}
            <Footer />

          </div>
        </div>
	  </body>
    </html>
  );
}