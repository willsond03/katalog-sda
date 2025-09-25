// Lokasi: src/app/layout.js
import { Inter } from "next/font/google";
import "./globals.css";
import Sidebar from "../components/Sidebar";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Dashboard E-Katalog SDA",
  description: "Dashboard Monitoring E-Katalog Sumber Daya Air",
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body className={`${inter.className} bg-gray-100 text-gray-800`}>
        <div className="flex h-screen">
          <Sidebar />
          <main className="flex-1 overflow-y-auto bg-gray-50">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}