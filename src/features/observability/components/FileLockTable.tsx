import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import type { FileLockDto } from "../types";
import { formatDuration } from "@/lib/utils";
import { Lock, Unlock, AlertTriangle, FileText, Users } from "lucide-react";

interface FileLockTableProps {
  fileLocks: { locks: FileLockDto[] } | undefined;
  isLoading: boolean;
  onReleaseLock: (ticketId: string) => Promise<void>;
  isReleasingLock: boolean;
}

/**
 * FileLockTable component - AC#3
 * 
 * Displays active file locks with conflict tracking:
 * - Table of active locks with file_path, ticket_id, duration
 * - Conflict warning badge for tickets waiting on same file
 * - "Manually Release" button using TanStack Mutation
 */
export function FileLockTable({
  fileLocks,
  isLoading,
  onReleaseLock,
  isReleasingLock,
}: FileLockTableProps) {
  const locks = fileLocks?.locks || [];

  // Calculate duration since lock was acquired
  const getLockDuration = (lockedAt: Date): number => {
    const locked = new Date(lockedAt);
    const now = new Date();
    return Math.floor((now.getTime() - locked.getTime()) / 1000);
  };

  // Check if lock has conflicts (waiting tickets)
  const hasConflicts = (lock: FileLockDto): boolean => {
    return lock.waiting_count > 0;
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>File Locks</CardTitle>
          <CardDescription>Loading lock data...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[200px] animate-pulse bg-gray-200 rounded" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lock className="h-5 w-5" />
          File Locks
          {locks.length > 0 && (
            <Badge variant="secondary">{locks.length} active</Badge>
          )}
        </CardTitle>
        <CardDescription>
          Active file locks and conflict tracking
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Conflict Warning */}
        {locks.some(hasConflicts) && (
          <Alert variant="warning">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Lock Conflicts Detected</AlertTitle>
            <AlertDescription>
              Some files have multiple tickets waiting. Consider releasing locks
              for stale executions.
            </AlertDescription>
          </Alert>
        )}

        {/* Locks Table */}
        {locks.length > 0 ? (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead>File Path</TableHead>
                  <TableHead>Ticket ID</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Waiting</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {locks.map((lock) => {
                  const duration = getLockDuration(lock.locked_at);
                  const conflicts = hasConflicts(lock);

                  return (
                    <TableRow key={`${lock.file_path}-${lock.locked_by_ticket_id}`}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-gray-400" />
                          <span
                            className="font-mono text-xs truncate max-w-[200px]"
                            title={lock.file_path}
                          >
                            {lock.file_path}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-mono text-xs">
                          {lock.locked_by_ticket_id.slice(0, 8)}...
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-muted-foreground">
                          {formatDuration(duration)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Users className="h-3 w-3 text-gray-400" />
                          <span>{lock.waiting_count}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {conflicts ? (
                          <Badge variant="default" className="text-xs bg-yellow-100 text-yellow-800">
                            Conflict
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="text-xs">
                            Clean
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onReleaseLock(lock.locked_by_ticket_id)}
                          disabled={isReleasingLock}
                          className="text-xs"
                        >
                          <Unlock className="h-3 w-3 mr-1" />
                          Release
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <Lock className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p>No active file locks</p>
            <p className="text-sm">All files are currently available</p>
          </div>
        )}

        {/* Waiting Tickets Details (for locks with conflicts) */}
        {locks.filter(hasConflicts).map((lock) => (
          <Card key={`waiting-${lock.file_path}`} className="bg-yellow-50/50">
            <CardHeader className="py-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-yellow-500" />
                Waiting for: {lock.file_path}
              </CardTitle>
            </CardHeader>
            <CardContent className="py-0">
              <div className="space-y-2">
                {lock.waiting_tickets.map((ticket) => (
                  <div
                    key={ticket.ticket_id}
                    className="flex items-center justify-between text-sm py-2 border-b last:border-0"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs">
                        {ticket.ticket_id.slice(0, 8)}...
                      </span>
                      <span className="text-muted-foreground">
                        waiting {formatDuration(ticket.wait_time_seconds)}
                      </span>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      Position {lock.waiting_tickets.indexOf(ticket) + 1}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </CardContent>
    </Card>
  );
}
