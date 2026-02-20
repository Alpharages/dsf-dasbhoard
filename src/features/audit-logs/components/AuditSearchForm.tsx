import React, { useState } from 'react';
import { useAuditSearch } from '../hooks/useAudit';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, Search } from 'lucide-react';
import { flexRender, getCoreRowModel, useReactTable, createColumnHelper } from '@tanstack/react-table';
import type { AIDecisionLog } from '../types';

import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

export interface AuditSearchFormProps {
  onViewDetail?: (ticketId: string) => void;
}

export const AuditSearchForm: React.FC<AuditSearchFormProps> = ({ onViewDetail }) => {
  const [filters, setFilters] = useState({
    agent_name: '',
    action: '',
    ticketId: '',
    startDate: '',
    endDate: '',
  });
  
  const [page, setPage] = useState(1);
  const [activeFilters, setActiveFilters] = useState(filters);
  const { data, isLoading } = useAuditSearch({ ...activeFilters, page, limit: 10 });

  const columnHelper = createColumnHelper<AIDecisionLog>();
  const columns = [
    columnHelper.accessor('ticket_id', { header: 'Ticket ID', cell: info => <span className="font-mono text-xs">{info.getValue()}</span> }),
    columnHelper.accessor('action', { header: 'Action', cell: info => <span className="font-semibold">{info.getValue()}</span> }),
    columnHelper.accessor('agent_name', { header: 'Agent' }),
    columnHelper.accessor('confidence', {
      header: 'Confidence',
      cell: info => <Badge variant="outline">{(info.getValue() * 100).toFixed(0)}%</Badge>,
    }),
    columnHelper.accessor('timestamp', {
      header: 'Date',
      cell: info => new Date(info.getValue()).toLocaleString(),
    }),
    columnHelper.display({
      id: 'actions',
      header: 'Actions',
      cell: info => (
        <Button 
          variant="link" 
          size="sm" 
          onClick={() => onViewDetail && onViewDetail(info.row.original.ticket_id)}
          className="p-0 h-auto font-semibold"
        >
          View Detail
        </Button>
      )
    }),
  ];

  const table = useReactTable({
    data: data?.data || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setActiveFilters(filters);
    setPage(1);
  };

  return (
    <div className="space-y-6">
      <div className="bg-card border border-border p-6 rounded-2xl shadow-sm">
        <h2 className="text-xl font-bold mb-4">Global Audit Search</h2>
        
        <form onSubmit={handleSearch} className="flex gap-4 items-end mb-8 flex-wrap">
          <div className="flex-1 min-w-[150px] space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Ticket ID</label>
            <input
              type="text"
              className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm"
              placeholder="Filter by Ticket ID"
              value={filters.ticketId}
              onChange={(e) => setFilters(prev => ({ ...prev, ticketId: e.target.value }))}
            />
          </div>
          <div className="flex-1 space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Agent Name</label>
            <input
              type="text"
              className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm"
              placeholder="Filter by Agent"
              value={filters.agent_name}
              onChange={(e) => setFilters(prev => ({ ...prev, agent_name: e.target.value }))}
            />
          </div>
          <div className="flex-1 min-w-[150px] space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Action</label>
            <input
              type="text"
              className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm"
              placeholder="Filter by Action"
              value={filters.action}
              onChange={(e) => setFilters(prev => ({ ...prev, action: e.target.value }))}
            />
          </div>
          <div className="flex-1 min-w-[150px] space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Start Date</label>
            <input
              type="date"
              className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm"
              value={filters.startDate}
              onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value }))}
            />
          </div>
          <div className="flex-1 min-w-[150px] space-y-2">
            <label className="text-sm font-medium text-muted-foreground">End Date</label>
            <input
              type="date"
              className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm"
              value={filters.endDate}
              onChange={(e) => setFilters(prev => ({ ...prev, endDate: e.target.value }))}
            />
          </div>
          
          <Button type="submit" disabled={isLoading} className="gap-2">
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            Search
          </Button>
        </form>

        <div className="rounded-xl border border-border overflow-hidden">
          <Table>
            <TableHeader className="bg-secondary/50">
              {table.getHeaderGroups().map(headerGroup => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map(header => (
                    <TableHead key={header.id}>
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows.length > 0 ? (
                table.getRowModel().rows.map(row => (
                  <TableRow key={row.id}>
                    {row.getVisibleCells().map(cell => (
                      <TableCell key={cell.id}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className="text-center py-8 text-muted-foreground bg-secondary/10">
                    No results found matching your filters.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          
          {data?.meta && data.meta.totalPages > 1 && (
            <div className="p-4 border-t border-border">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious 
                      size="default"
                      onClick={() => setPage(p => Math.max(1, p - 1))} 
                      className={page <= 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                  </PaginationItem>
                  <PaginationItem>
                    <span className="px-4 text-sm font-medium">Page {page} of {data.meta.totalPages}</span>
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationNext 
                      size="default"
                      onClick={() => setPage(p => Math.min(data.meta.totalPages, p + 1))}
                      className={page >= data.meta.totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
