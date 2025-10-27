// Lokasi: src/components/Pagination.js
'use client';

export default function Pagination({ currentPage, totalPages, onPageChange }) {
  const getPaginationRange = () => {
    const delta = 2;
    const range = [];
    for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
      range.push(i);
    }
    if (currentPage - delta > 2) { range.unshift('...'); }
    if (currentPage + delta < totalPages - 1) { range.push('...'); }
    range.unshift(1);
    if (totalPages > 1) { range.push(totalPages); }
    return range;
  };
  
  const pages = getPaginationRange();

  if (totalPages <= 1) {
    return null; // Jangan tampilkan paginasi jika hanya ada 1 halaman
  }

  return (
    <div className="flex items-center justify-center space-x-1">
      <button 
        onClick={() => onPageChange(currentPage - 1)} 
        disabled={currentPage <= 1} 
        className="px-3 py-1 rounded-md bg-gray-200 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        &laquo;
      </button>
      
      {pages.map((page, index) => (
        <button 
          key={index} 
          onClick={() => typeof page === 'number' && onPageChange(page)} 
          disabled={typeof page !== 'number'} 
          className={`px-3 py-1 rounded-md ${currentPage === page ? 'bg-blue-600 text-white' : 'bg-gray-200 hover:bg-gray-300'} ${typeof page !== 'number' ? 'cursor-default' : ''}`}
        >
          {page}
        </button>
      ))}
      
      <button 
        onClick={() => onPageChange(currentPage + 1)} 
        disabled={currentPage >= totalPages} 
        className="px-3 py-1 rounded-md bg-gray-200 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        &raquo;
      </button>
    </div>
  );
}