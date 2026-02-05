import { useState, memo } from 'react';
import { 
  Play,
  Pause, 
  Square, 
  Terminal, 
  Loader2,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'react-hot-toast';
import { useAuth } from '@/contexts/AuthContext';
import { 
  canControlExecution, 
  getAvailableControls,
  checkExecutionControlPermission 
} from '@/lib/auth/permissions';
import { useControlExecution } from '@/hooks/queries/useExecutions';
import type { Execution, ExecutionStatus } from '@/types/execution';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface ExecutionCardProps {
  execution: Execution;
  onViewLogs?: (executionId: string) => void;
}

const statusConfig: Record<ExecutionStatus, { 
  label: string; 
  color: string; 
  icon: React.ReactNode;
  bgColor: string;
}> = {
  'QUEUED': {
    label: 'Queued',
    color: 'text-slate-400',
    icon: <Clock className="w-4 h-4" />,
    bgColor: 'bg-slate-500/10',
  },
  'IN_PROGRESS': {
    label: 'In Progress',
    color: 'text-blue-400',
    icon: <Loader2 className="w-4 h-4 animate-spin" />,
    bgColor: 'bg-blue-500/10',
  },
  'PAUSED': {
    label: 'Paused',
    color: 'text-yellow-400',
    icon: <Pause className="w-4 h-4" />,
    bgColor: 'bg-yellow-500/10',
  },
  'COMPLETED': {
    label: 'Completed',
    color: 'text-emerald-400',
    icon: <CheckCircle2 className="w-4 h-4" />,
    bgColor: 'bg-emerald-500/10',
  },
  'FAILED': {
    label: 'Failed',
    color: 'text-rose-400',
    icon: <XCircle className="w-4 h-4" />,
    bgColor: 'bg-rose-500/10',
  },
  'TIMEOUT': {
    label: 'Timeout',
    color: 'text-orange-400',
    icon: <Clock className="w-4 h-4" />,
    bgColor: 'bg-orange-500/10',
  },
  'CANCELLED': {
    label: 'Cancelled',
    color: 'text-slate-400',
    icon: <Square className="w-4 h-4" />,
    bgColor: 'bg-slate-500/10',
  },
};

export const ExecutionCard = memo(function ExecutionCard({ execution, onViewLogs }: ExecutionCardProps) {
  const { user } = useAuth();
  const controlMutation = useControlExecution();
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingAction, setPendingAction] = useState<'pause' | 'resume' | 'emergency-stop' | null>(null);

  const status = statusConfig[execution.status];
  const canControl = canControlExecution(user, execution);
  const availableControls = getAvailableControls(execution.status);

  const handleControlAction = (action: 'pause' | 'resume' | 'emergency-stop') => {
    const check = checkExecutionControlPermission(user, execution, action);
    
    if (!check.allowed) {
      toast.error(check.reason || 'Action not allowed');
      return;
    }

    if (action === 'emergency-stop') {
      setPendingAction(action);
      setShowConfirmDialog(true);
      return;
    }

    executeControlAction(action);
  };

  const executeControlAction = (action: 'pause' | 'resume' | 'emergency-stop') => {
    controlMutation.mutate(
      { executionId: execution.id, action },
      {
        onError: (error) => {
          toast.error(`Failed to ${action} execution: ${error.message}`);
        },
      }
    );
    setPendingAction(null);
    setShowConfirmDialog(false);
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins > 0) {
      return `${mins}m ${secs}s`;
    }
    return `${secs}s`;
  };

  return (
    <TooltipProvider>
      <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition-all">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${status.bgColor} ${status.color}`}>
              {status.icon}
            </div>
            <div>
              <h3 className="font-semibold text-slate-200 text-sm">
                {execution.projectName}
              </h3>
              <p className="text-xs text-slate-500 font-mono">
                {execution.ticketId}
              </p>
            </div>
          </div>
          <Badge 
            variant="outline" 
            className={`${status.color} border-current ${status.bgColor}`}
          >
            {status.label}
          </Badge>
        </div>

        {/* Progress */}
        <div className="mb-4">
          <div className="flex justify-between text-xs mb-2">
            <span className="text-slate-400">{execution.currentStep || 'Initializing...'}</span>
            <span className="text-slate-300 font-medium">{execution.percentComplete}%</span>
          </div>
          <Progress 
            value={execution.percentComplete} 
            className="h-2 bg-slate-800"
          />
        </div>

        {/* Metadata */}
        <div className="grid grid-cols-2 gap-3 mb-4 text-xs">
          <div>
            <span className="text-slate-500">Provider</span>
            <p className="text-slate-300 font-medium">{execution.aiProvider}</p>
          </div>
          <div>
            <span className="text-slate-500">Duration</span>
            <p className="text-slate-300 font-medium">{formatDuration(execution.duration)}</p>
          </div>
          <div>
            <span className="text-slate-500">Started</span>
            <p className="text-slate-300 font-medium">
              {formatDistanceToNow(new Date(execution.startTime), { addSuffix: true })}
            </p>
          </div>
          <div>
            <span className="text-slate-500">Execution ID</span>
            <p className="text-slate-300 font-medium font-mono truncate">
              {execution.id.slice(0, 8)}...
            </p>
          </div>
        </div>

        {/* Error message if failed */}
        {execution.errorMessage && (
          <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/20 rounded-lg">
            <p className="text-xs text-rose-400">
              <AlertTriangle className="w-3 h-3 inline mr-1" />
              {execution.errorMessage}
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-800">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="text-slate-400 hover:text-slate-200"
                onClick={() => onViewLogs?.(execution.id)}
              >
                <Terminal className="w-4 h-4 mr-1" />
                Logs
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>View execution logs</p>
            </TooltipContent>
          </Tooltip>

          {/* Control Buttons */}
          {canControl && availableControls.length > 0 && (
            <div className="flex items-center gap-2">
              {availableControls.includes('pause') && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/10"
                      onClick={() => handleControlAction('pause')}
                      disabled={controlMutation.isPending}
                    >
                      {controlMutation.isPending ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Pause className="w-4 h-4 mr-1" />
                      )}
                      Pause
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Pause execution</p>
                  </TooltipContent>
                </Tooltip>
              )}

              {availableControls.includes('resume') && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10"
                      onClick={() => handleControlAction('resume')}
                      disabled={controlMutation.isPending}
                    >
                      {controlMutation.isPending ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Play className="w-4 h-4 mr-1" />
                      )}
                      Resume
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Resume execution</p>
                  </TooltipContent>
                </Tooltip>
              )}

              {availableControls.includes('emergency-stop') && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-rose-500/30 text-rose-400 hover:bg-rose-500/10"
                      onClick={() => handleControlAction('emergency-stop')}
                      disabled={controlMutation.isPending}
                    >
                      {controlMutation.isPending ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Square className="w-4 h-4 mr-1" />
                      )}
                      Stop
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Emergency stop execution</p>
                  </TooltipContent>
                </Tooltip>
              )}
            </div>
          )}
        </div>

        {/* Emergency Stop Confirmation Dialog */}
        <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
          <DialogContent className="bg-slate-900 border-slate-800">
            <DialogHeader>
              <DialogTitle className="text-rose-400 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Emergency Stop
              </DialogTitle>
              <DialogDescription className="text-slate-400">
                Are you sure you want to emergency stop this execution? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <div className="p-3 bg-slate-800 rounded-lg">
                <p className="text-sm text-slate-300">
                  <span className="text-slate-500">Project:</span> {execution.projectName}
                </p>
                <p className="text-sm text-slate-300">
                  <span className="text-slate-500">Ticket:</span> {execution.ticketId}
                </p>
                <p className="text-sm text-slate-300">
                  <span className="text-slate-500">Current Step:</span> {execution.currentStep || 'N/A'}
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowConfirmDialog(false)}
                className="border-slate-700 text-slate-300"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => pendingAction && executeControlAction(pendingAction)}
                disabled={controlMutation.isPending}
                className="bg-rose-600 hover:bg-rose-700"
              >
                {controlMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Stopping...
                  </>
                ) : (
                  <>
                    <Square className="w-4 h-4 mr-2" />
                    Emergency Stop
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
});
