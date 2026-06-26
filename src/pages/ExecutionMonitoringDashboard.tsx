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
  SortAsc,
  Inbox,
  ShieldAlert
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useQueryClient } from '@tanstack/react-query';


import { useSocketIO, useExecutionEvents } from '@/lib/socket/useSocketIO';
import { type QAFailedEventPayload } from '@/lib/socket/socketEvents';
import { useActiveExecutions, executionKeys } from '@/hooks/queries/useExecutions';
import { useUserProjects } from '@/hooks/queries/useProjects';
import { ExecutionCard } from '@/components/execution/ExecutionCard';
const ExecutionLogsViewer = lazy(() => import('@/components/execution/ExecutionLogsViewer'));
import { PMResolutionModal } from '@/components/execution/PMResolutionModal';
import type { ExecutionStatus, QAResolutionResult } from '@/types/execution';
import type { Project } from '@/types/project';
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
    color: 'text-muted-foreground',
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
    color: 'text-muted-foreground',
    activeColor: 'text-white',
    activeBg: 'bg-muted'
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
    label: 'Awaiting Approval', 
    value: 'AWAITING_APPROVAL', 
    icon: <Inbox className="w-4 h-4" />,
    color: 'text-blue-400',
    activeColor: 'text-white',
    activeBg: 'bg-blue-500'
  },
  { 
    label: 'Failed', 
    value: 'FAILED', 
    icon: <XCircle className="w-4 h-4" />,
    color: 'text-rose-500',
    activeColor: 'text-white',
    activeBg: 'bg-rose-600'
  },
  { 
    label: 'QA Failed', 
    value: 'QA_FAILED', 
    icon: <ShieldAlert className="w-4 h-4" />,
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

  // Fetch active executions (initial load + 30s fallback poll)
  const { 
    data: executions = [], 
    isLoading, 
    error, 
    refetch 
  } = useActiveExecutions();

  // Helper: optimistically update a single execution's status in cache
  const updateExecutionStatus = useCallback((executionId: string, status: string) => {
    queryClient.setQueryData(
      executionKeys.activeFiltered(undefined),
      (oldData: any[] | undefined) => {
        if (!oldData) return oldData;
        return oldData.map((exec) =>
          exec.id === executionId ? { ...exec, status } : exec,
        );
      },
    );
  }, [queryClient]);

  // Join project rooms when projects load and socket connects
  useEffect(() => {
    if (connected && userProjects.length > 0) {
      const projectIds = userProjects.map(p => p.id);
      joinProjectRooms(projectIds);
    }
  }, [connected, userProjects, joinProjectRooms]);

  // Handle execution events — all updates are optimistic via WebSocket payloads.
  // Only onStarted needs a single refetch (new execution not yet in cache, needs projectName etc.)
  useExecutionEvents(socket, {
    onStarted: (_payload) => {
      toast.success('New execution started');
      // New execution isn't in cache yet and WS payload lacks fields like projectName,
      // so one refetch is needed to get the full object. This is infrequent (once per execution).
      refetch();
    },
    onProgress: (payload) => {
      // Optimistically update cache from WebSocket payload — zero HTTP calls
      queryClient.setQueryData(
        executionKeys.activeFiltered(undefined),
        (oldData: any[] | undefined) => {
          if (!oldData) return oldData;
          
          const exists = oldData.some(exec => exec.id === payload.executionId);
          if (!exists) {
            // Execution not in cache (missed the started event?) — single refetch
            refetch();
            return oldData;
          }

          return oldData.map((exec) =>
            exec.id === payload.executionId
              ? {
                  ...exec,
                  status: payload.status,
                  currentStep: payload.currentStep || exec.currentStep,
                  percentComplete: payload.percentComplete ?? exec.percentComplete,
                  aiProvider: payload.aiProvider || exec.aiProvider,
                  startTime: payload.startedAt || exec.startTime,
                  duration: payload.startedAt 
                    ? Math.floor((Date.now() - new Date(payload.startedAt).getTime()) / 1000)
                    : exec.duration
                }
              : exec,
          );
        },
      );
    },
    onCompleted: (payload) => {
      toast.success(`Execution ${payload.executionId.slice(0, 8)} completed`);
      updateExecutionStatus(payload.executionId, 'COMPLETED');
    },
    onFailed: (payload) => {
      toast.error(`Execution ${payload.executionId.slice(0, 8)} failed`);
      updateExecutionStatus(payload.executionId, 'FAILED');
    },
    onTimeout: (payload) => {
      toast.error(`Execution ${payload.executionId.slice(0, 8)} timed out`);
      updateExecutionStatus(payload.executionId, 'TIMEOUT');
    },
    onCancelled: (payload) => {
      toast(`Execution ${payload.executionId.slice(0, 8)} cancelled`);
      updateExecutionStatus(payload.executionId, 'CANCELLED');
    },
    onPaused: (payload) => updateExecutionStatus(payload.executionId, 'PAUSED'),
    onResumed: (payload) => updateExecutionStatus(payload.executionId, 'IN_PROGRESS'),
    onEmergencyStopped: (payload) => updateExecutionStatus(payload.executionId, 'CANCELLED'),
    onQAFailed: (payload: QAFailedEventPayload) => {
      toast.error(
        `Execution ${payload.executionId.slice(0, 8)} — QA failed after ${payload.payload.qaRetryCount ?? '?'} retries. Resolve required.`
      );
      queryClient.setQueryData(
        executionKeys.activeFiltered(undefined),
        (oldData: any[] | undefined) => {
          if (!oldData) return oldData;
          const exists = oldData.some((exec) => exec.id === payload.executionId);
          if (!exists) {
            // Execution not in cache — refetch to pull QA_FAILED entry from server
            refetch();
            return oldData;
          }
          return oldData.map((exec) =>
            exec.id === payload.executionId
              ? {
                  ...exec,
                  status: 'QA_FAILED',
                  qaRetryCount: payload.payload.qaRetryCount,
                  qaFailedBranch: payload.payload.branchName,
                  errorMessage: payload.payload.errorMessage,
                }
              : exec,
          );
        },
      );
    },
  }, {
    progressDebounceMs: 500
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

  // PM Resolution Modal state
  const [resolvingExecution, setResolvingExecution] = useState<{
    executionId: string;
    branchName: string | null;
    branchUrl: string | null;
    errorMessage: string;
  } | null>(null);

  const handleResolve = useCallback(
    (executionId: string) => {
      const execution = executions.find((e) => e.id === executionId);
      if (!execution) return;
      const project = userProjects.find((p) => p.id === execution.projectId);
      const branchName = execution.qaFailedBranch ?? null;
      const branchUrl =
        project?.github_repository_url && branchName
          ? `${project.github_repository_url}/tree/${branchName}`
          : null;
      setResolvingExecution({
        executionId,
        branchName,
        branchUrl,
        errorMessage: execution.errorMessage ?? 'No error details available.',
      });
    },
    [executions, userProjects],
  );

  const handleModalClose = useCallback(() => {
    setResolvingExecution(null);
  }, []);

  const handleResolved = useCallback(
    (result: QAResolutionResult) => {
      if (!resolvingExecution) return;
      const newStatus = result.action === 'open_pr' ? 'COMPLETED' : 'FAILED';
      updateExecutionStatus(resolvingExecution.executionId, newStatus);
    },
    [resolvingExecution, updateExecutionStatus],
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-4 mb-2">
            <h1 className="text-3xl font-bold text-foreground tracking-tight">Active Executions</h1>
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
          className="p-3 bg-secondary/50 border border-border text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-all"
          title="Refresh Data"
        >
          <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Socket Error Banner */}
      {socketError && (
        <div className="bg-rose-500/10 border border-rose-500/20 rounded-lg p-6 text-rose-500 flex items-center justify-between">
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
      <div className="bg-card/50 border border-border rounded-lg p-4 flex flex-wrap items-center justify-between gap-4">
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
        <div className="p-8 bg-rose-500/10 border border-rose-500/20 rounded-lg text-center">
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
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-64 bg-card/50 border border-border animate-pulse rounded-lg"></div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && filteredExecutions.length === 0 && (
        <div className="text-center py-24 bg-card/30 border border-dashed border-border rounded-lg">
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
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredExecutions.map((execution) => (
            <ExecutionCard
              key={execution.id}
              execution={execution}
              onViewLogs={handleViewLogs}
              onResolve={handleResolve}
              socket={socket}
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

      {/* PM Resolution Modal — QA failure resolution (FE-1.2) */}
      {resolvingExecution && (
        <PMResolutionModal
          key={resolvingExecution.executionId}
          isOpen={!!resolvingExecution}
          executionId={resolvingExecution.executionId}
          branchName={resolvingExecution.branchName}
          branchUrl={resolvingExecution.branchUrl}
          errorMessage={resolvingExecution.errorMessage}
          onClose={handleModalClose}
          onResolved={handleResolved}
        />
      )}
    </div>
  );
}
