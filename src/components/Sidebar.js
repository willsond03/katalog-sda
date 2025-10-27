// Lokasi: src/components/Sidebar.js
'use client';
import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';

// Ikon Chevron untuk dropdown
const ChevronDownIcon = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" {...props}>
    <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.25 4.25a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.06z" clipRule="evenodd" />
  </svg>
);

export default function Sidebar() {
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  // Cek apakah route saat ini adalah bagian dari market sounding
  const isMarketSoundingActive = pathname.startsWith('/market-sounding');
  
  // State untuk submenu, default terbuka jika aktif
  const [isSubmenuOpen, setIsSubmenuOpen] = useState(isMarketSoundingActive);

  // Daftar link sub-menu
  const subNavItems = [
    { href: '/market-sounding/input', label: 'Input Market Sounding' },
    { href: '/market-sounding/history', label: 'Histori Market Sounding' },
    { href: '/market-sounding/analysis', label: 'Analisa Market Sounding' },
  ];

  const sidebarContent = (
    <>
      <div className="p-4 border-b border-gray-200 flex items-center space-x-3">
        <Image 
          src="/logo.png" // Pastikan logo ada di folder /public
          alt="Logo E-Katalog SDA"
          width={40}
          height={40}
          className="rounded-md"
        />
        <div>
          <h1 className="text-xl font-bold text-gray-800">E-Katalog SDA</h1>
          <p className="text-xs text-gray-500">Dashboard Monitoring</p>
        </div>
      </div>
      
      {/* Navigasi */}
      <nav className="flex-1 px-4 py-2 space-y-2">
        {/* Link Dashboard (Level Atas) */}
        <Link
          href="/"
          onClick={() => setMobileMenuOpen(false)}
          className={`flex items-center p-2 rounded-lg font-semibold text-sm transition-colors duration-200 ${
            pathname === '/'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <span>Dashboard</span>
        </Link>
        
        {/* Tombol Dropdown Market Sounding (Level Atas) */}
        <div>
          <button
            onClick={() => setIsSubmenuOpen(!isSubmenuOpen)}
            className={`flex items-center justify-between w-full p-2 rounded-lg font-semibold text-sm transition-colors duration-200 ${
              isMarketSoundingActive && !isSubmenuOpen
                ? 'bg-blue-600 text-white shadow-sm' // Aktif tapi tertutup
                : 'text-gray-600 hover:bg-gray-100' // Default
            }`}
          >
            <span>Market Sounding</span>
            <ChevronDownIcon className={`w-5 h-5 transition-transform ${isSubmenuOpen ? 'rotate-180' : ''}`} />
          </button>
          
          {/* Sub-menu (Level Bawah) */}
          {isSubmenuOpen && (
            <div className="mt-1 pl-4 space-y-1">
              {subNavItems.map(item => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center p-2 rounded-lg font-medium text-xs transition-colors duration-200 ${
                    pathname === item.href
                      ? 'bg-blue-100 text-blue-700' // Sub-menu aktif
                      : 'text-gray-500 hover:bg-gray-100'
                  }`}
                >
                  <span>{item.label}</span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </nav>
    </>
  );

  return (
    <>
      {/* Sidebar untuk Desktop */}
      <aside className="w-64 bg-white border-r border-gray-200 flex-col hidden lg:flex">
        {sidebarContent}
      </aside>

      {/* Header Mobile */}
      <div className="lg:hidden w-full absolute top-0 left-0 p-4 bg-white/80 backdrop-blur-sm border-b border-gray-200 flex justify-between items-center z-30">
        <div className="flex items-center space-x-2">
          <Image 
            src="/logo.png"
            alt="Logo E-Katalog SDA"
            width={32}
            height={32}
            className="rounded-md"
          />
          <h1 className="text-lg font-bold">E-Katalog SDA</h1>
        </div>
        <button onClick={() => setMobileMenuOpen(true)}>
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" /></svg>
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-40">
            <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setMobileMenuOpen(false)}></div>
            <div className="relative h-full w-64 bg-white z-50 flex flex-col shadow-xl">
               {sidebarContent}
            </div>
        </div>
      )}
    </>
  );
}