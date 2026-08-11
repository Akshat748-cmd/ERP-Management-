import React, { ReactNode, useState } from 'react';
import { cn } from '@/shared/utils/cn';
import { ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react';

/* ─── Column definition ───────────────────────────────────────────── */
export interface Column<T> {
  header: string;
  accessorKey?: keyof T;
  cell?: (row: T) => ReactNode;
  className?: string;
  sortable?: boolean;
  width?: string;
}

/* ─── Table props ─────────────────────────────────────────────────── */
export interface TableProps<T> {
  data: T[];
  columns: Column<T>[];
  keyExtractor: (row: T) => string | number;
  emptyMessage?: string;
  emptyIcon?: ReactNode;
  isLoading?: boolean;
  skeletonRows?: number;
  /** Called when a row is clicked */
  onRowClick?: (row: T) => void;
  /** Show checkbox column */
  selectable?: boolean;
  /** Compact row height */
  compact?: boolean;
  className?: string;
}

/* ─── Skeleton Row ────────────────────────────────────────────────── */
const SkeletonRow: React.FC<{ cols: number; compact?: boolean }> = ({ cols, compact }) => (
  <tr className="border-b border-slate-50">
    {Array.from({ length: cols }).map((_, i) => (
      <td key={i} className={cn('px-4', compact ? 'py-2.5' : 'py-3.5')}>
        <div
          className="skeleton rounded-md"
          style={{ height: 12, width: i === 0 ? '60%' : i === cols - 1 ? '40%' : '70%' }}
        />
      </td>
    ))}
  </tr>
);

/* ─── Main Table ──────────────────────────────────────────────────── */
export function Table<T>({
  data,
  columns,
  keyExtractor,
  emptyMessage = 'No records found',
  emptyIcon,
  isLoading = false,
  skeletonRows = 6,
  onRowClick,
  selectable = false,
  compact = false,
  className,
}: TableProps<T>) {
  const [sortKey, setSortKey] = useState<keyof T | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [selectedRows, setSelectedRows] = useState<Set<string | number>>(new Set());

  const handleSort = (col: Column<T>) => {
    if (!col.sortable || !col.accessorKey) return;
    if (sortKey === col.accessorKey) {
      setSortDir(d => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(col.accessorKey);
      setSortDir('asc');
    }
  };

  const sortedData = React.useMemo(() => {
    if (!sortKey) return data;
    return [...data].sort((a, b) => {
      const av = a[sortKey] as unknown;
      const bv = b[sortKey] as unknown;
      const aStr = String(av ?? '').toLowerCase();
      const bStr = String(bv ?? '').toLowerCase();
      return sortDir === 'asc' ? aStr.localeCompare(bStr) : bStr.localeCompare(aStr);
    });
  }, [data, sortKey, sortDir]);

  const toggleRow = (key: string | number) => {
    setSelectedRows(prev => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  };

  const toggleAll = () => {
    if (selectedRows.size === sortedData.length) {
      setSelectedRows(new Set());
    } else {
      setSelectedRows(new Set(sortedData.map(r => keyExtractor(r))));
    }
  };

  const SortIcon: React.FC<{ col: Column<T> }> = ({ col }) => {
    if (!col.sortable) return null;
    if (sortKey !== col.accessorKey) return <ChevronsUpDown className="w-3 h-3 text-slate-300 group-hover:text-slate-400" />;
    return sortDir === 'asc'
      ? <ChevronUp className="w-3 h-3 text-slate-600" />
      : <ChevronDown className="w-3 h-3 text-slate-600" />;
  };

  const totalCols = columns.length + (selectable ? 1 : 0);

  return (
    <div className={cn('w-full overflow-x-auto', className)}>
      <table className="w-full text-left text-[13px] border-collapse">
        {/* Head */}
        <thead>
          <tr className="border-b border-slate-100">
            {selectable && (
              <th className="pl-4 pr-2 py-3 w-8">
                <input
                  type="checkbox"
                  checked={selectedRows.size === sortedData.length && sortedData.length > 0}
                  onChange={toggleAll}
                  className="w-3.5 h-3.5 accent-slate-700 rounded cursor-pointer"
                />
              </th>
            )}
            {columns.map((col, idx) => (
              <th
                key={idx}
                onClick={() => handleSort(col)}
                style={{ width: col.width }}
                className={cn(
                  'px-4 py-3 font-semibold text-[11px] uppercase tracking-wider text-slate-400 whitespace-nowrap select-none group',
                  col.sortable && 'cursor-pointer hover:text-slate-600',
                  col.className
                )}
              >
                <span className="inline-flex items-center gap-1.5">
                  {col.header}
                  <SortIcon col={col} />
                </span>
              </th>
            ))}
          </tr>
        </thead>

        {/* Body */}
        <tbody>
          {isLoading ? (
            Array.from({ length: skeletonRows }).map((_, i) => (
              <SkeletonRow key={i} cols={totalCols} compact={compact} />
            ))
          ) : sortedData.length === 0 ? (
            <tr>
              <td colSpan={totalCols}>
                <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
                  {emptyIcon && (
                    <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
                      {emptyIcon}
                    </div>
                  )}
                  <p className="text-sm font-medium text-slate-500">{emptyMessage}</p>
                  <p className="text-xs text-slate-400 mt-1">Try adjusting your filters or search terms</p>
                </div>
              </td>
            </tr>
          ) : (
            sortedData.map(row => {
              const key = keyExtractor(row);
              const isSelected = selectedRows.has(key);
              return (
                <tr
                  key={key}
                  onClick={() => onRowClick?.(row)}
                  className={cn(
                    'border-b border-slate-50 transition-colors duration-100 group/row',
                    onRowClick && 'cursor-pointer',
                    isSelected ? 'bg-slate-50' : 'hover:bg-slate-50/70'
                  )}
                >
                  {selectable && (
                    <td className="pl-4 pr-2" onClick={e => { e.stopPropagation(); toggleRow(key); }}>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleRow(key)}
                        className="w-3.5 h-3.5 accent-slate-700 rounded cursor-pointer"
                      />
                    </td>
                  )}
                  {columns.map((col, idx) => (
                    <td
                      key={idx}
                      className={cn(
                        'px-4 text-slate-700',
                        compact ? 'py-2.5' : 'py-3.5',
                        col.className
                      )}
                    >
                      {col.cell
                        ? col.cell(row)
                        : col.accessorKey
                        ? String(row[col.accessorKey] ?? '')
                        : null}
                    </td>
                  ))}
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
