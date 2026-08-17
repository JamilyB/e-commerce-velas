import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export const DataTable: React.FC<{
  columns: Array<{ key: string; label: string; render?: (row: Record<string, unknown>) => React.ReactNode; width?: string }>;
  data: Array<Record<string, unknown>>;
  onRowClick?: (row: Record<string, unknown>) => void;
  emptyMessage?: string;
  pageSize?: number;
}> = ({ columns, data, onRowClick, emptyMessage = 'Nenhum registro encontrado.', pageSize = 10 }) => {
  const [currentPage, setCurrentPage] = React.useState(1);
  const totalPages = Math.ceil(data.length / pageSize);
  const paginatedData = data.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  if (data.length === 0) {
    return (
      <div className="text-center py-12 text-sm text-[#A28776]">{emptyMessage}</div>
    );
  }

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#E4C7B7]/20">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className="text-left text-[10px] font-bold uppercase tracking-wider text-[#A28776] py-3 px-4"
                  style={col.width ? { width: col.width } : undefined}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((row, idx) => (
              <tr
                key={idx}
                onClick={() => onRowClick?.(row)}
                className={`border-b border-[#E4C7B7]/10 transition-colors ${onRowClick ? 'cursor-pointer hover:bg-[#FAF9F5]' : ''}`}
              >
                {columns.map((col) => (
                  <td key={col.key} className="py-3.5 px-4 text-sm text-[#56443F]">
                    {col.render ? col.render(row) : String(row[col.key] ?? '—')}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-[#E4C7B7]/20">
          <span className="text-xs text-[#A28776]">
            Página {currentPage} de {totalPages} • {data.length} registros
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg hover:bg-[#E4C7B7]/20 disabled:opacity-30 text-[#56443F] transition-colors"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg hover:bg-[#E4C7B7]/20 disabled:opacity-30 text-[#56443F] transition-colors"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
