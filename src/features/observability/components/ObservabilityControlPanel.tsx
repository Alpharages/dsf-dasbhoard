import { useObservabilityData } from "../hooks/useObservabilityData";
import { HealthMonitorGrid } from "./HealthMonitorGrid";
import { QueueMetricsChart } from "./QueueMetricsChart";
import { FileLockTable } from "./FileLockTable";
import { Card } from "@/components/ui/card";
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

    // Loading states
    isSystemHealthLoading,
    isQueueMetricsLoading,
    isFileLocksLoading,

    // Error states
    systemHealthError,
    queueMetricsError,
    fileLocksError,

    // Connection states
    isDisconnected,
    isSocketConnected,

    // Mutations
    releaseLock,
    isReleasingLock,

    // Refetch functions
    refetchSystemHealth,
    refetchQueueMetrics,
    refetchFileLocks,
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
  };

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

      {/* Main Content Grid */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* System Health - Spans full width */}
        <div className="lg:col-span-2">
          {systemHealthError ? (
            <Card className="min-h-[300px] flex flex-col items-center justify-center p-6 text-center border-dashed border-2">
              <Activity className="h-8 w-8 text-muted-foreground mb-2 opacity-50" />
              <Badge variant="destructive" className="mb-3">Metrics Unavailable</Badge>
              <p className="text-sm text-muted-foreground">{systemHealthError.message || "Failed to load system health metrics."}</p>
              <Button variant="outline" size="sm" onClick={() => refetchSystemHealth()} className="mt-4">Retry</Button>
            </Card>
          ) : (
            <HealthMonitorGrid
              systemHealth={systemHealth}
              isLoading={isSystemHealthLoading}
              isDisconnected={isDisconnected}
            />
          )}
        </div>

        {/* Queue Metrics */}
        <div className="lg:col-span-1">
          {queueMetricsError ? (
            <Card className="h-full min-h-[300px] flex flex-col items-center justify-center p-6 text-center border-dashed border-2">
              <Activity className="h-8 w-8 text-muted-foreground mr-2 mb-2 opacity-50" />
              <Badge variant="destructive" className="mb-3">Metrics Unavailable</Badge>
              <p className="text-sm text-muted-foreground">{queueMetricsError.message || "Failed to load queue metrics."}</p>
              <Button variant="outline" size="sm" onClick={() => refetchQueueMetrics()} className="mt-4">Retry</Button>
            </Card>
          ) : (
            <QueueMetricsChart
              queueMetrics={queueMetrics}
              isLoading={isQueueMetricsLoading}
            />
          )}
        </div>

        {/* File Locks */}
        <div className="lg:col-span-1">
          {fileLocksError ? (
            <Card className="h-full min-h-[300px] flex flex-col items-center justify-center p-6 text-center border-dashed border-2">
              <Activity className="h-8 w-8 text-muted-foreground mr-2 mb-2 opacity-50" />
              <Badge variant="destructive" className="mb-3">Metrics Unavailable</Badge>
              <p className="text-sm text-muted-foreground">{fileLocksError.message || "Failed to load file locks."}</p>
              <Button variant="outline" size="sm" onClick={() => refetchFileLocks()} className="mt-4">Retry</Button>
            </Card>
          ) : (
            <FileLockTable
              fileLocks={fileLocks}
              isLoading={isFileLocksLoading}
              onReleaseLock={releaseLock}
              isReleasingLock={isReleasingLock}
            />
          )}
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
