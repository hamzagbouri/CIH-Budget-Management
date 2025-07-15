import { useState } from 'react';

export default function Table({ columns, data, onEdit, onDelete, enableSort = false, enablePagination = false, pageSize = 5, customActions }) {
  const [sortCol, setSortCol] = useState(null);
  const [sortDir, setSortDir] = useState('asc');
  const [page, setPage] = useState(1);

  // Sorting
  let sortedData = [...data];
  if (enableSort && sortCol) {
    sortedData.sort((a, b) => {
      if (a[sortCol] < b[sortCol]) return sortDir === 'asc' ? -1 : 1;
      if (a[sortCol] > b[sortCol]) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
  }

  // Pagination
  const totalPages = enablePagination ? Math.ceil(sortedData.length / pageSize) : 1;
  const pagedData = enablePagination ? sortedData.slice((page - 1) * pageSize, page * pageSize) : sortedData;

  return (
    <div>
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
      {enablePagination && totalPages > 1 && (
        <div className="flex justify-end gap-2 mt-2">
          <button disabled={page === 1} onClick={() => setPage(page - 1)} className="px-2 py-1 rounded bg-gray-200 disabled:opacity-50">Préc.</button>
          <span className="px-2">Page {page} / {totalPages}</span>
          <button disabled={page === totalPages} onClick={() => setPage(page + 1)} className="px-2 py-1 rounded bg-gray-200 disabled:opacity-50">Suiv.</button>
        </div>
      )}
    </div>
  );
} 