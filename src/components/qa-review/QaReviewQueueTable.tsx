import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
} from '@tanstack/react-table';
import type { QaReviewSample } from '../../types/qa-review';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Eye, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { format } from 'date-fns';

interface QaReviewQueueTableProps {
  data: QaReviewSample[];
  onReview: (sample: QaReviewSample) => void;
  isLoading?: boolean;
}

const columnHelper = createColumnHelper<QaReviewSample>();

export const QaReviewQueueTable: React.FC<QaReviewQueueTableProps> = ({ data, onReview, isLoading }) => {
  const columns = [
    columnHelper.accessor('ticket_id', {
      header: 'Ticket',
      cell: (info) => (
        <div className="flex flex-col">
          <span className="font-bold text-foreground">{info.getValue()}</span>
          <span className="text-xs text-muted-foreground truncate max-w-[200px]">
            {info.row.original.ticket_title || 'No Title'}
          </span>
        </div>
      ),
    }),
    columnHelper.accessor('project_name', {
      header: 'Project',
      cell: (info) => <span className="text-muted-foreground">{info.getValue() || 'N/A'}</span>,
    }),
    columnHelper.accessor('risk_level', {
      header: 'Risk',
      cell: (info) => {
        const level = info.getValue();
        const variants: Record<string, string> = {
          LOW: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
          MEDIUM: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
          HIGH: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
          CRITICAL: 'bg-rose-500/10 text-rose-500 border-rose-500/20 animate-pulse',
        };
        return <Badge className={variants[level]}>{level}</Badge>;
      },
    }),
    columnHelper.accessor('status', {
      header: 'Status',
      cell: (info) => {
        const status = info.getValue();
        const icons: Record<string, any> = {
          PENDING: <Clock className="w-3 h-3 mr-1" />,
          IN_REVIEW: <Eye className="w-3 h-3 mr-1" />,
          APPROVED: <CheckCircle className="w-3 h-3 mr-1" />,
          REJECTED: <AlertCircle className="w-3 h-3 mr-1" />,
        };
        const variants: Record<string, string> = {
          PENDING: 'bg-muted text-muted-foreground border-border',
          IN_REVIEW: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
          APPROVED: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
          REJECTED: 'bg-rose-500/10 text-rose-500 border-rose-500/20',
        };
        return (
          <Badge className={`flex items-center ${variants[status]}`}>
            {icons[status]}
            {status.replace('_', ' ')}
          </Badge>
        );
      },
    }),
    columnHelper.accessor('ai_quality_score', {
      header: 'AI Quality',
      cell: (info) => {
        const score = info.getValue() || 0;
        const color = score >= 85 ? 'text-emerald-500' : score >= 70 ? 'text-amber-500' : 'text-rose-500';
        return <span className={`font-mono font-bold ${color}`}>{score}%</span>;
      },
    }),
    columnHelper.accessor('created_at', {
      header: 'Received',
      cell: (info) => (
        <span className="text-muted-foreground text-sm">
          {format(new Date(info.getValue()), 'MMM d, HH:mm')}
        </span>
      ),
    }),
    columnHelper.display({
      id: 'actions',
      header: '',
      cell: (info) => (
        <Button
          size="sm"
          variant="outline"
          className="bg-card border-border hover:bg-accent hover:text-accent-foreground rounded-lg px-3 py-1 transition-all h-auto"
          onClick={() => onReview(info.row.original)}
        >
          {info.row.original.status === 'PENDING' ? 'Start Review' : 'View Detail'}
        </Button>
      ),
    }),
  ];

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-16 bg-muted/50 border border-border rounded-xl animate-pulse"></div>
        ))}
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden">
      <table className="w-full text-left border-collapse">
        <thead className="bg-muted/50 border-b border-border">
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th key={header.id} className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  {flexRender(header.column.columnDef.header, header.getContext())}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody className="divide-y divide-border/50">
          {table.getRowModel().rows.length > 0 ? (
            table.getRowModel().rows.map((row) => (
              <tr key={row.id} className="hover:bg-muted/30 transition-colors group">
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-6 py-4 font-normal">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={columns.length} className="px-6 py-12 text-center text-muted-foreground font-medium">
                No review samples currently in the queue.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};
