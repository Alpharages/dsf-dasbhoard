import {
  Pie,
  PieChart,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { DashboardSummary } from '@/types';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b'];

interface ProviderDistributionChartProps {
  summary: DashboardSummary | null;
}

export function ProviderDistributionChart({ summary }: ProviderDistributionChartProps) {
  const distribution = summary?.provider_distribution ?? [];
  const hasData = distribution.some((item) => item.count > 0);

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle className="text-sm font-medium">AI Provider Distribution</CardTitle>
      </CardHeader>
      <CardContent>
        {!hasData ? (
          <p className="text-sm text-muted-foreground">No data yet</p>
        ) : (
          <div className="h-[240px] w-full min-w-0">
            <ResponsiveContainer width="100%" height="100%" debounce={100}>
              <PieChart>
                <Pie
                  data={distribution}
                  dataKey="percentage"
                  nameKey="provider"
                  cx="50%"
                  cy="50%"
                  innerRadius={52}
                  outerRadius={86}
                  label={({ provider, percentage }) => `${provider}: ${Number(percentage).toFixed(1)}%`}
                  labelLine={false}
                >
                  {distribution.map((entry, index) => (
                    <Cell key={`${entry.provider}-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number | string, _name, payload) => {
                    const count = payload?.payload?.count ?? 0;
                    return [`${Number(value).toFixed(1)}% (${count})`, 'Usage'];
                  }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
