import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { formatUptime, formatLatency } from "@/lib/utils";
import type { SystemHealthDto, ComponentHealthDto, ComponentStatus } from "../types";
import { Database, Radio, Activity, AlertTriangle, WifiOff } from "lucide-react";

interface HealthMonitorGridProps {
  systemHealth: SystemHealthDto | undefined;
  isLoading: boolean;
  isDisconnected: boolean;
}

/**
 * Map component status to badge variant
 */
function getStatusVariant(status: ComponentStatus): "default" | "secondary" | "destructive" {
  switch (status) {
    case "up":
      return "secondary"; // Use secondary (green-ish) for up
    case "degraded":
      return "default"; // Use default for warning
    case "down":
      return "destructive";
    default:
      return "default";
  }
}

/**
 * Component health card for individual services
 */
function ComponentHealthCard({
  title,
  icon: Icon,
  health,
}: {
  title: string;
  icon: React.ElementType;
  health: ComponentHealthDto | undefined;
}) {
  if (!health) {
    return (
      <Card className="opacity-50">
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <Icon className="h-5 w-5 text-gray-400" />
            <span className="text-sm font-medium">{title}</span>
            <Badge variant="outline">Unknown</Badge>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon
              className={`h-5 w-5 ${
                health.status === "up"
                  ? "text-green-500"
                  : health.status === "degraded"
                  ? "text-yellow-500"
                  : "text-red-500"
              }`}
            />
            <span className="text-sm font-medium">{title}</span>
          </div>
          <Badge variant={getStatusVariant(health.status)}>
            {health.status.toUpperCase()}
          </Badge>
        </div>
        <div className="mt-2 text-xs text-muted-foreground">
          Latency: {formatLatency(health.latency_ms)}
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * HealthMonitorGrid component - AC#1, AC#4
 *
 * Displays system health with traffic light indicators:
 * - Database, RabbitMQ, Prometheus health status
 * - Latency and uptime display
 * - Disconnected state handling
 */
export function HealthMonitorGrid({
  systemHealth,
  isLoading,
  isDisconnected,
}: HealthMonitorGridProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>System Health</CardTitle>
          <CardDescription>Loading health status...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-4">
                  <div className="h-10 bg-gray-200 rounded" />
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              System Health
            </CardTitle>
            <CardDescription>
              Real-time status of core system components
            </CardDescription>
          </div>
          {systemHealth && (
            <div className="text-right">
              <div className="text-sm text-muted-foreground">Uptime</div>
              <div className="text-lg font-mono">
                {formatUptime(systemHealth.uptime_seconds)}
              </div>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Disconnection Alert */}
        {isDisconnected && (
          <Alert variant="warning">
            <WifiOff className="h-4 w-4" />
            <AlertTitle>Connection Lost</AlertTitle>
            <AlertDescription>
              Unable to connect to the monitoring server. Displaying cached data.
              Some features may be unavailable.
            </AlertDescription>
          </Alert>
        )}

        {/* System Health Status */}
        {systemHealth && systemHealth.status !== "up" && (
          <Alert
            variant={
              systemHealth.status === "degraded" ? "warning" : "destructive"
            }
          >
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>
              System {systemHealth.status === "degraded" ? "Degraded" : "Down"}
            </AlertTitle>
            <AlertDescription>
              One or more components are experiencing issues. Please check the
              individual component status below.
            </AlertDescription>
          </Alert>
        )}

        {/* Core Components Grid */}
        <div>
          <h4 className="text-sm font-semibold mb-3">Core Infrastructure</h4>
          <div className="grid gap-4 md:grid-cols-3">
            <ComponentHealthCard
              title="Database"
              icon={Database}
              health={systemHealth?.components.database}
            />
            <ComponentHealthCard
              title="RabbitMQ"
              icon={Radio}
              health={systemHealth?.components.rabbitmq}
            />
            <ComponentHealthCard
              title="Prometheus"
              icon={Activity}
              health={systemHealth?.components.prometheus}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
