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
  WifiOff,
  Filter,
  SortAsc
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useQueryClient } from '@tanstack/react-query';


import { useSocketIO, useExecutionEvents } from '@/lib/socket/useSocketIO';
import { useActiveExecutions, executionKeys } from '@/hooks/queries/useExecutions';
import { useUserProjects } from '@/hooks/queries/useProjects';
import { ExecutionCard } from '@/components/execution/ExecutionCard';
const ExecutionLogsViewer = lazy(() => import('@/components/execution/ExecutionLogsViewer'));
import type { ExecutionStatus } from '@/types/execution';
import { Button } from '@/components/ui/button';

interface StatusFilter {
  label: string;
  value: ExecutionStatus | 'ALL';
  icon: React.ReactNode;
  color: string;
  activeColor: string;
  activeBg: string;
}

const statusFilters: StatusFilter[] = [
  { 
    label: 'All', 
    value: 'ALL', 
    icon: <Activity className="w-4 h-4" />,
    color: 'text-slate-400',
    activeColor: 'text-primary-foreground',
    activeBg: 'bg-primary'
  },
  { 
    label: 'In Progress', 
    value: 'IN_PROGRESS', 
    icon: <Loader2 className="w-4 h-4" />,
    color: 'text-blue-500',
    activeColor: 'text-white',
    activeBg: 'bg-blue-600'
  },
  { 
    label: 'Queued', 
    value: 'QUEUED', 
    icon: <Clock className="w-4 h-4" />,
    color: 'text-slate-400',
    activeColor: 'text-white',
    activeBg: 'bg-slate-600'
  },
  { 
    label: 'Paused', 
    value: 'PAUSED', 
    icon: <Pause className="w-4 h-4" />,
    color: 'text-amber-500',
    activeColor: 'text-white',
    activeBg: 'bg-amber-600'
  },
  { 
    label: 'Completed', 
    value: 'COMPLETED', 
    icon: <CheckCircle2 className="w-4 h-4" />,
    color: 'text-emerald-500',
    activeColor: 'text-white',
    activeBg: 'bg-emerald-600'
  },
  { 
    label: 'Failed', 
    value: 'FAILED', 
    icon: <XCircle className="w-4 h-4" />,
    color: 'text-rose-500',
    activeColor: 'text-white',
    activeBg: 'bg-rose-600'
  },
];

export function ExecutionMonitoringDashboard() {
  const queryClient = useQueryClient();
  const [selectedStatus, setSelectedStatus] = useState<ExecutionStatus | 'ALL'>('ALL');
  const [viewingLogsFor, setViewingLogsFor] = useState<string | null>(null);
  
  // Fetch user's projects for room subscriptions
  const { data: userProjects = [] } = useUserProjects();
  
  // Socket.IO connection with project rooms
  const { 
    socket, 
    connected, 
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
    onProgress: (payload) => {
      console.log('[Dashboard] Received progress:', payload);
      // Optimistically update cache for smooth progress
      queryClient.setQueryData(
        executionKeys.activeFiltered(undefined),
        (oldData: any[] | undefined) => {
          if (!oldData) return oldData;
          return oldData.map((exec) =>
            exec.id === payload.executionId
              ? {
                  ...exec,
                  status: payload.status,
                  currentStep: payload.currentStep || exec.currentStep,
                  percentComplete: payload.percentComplete ?? exec.percentComplete,
                }
              : exec,
          );
        },
      );
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
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-4 mb-2">
            <h1 className="text-4xl font-extrabold text-foreground tracking-tight leading-none">Active Executions</h1>
            <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
              connected 
                ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' 
                : 'bg-rose-500/10 text-rose-500 border-rose-500/20'
            }`}>
              <div className={`w-1.5 h-1.5 rounded-full ${connected ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`}></div>
              {connected ? 'Real-time Live' : 'Offline'}
            </div>
          </div>
          <p className="text-muted-foreground font-medium">
            Monitor and control AI executions in real-time
          </p>
        </div>

        <button
          onClick={() => refetch()}
          disabled={isLoading}
          className="p-3 bg-secondary/50 border border-border text-muted-foreground hover:text-foreground hover:bg-secondary rounded-2xl transition-all"
          title="Refresh Data"
        >
          <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Socket Error Banner */}
      {socketError && (
        <div className="bg-rose-500/10 border border-rose-500/20 rounded-2xl p-6 text-rose-500 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <WifiOff className="w-5 h-5" />
            <div>
              <p className="font-semibold">Real-time updates unavailable</p>
              <p className="text-sm opacity-80">{socketError.message}. Data will refresh every 30 seconds.</p>
            </div>
          </div>
        </div>
      )}

      {/* Controls & Filters Bar */}
      <div className="bg-card/50 border border-border rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap gap-2">
          {statusFilters.map((filter) => (
            <button
              key={filter.value}
              onClick={() => setSelectedStatus(filter.value)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
                selectedStatus === filter.value 
                  ? `${filter.activeBg} ${filter.activeColor} border-transparent shadow-lg` 
                  : `bg-secondary/50 text-muted-foreground border-transparent hover:bg-secondary hover:text-foreground`
              }`}
            >
              {filter.icon}
              <span>{filter.label}</span>
              <span className={`px-1.5 py-0.5 rounded-md text-[10px] ${
                selectedStatus === filter.value 
                  ? 'bg-white/20' 
                  : 'bg-black/10 dark:bg-white/10'
              }`}>
                {statusCounts[filter.value] || 0}
              </span>
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-secondary/50 hover:bg-secondary text-muted-foreground hover:text-foreground text-sm font-semibold rounded-xl border border-transparent transition-all">
            <Filter className="w-4 h-4" />
            Filter
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-secondary/50 hover:bg-secondary text-muted-foreground hover:text-foreground text-sm font-semibold rounded-xl border border-transparent transition-all">
            <SortAsc className="w-4 h-4" />
            Sort
          </button>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="p-8 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-center">
          <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-rose-500 mb-2">
            Failed to load executions
          </h3>
          <p className="text-sm text-rose-500/70 mb-4">
            {error.message}
          </p>
          <Button 
            onClick={() => refetch()}
            variant="outline"
            className="border-rose-500/30 text-rose-500 hover:bg-rose-500/10"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-64 bg-card/50 border border-border animate-pulse rounded-2xl"></div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && filteredExecutions.length === 0 && (
        <div className="text-center py-24 bg-card/30 border border-dashed border-border rounded-3xl">
          <Activity className="w-16 h-16 text-muted-foreground/50 mx-auto mb-6" />
          <h3 className="text-xl font-bold text-muted-foreground mb-2">
            No active executions
          </h3>
          <p className="text-muted-foreground/70 max-w-md mx-auto">
            {selectedStatus === 'ALL' 
              ? "There are no executions running at the moment. New executions will appear here automatically."
              : `No executions with status "${selectedStatus.replace('_', ' ')}" found.`
            }
          </p>
        </div>
      )}

      {/* Executions Grid */}
      {!isLoading && !error && filteredExecutions.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
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
