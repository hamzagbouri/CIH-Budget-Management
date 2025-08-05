import { useState } from 'react';

export default function Table({ 
  columns, 
  data, 
  onEdit, 
  onDelete, 
  enableSort = false, 
  enablePagination = false, 
  pageSize = 10, 
  customActions,
  searchable = false,
  onSearch = null
}) {
  const [sortCol, setSortCol] = useState(null);
  const [sortDir, setSortDir] = useState('asc');
  const [page, setPage] = useState(1);
  const [currentPageSize, setCurrentPageSize] = useState(pageSize);
  const [searchTerm, setSearchTerm] = useState('');

  // Filter data if searchable
  let filteredData = [...data];
  if (searchable && searchTerm) {
    filteredData = data.filter(row => 
      Object.values(row).some(value => 
        value && value.toString().toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }

  // Sorting
  let sortedData = [...filteredData];
  if (enableSort && sortCol) {
    sortedData.sort((a, b) => {
      if (a[sortCol] < b[sortCol]) return sortDir === 'asc' ? -1 : 1;
      if (a[sortCol] > b[sortCol]) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
  }

  // Pagination
  const totalPages = enablePagination ? Math.ceil(sortedData.length / currentPageSize) : 1;
  const pagedData = enablePagination ? sortedData.slice((page - 1) * currentPageSize, page * currentPageSize) : sortedData;
  const startIndex = (page - 1) * currentPageSize + 1;
  const endIndex = Math.min(page * currentPageSize, sortedData.length);

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  const handlePageSizeChange = (newPageSize) => {
    setCurrentPageSize(newPageSize);
    setPage(1); // Reset to first page when changing page size
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

  return (
    <div>
      {/* Search Bar */}
      {searchable && (
        <div className="mb-4">
          <input
            type="text"
            placeholder="Rechercher..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      )}

      <table className="min-w-full border rounded-xl overflow-hidden">
        <thead>
          <tr className="bg-[#f5f7fa]">
            {columns.map((col) => (
              <th
                key={col.key}
                className="py-2 px-4 border-b text-left font-medium cursor-pointer select-none"
                onClick={enableSort && col.sortable !== false ? () => {
                  if (sortCol === col.key) setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
                  else { setSortCol(col.key); setSortDir('asc'); }
                } : undefined}
              >
                {col.label}
                {enableSort && col.sortable !== false && sortCol === col.key && (
                  <span className="ml-1">{sortDir === 'asc' ? '▲' : '▼'}</span>
                )}
              </th>
            ))}
            {(onEdit || onDelete || customActions) && <th className="py-2 px-4 border-b text-left font-medium">Actions</th>}
          </tr>
        </thead>
        <tbody>
          {pagedData.map((row, idx) => (
            <tr key={idx} className="hover:bg-blue-50">
              {columns.map((col) => (
                <td key={col.key} className="py-2 px-4 border-b">
                  {col.render ? col.render(row[col.key], row) : row[col.key]}
                </td>
              ))}
              {(onEdit || onDelete || customActions) && (
                <td className="py-2 px-4 border-b">
                  <div className="flex items-center gap-2">
                    {customActions && customActions(row)}
                    {onEdit && <button className="text-blue-600 hover:underline mr-2" onClick={() => onEdit(row)}>Éditer</button>}
                    {onDelete && <button className="text-red-500 hover:underline" onClick={() => onDelete(row)}>Supprimer</button>}
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>

      {/* Enhanced Pagination */}
      {enablePagination && totalPages > 1 && (
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-4 p-4 bg-gray-50 rounded-lg">
          {/* Results Info */}
          <div className="text-sm text-gray-600">
            Affichage de {startIndex} à {endIndex} sur {sortedData.length} résultat(s)
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
        </div>
      )}
    </div>
  );
} 