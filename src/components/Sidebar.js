// Lokasi: src/components/Sidebar.js
'use client';
import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image'; // Gunakan next/image untuk optimasi
import { usePathname } from 'next/navigation';

// Komponen terpisah untuk link agar bisa digunakan di desktop & mobile
const NavLinks = ({ onItemClick }) => {
  const pathname = usePathname();
  const navItems = [
    { href: '/', label: 'Dashboard' },
    { href: '/market-sounding', label: 'Market Sounding' },
  ];

  return (
    <nav className="flex-1 px-4 py-2 space-y-2">
      {navItems.map(item => (
        <Link
          key={item.href}
          href={item.href}
          onClick={onItemClick}
          className={`flex items-center p-2 rounded-lg font-semibold text-sm transition-colors duration-200 ${
            pathname === item.href
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <span>{item.label}</span>
        </Link>
      ))}
    </nav>
  );
};

export default function Sidebar() {
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Bagian utama sidebar yang akan ditampilkan
  const sidebarContent = (
    <>
      {/* --- PERUBAHAN DI SINI (Sidebar Desktop) --- */}
      <div className="p-4 border-b border-gray-200 flex items-center space-x-3">
        {/* Logo */}
        <Image 
          src="/logo.png" // Pastikan logo ada di folder /public
          alt="Logo E-Katalog SDA"
          width={40} // Sesuaikan ukuran
          height={40}
          className="rounded-md"
        />
        {/* Blok Teks */}
        <div>
          <h1 className="text-xl font-bold text-gray-800">E-Katalog SDA</h1>
          <p className="text-xs text-gray-500">Dashboard Monitoring</p>
        </div>
      </div>
      <NavLinks onItemClick={() => setMobileMenuOpen(false)} />
    </>
  );

  return (
    <>
      {/* Sidebar untuk Desktop */}
      <aside className="w-64 bg-white border-r border-gray-200 flex-col hidden lg:flex">
        {sidebarContent}
      </aside>

      {/* --- PERUBAHAN DI SINI (Header Mobile) --- */}
      <div className="lg:hidden w-full absolute top-0 left-0 p-4 bg-white/80 backdrop-blur-sm border-b border-gray-200 flex justify-between items-center z-30">
        {/* Logo dan Teks di Kiri */}
        <div className="flex items-center space-x-2">
          <Image 
            src="/logo.png" // Pastikan logo ada di folder /public
            alt="Logo E-Katalog SDA"
            width={32} // Ukuran mobile lebih kecil
            height={32}
            className="rounded-md"
          />
          <h1 className="text-lg font-bold">E-Katalog SDA</h1>
        </div>
        
        {/* Tombol Hamburger di Kanan */}
        <button onClick={() => setMobileMenuOpen(true)}>
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" /></svg>
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-40">
            {/* Latar belakang gelap */}
            <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setMobileMenuOpen(false)}></div>
            {/* Konten menu */}
            <div className="relative h-full w-64 bg-white z-50 flex flex-col shadow-xl">
               {sidebarContent}
            </div>
        </div>
      )}
    </>
  );
}