import { useEffect, useState } from 'react';
import {
  Pie,
  PieChart,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { DashboardSummary } from '@/types';
import { Cpu } from 'lucide-react';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];

interface ProviderDistributionChartProps {
  summary: DashboardSummary | null;
}

export function ProviderDistributionChart({ summary }: ProviderDistributionChartProps) {
  const distribution = summary?.provider_distribution ?? [];
  const hasData = distribution.some((item) => item.count > 0);

  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  // Filter out providers with 0% to avoid label overlap
  const filteredDistribution = distribution.filter((item) => item.percentage > 0);

  return (
    <Card className="h-full min-h-[400px] flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-violet-500 to-purple-400 flex items-center justify-center shadow-lg shadow-violet-500/20">
            <Cpu className="h-4 w-4 text-white" />
          </div>
          <CardTitle className="text-sm font-medium">AI Provider Distribution</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col">
        {!hasData ? (
          <div className="flex-1 flex flex-col items-center justify-center py-12 text-center">
            <div className="h-16 w-16 rounded-2xl bg-[var(--surface-1)] flex items-center justify-center mb-3">
              <Cpu className="h-8 w-8 text-muted-foreground/30" />
            </div>
            <p className="text-sm text-muted-foreground">No provider data available</p>
          </div>
        ) : (
          <>
            <div className="flex-1 min-h-0">
              {mounted && (
                <ResponsiveContainer width="100%" height="100%" debounce={100}>
                  <PieChart>
                    <Pie
                      data={filteredDistribution as any[]}
                      dataKey="percentage"
                      nameKey="provider"
                      cx="50%"
                      cy="50%"
                      innerRadius={70}
                      outerRadius={100}
                      paddingAngle={4}
                      // No labels on the pie itself - use custom legend below
                      label={false}
                    >
                      {filteredDistribution.map((entry, index) => (
                        <Cell 
                          key={`${entry.provider}-${index}`} 
                          fill={COLORS[index % COLORS.length]}
                          stroke="var(--card)"
                          strokeWidth={3}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        background: 'var(--popover)',
                        border: '1px solid var(--border)',
                        borderRadius: '8px',
                        fontSize: '12px',
                      }}
                      formatter={(value: any, _name: any, payload: any) => {
                        const count = payload?.payload?.count ?? 0;
                        return [`${Number(value).toFixed(1)}% (${count} tasks)`, payload?.payload?.provider];
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
            
            {/* Custom Legend — only providers actually used (matches the pie).
                Avoids advertising dormant 0% providers (e.g. post-pivot the
                runtime is subscription-only Claude, so GEMINI/CODEX/KIMI at 0%
                would otherwise show as stale buckets). */}
            <div className="mt-4 grid grid-cols-3 gap-2">
              {filteredDistribution.map((item, index) => (
                <div 
                  key={item.provider}
                  className="flex items-center gap-2 p-2 rounded-lg bg-[var(--surface-1)] border border-[var(--card-border)]"
                >
                  <div 
                    className="w-3 h-3 rounded-full shrink-0"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-foreground truncate">{item.provider}</p>
                    <p className="text-[10px] text-muted-foreground">{item.percentage.toFixed(1)}%</p>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
