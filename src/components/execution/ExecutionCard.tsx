import { useState, memo, useEffect } from 'react';
import { 
  Play,
  Pause, 
  Square, 
  Terminal, 
  Loader2,
  AlertTriangle,
  ShieldAlert,
  MoreVertical,
  ChevronRight,
  Activity
} from 'lucide-react';
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

interface ExecutionCardProps {
  execution: Execution;
  onViewLogs?: (executionId: string) => void;
  onResolve?: (executionId: string) => void;
  socket?: ReturnType<typeof import('@/lib/socket/useSocketIO').useSocketIO>['socket'];
}

const statusConfig: Record<ExecutionStatus, { 
  label: string; 
  color: string; 
  bgColor: string;
  borderColor: string;
}> = {
  'QUEUED': {
    label: 'Queued',
    color: 'text-slate-500',
    bgColor: 'bg-slate-500/10',
    borderColor: 'border-slate-500/20'
  },
  'IN_PROGRESS': {
    label: 'In Progress',
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/20',
    borderColor: 'border-blue-500/30'
  },
  'PAUSED': {
    label: 'Paused',
    color: 'text-amber-500',
    bgColor: 'bg-amber-500/10',
    borderColor: 'border-amber-500/20'
  },
  'COMPLETED': {
    label: 'Completed',
    color: 'text-emerald-500',
    bgColor: 'bg-emerald-500/10',
    borderColor: 'border-emerald-500/20'
  },
  'FAILED': {
    label: 'Failed',
    color: 'text-rose-500',
    bgColor: 'bg-rose-500/10',
    borderColor: 'border-rose-500/20'
  },
  'TIMEOUT': {
    label: 'Timeout',
    color: 'text-orange-500',
    bgColor: 'bg-orange-500/10',
    borderColor: 'border-orange-500/20'
  },
  'CANCELLED': {
    label: 'Cancelled',
    color: 'text-slate-500',
    bgColor: 'bg-slate-500/10',
    borderColor: 'border-slate-500/20'
  },
  'AWAITING_APPROVAL': {
    label: 'Awaiting Approval',
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/30'
  },
  'QA_FAILED': {
    label: 'QA Failed',
    color: 'text-rose-500',
    bgColor: 'bg-rose-500/10',
    borderColor: 'border-rose-500/30',
  },
};

// Lazy-load the activity timeline to avoid bloating the initial card bundle
import { lazy, Suspense } from 'react';
const ContainerActivityTimeline = lazy(() => import('./ContainerActivityTimeline'));

export const ExecutionCard = memo(function ExecutionCard({ execution, onViewLogs, onResolve, socket }: ExecutionCardProps) {
  const { user } = useAuth();
  const controlMutation = useControlExecution();
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingAction, setPendingAction] = useState<'pause' | 'resume' | 'emergency-stop' | null>(null);
  const [liveDuration, setLiveDuration] = useState(execution.duration || 0);

  // Live duration timer
  useEffect(() => {
    if (execution.status === 'IN_PROGRESS' && execution.startTime) {
      const start = new Date(execution.startTime).getTime();
      const interval = setInterval(() => {
        const now = Date.now();
        const seconds = Math.floor((now - start) / 1000);
        setLiveDuration(seconds > 0 ? seconds : 0);
      }, 1000);
      return () => clearInterval(interval);
    } else {
      setLiveDuration(execution.duration || 0);
    }
  }, [execution.status, execution.startTime, execution.duration]);

  const status = statusConfig[execution.status] || {
    label: 'Unknown',
    color: 'text-slate-500',
    bgColor: 'bg-slate-500/10',
    borderColor: 'border-slate-500/20'
  };
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

  const formatDuration = (seconds?: number) => {
    if (typeof seconds !== 'number' || isNaN(seconds)) return '0s';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins > 0) {
      return `${mins}m ${secs}s`;
    }
    return `${secs}s`;
  };

  return (
    <TooltipProvider>
      <div className="bg-card border border-border rounded-2xl p-6 hover:shadow-2xl hover:shadow-primary/5 transition-all group relative overflow-hidden">
        <div className="absolute top-0 left-0 w-1 h-full bg-primary opacity-0 group-hover:opacity-100 transition-opacity"></div>
        
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h3 className="text-lg font-bold text-card-foreground group-hover:text-primary transition-colors">
                {execution.projectName}
              </h3>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${status.bgColor} ${status.color} ${status.borderColor}`}>
                {status.label}
              </span>
            </div>
            <p className="text-sm text-muted-foreground flex items-center gap-1.5">
              Ticket: <span className="text-foreground/80 font-medium font-mono">{execution.ticketId}</span>
            </p>
          </div>
          <div className="flex gap-3 items-center">
            {execution.status === 'IN_PROGRESS' && (
              <span className="bg-blue-500/20 text-blue-400 border border-blue-500/30 px-2 py-0.5 rounded text-[10px] font-bold animate-pulse">
                RUNNING
              </span>
            )}
            <button className="text-muted-foreground hover:text-foreground transition-colors">
              <MoreVertical className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Progress */}
        <div className="mb-8">
          <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1.5">
            <span>{execution.currentStep || 'Initializing...'}</span>
            <span>{execution.percentComplete}%</span>
          </div>
          <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
             <div 
               className={`h-full rounded-full transition-all duration-1000 ${
                execution.status === 'FAILED' || execution.status === 'QA_FAILED' ? 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]' :
                execution.status === 'COMPLETED' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' :
                'bg-blue-600 shadow-[0_0_8px_rgba(37,99,235,0.5)]'
              }`}
               style={{ width: `${execution.percentComplete}%` }}
             />
          </div>
        </div>

        {/* Container Activity Timeline (PM-friendly live feed / historical review) */}
        {(() => {
          const isLive = execution.status === 'IN_PROGRESS' || execution.status === 'PAUSED';
          const showTimeline = isLive || ['COMPLETED', 'FAILED', 'TIMEOUT', 'CANCELLED', 'QA_FAILED'].includes(execution.status);
          if (!showTimeline) return null;

          return (
            <div className="mb-4 bg-secondary/20 rounded-xl border border-border/50 p-3">
              <div className="flex items-center gap-1.5 mb-2">
                <Activity className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  {isLive ? 'Live Activity' : 'Activity History'}
                </span>
                {isLive && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                )}
              </div>
              <Suspense fallback={
                <div className="flex items-center gap-2 py-2 text-xs text-muted-foreground">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  Loading timeline...
                </div>
              }>
                <ContainerActivityTimeline
                  executionId={execution.id}
                  socket={socket ?? null}
                  maxHeight="240px"
                  collapsible={true}
                  defaultCollapsed={true}
                  isLive={isLive}
                />
              </Suspense>
            </div>
          );
        })()}

        {/* Metadata Grid */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="bg-secondary/30 rounded-xl p-3 border border-border/50">
             <p className="text-[10px] text-muted-foreground uppercase font-bold mb-1">Provider</p>
             <p className="text-sm font-bold text-foreground">{execution.aiProvider}</p>
          </div>
          <div className="bg-secondary/30 rounded-xl p-3 border border-border/50">
             <p className="text-[10px] text-muted-foreground uppercase font-bold mb-1">Duration</p>
             <p className="text-sm font-bold text-foreground">{formatDuration(liveDuration)}</p>
          </div>
        </div>

        {/* QA Failure Prompt (FE-1.1) */}
        {execution.status === 'QA_FAILED' && (
          <div className="mt-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-rose-400 text-sm">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span className="font-medium">
                QA failed
                {execution.qaRetryCount === undefined
                  ? ''
                  : execution.qaRetryCount === 0
                  ? ' on first attempt'
                  : ` after ${execution.qaRetryCount} retr${execution.qaRetryCount === 1 ? 'y' : 'ies'}`}
                {" — "}action required
              </span>
            </div>
            <Button
              size="sm"
              variant="destructive"
              className="h-8 rounded-lg px-4 font-bold shadow-lg shadow-rose-500/20"
              onClick={() => onResolve?.(execution.id)}
              aria-label={`Resolve QA failure for execution ${execution.id}`}
            >
              Resolve
            </Button>
          </div>
        )}

        {/* Error message if failed */}
        {execution.errorMessage && execution.status !== 'QA_FAILED' && (
          <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/20 rounded-lg">
            <p className="text-xs text-rose-500 font-medium flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5" />
              {execution.errorMessage}
            </p>
          </div>
        )}

        {/* Actions Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-border/50 mt-4">
          <div className="flex gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="p-2 bg-secondary hover:bg-secondary/80 text-muted-foreground hover:text-foreground rounded-lg transition-all h-8"
                  onClick={() => onViewLogs?.(execution.id)}
                >
                  <Terminal className="w-4 h-4 mr-1.5" />
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
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 border-amber-500/30 text-amber-500 hover:bg-amber-500/10 hover:text-amber-400 bg-transparent"
                    onClick={() => handleControlAction('pause')}
                    disabled={controlMutation.isPending}
                  >
                    {controlMutation.isPending ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Pause className="w-3.5 h-3.5 mr-1" />
                    )}
                    Pause
                  </Button>
                )}

                {availableControls.includes('resume') && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 border-emerald-500/30 text-emerald-500 hover:bg-emerald-500/10 hover:text-emerald-400 bg-transparent"
                    onClick={() => handleControlAction('resume')}
                    disabled={controlMutation.isPending}
                  >
                     {controlMutation.isPending ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Play className="w-3.5 h-3.5 mr-1" />
                    )}
                    Resume
                  </Button>
                )}

                {availableControls.includes('emergency-stop') && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 border-rose-500/30 text-rose-500 hover:bg-rose-500/10 hover:text-rose-400 bg-transparent"
                    onClick={() => handleControlAction('emergency-stop')}
                    disabled={controlMutation.isPending}
                  >
                    {controlMutation.isPending ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Square className="w-3.5 h-3.5 mr-1" />
                    )}
                    Stop
                  </Button>
                )}
              </div>
            )}
          </div>

          <button
            className="text-xs font-bold text-primary hover:text-primary/80 flex items-center gap-1 py-1 px-2 hover:bg-primary/5 rounded-lg transition-all"
            onClick={() => onViewLogs?.(execution.id)}
          >
            Details
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Emergency Stop Confirmation Dialog */}
        <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
          <DialogContent className="bg-card border-border text-card-foreground">
            <DialogHeader>
              <DialogTitle className="text-rose-500 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Emergency Stop
              </DialogTitle>
              <DialogDescription className="text-muted-foreground">
                Are you sure you want to emergency stop this execution? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <div className="p-3 bg-secondary/50 border border-border rounded-lg">
                <p className="text-sm text-foreground/80">
                  <span className="text-muted-foreground">Project:</span> {execution.projectName}
                </p>
                <p className="text-sm text-foreground/80">
                  <span className="text-muted-foreground">Ticket:</span> {execution.ticketId}
                </p>
                <p className="text-sm text-foreground/80">
                  <span className="text-muted-foreground">Current Step:</span> {execution.currentStep || 'N/A'}
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowConfirmDialog(false)}
                className="border-border text-foreground hover:bg-secondary"
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
