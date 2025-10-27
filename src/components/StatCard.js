// Lokasi: src/components/StatCard.js
'use client';

export default function StatCard({ title, value, children }) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5">
      <h3 className="text-sm font-medium text-gray-500">{title}</h3>
      <p className="mt-1 text-3xl font-semibold text-gray-900">{value}</p>
      <div className="mt-3 text-sm">
        {children}
      </div>
    </div>
  );
}