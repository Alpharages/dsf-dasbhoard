/**
 * Error List Table
 * Story 9-U-5: Production Error Dashboard - AC#2
 *
 * Filterable, sortable table with pagination and row selection.
 * 
 * Optimizations:
 * - useCallback for event handlers (stable function references)
 * - useMemo for expensive computations
 * - React.memo to prevent unnecessary re-renders
 */

import { useState, useMemo, useCallback, memo } from 'react';
import { useProductionErrors, useApplications } from '@/hooks/useProductionErrors';
import type { ErrorListFilters, ErrorSeverity, ErrorListItem } from '@/api/production-errors';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  type SortingState,
} from '@tanstack/react-table';
import { format } from 'date-fns';
import { ChevronDown, ChevronUp, Filter, X } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';

interface ErrorListTableProps {
  filters: ErrorListFilters;
  onFilterChange: (filters: ErrorListFilters) => void;
  selectedErrors: string[];
  onSelectionChange: (selected: string[]) => void;
  onErrorClick: (error: ErrorListItem) => void;
}

const severityColors: Record<ErrorSeverity, string> = {
  CRITICAL: 'bg-red-500/20 text-red-400 border-red-500/50',
  HIGH: 'bg-orange-500/20 text-orange-400 border-orange-500/50',
  MEDIUM: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50',
  LOW: 'bg-blue-500/20 text-blue-400 border-blue-500/50',
};

const severityOrder: ErrorSeverity[] = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'];

function ErrorListTableComponent({
  filters,
  onFilterChange,
  selectedErrors,
  onSelectionChange,
  onErrorClick,
}: ErrorListTableProps) {
  const [sorting, setSorting] = useState<SortingState>([
    { id: 'severity', desc: false },
  ]);
  
  const { data: errorData, isLoading } = useProductionErrors(filters);
  const { data: applications } = useApplications();

  const errors = errorData?.errors || [];
  const totalCount = errorData?.total || 0;
  const pageCount = Math.ceil(totalCount / (filters.limit || 20));

  // Toggle row selection - useCallback for stable function reference
  const toggleSelection = useCallback((errorId: string) => {
    if (selectedErrors.includes(errorId)) {
      onSelectionChange(selectedErrors.filter(id => id !== errorId));
    } else {
      onSelectionChange([...selectedErrors, errorId]);
    }
  }, [selectedErrors, onSelectionChange]);

  // Toggle all selection - useCallback for stable function reference
  const toggleAll = useCallback(() => {
    if (selectedErrors.length === errors.length) {
      onSelectionChange([]);
    } else {
      onSelectionChange(errors.map(e => e.id));
    }
  }, [selectedErrors.length, errors, onSelectionChange]);

  // Table columns
  const columns = useMemo(
    () => [
      {
        id: 'select',
        header: () => (
          <Checkbox
            checked={errors.length > 0 && selectedErrors.length === errors.length}
            onCheckedChange={toggleAll}
          />
        ),
        cell: ({ row }: { row: { original: ErrorListItem } }) => (
          <Checkbox
            checked={selectedErrors.includes(row.original.id)}
            onCheckedChange={() => toggleSelection(row.original.id)}
          />
        ),
        size: 40,
      },
      {
        accessorKey: 'application',
        header: 'Application',
        cell: ({ row }: { row: { original: ErrorListItem } }) => (
          <span className="font-medium text-slate-300">{row.original.application}</span>
        ),
      },
      {
        accessorKey: 'error_type',
        header: 'Error Type',
        cell: ({ row }: { row: { original: ErrorListItem } }) => (
          <span className="text-slate-300">{row.original.error_type}</span>
        ),
      },
      {
        accessorKey: 'error_message',
        header: 'Message',
        cell: ({ row }: { row: { original: ErrorListItem } }) => (
          <span className="text-slate-400 truncate max-w-[300px] block">
            {row.original.error_message}
          </span>
        ),
      },
      {
        accessorKey: 'severity',
        header: 'Severity',
        cell: ({ row }: { row: { original: ErrorListItem } }) => (
          <Badge
            variant="outline"
            className={`${severityColors[row.original.severity]} font-semibold`}
          >
            {row.original.severity}
          </Badge>
        ),
        sortingFn: (a: { original: ErrorListItem }, b: { original: ErrorListItem }) => {
          return severityOrder.indexOf(a.original.severity) - severityOrder.indexOf(b.original.severity);
        },
      },
      {
        accessorKey: 'occurred_at',
        header: 'Occurred At',
        cell: ({ row }: { row: { original: ErrorListItem } }) => (
          <span className="text-slate-400 text-sm">
            {format(new Date(row.original.occurred_at), 'MMM dd, HH:mm')}
          </span>
        ),
      },
      {
        accessorKey: 'affected_users',
        header: 'Affected Users',
        cell: ({ row }: { row: { original: ErrorListItem } }) => (
          <span className="text-slate-400">{row.original.affected_users}</span>
        ),
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }: { row: { original: ErrorListItem } }) => {
          const error = row.original;
          if (error.resolved) {
            return <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400">Resolved</Badge>;
          }
          if (error.fix_ticket_id) {
            return <Badge variant="outline" className="bg-blue-500/10 text-blue-400">Ticket Created</Badge>;
          }
          if (error.acknowledged_at) {
            return <Badge variant="outline" className="bg-yellow-500/10 text-yellow-400">Acknowledged</Badge>;
          }
          return <Badge variant="outline" className="bg-red-500/10 text-red-400">Active</Badge>;
        },
      },
    ],
    [selectedErrors, errors.length]
  );

  const table = useReactTable({
    data: errors,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    manualPagination: true,
    pageCount,
  });

  if (isLoading) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <Skeleton className="h-6 w-48 mb-4" />
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-12" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="text-sm text-slate-400">Filters:</span>
        </div>

        {/* Severity Filter */}
        <Select
          value={filters.severity?.[0] || 'all'}
          onValueChange={(value) => {
            onFilterChange({
              ...filters,
              severity: value === 'all' ? undefined : [value as ErrorSeverity],
            });
          }}
        >
          <SelectTrigger className="w-40 bg-slate-800 border-slate-700">
            <SelectValue placeholder="Severity" />
          </SelectTrigger>
          <SelectContent className="bg-slate-800 border-slate-700">
            <SelectItem value="all">All Severities</SelectItem>
            <SelectItem value="CRITICAL">Critical</SelectItem>
            <SelectItem value="HIGH">High</SelectItem>
            <SelectItem value="MEDIUM">Medium</SelectItem>
            <SelectItem value="LOW">Low</SelectItem>
          </SelectContent>
        </Select>

        {/* Status Filter */}
        <Select
          value={filters.status || 'all'}
          onValueChange={(value) => {
            onFilterChange({
              ...filters,
              status: value === 'all' ? undefined : value as ErrorListFilters['status'],
            });
          }}
        >
          <SelectTrigger className="w-40 bg-slate-800 border-slate-700">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent className="bg-slate-800 border-slate-700">
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="ticket_created">Ticket Created</SelectItem>
            <SelectItem value="resolved">Resolved</SelectItem>
          </SelectContent>
        </Select>

        {/* Application Filter */}
        <Select
          value={filters.application?.[0] || 'all'}
          onValueChange={(value) => {
            onFilterChange({
              ...filters,
              application: value === 'all' ? undefined : [value],
            });
          }}
        >
          <SelectTrigger className="w-48 bg-slate-800 border-slate-700">
            <SelectValue placeholder="Application" />
          </SelectTrigger>
          <SelectContent className="bg-slate-800 border-slate-700">
            <SelectItem value="all">All Applications</SelectItem>
            {applications?.map((app) => (
              <SelectItem key={app} value={app}>{app}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Clear Filters */}
        {(filters.severity || filters.status || filters.application) && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onFilterChange({ page: 1, limit: filters.limit })}
          >
            <X className="w-4 h-4 mr-1" />
            Clear
          </Button>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id} className="border-b border-slate-800">
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="text-left py-3 px-4 text-sm font-medium text-slate-400 cursor-pointer hover:text-slate-300"
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    <div className="flex items-center gap-1">
                      {flexRender(header.column.columnDef.header, header.getContext())}
                      {header.column.getIsSorted() === 'asc' && <ChevronUp className="w-4 h-4" />}
                      {header.column.getIsSorted() === 'desc' && <ChevronDown className="w-4 h-4" />}
                    </div>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr
                key={row.id}
                className="border-b border-slate-800/50 hover:bg-slate-800/30 cursor-pointer transition-colors"
                onClick={() => onErrorClick(row.original)}
              >
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="py-3 px-4" onClick={(e) => e.stopPropagation()}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
            {errors.length === 0 && (
              <tr>
                <td colSpan={columns.length} className="py-8 text-center text-slate-500">
                  No errors found matching the current filters
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-800">
        <div className="text-sm text-slate-400">
          Showing {(filters.page || 1) * (filters.limit || 20) - (filters.limit || 20) + 1} to{' '}
          {Math.min((filters.page || 1) * (filters.limit || 20), totalCount)} of {totalCount} errors
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onFilterChange({ ...filters, page: (filters.page || 1) - 1 })}
            disabled={(filters.page || 1) <= 1}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onFilterChange({ ...filters, page: (filters.page || 1) + 1 })}
            disabled={(filters.page || 1) >= pageCount}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}

// Memoize to prevent re-renders when parent updates but props don't change
// Follows rerender-memo best practice
export const ErrorListTable = memo(ErrorListTableComponent);
