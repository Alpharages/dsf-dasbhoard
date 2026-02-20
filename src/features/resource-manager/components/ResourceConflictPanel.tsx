import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Unlock, ArrowUpDown, ShieldAlert, FileKey } from 'lucide-react';
import {
  useForceUnlockMutation,
  useReprioritizeMutation,
} from '../hooks/useResourceManager';
import type { FileLock } from '../types';

interface ForceUnlockDialogProps {
  lock: FileLock | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function ForceUnlockDialog({ lock, open, onOpenChange }: ForceUnlockDialogProps) {
  const [reason, setReason] = useState('');
  const forceUnlock = useForceUnlockMutation();

  const handleSubmit = async () => {
    if (!lock || !reason.trim()) return;

    await forceUnlock.mutateAsync({
      lockId: lock.id,
      reason: reason.trim(),
    });

    setReason('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <ShieldAlert className="h-5 w-5" />
            Force Unlock File
          </DialogTitle>
          <DialogDescription>
            This is a destructive action that will immediately release the lock. An audit log entry
            will be created with your reason.
          </DialogDescription>
        </DialogHeader>

        {lock && (
          <div className="space-y-4 py-4">
            <div className="rounded-md bg-muted p-4 space-y-2">
              <div className="flex items-center gap-2">
                <FileKey className="h-4 w-4 text-muted-foreground" />
                <span className="font-mono text-sm">{lock.filePath}</span>
              </div>
              <div className="text-sm text-muted-foreground">
                Ticket: <span className="font-mono">{lock.ticketId}</span>
              </div>
              <div className="text-sm text-muted-foreground">
                Locked for: {lock.lockAgeMinutes} minutes
                {lock.isStale && (
                  <Badge variant="destructive" className="ml-2">
                    Stale
                  </Badge>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="reason" className="text-red-600">
                Reason for Force Unlock <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="reason"
                placeholder="Explain why you are forcefully releasing this lock (required for audit log)..."
                value={reason}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setReason(e.target.value)}
                className="min-h-[100px]"
              />
              <p className="text-xs text-muted-foreground">
                This reason will be recorded in the audit log for accountability.
              </p>
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={forceUnlock.isPending}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!reason.trim() || forceUnlock.isPending}
            variant="destructive"
          >
            {forceUnlock.isPending ? 'Unlocking...' : 'Force Unlock'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface ReprioritizeDialogProps {
  ticketId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function ReprioritizeDialog({ ticketId, open, onOpenChange }: ReprioritizeDialogProps) {
  const [reason, setReason] = useState('');
  const [priority, setPriority] = useState<number>(50);
  const reprioritize = useReprioritizeMutation();

  const handleSubmit = async () => {
    if (!ticketId || !reason.trim()) return;

    await reprioritize.mutateAsync({
      ticketId,
      newPriority: priority,
      reason: reason.trim(),
    });

    setReason('');
    setPriority(50);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ArrowUpDown className="h-5 w-5" />
            Reprioritize Ticket
          </DialogTitle>
          <DialogDescription>
            Change the priority of this ticket in the execution queue. Higher priority tickets are
            processed first.
          </DialogDescription>
        </DialogHeader>

        {ticketId && (
          <div className="space-y-6 py-4">
            <div className="rounded-md bg-muted p-4">
              <div className="text-sm text-muted-foreground">
                Ticket ID: <span className="font-mono">{ticketId}</span>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label>New Priority: {priority}</Label>
                <Slider
                  value={[priority]}
                  onValueChange={(value) => setPriority(value[0])}
                  max={100}
                  min={0}
                  step={1}
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Low (0)</span>
                  <span>Medium (50)</span>
                  <span>High (100)</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="reprioritize-reason">
                  Reason <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="reprioritize-reason"
                  placeholder="Explain why you are changing the priority..."
                  value={reason}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setReason(e.target.value)}
                  className="min-h-[100px]"
                />
                <p className="text-xs text-muted-foreground">
                  This reason will be recorded in the audit log.
                </p>
              </div>
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={reprioritize.isPending}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!reason.trim() || reprioritize.isPending}
          >
            {reprioritize.isPending ? 'Updating...' : 'Reprioritize'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface ResourceConflictPanelProps {
  selectedLock: FileLock | null;
  onClearSelection: () => void;
}

export function ResourceConflictPanel({ selectedLock, onClearSelection }: ResourceConflictPanelProps) {
  const [forceUnlockOpen, setForceUnlockOpen] = useState(false);
  const [reprioritizeOpen, setReprioritizeOpen] = useState(false);

  // Open force unlock dialog when a lock is selected
  const handleForceUnlockClick = () => {
    if (selectedLock) {
      setForceUnlockOpen(true);
    }
  };

  // Open reprioritize dialog
  const handleReprioritizeClick = () => {
    if (selectedLock) {
      setReprioritizeOpen(true);
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldAlert className="h-5 w-5" />
            Conflict Resolution
          </CardTitle>
          <CardDescription>
            Actions to resolve resource conflicts and manage execution queue
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {selectedLock ? (
            <div className="rounded-md bg-muted p-4 space-y-2">
              <div className="font-medium">Selected Lock</div>
              <div className="text-sm font-mono text-muted-foreground truncate">
                {selectedLock.filePath}
              </div>
              <div className="text-sm text-muted-foreground">
                Ticket: {selectedLock.ticketId}
              </div>
              {selectedLock.isStale && (
                <Badge variant="destructive" className="mt-2">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  Stale Lock ({selectedLock.lockAgeMinutes} min)
                </Badge>
              )}
            </div>
          ) : (
            <div className="text-sm text-muted-foreground py-4 text-center">
              Select a lock from the Active File Locks table to perform actions
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="destructive"
              disabled={!selectedLock}
              onClick={handleForceUnlockClick}
              className="w-full"
            >
              <Unlock className="h-4 w-4 mr-2" />
              Force Unlock
            </Button>
            <Button
              variant="outline"
              disabled={!selectedLock}
              onClick={handleReprioritizeClick}
              className="w-full"
            >
              <ArrowUpDown className="h-4 w-4 mr-2" />
              Reprioritize
            </Button>
          </div>

          {selectedLock && (
            <Button variant="ghost" className="w-full" onClick={onClearSelection}>
              Clear Selection
            </Button>
          )}
        </CardContent>
      </Card>

      <ForceUnlockDialog
        lock={selectedLock}
        open={forceUnlockOpen}
        onOpenChange={(open) => {
          setForceUnlockOpen(open);
          if (!open) onClearSelection();
        }}
      />

      <ReprioritizeDialog
        ticketId={selectedLock?.ticketId || null}
        open={reprioritizeOpen}
        onOpenChange={(open) => {
          setReprioritizeOpen(open);
          if (!open) onClearSelection();
        }}
      />
    </>
  );
}
