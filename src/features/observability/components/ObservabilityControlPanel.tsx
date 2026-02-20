import { useObservabilityData } from "../hooks/useObservabilityData";
import { HealthMonitorGrid } from "./HealthMonitorGrid";
import { QueueMetricsChart } from "./QueueMetricsChart";
import { FileLockTable } from "./FileLockTable";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Activity, Wifi, WifiOff, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ObservabilityControlPanelProps {
  /** Enable/disable real-time updates */
  enableRealtime?: boolean;
  /** Polling interval in milliseconds */
  pollingInterval?: number;
  /** Auth token */
  token?: string | null;
}

/**
 * ObservabilityControlPanel - Main dashboard page (AC#5)
 * 
 * Assembles all observability components:
 * - System Health Widget (HealthMonitorGrid)
 * - Queue Depth Monitor (QueueMetricsChart)
 * - File Lock & Conflict Tracker (FileLockTable)
 * - AI Provider Status (within HealthMonitorGrid)
 * 
 * Layout:
 * - Desktop: Multi-column responsive grid
 * - Mobile: Single column fallback
 */
export function ObservabilityControlPanel({
  pollingInterval = 10000,
  token,
}: ObservabilityControlPanelProps) {
  const {
    // Data
    systemHealth,
    queueMetrics,
    fileLocks,
    aiProviders,
    
    // Loading states
    isSystemHealthLoading,
    isQueueMetricsLoading,
    isFileLocksLoading,
    isAiProvidersLoading,
    
    // Error states
    systemHealthError,
    queueMetricsError,
    fileLocksError,
    aiProvidersError,
    
    // Connection states
    isDisconnected,
    isSocketConnected,
    
    // Mutations
    releaseLock,
    isReleasingLock,
    togglePause,
    
    // Refetch functions
    refetchSystemHealth,
    refetchQueueMetrics,
    refetchFileLocks,
    refetchAiProviders,
  } = useObservabilityData({
    pollingEnabled: true,
    pollingInterval,
    token,
  });

  // Handle manual refresh of all data
  const handleRefreshAll = () => {
    refetchSystemHealth();
    refetchQueueMetrics();
    refetchFileLocks();
    refetchAiProviders();
  };

  // Check for any errors
  const hasErrors = systemHealthError || queueMetricsError || fileLocksError || aiProvidersError;

  return (
    <div className="min-h-screen bg-background p-4 md:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
              <Activity className="h-8 w-8 text-primary" />
              Observability Control Panel
            </h1>
            <p className="text-muted-foreground mt-1">
              Real-time monitoring of system health, queue status, and file locks
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Connection Status */}
            <div className="flex items-center gap-2">
              {isSocketConnected ? (
                <>
                  <Wifi className="h-4 w-4 text-green-500" />
                  <Badge variant="secondary" className="text-xs">Live</Badge>
                </>
              ) : (
                <>
                  <WifiOff className="h-4 w-4 text-yellow-500" />
                  <Badge variant="default" className="text-xs">Polling</Badge>
                </>
              )}
            </div>
            
            {/* Refresh Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefreshAll}
              disabled={
                isSystemHealthLoading || isQueueMetricsLoading || isFileLocksLoading
              }
            >
              <RefreshCw
                className={`h-4 w-4 mr-2 ${
                  isSystemHealthLoading || isQueueMetricsLoading || isFileLocksLoading
                    ? "animate-spin"
                    : ""
                }`}
              />
              Refresh
            </Button>
          </div>
        </div>
      </div>

      {/* Global Error Alert */}
      {hasErrors && (
        <Alert variant="destructive" className="mb-6">
          <AlertTitle>Data Loading Error</AlertTitle>
          <AlertDescription>
            Some components failed to load. Retrying automatically...
            {systemHealthError && (
              <div className="text-sm mt-1">
                System Health: {systemHealthError.message}
              </div>
            )}
            {queueMetricsError && (
              <div className="text-sm mt-1">
                Queue Metrics: {queueMetricsError.message}
              </div>
            )}
            {fileLocksError && (
              <div className="text-sm mt-1">
                File Locks: {fileLocksError.message}
              </div>
            )}
            {aiProvidersError && (
              <div className="text-sm mt-1">
                AI Providers: {aiProvidersError.message}
              </div>
            )}
          </AlertDescription>
        </Alert>
      )}

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* System Health - Spans full width */}
        <div className="lg:col-span-2">
          <HealthMonitorGrid
            systemHealth={systemHealth}
            isLoading={isSystemHealthLoading || isAiProvidersLoading}
            isDisconnected={isDisconnected}
            aiProviders={aiProviders?.providers}
            executionPaused={aiProviders?.execution_paused}
            onTogglePause={togglePause}
          />
        </div>

        {/* Queue Metrics */}
        <div className="lg:col-span-1">
          <QueueMetricsChart
            queueMetrics={queueMetrics}
            isLoading={isQueueMetricsLoading}
          />
        </div>

        {/* File Locks */}
        <div className="lg:col-span-1">
          <FileLockTable
            fileLocks={fileLocks}
            isLoading={isFileLocksLoading}
            onReleaseLock={releaseLock}
            isReleasingLock={isReleasingLock}
          />
        </div>
      </div>

      {/* Footer */}
      <div className="mt-8 border-t pt-4 text-center text-sm text-muted-foreground">
        <p>
          DSF Observability Dashboard • Updates every {pollingInterval / 1000}s
          {isSocketConnected && " • Real-time via WebSocket"}
        </p>
      </div>
    </div>
  );
}
