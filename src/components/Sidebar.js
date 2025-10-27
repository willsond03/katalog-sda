// Lokasi: src/components/Sidebar.js
'use client';
import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';

// --- KUMPULAN IKON ---
const IconDashboard = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" /></svg>
);
const IconMarketSounding = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 0 1 4.5 9.75h15A2.25 2.25 0 0 1 21.75 12v.75m-8.69-6.44-2.12-2.12a1.5 1.5 0 0 0-1.061-.44H4.5A2.25 2.25 0 0 0 2.25 6v12a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9a2.25 2.25 0 0 0-2.25-2.25h-5.379a1.5 1.5 0 0 1-1.06-.44Z" /></svg>
);
const IconInput = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m3.75 9v6m-3-3H9m1.5-12H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" /></svg>
);
const IconHistory = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>
);
const IconAnalysis = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 0 0 6 16.5h12A2.25 2.25 0 0 0 20.25 14.25V3m-16.5 0h16.5M3.75 3v1.5M20.25 3v1.5M3.75 16.5a1.5 1.5 0 0 1-1.5-1.5V6.75A1.5 1.5 0 0 1 3.75 5.25h16.5A1.5 1.5 0 0 1 21.75 6.75v8.25a1.5 1.5 0 0 1-1.5 1.5h-1.5M3.75 16.5h16.5c.621 0 1.125-.504 1.125-1.125v-8.25A2.25 2.25 0 0 0 20.25 5.25H3.75A2.25 2.25 0 0 0 1.5 7.5v8.25A2.25 2.25 0 0 0 3.75 18h16.5v-1.5Z" /></svg>
);
const ChevronDownIcon = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" {...props}><path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.25 4.25a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.06z" clipRule="evenodd" /></svg>
);
// --- END IKON ---


export default function Sidebar() {
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const isMarketSoundingActive = pathname.startsWith('/market-sounding');
  const [isSubmenuOpen, setIsSubmenuOpen] = useState(isMarketSoundingActive);

  // --- REVISI 1: Label diubah & ikon ditambahkan ---
  const subNavItems = [
    { href: '/market-sounding/input', label: 'Input', icon: IconInput },
    { href: '/market-sounding/history', label: 'Histori', icon: IconHistory },
    { href: '/market-sounding/analysis', label: 'Analisa', icon: IconAnalysis },
  ];

  const sidebarContent = (
    <>
      <div className="p-4 border-b border-gray-200 flex items-center space-x-3">
        <Image 
          src="/logo.png"
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
      
      <nav className="flex-1 px-4 py-2 space-y-2">
        {/* Link Dashboard (dengan ikon) */}
        <Link
          href="/"
          onClick={() => setMobileMenuOpen(false)}
          className={`flex items-center p-2 rounded-lg font-semibold text-sm transition-colors duration-200 ${
            pathname === '/'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <IconDashboard className="w-5 h-5 mr-3 shrink-0" />
          <span>Dashboard</span>
        </Link>
        
        {/* Tombol Dropdown Market Sounding (dengan ikon) */}
        <div>
          <button
            onClick={() => setIsSubmenuOpen(!isSubmenuOpen)}
            className={`flex items-center justify-between w-full p-2 rounded-lg font-semibold text-sm transition-colors duration-200 ${
              isMarketSoundingActive && !isSubmenuOpen
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <span className="flex items-center">
              <IconMarketSounding className="w-5 h-5 mr-3 shrink-0" />
              <span>Market Sounding</span>
            </span>
            <ChevronDownIcon className={`w-5 h-5 transition-transform ${isSubmenuOpen ? 'rotate-180' : ''}`} />
          </button>
          
          {/* Sub-menu (dengan ikon) */}
          {isSubmenuOpen && (
            <div className="mt-1 pl-4 space-y-1">
              {subNavItems.map(item => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center p-2 rounded-lg font-medium text-xs transition-colors duration-200 ${
                    pathname === item.href
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-500 hover:bg-gray-100'
                  }`}
                >
                  <item.icon className="w-4 h-4 mr-2 shrink-0" />
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