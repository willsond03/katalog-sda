// Lokasi: src/components/StatCard.js
'use client';

// Terima prop 'className' baru, beri default 'bg-white'
export default function StatCard({ title, value, children, className = 'bg-white' }) {
  return (
    // Gabungkan className dasar (tanpa border) dengan prop className baru
    <div className={`rounded-xl shadow-sm p-5 ${className}`}>
      <h3 className="text-sm font-medium text-gray-500">{title}</h3>
      <p className="mt-1 text-3xl font-semibold text-gray-900">{value}</p>
      <div className="mt-3 text-sm">
        {children}
      </div>
    </div>
  );
}