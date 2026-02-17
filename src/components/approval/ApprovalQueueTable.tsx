/**
 * Approval Queue Table
 * Displays all executions awaiting PM approval
 */

import React from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  createColumnHelper,
  type SortingState,
} from '@tanstack/react-table';
import type { ApprovalExecution } from '../../types/approval';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import {
  Eye,
  Clock,
  Cpu,
  FileCode,
  ArrowUpDown,
  Zap,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useState } from 'react';

interface ApprovalQueueTableProps {
  data: ApprovalExecution[];
  onReview: (execution: ApprovalExecution) => void;
  isLoading?: boolean;
}

const columnHelper = createColumnHelper<ApprovalExecution>();

export const ApprovalQueueTable: React.FC<ApprovalQueueTableProps> = ({
  data,
  onReview,
  isLoading,
}) => {
  const [sorting, setSorting] = useState<SortingState>([]);

  const columns = [
    columnHelper.accessor('ticketTitle', {
      header: ({ column }) => (
        <button
          className="flex items-center gap-1"
          onClick={() => column.toggleSorting()}
        >
          Ticket
          <ArrowUpDown className="w-3 h-3" />
        </button>
      ),
      cell: (info) => (
        <div className="flex flex-col gap-0.5 max-w-[280px]">
          <span className="font-bold text-foreground truncate">
            {info.getValue() || 'Untitled'}
          </span>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono text-primary">
              {info.row.original.ticketId}
            </span>
            {info.row.original.projectName && (
              <>
                <span className="text-muted-foreground/40">·</span>
                <span className="text-[11px] text-muted-foreground truncate">
                  {info.row.original.projectName}
                </span>
              </>
            )}
          </div>
        </div>
      ),
    }),
    columnHelper.accessor('aiProvider', {
      header: 'AI Provider',
      cell: (info) => {
        const provider = info.getValue();
        const color =
          provider === 'CLAUDE_CODE'
            ? 'bg-orange-500/10 text-orange-400 border-orange-500/20'
            : 'bg-blue-500/10 text-blue-400 border-blue-500/20';
        return (
          <Badge className={`${color} gap-1`}>
            <Cpu className="w-3 h-3" />
            {provider?.replace('_', ' ') || 'Unknown'}
          </Badge>
        );
      },
    }),
    columnHelper.accessor('confidenceScore', {
      header: ({ column }) => (
        <button
          className="flex items-center gap-1"
          onClick={() => column.toggleSorting()}
        >
          Confidence
          <ArrowUpDown className="w-3 h-3" />
        </button>
      ),
      cell: (info) => {
        const score = info.getValue();
        if (score === null || score === undefined)
          return <span className="text-muted-foreground">—</span>;
        const pct = Math.round(score * 100);
        const color =
          pct >= 85
            ? 'text-emerald-500'
            : pct >= 70
              ? 'text-amber-500'
              : 'text-rose-500';
        return (
          <div className="flex items-center gap-2">
            <Zap className={`w-3.5 h-3.5 ${color}`} />
            <span className={`font-mono font-bold ${color}`}>{pct}%</span>
          </div>
        );
      },
    }),
    columnHelper.accessor('filesChanged', {
      header: 'Files',
      cell: (info) => {
        const files = info.getValue();
        const count = Array.isArray(files) ? files.length : 0;
        return (
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <FileCode className="w-3.5 h-3.5" />
            <span className="font-mono text-sm font-bold text-foreground">
              {count}
            </span>
          </div>
        );
      },
    }),
    columnHelper.accessor('qaResult', {
      header: 'QA Status',
      cell: (info) => {
        const qa = info.getValue();
        if (!qa) return <Badge className="bg-muted text-muted-foreground">No QA</Badge>;
        const passed = qa.overall_passed;
        return (
          <div className="flex flex-col gap-1">
            <Badge
              className={
                passed
                  ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                  : 'bg-rose-500/10 text-rose-500 border-rose-500/20'
              }
            >
              {passed ? 'QA Passed' : 'QA Issues'}
            </Badge>
            {qa.test_coverage !== null && qa.test_coverage !== undefined && (
              <span className="text-[10px] text-muted-foreground">
                Coverage: {qa.test_coverage}%
              </span>
            )}
          </div>
        );
      },
    }),
    columnHelper.accessor('updatedAt', {
      header: ({ column }) => (
        <button
          className="flex items-center gap-1"
          onClick={() => column.toggleSorting()}
        >
          Waiting Since
          <ArrowUpDown className="w-3 h-3" />
        </button>
      ),
      cell: (info) => {
        const date = info.getValue();
        if (!date) return <span className="text-muted-foreground">—</span>;
        const waitTime = formatDistanceToNow(new Date(date), {
          addSuffix: true,
        });
        const hours =
          (Date.now() - new Date(date).getTime()) / (1000 * 60 * 60);
        const urgency =
          hours > 2
            ? 'text-rose-500'
            : hours > 1
              ? 'text-amber-500'
              : 'text-muted-foreground';
        return (
          <div className={`flex items-center gap-1.5 ${urgency}`}>
            <Clock className="w-3.5 h-3.5" />
            <span className="text-sm font-medium">{waitTime}</span>
          </div>
        );
      },
    }),
    columnHelper.display({
      id: 'actions',
      header: '',
      cell: (info) => (
        <Button
          size="sm"
          onClick={() => onReview(info.row.original)}
          className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl px-4 py-1.5 font-bold transition-all hover:scale-[1.02] active:scale-[0.98] h-auto gap-1.5"
        >
          <Eye className="w-3.5 h-3.5" />
          Review
        </Button>
      ),
    }),
  ];

  const table = useReactTable({
    data,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-20 bg-card/50 border border-border rounded-xl animate-pulse"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="bg-card/50 border border-border rounded-2xl overflow-hidden">
      <table className="w-full text-left border-collapse">
        <thead className="bg-card border-b border-border">
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground"
                >
                  {flexRender(
                    header.column.columnDef.header,
                    header.getContext(),
                  )}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody className="divide-y divide-border/50">
          {table.getRowModel().rows.length > 0 ? (
            table.getRowModel().rows.map((row) => (
              <tr
                key={row.id}
                className="hover:bg-accent/30 transition-colors group cursor-pointer"
                onClick={() => onReview(row.original)}
              >
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-6 py-4">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td
                colSpan={columns.length}
                className="px-6 py-16 text-center"
              >
                <div className="flex flex-col items-center gap-3">
                  <div className="p-4 bg-emerald-500/10 rounded-2xl">
                    <Zap className="w-8 h-8 text-emerald-500" />
                  </div>
                  <p className="text-lg font-bold text-foreground">
                    All caught up!
                  </p>
                  <p className="text-sm text-muted-foreground">
                    No executions are awaiting your approval.
                  </p>
                </div>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};
