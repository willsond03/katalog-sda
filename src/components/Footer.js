// Lokasi: src/components/Footer.js

export default function Footer() {
  return (
    <footer className="w-full border-t border-gray-200 bg-white p-4 shadow-sm shrink-0">
      <div className="flex flex-col md:flex-row justify-between items-center text-xs text-gray-500 gap-2 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Bagian Kiri: Informasi Organisasi */}
        <div className="flex flex-wrap justify-center md:justify-start gap-x-3 gap-y-1">
          <span>Subdit Teknologi dan Peralatan Infrastruktur</span>
          <span className="hidden md:inline text-gray-300">|</span>
          <span>Direktorat Bina Teknik SDA</span>
        </div>
        
        {/* REVISI 2: Bagian Kanan (Versi & Kredit) */}
        <div className="flex items-center gap-x-2">
          <span className="shrink-0 text-gray-400">
            Dashboard v.1 © 2025
          </span>
          <span className="text-gray-300">|</span>
          <span className="shrink-0">
            Made with ☕️
          </span>
        </div>
        
      </div>
    </footer>
  );
}