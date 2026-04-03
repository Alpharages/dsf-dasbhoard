import { useState, useRef, useEffect, useCallback, lazy, Suspense } from 'react';
import {
  X,
  Download,
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Loader2,
  Activity,
  ShieldCheck,
} from 'lucide-react';
import { format } from 'date-fns';
import { useExecutionLogs, useExportExecutionLogs, useExecution } from '@/hooks/queries/useExecutions';
import { QAResultsPanel } from '@/components/execution/QAResultsPanel';
import { useLogEvents } from '@/lib/socket/useSocketIO';
import type { ExecutionLog, LogLevel } from '@/types/execution';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

const ContainerActivityTimeline = lazy(() => import('./ContainerActivityTimeline'));

interface ExecutionLogsViewerProps {
  executionId: string;
  isOpen: boolean;
  onClose: () => void;
  socket: ReturnType<typeof import('@/lib/socket/useSocketIO').useSocketIO>['socket'];
  /** Whether the execution is currently live (enables WebSocket subscription) */
  isLive?: boolean;
}

const LOG_LEVEL_COLORS: Record<LogLevel, string> = {
  'DEBUG': 'text-slate-400',
  'INFO': 'text-blue-400',
  'WARN': 'text-yellow-400',
  'ERROR': 'text-rose-400',
  'STDOUT': 'text-green-400',
  'STDERR': 'text-orange-400',
};

const LOG_LEVEL_BG: Record<LogLevel, string> = {
  'DEBUG': 'bg-slate-500/10',
  'INFO': 'bg-blue-500/10',
  'WARN': 'bg-yellow-500/10',
  'ERROR': 'bg-rose-500/10',
  'STDOUT': 'bg-green-500/10',
  'STDERR': 'bg-orange-500/10',
};

const MAX_LOG_LINES = 10000;

export default function ExecutionLogsViewer({ 
  executionId, 
  isOpen, 
  onClose,
  socket,
  isLive = true,
}: ExecutionLogsViewerProps) {
  const [selectedLevels, setSelectedLevels] = useState<LogLevel[]>(['INFO', 'WARN', 'ERROR']);
  const [searchQuery, setSearchQuery] = useState('');
  const [autoScroll, setAutoScroll] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [showActivityPanel, setShowActivityPanel] = useState(true);
  const [showQAPanel, setShowQAPanel] = useState(false);
  const [realTimeLogs, setRealTimeLogs] = useState<ExecutionLog[]>([]);
  const logsEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Fetch initial logs
  const { data: initialLogs = [], isLoading, error } = useExecutionLogs(
    executionId,
    { level: selectedLevels },
    { enabled: isOpen && !!executionId }
  );

  const exportLogs = useExportExecutionLogs();

  const { data: executionDetail } = useExecution(executionId, {
    refetchInterval: isLive ? 5_000 : false,
    enabled: !!executionId && isOpen,
  });

  // Combine initial logs with real-time logs
  const allLogs = [...initialLogs, ...realTimeLogs];

  // Filter logs based on search query
  const filteredLogs = allLogs.filter(log => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      log.message.toLowerCase().includes(query) ||
      log.level.toLowerCase().includes(query)
    );
  });

  // Limit to max lines
  const displayLogs = filteredLogs.slice(-MAX_LOG_LINES);
  const hasMoreLogs = filteredLogs.length > MAX_LOG_LINES;

  // Handle real-time log events
  useLogEvents(socket, useCallback((payload) => {
    if (payload.executionId === executionId) {
      const newLog: ExecutionLog = {
        id: `${Date.now()}-${Math.random()}`,
        executionId: payload.executionId,
        timestamp: payload.timestamp,
        level: payload.level as LogLevel,
        message: payload.message,
        source: payload.source,
      };
      setRealTimeLogs(prev => [...prev, newLog]);
    }
  }, [executionId]));

  // Auto-scroll to bottom
  useEffect(() => {
    if (autoScroll && logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [displayLogs, autoScroll]);

  // Handle manual scroll
  const handleScroll = useCallback(() => {
    if (!containerRef.current) return;
    
    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 50;
    
    if (!isNearBottom && autoScroll) {
      setAutoScroll(false);
    } else if (isNearBottom && !autoScroll) {
      setAutoScroll(true);
    }
  }, [autoScroll]);

  // Toggle log level filter
  const toggleLevel = (level: LogLevel) => {
    setSelectedLevels(prev => 
      prev.includes(level) 
        ? prev.filter(l => l !== level)
        : [...prev, level]
    );
  };

  const handleToggleActivity = () => {
    setShowActivityPanel((prev) => {
      if (!prev) setShowQAPanel(false); // opening activity → close QA
      return !prev;
    });
  };

  const handleToggleQAPanel = () => {
    setShowQAPanel((prev) => {
      if (!prev) setShowActivityPanel(false); // opening QA → close activity
      return !prev;
    });
  };

  // Handle export
  const handleExport = () => {
    exportLogs.mutate(executionId);
  };

  // Clear real-time logs when closing
  useEffect(() => {
    if (!isOpen) {
      setRealTimeLogs([]);
      setSearchQuery('');
      setShowQAPanel(false);    // FE-1.3: reset QA panel on close
      setShowActivityPanel(true); // reset to default-open
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] w-[95vw] h-[90vh] bg-slate-900 border-slate-800 p-0 flex flex-col">
        <DialogHeader className="px-6 py-4 border-b border-slate-800">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-slate-200 flex items-center gap-2">
              Execution Logs
              <Badge variant="outline" className="ml-2 text-slate-400 border-slate-700">
                {executionId.slice(0, 8)}...
              </Badge>
            </DialogTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleExport}
                disabled={exportLogs.isPending}
                className="border-slate-700 text-slate-300"
              >
                {exportLogs.isPending ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Download className="w-4 h-4 mr-2" />
                )}
                Export
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="text-slate-400"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        {/* Filters Bar */}
        <div className="px-6 py-3 border-b border-slate-800 bg-slate-950/50">
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <Input
                placeholder="Search logs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-slate-800 border-slate-700 text-slate-200"
              />
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleToggleActivity}
              className={`border-slate-700 ${showActivityPanel ? 'bg-slate-800 text-blue-400' : ''}`}
            >
              <Activity className="w-4 h-4 mr-2" />
              Activity
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleToggleQAPanel}
              className={`border-slate-700 ${showQAPanel ? 'bg-slate-800 text-emerald-400' : ''}`}
            >
              <ShieldCheck className="w-4 h-4 mr-2" />
              QA Results
              {executionDetail?.qaAttempts?.length ? (
                <Badge variant="secondary" className="ml-2 bg-emerald-500/20 text-emerald-400 text-[10px]">
                  {executionDetail.qaAttempts.length}
                </Badge>
              ) : null}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className={`border-slate-700 ${showFilters ? 'bg-slate-800' : ''}`}
            >
              <Filter className="w-4 h-4 mr-2" />
              Filters
              {selectedLevels.length < 4 && (
                <Badge variant="secondary" className="ml-2 bg-blue-500/20 text-blue-400">
                  {selectedLevels.length}
                </Badge>
              )}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setAutoScroll(!autoScroll)}
              className={autoScroll ? 'text-blue-400' : 'text-slate-400'}
            >
              {autoScroll ? <ChevronDown className="w-4 h-4 mr-2" /> : <ChevronUp className="w-4 h-4 mr-2" />}
              Auto-scroll
            </Button>
          </div>

          {/* Level Filters */}
          {showFilters && (
            <div className="flex items-center gap-4 mt-3 pt-3 border-t border-slate-800">
              <span className="text-sm text-slate-500">Log Levels:</span>
              {(['DEBUG', 'INFO', 'WARN', 'ERROR'] as LogLevel[]).map(level => (
                <div key={level} className="flex items-center gap-2">
                  <Checkbox
                    checked={selectedLevels.includes(level)}
                    onCheckedChange={() => toggleLevel(level)}
                  />
                  <Label 
                    className={`text-sm cursor-pointer ${LOG_LEVEL_COLORS[level]}`}
                  >
                    {level}
                  </Label>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Warning Banner for Truncated Logs */}
        {hasMoreLogs && (
          <div className="px-6 py-2 bg-yellow-500/10 border-b border-yellow-500/20 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-yellow-400" />
            <span className="text-sm text-yellow-400">
              Showing last {MAX_LOG_LINES.toLocaleString()} lines only. Export for full logs.
            </span>
          </div>
        )}

        {/* Main Content: Activity Panel + Logs */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left sidebar — Activity OR QA Results (mutually exclusive) */}
          {(showActivityPanel || showQAPanel) && (
            <div className="w-72 border-r border-slate-800 bg-slate-900/50 overflow-auto flex-shrink-0">
              {showActivityPanel && (
                <>
                  <div className="flex items-center gap-2 p-4 pb-3">
                    <Activity className="w-4 h-4 text-blue-400" />
                    <h3 className="text-sm font-bold text-slate-200">Container Activity</h3>
                  </div>
                  <div className="px-4 pb-4">
                    <Suspense
                      fallback={
                        <div className="flex items-center gap-2 py-4 text-xs text-slate-500">
                          <Loader2 className="w-3 h-3 animate-spin" />
                          Loading...
                        </div>
                      }
                    >
                      <ContainerActivityTimeline
                        executionId={executionId}
                        socket={socket}
                        maxHeight="calc(100% - 40px)"
                        collapsible={false}
                        defaultCollapsed={false}
                        isLive={isLive}
                      />
                    </Suspense>
                  </div>
                </>
              )}
              {showQAPanel && (
                <>
                  <div className="flex items-center gap-2 p-4 pb-3">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <h3 className="text-sm font-bold text-slate-200">QA Results</h3>
                  </div>
                  <div className="px-4 pb-4">
                    <QAResultsPanel qaAttempts={executionDetail?.qaAttempts ?? null} isLive={isLive} />
                  </div>
                </>
              )}
            </div>
          )}

          {/* Logs Container */}
          <div 
            ref={containerRef}
            onScroll={handleScroll}
            className="flex-1 min-w-0 overflow-auto p-4 font-mono text-sm bg-slate-950"
          >
          {isLoading ? (
            <div className="flex items-center justify-center h-full text-slate-500">
              <Loader2 className="w-6 h-6 animate-spin mr-2" />
              Loading logs...
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-full text-rose-400">
              <AlertCircle className="w-6 h-6 mr-2" />
              Failed to load logs: {error.message}
            </div>
          ) : displayLogs.length === 0 ? (
            <div className="flex items-center justify-center h-full text-slate-500">
              No logs found
            </div>
          ) : (
            <div className="space-y-1">
              {displayLogs.map((log, index) => (
                <div 
                  key={`${log.id}-${index}`}
                  className={`flex items-start gap-3 py-1 px-2 rounded hover:bg-slate-900/50 ${
                    log.level === 'ERROR' ? 'bg-rose-500/5' : ''
                  }`}
                >
                  <span className="text-slate-600 text-xs shrink-0 w-20">
                    {format(new Date(log.timestamp), 'HH:mm:ss.SSS')}
                  </span>
                  <Badge 
                    variant="outline" 
                    className={`shrink-0 text-[10px] px-1.5 py-0 h-5 ${LOG_LEVEL_COLORS[log.level]} ${LOG_LEVEL_BG[log.level]} border-transparent`}
                  >
                    {log.level}
                  </Badge>
                  <span className="text-slate-300 break-words whitespace-pre-wrap min-w-0">
                    {log.message}
                  </span>
                </div>
              ))}
              <div ref={logsEndRef} />
            </div>
          )}
        </div>
        </div>

        {/* Footer Stats */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950/50 flex items-center justify-between text-xs text-slate-500">
          <span>
            {filteredLogs.length.toLocaleString()} logs
            {hasMoreLogs && ` (showing last ${MAX_LOG_LINES.toLocaleString()})`}
          </span>
          <span>
            {realTimeLogs.length > 0 && `${realTimeLogs.length} new`}
          </span>
        </div>
      </DialogContent>
    </Dialog>
  );
}
