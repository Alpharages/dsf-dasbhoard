import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
  type SortingState,
  type ColumnDef,
} from '@tanstack/react-table';
import { useState, useMemo } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle, Unlock, ExternalLink, Clock, FileKey } from 'lucide-react';
import { useActiveLocks } from '../hooks/useResourceManager';
import type { FileLock } from '../types';

interface ActiveLockManagerProps {
  onForceUnlock?: (lock: FileLock) => void;
}

export function ActiveLockManager({ onForceUnlock }: ActiveLockManagerProps) {
  const { data: locks, isLoading, error } = useActiveLocks();
  const [sorting, setSorting] = useState<SortingState>([{ id: 'lockAgeMinutes', desc: true }]);
  const [globalFilter, setGlobalFilter] = useState('');

  const columns = useMemo<ColumnDef<FileLock>[]>(
    () => [
      {
        accessorKey: 'filePath',
        header: 'File Path',
        cell: ({ row }) => (
          <div className="flex items-center gap-2 max-w-md">
            <FileKey className="h-4 w-4 text-muted-foreground shrink-0" />
            <span className="font-mono text-xs truncate" title={row.original.filePath}>
              {row.original.filePath}
            </span>
          </div>
        ),
      },
      {
        accessorKey: 'ticketId',
        header: 'Ticket',
        cell: ({ row }) => (
          <a
            href={`https://app.clickup.com/t/${row.original.ticketId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-primary hover:underline"
          >
            <span className="font-mono text-xs">{row.original.ticketId}</span>
            <ExternalLink className="h-3 w-3" />
          </a>
        ),
      },
      {
        accessorKey: 'executionId',
        header: 'Execution ID',
        cell: ({ row }) => (
          <span className="font-mono text-xs text-muted-foreground">
            {row.original.executionId.slice(0, 8)}...
          </span>
        ),
      },
      {
        accessorKey: 'lockAgeMinutes',
        header: 'Lock Age',
        cell: ({ row }) => {
          const minutes = row.original.lockAgeMinutes;
          const hours = Math.floor(minutes / 60);
          const mins = minutes % 60;
          const isStale = row.original.isStale;

          return (
            <div className="flex items-center gap-2">
              <Clock className={`h-4 w-4 ${isStale ? 'text-red-500' : 'text-muted-foreground'}`} />
              <span className={isStale ? 'text-red-600 font-medium' : ''}>
                {hours > 0 ? `${hours}h ${mins}m` : `${mins}m`}
              </span>
              {isStale && (
                <Badge variant="destructive" className="text-xs">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  Stale
                </Badge>
              )}
            </div>
          );
        },
      },
      {
        accessorKey: 'agentName',
        header: 'Agent',
        cell: ({ row }) => (
          <span className="text-sm text-muted-foreground">
            {row.original.agentName || row.original.agentId || 'Unknown'}
          </span>
        ),
      },
      {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onForceUnlock?.(row.original)}
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <Unlock className="h-4 w-4 mr-1" />
            Force Unlock
          </Button>
        ),
      },
    ],
    [onForceUnlock]
  );

  const table = useReactTable({
    data: locks || [],
    columns,
    state: {
      sorting,
      globalFilter,
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  // Count stale locks
  const staleCount = useMemo(() => {
    return locks?.filter((lock) => lock.isStale).length || 0;
  }, [locks]);

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-red-600 flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            Error Loading Locks
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">{error.message}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <FileKey className="h-5 w-5" />
              Active File Locks
            </CardTitle>
            <CardDescription>
              {isLoading ? (
                'Loading...'
              ) : (
                <>
                  {locks?.length || 0} active locks
                  {staleCount > 0 && (
                    <Badge variant="destructive" className="ml-2">
                      {staleCount} stale
                    </Badge>
                  )}
                </>
              )}
            </CardDescription>
          </div>
          <div className="w-64">
            <Input
              placeholder="Search locks..."
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              className="h-9"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    {columns.map((_, j) => (
                      <TableCell key={j}>
                        <Skeleton className="h-4 w-full" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && 'selected'}
                    className={row.original.isStale ? 'bg-red-50/50' : ''}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-24 text-center text-muted-foreground">
                    No active locks found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
