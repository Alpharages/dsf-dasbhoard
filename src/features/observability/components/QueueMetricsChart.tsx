import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import type { QueueMetricsDto, QueueName } from "../types";
import { formatQueueName, formatDuration } from "@/lib/utils";
import { AlertTriangle, BarChart3, Layers } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  LineChart,
  Line,
  Legend,
} from "recharts";

interface QueueMetricsChartProps {
  queueMetrics: QueueMetricsDto | undefined;
  isLoading: boolean;
}

// Thresholds for alerts (as per AC#2)
const DEPTH_THRESHOLD = 50;
const AGE_THRESHOLD_SECONDS = 3600; // 1 hour

/**
 * Custom tooltip for the queue chart
 */
function QueueTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
    dataKey: string;
  }>;
  label?: string;
}) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border rounded-lg p-3 shadow-lg">
        <p className="font-semibold text-sm">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} className="text-sm text-gray-600">
            {entry.name}: {entry.value.toLocaleString()}
            {entry.dataKey === "rate" && "/hour"}
            {entry.dataKey === "age" && " old"}
          </p>
        ))}
      </div>
    );
  }
  return null;
}

/**
 * QueueMetricsChart component - AC#2
 * 
 * Displays queue depth and processing rates using Recharts:
 * - Bar chart for queue depths
 * - Line chart for processing rates
 * - Visual alerts (red highlight) when thresholds exceeded
 * - Responsive container for mobile fallback
 */
export function QueueMetricsChart({
  queueMetrics,
  isLoading,
}: QueueMetricsChartProps) {
  // Transform data for charts
  const chartData = queueMetrics
    ? (Object.entries(queueMetrics) as [QueueName, typeof queueMetrics[QueueName]][]).map(
        ([name, metrics]) => ({
          name: formatQueueName(name),
          queueKey: name,
          depth: metrics.depth,
          rate: metrics.rate,
          age: metrics.oldest_message_age_seconds,
          depthAlert: metrics.depth > DEPTH_THRESHOLD,
          ageAlert: metrics.oldest_message_age_seconds > AGE_THRESHOLD_SECONDS,
        })
      )
    : [];

  // Check if any queue has alerts
  const hasAlerts = chartData.some((q) => q.depthAlert || q.ageAlert);

  // Get queues with alerts for the alert banner
  const alertingQueues = chartData.filter((q) => q.depthAlert || q.ageAlert);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Queue Metrics</CardTitle>
          <CardDescription>Loading queue data...</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="h-[250px] animate-pulse bg-muted rounded" />
          <div className="h-[200px] animate-pulse bg-muted rounded" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Layers className="h-5 w-5" />
          Queue Metrics
        </CardTitle>
        <CardDescription>
          Queue depths and processing rates across all queues
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Alert Banner for Threshold Violations */}
        {hasAlerts && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Queue Alert</AlertTitle>
            <AlertDescription>
              {alertingQueues.map((q) => (
                <span key={q.queueKey} className="block">
                  <strong>{q.name}:</strong>{" "}
                  {q.depthAlert && `Depth (${q.depth}) exceeds threshold (${DEPTH_THRESHOLD})`}
                  {q.depthAlert && q.ageAlert && "; "}
                  {q.ageAlert && `Oldest message is ${formatDuration(q.age)} old`}
                </span>
              ))}
            </AlertDescription>
          </Alert>
        )}

        {/* Queue Depth Bar Chart */}
        <div>
          <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Queue Depth
            {chartData.some((q) => q.depthAlert) && (
              <Badge variant="destructive">Alert</Badge>
            )}
          </h4>
          <div className="h-[250px] min-w-0">
            <ResponsiveContainer width="100%" height="100%" debounce={100}>
              <BarChart
                data={chartData}
                margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip content={<QueueTooltip />} />
                <Bar dataKey="depth" name="Messages" radius={[4, 4, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.depthAlert ? "#ef4444" : "#3b82f6"}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Processing Rate Line Chart */}
        <div>
          <h4 className="text-sm font-semibold mb-3">Processing Rate (tickets/hour)</h4>
          <div className="h-[200px] min-w-0">
            <ResponsiveContainer width="100%" height="100%" debounce={100}>
              <LineChart
                data={chartData}
                margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip content={<QueueTooltip />} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="rate"
                  name="Processing Rate"
                  stroke="#10b981"
                  strokeWidth={2}
                  dot={{ fill: "#10b981", r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Queue Summary Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          {chartData.map((queue) => (
            <Card
              key={queue.queueKey}
              className={
                queue.depthAlert || queue.ageAlert
                  ? "border-red-500 border-2"
                  : ""
              }
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{queue.name}</span>
                  {queue.depthAlert && (
                    <Badge variant="destructive" className="text-xs">
                      High Depth
                    </Badge>
                  )}
                  {queue.ageAlert && !queue.depthAlert && (
                    <Badge variant="default" className="text-xs">
                      Stale
                    </Badge>
                  )}
                </div>
                <div className="mt-2 space-y-1 text-xs text-muted-foreground">
                  <div className="flex justify-between">
                    <span>Depth:</span>
                    <span
                      className={
                        queue.depthAlert ? "text-red-600 font-semibold" : ""
                      }
                    >
                      {queue.depth.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Rate:</span>
                    <span>{queue.rate.toLocaleString()}/hour</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Oldest:</span>
                    <span
                      className={
                        queue.ageAlert ? "text-red-600 font-semibold" : ""
                      }
                    >
                      {formatDuration(queue.age)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {chartData.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            No queue metrics available
          </div>
        )}
      </CardContent>
    </Card>
  );
}
