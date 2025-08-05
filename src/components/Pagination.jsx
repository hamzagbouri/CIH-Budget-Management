import { useState } from 'react';

export default function Pagination({ 
  data, 
  pageSize = 10, 
  onPageChange = null,
  className = ""
}) {
  const [page, setPage] = useState(1);
  const [currentPageSize, setCurrentPageSize] = useState(pageSize);

  const totalPages = Math.ceil(data.length / currentPageSize);
  const startIndex = (page - 1) * currentPageSize;
  const endIndex = Math.min(startIndex + currentPageSize, data.length);
  const pagedData = data.slice(startIndex, endIndex);

  const handlePageChange = (newPage) => {
    setPage(newPage);
    if (onPageChange) {
      onPageChange(pagedData, newPage);
    }
  };

  const handlePageSizeChange = (newPageSize) => {
    setCurrentPageSize(newPageSize);
    setPage(1);
  };

  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (page <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      } else if (page >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = page - 1; i <= page + 1; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  if (data.length === 0) {
    return null;
  }

  return (
    <div className={`flex flex-col sm:flex-row justify-between items-center gap-4 mt-4 p-4 bg-gray-50 rounded-lg ${className}`}>
      {/* Results Info */}
      <div className="text-sm text-gray-600">
        Affichage de {startIndex + 1} à {endIndex} sur {data.length} résultat(s)
      </div>

      {/* Page Size Selector */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-600">Afficher:</span>
        <select
          value={currentPageSize}
          onChange={(e) => handlePageSizeChange(Number(e.target.value))}
          className="px-2 py-1 border border-gray-300 rounded text-sm"
        >
          <option value={5}>5</option>
          <option value={10}>10</option>
          <option value={25}>25</option>
          <option value={50}>50</option>
          <option value={100}>100</option>
        </select>
        <span className="text-sm text-gray-600">par page</span>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center gap-2">
          <button
            disabled={page === 1}
            onClick={() => handlePageChange(1)}
            className="px-3 py-1 rounded bg-white border border-gray-300 text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            «
          </button>
          <button
            disabled={page === 1}
            onClick={() => handlePageChange(page - 1)}
            className="px-3 py-1 rounded bg-white border border-gray-300 text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            ‹
          </button>

          {getPageNumbers().map((pageNum, index) => (
            <button
              key={index}
              onClick={() => typeof pageNum === 'number' && handlePageChange(pageNum)}
              disabled={pageNum === '...'}
              className={`px-3 py-1 rounded text-sm ${
                pageNum === page
                  ? 'bg-blue-600 text-white'
                  : pageNum === '...'
                  ? 'text-gray-400 cursor-default'
                  : 'bg-white border border-gray-300 hover:bg-gray-50'
              }`}
            >
              {pageNum}
            </button>
          ))}

          <button
            disabled={page === totalPages}
            onClick={() => handlePageChange(page + 1)}
            className="px-3 py-1 rounded bg-white border border-gray-300 text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            ›
          </button>
          <button
            disabled={page === totalPages}
            onClick={() => handlePageChange(totalPages)}
            className="px-3 py-1 rounded bg-white border border-gray-300 text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            »
          </button>
        </div>
      )}
    </div>
  );
} 