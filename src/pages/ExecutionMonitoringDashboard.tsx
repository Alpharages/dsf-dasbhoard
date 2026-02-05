import { useState, useCallback, lazy, Suspense, useEffect } from 'react';
import { 
  Activity, 
  RefreshCw, 
  AlertCircle,
  Pause,
  CheckCircle2,
  XCircle,
  Clock,
  Loader2,
  WifiOff
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useSocketIO, useExecutionEvents } from '@/lib/socket/useSocketIO';
import { useActiveExecutions } from '@/hooks/queries/useExecutions';
import { useUserProjects } from '@/hooks/queries/useProjects';
import { ExecutionCard } from '@/components/execution/ExecutionCard';
const ExecutionLogsViewer = lazy(() => import('@/components/execution/ExecutionLogsViewer'));
import type { ExecutionStatus } from '@/types/execution';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

interface StatusFilter {
  label: string;
  value: ExecutionStatus | 'ALL';
  icon: React.ReactNode;
  color: string;
}

const statusFilters: StatusFilter[] = [
  { 
    label: 'All', 
    value: 'ALL', 
    icon: <Activity className="w-4 h-4" />,
    color: 'text-slate-400'
  },
  { 
    label: 'In Progress', 
    value: 'IN_PROGRESS', 
    icon: <Loader2 className="w-4 h-4" />,
    color: 'text-blue-400'
  },
  { 
    label: 'Queued', 
    value: 'QUEUED', 
    icon: <Clock className="w-4 h-4" />,
    color: 'text-slate-400'
  },
  { 
    label: 'Paused', 
    value: 'PAUSED', 
    icon: <Pause className="w-4 h-4" />,
    color: 'text-yellow-400'
  },
  { 
    label: 'Completed', 
    value: 'COMPLETED', 
    icon: <CheckCircle2 className="w-4 h-4" />,
    color: 'text-emerald-400'
  },
  { 
    label: 'Failed', 
    value: 'FAILED', 
    icon: <XCircle className="w-4 h-4" />,
    color: 'text-rose-400'
  },
];

export function ExecutionMonitoringDashboard() {
  const [selectedStatus, setSelectedStatus] = useState<ExecutionStatus | 'ALL'>('ALL');
  const [viewingLogsFor, setViewingLogsFor] = useState<string | null>(null);
  
  // Fetch user's projects for room subscriptions
  const { data: userProjects = [] } = useUserProjects();
  
  // Socket.IO connection with project rooms
  const { 
    socket, 
    connected, 
    connecting, 
    error: socketError,
    joinProjectRooms
  } = useSocketIO({
    projectIds: userProjects.map(p => p.id)
  });

  // Fetch active executions
  const { 
    data: executions = [], 
    isLoading, 
    error, 
    refetch 
  } = useActiveExecutions();

  // Join project rooms when projects load and socket connects
  useEffect(() => {
    if (connected && userProjects.length > 0) {
      const projectIds = userProjects.map(p => p.id);
      joinProjectRooms(projectIds);
    }
  }, [connected, userProjects, joinProjectRooms]);

  // Handle execution events with debounced progress updates
  useExecutionEvents(socket, {
    onStarted: () => {
      toast.success('New execution started');
      refetch();
    },
    onProgress: () => {
      // Debounced refetch - only triggers after 500ms of no new progress events
      refetch();
    },
    onCompleted: (payload) => {
      toast.success(`Execution ${payload.executionId.slice(0, 8)} completed`);
      refetch();
    },
    onFailed: (payload) => {
      toast.error(`Execution ${payload.executionId.slice(0, 8)} failed`);
      refetch();
    },
    onTimeout: (payload) => {
      toast.error(`Execution ${payload.executionId.slice(0, 8)} timed out`);
      refetch();
    },
    onCancelled: (payload) => {
      toast(`Execution ${payload.executionId.slice(0, 8)} cancelled`);
      refetch();
    },
    onPaused: () => refetch(),
    onResumed: () => refetch(),
    onEmergencyStopped: () => refetch(),
  }, {
    progressDebounceMs: 500 // Debounce progress events to prevent API flooding
  });

  // Filter executions by status
  const filteredExecutions = selectedStatus === 'ALL' 
    ? executions 
    : executions.filter(e => e.status === selectedStatus);

  // Get counts for each status
  const statusCounts = statusFilters.reduce((acc, filter) => {
    if (filter.value === 'ALL') {
      acc[filter.value] = executions.length;
    } else {
      acc[filter.value] = executions.filter(e => e.status === filter.value).length;
    }
    return acc;
  }, {} as Record<string, number>);

  // Handle view logs
  const handleViewLogs = useCallback((executionId: string) => {
    setViewingLogsFor(executionId);
  }, []);

  // Close logs viewer
  const handleCloseLogs = useCallback(() => {
    setViewingLogsFor(null);
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-white">Active Executions</h1>
            <Badge 
              variant="outline" 
              className={`${
                connected 
                  ? 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10' 
                  : 'text-rose-400 border-rose-500/30 bg-rose-500/10'
              }`}
            >
              {connected ? (
                <>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1.5 animate-pulse" />
                  Real-time
                </>
              ) : connecting ? (
                <>
                  <Loader2 className="w-3 h-3 mr-1.5 animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  <WifiOff className="w-3 h-3 mr-1.5" />
                  Offline
                </>
              )}
            </Badge>
          </div>
          <p className="text-slate-500 mt-1">
            Monitor and control AI executions in real-time
          </p>
        </div>

        <Button
          variant="outline"
          onClick={() => refetch()}
          disabled={isLoading}
          className="border-slate-700 text-slate-300"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Socket Error Banner */}
      {socketError && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-center gap-3">
          <WifiOff className="w-5 h-5 text-rose-400" />
          <div className="flex-1">
            <p className="text-sm text-rose-400 font-medium">
              Real-time updates unavailable
            </p>
            <p className="text-xs text-rose-400/70">
              {socketError.message}. Data will refresh every 30 seconds.
            </p>
          </div>
        </div>
      )}

      {/* Status Filters */}
      <div className="flex flex-wrap gap-2">
        {statusFilters.map((filter) => (
          <Button
            key={filter.value}
            variant={selectedStatus === filter.value ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedStatus(filter.value)}
            className={`${
              selectedStatus === filter.value 
                ? 'bg-blue-600 hover:bg-blue-700' 
                : 'border-slate-700 text-slate-400 hover:text-slate-200'
            }`}
          >
            <span className={filter.color}>{filter.icon}</span>
            <span className="ml-2">{filter.label}</span>
            <Badge 
              variant="secondary" 
              className={`ml-2 ${
                selectedStatus === filter.value 
                  ? 'bg-blue-500/30 text-white' 
                  : 'bg-slate-800 text-slate-400'
              }`}
            >
              {statusCounts[filter.value] || 0}
            </Badge>
          </Button>
        ))}
      </div>

      {/* Error State */}
      {error && (
        <div className="p-8 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-center">
          <AlertCircle className="w-12 h-12 text-rose-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-rose-400 mb-2">
            Failed to load executions
          </h3>
          <p className="text-sm text-rose-400/70 mb-4">
            {error.message}
          </p>
          <Button 
            onClick={() => refetch()}
            variant="outline"
            className="border-rose-500/30 text-rose-400"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-slate-900/50 border border-slate-800 rounded-xl p-5">
              <div className="flex items-center gap-3 mb-4">
                <Skeleton className="w-10 h-10 rounded-lg" />
                <div className="flex-1">
                  <Skeleton className="h-4 w-32 mb-2" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </div>
              <Skeleton className="h-2 w-full mb-4" />
              <div className="grid grid-cols-2 gap-3 mb-4">
                <Skeleton className="h-8" />
                <Skeleton className="h-8" />
                <Skeleton className="h-8" />
                <Skeleton className="h-8" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && filteredExecutions.length === 0 && (
        <div className="text-center py-20 bg-slate-900/20 border border-dashed border-slate-800 rounded-3xl">
          <Activity className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-slate-400 mb-2">
            No active executions
          </h3>
          <p className="text-slate-500 max-w-md mx-auto">
            {selectedStatus === 'ALL' 
              ? "There are no executions running at the moment. New executions will appear here automatically."
              : `No executions with status "${selectedStatus.replace('_', ' ')}" found.`
            }
          </p>
        </div>
      )}

      {/* Executions Grid */}
      {!isLoading && !error && filteredExecutions.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredExecutions.map((execution) => (
            <ExecutionCard
              key={execution.id}
              execution={execution}
              onViewLogs={handleViewLogs}
            />
          ))}
        </div>
      )}

      {/* Logs Viewer Modal */}
      <Suspense fallback={null}>
        <ExecutionLogsViewer
          executionId={viewingLogsFor || ''}
          isOpen={!!viewingLogsFor}
          onClose={handleCloseLogs}
          socket={socket}
        />
      </Suspense>
    </div>
  );
}
