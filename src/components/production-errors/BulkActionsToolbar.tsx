/**
 * Bulk Actions Toolbar
 * Story 9-U-5: Production Error Dashboard - AC#7
 *
 * Toolbar for bulk operations on selected errors.
 * 
 * Optimizations:
 * - useCallback for event handlers
 * - React.memo to prevent unnecessary re-renders
 */

import { useState, useCallback, memo } from 'react';
import { useBulkCreateTickets, useAcknowledgeError, useExportErrors } from '@/hooks/useProductionErrors';
import { Ticket, CheckCircle, Download, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from 'react-hot-toast';

interface BulkActionsToolbarProps {
  selectedErrors: string[];
  onClearSelection: () => void;
}

type ConfirmAction = 'createTickets' | 'acknowledge' | null;

function BulkActionsToolbarComponent({ selectedErrors, onClearSelection }: BulkActionsToolbarProps) {
  const [confirmAction, setConfirmAction] = useState<ConfirmAction>(null);
  
  const { mutate: bulkCreateTickets, isPending: isCreating } = useBulkCreateTickets();
  const { mutate: acknowledgeError, isPending: isAcknowledging } = useAcknowledgeError();
  const { mutate: exportErrors, isPending: isExporting } = useExportErrors();

  if (selectedErrors.length === 0) return null;

  // useCallback for stable function references
  const handleCreateTickets = useCallback(() => {
    bulkCreateTickets(selectedErrors, {
      onSuccess: (result) => {
        toast.success(
          `Created ${result.created} tickets. ${result.skipped} skipped.`
        );
        onClearSelection();
        setConfirmAction(null);
      },
      onError: () => {
        toast.error('Failed to create tickets');
      },
    });
  }, [bulkCreateTickets, selectedErrors, onClearSelection]);

  const handleAcknowledge = useCallback(() => {
    // Acknowledge all selected errors
    let completed = 0;
    let failed = 0;

    selectedErrors.forEach((errorId) => {
      acknowledgeError(
        { errorId },
        {
          onSuccess: () => {
            completed++;
            if (completed + failed === selectedErrors.length) {
              toast.success(`Acknowledged ${completed} errors`);
              onClearSelection();
              setConfirmAction(null);
            }
          },
          onError: () => {
            failed++;
            if (completed + failed === selectedErrors.length) {
              toast.success(`Acknowledged ${completed} errors`);
              if (failed > 0) {
                toast.error(`Failed to acknowledge ${failed} errors`);
              }
              onClearSelection();
              setConfirmAction(null);
            }
          },
        }
      );
    });
  }, [acknowledgeError, selectedErrors, onClearSelection]);

  const handleExport = useCallback(() => {
    exportErrors(selectedErrors, {
      onSuccess: (blob) => {
        // Create download link
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `production-errors-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        
        toast.success('Exported errors to CSV');
        onClearSelection();
      },
      onError: () => {
        toast.error('Failed to export errors');
      },
    });
  }, [exportErrors, selectedErrors, onClearSelection]);

  return (
    <>
      <div className="flex items-center gap-4 p-4 bg-slate-800/50 rounded-lg border border-slate-700">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-slate-300">
            {selectedErrors.length} selected
          </span>
          <Button variant="ghost" size="sm" onClick={onClearSelection}>
            <X className="w-4 h-4 mr-1" />
            Clear
          </Button>
        </div>

        <div className="h-6 w-px bg-slate-700" />

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setConfirmAction('createTickets')}
            disabled={isCreating}
          >
            <Ticket className="w-4 h-4 mr-2" />
            Create Tickets
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setConfirmAction('acknowledge')}
            disabled={isAcknowledging}
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            Acknowledge
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
            disabled={isExporting}
          >
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Confirmation Dialogs */}
      <AlertDialog open={confirmAction === 'createTickets'} onOpenChange={() => setConfirmAction(null)}>
        <AlertDialogContent className="bg-slate-900 border-slate-800 text-slate-200">
          <AlertDialogHeader>
            <AlertDialogTitle>Create Fix Tickets?</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-400">
              This will create ClickUp tickets for {selectedErrors.length} selected errors.
              Errors that already have tickets will be skipped.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCreateTickets}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Create Tickets
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={confirmAction === 'acknowledge'} onOpenChange={() => setConfirmAction(null)}>
        <AlertDialogContent className="bg-slate-900 border-slate-800 text-slate-200">
          <AlertDialogHeader>
            <AlertDialogTitle>Acknowledge Errors?</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-400">
              This will mark {selectedErrors.length} selected errors as acknowledged.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleAcknowledge}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Acknowledge
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

// Memoize to prevent re-renders when parent updates but props don't change
export const BulkActionsToolbar = memo(BulkActionsToolbarComponent);
