// Lokasi: src/components/FilterBreadcrumb.js
'use client';

const Crumb = ({ label, value, onClear }) => {
    const truncate = (text, length = 50) => {
        if (typeof text !== 'string') return '';
        if (text.length <= length) return text;
        return text.substring(0, length) + '...';
    };

    return (
        <div className="flex items-center bg-gray-100 text-gray-700 text-sm font-medium pl-3 pr-2 py-1 rounded-full">
            <span className="mr-2">{label}: <span className="font-semibold">{truncate(value)}</span></span>
            <button onClick={onClear} className="w-5 h-5 flex items-center justify-center rounded-full hover:bg-gray-300">
                &times;
            </button>
        </div>
    );
};

export default function FilterBreadcrumb({ filters, onClear }) {
    const hasActiveFilters = Object.values(filters).some(val => val !== 'all');

    if (!hasActiveFilters) {
        return null;
    }

    return (
        <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-semibold text-gray-600">Filter Aktif:</span>
            {filters.provinsi !== 'all' && (
                <Crumb label="Provinsi" value={filters.provinsi} onClear={() => onClear('provinsi', 'all')} />
            )}
            {filters.kategori_1 !== 'all' && (
                <Crumb label="Kategori 1" value={filters.kategori_1} onClear={() => onClear('kategori_1', 'all')} />
            )}
            {filters.kategori_2 !== 'all' && (
                <Crumb label="Kategori 2" value={filters.kategori_2} onClear={() => onClear('kategori_2', 'all')} />
            )}
        </div>
    );
}