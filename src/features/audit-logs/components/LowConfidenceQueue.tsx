import React, { useState } from 'react';
import { useReactTable, getCoreRowModel, flexRender, createColumnHelper } from '@tanstack/react-table';
import { useLowConfidenceAudits, useRequestReworkMutation } from '../hooks/useAudit';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, AlertCircle } from 'lucide-react';
import type { AIDecisionLog } from '../types';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

const ActionCell: React.FC<{
  ticketId: string;
  isPending: boolean;
  onRequestRework: (ticketId: string, reasoning: string) => void;
}> = ({ ticketId, isPending, onRequestRework }) => {
  const [reason, setReason] = useState('');
  return (
    <div className="flex items-center gap-2">
      <input
        type="text"
        placeholder="Reasoning..."
        className="text-xs px-2 py-1 rounded border border-border bg-background w-32"
        value={reason}
        onChange={(e) => setReason(e.target.value)}
      />
      <Button
        size="sm"
        variant="outline"
        disabled={isPending || !reason}
        onClick={() => {
          onRequestRework(ticketId, reason);
          setReason('');
        }}
      >
        Request Rework
      </Button>
    </div>
  );
};

export const LowConfidenceQueue: React.FC = () => {
  const [minConfidence, setMinConfidence] = useState(0.5);
  const [page, setPage] = useState(1);
  const { data, isLoading, isError } = useLowConfidenceAudits(minConfidence, page, 50);
  const { mutate: requestRework, isPending } = useRequestReworkMutation();

  const columnHelper = createColumnHelper<AIDecisionLog>();
  const columns = [
    columnHelper.accessor('ticket_id', {
      header: 'Ticket ID',
      cell: info => <span className="font-mono text-xs">{info.getValue()}</span>,
    }),
    columnHelper.accessor('action', {
      header: 'Action',
      cell: info => <span className="font-semibold">{info.getValue()}</span>,
    }),
    columnHelper.accessor('confidence', {
      header: 'Confidence',
      cell: info => (
        <Badge variant={info.getValue() >= 0.5 ? 'secondary' : 'destructive'}>
          {(info.getValue() * 100).toFixed(1)}%
        </Badge>
      ),
    }),
    columnHelper.accessor('agent_name', {
      header: 'Agent',
    }),
    columnHelper.accessor('timestamp', {
      header: 'Time',
      cell: info => new Date(info.getValue()).toLocaleString(),
    }),
    columnHelper.display({
      id: 'actions',
      header: 'Actions',
      cell: (info) => (
        <ActionCell
          ticketId={info.row.original.ticket_id}
          isPending={isPending}
          onRequestRework={(ticketId, reasoning) => requestRework({ ticketId, reasoning })}
        />
      )
    })
  ];

  const table = useReactTable({
    data: data?.data || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="space-y-6">
      <div className="bg-card border border-border p-6 rounded-2xl shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold">Review Required Items</h2>
            <p className="text-sm text-muted-foreground">Queue of low confidence actions requiring human review</p>
          </div>
          
          <div className="flex items-center gap-4 w-64">
            <span className="text-sm text-muted-foreground whitespace-nowrap">Max Confidence:</span>
            <Slider
              value={[minConfidence]}
              min={0.1}
              max={0.9}
              step={0.1}
              onValueChange={([val]) => {
                setMinConfidence(val);
                setPage(1);
              }}
            />
            <span className="text-sm font-semibold w-10 text-right">{(minConfidence * 100).toFixed(0)}%</span>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center py-12 text-destructive bg-destructive/10 rounded-xl">
            <AlertCircle className="w-8 h-8 mb-2" />
            <p>Failed to load review queue</p>
          </div>
        ) : data?.data.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground bg-secondary/20 rounded-xl">
            No items require review at this confidence threshold.
          </div>
        ) : (
          <div className="rounded-xl border border-border overflow-hidden">
            <Table>
              <TableHeader className="bg-secondary/50">
                {table.getHeaderGroups().map(headerGroup => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map(header => (
                      <TableHead key={header.id}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows.map(row => (
                  <TableRow key={row.id}>
                    {row.getVisibleCells().map(cell => (
                      <TableCell key={cell.id}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
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
        )}
      </div>
    </div>
  );
};
