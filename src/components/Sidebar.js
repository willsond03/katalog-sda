// Lokasi: src/components/Sidebar.js
'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Sidebar() {
  const pathname = usePathname();

  const navItems = [
    { href: '/', label: 'Dashboard' },
    { href: '/market-sounding', label: 'Market Sounding' },
  ];

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex-col hidden lg:flex">
      <div className="p-4 border-b border-gray-200">
        <h1 className="text-xl font-bold text-gray-800">E-Katalog SDA</h1>
        <p className="text-xs text-gray-500">Dashboard Monitoring</p>
      </div>
      <nav className="flex-1 p-4 space-y-2">
        {navItems.map(item => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center p-2 rounded-lg font-semibold ${
              pathname === item.href
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>
    </aside>
  );
}