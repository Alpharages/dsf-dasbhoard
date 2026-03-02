import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { formatUptime, formatLatency } from "@/lib/utils";
import type { SystemHealthDto, ComponentHealthDto, ComponentStatus, AIProviderDto, AIProviderStatus } from "../types";
import { Database, Radio, Activity, Server, AlertTriangle, WifiOff, PauseCircle, PlayCircle } from "lucide-react";

interface HealthMonitorGridProps {
  systemHealth: SystemHealthDto | undefined;
  isLoading: boolean;
  isDisconnected: boolean;
  aiProviders?: AIProviderDto[];
  executionPaused?: boolean;
  onTogglePause?: (paused: boolean) => void;
  aiProvidersError?: Error | null;
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
 * Map AI provider status to badge variant
 */
function getProviderStatusVariant(status: AIProviderStatus): "secondary" | "default" | "destructive" | "outline" {
  switch (status) {
    case "available":
      return "secondary";
    case "busy":
      return "default";
    case "unavailable":
      return "destructive";
    case "paused":
      return "outline";
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
 * AI Provider status card
 */
function AIProviderCard({ provider }: { provider: AIProviderDto }) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Server className="h-5 w-5 text-blue-500" />
            <span className="text-sm font-medium">{provider.name}</span>
          </div>
          <Badge variant={getProviderStatusVariant(provider.status)}>
            {provider.status.toUpperCase()}
          </Badge>
        </div>
        {provider.active_executions !== undefined && (
          <div className="mt-2 text-xs text-muted-foreground">
            Active: {provider.active_executions} executions
          </div>
        )}
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
 * - AI Provider status with pause toggle
 * - Disconnected state handling
 */
export function HealthMonitorGrid({
  systemHealth,
  isLoading,
  isDisconnected,
  aiProviders = [],
  executionPaused = false,
  onTogglePause,
  aiProvidersError,
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

        {/* AI Providers Section */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-semibold">AI Providers</h4>
            {onTogglePause && (
              <div className="flex items-center gap-2">
                {executionPaused ? (
                  <PauseCircle className="h-4 w-4 text-yellow-500" />
                ) : (
                  <PlayCircle className="h-4 w-4 text-green-500" />
                )}
                <label className="flex items-center gap-2 text-sm">
                  <Switch
                    checked={!executionPaused}
                    onCheckedChange={(checked) => onTogglePause(!checked)}
                  />
                  {executionPaused ? "Execution Paused" : "Execution Active"}
                </label>
              </div>
            )}
          </div>
          
          {executionPaused && (
            <Alert className="mb-3">
              <PauseCircle className="h-4 w-4" />
              <AlertTitle>Execution Paused</AlertTitle>
              <AlertDescription>
                AI execution is currently paused. No new tickets will be processed.
              </AlertDescription>
            </Alert>
          )}

          <div className="grid gap-4 md:grid-cols-3">
            {aiProvidersError ? (
              <Card className="md:col-span-3">
                <CardContent className="p-4 text-center text-sm text-muted-foreground">
                  Failed to load AI providers: {aiProvidersError.message}
                </CardContent>
              </Card>
            ) : aiProviders.length > 0 ? (
              aiProviders.map((provider) => (
                <AIProviderCard key={provider.name} provider={provider} />
              ))
            ) : (
              <>
                <AIProviderCard
                  provider={{ name: "Cursor CLI", status: "available" }}
                />
                <AIProviderCard
                  provider={{ name: "Windsurf", status: "available" }}
                />
                <AIProviderCard
                  provider={{ name: "Antigravity", status: "available" }}
                />
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
