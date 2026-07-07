import { PieChart, Pie, Cell, Tooltip, Legend } from "recharts";
import { ChartContainer } from "@/components/dashboard/charts/ChartContainer";
import { Card, CardContent, CardHeader, CardTitle } from "../../../ui/card";
import { Skeleton } from "../../../ui/skeleton";
import type { AdrRiskDistribution } from "../../../../types/architectureReview";

interface RiskDistributionChartProps {
  data?: AdrRiskDistribution[];
  isLoading: boolean;
}

const COLORS: Record<string, string> = {
  HIGH: "#ef4444", // red-500
  MEDIUM: "#eab308", // yellow-500
  LOW: "#22c55e", // green-500
};

export function RiskDistributionChart({
  data,
  isLoading,
}: RiskDistributionChartProps) {
  if (isLoading) return <ChartSkeleton title="Risk Distribution" />;

  // Process data to ensure colors match risk levels
  const chartData = data || [];
  const hasData = chartData.some((d) => d.count > 0);

  return (
    <Card className="col-span-1">
      <CardHeader>
        <CardTitle>Risk Distribution</CardTitle>
      </CardHeader>
      <CardContent className="h-[300px] min-w-0">
        {hasData ? (
          <ChartContainer className="w-full h-full">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="count"
              >
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[entry.level] || "#8884d8"}
                  />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ChartContainer>
        ) : (
          <div className="h-full flex items-center justify-center text-muted-foreground">
            No risk data available
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function ChartSkeleton({ title }: { title: string }) {
  return (
    <Card className="col-span-1">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <Skeleton className="h-[300px] w-full rounded-full" />
      </CardContent>
    </Card>
  );
}
