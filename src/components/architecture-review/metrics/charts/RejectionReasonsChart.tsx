import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '../../../ui/card';
import { Skeleton } from '../../../ui/skeleton';
import type { AdrRejectionReason } from '../../../../types/architectureReview';

interface RejectionReasonsChartProps {
    data?: AdrRejectionReason[];
    isLoading: boolean;
}

export function RejectionReasonsChart({ data, isLoading }: RejectionReasonsChartProps) {
    if (isLoading) return <ChartSkeleton title="Rejection Reasons" />;

    // Sort by count descending and take top 5
    const chartData = [...(data || [])].sort((a, b) => b.count - a.count).slice(0, 5);
    const hasData = chartData.length > 0 && chartData.some(d => d.count > 0);

    return (
        <Card className="col-span-1">
            <CardHeader>
                <CardTitle>Top Rejection Reasons</CardTitle>
            </CardHeader>
            <CardContent className="min-w-0">
                {hasData ? (
                    <ResponsiveContainer width="100%" height={300} debounce={100}>
                        <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                            <XAxis type="number" hide />
                            <YAxis
                                type="category"
                                dataKey="reason"
                                width={100}
                                tick={{ fontSize: 12 }}
                                interval={0}
                            />
                            <Tooltip cursor={{ fill: 'transparent' }} />
                            <Bar dataKey="count" name="Rejections" radius={[0, 4, 4, 0]} barSize={20}>
                                {chartData.map((_, index) => (
                                    <Cell key={`cell-${index}`} fill="#ef4444" />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                        No rejection data available
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
                <Skeleton className="h-[300px] w-full" />
            </CardContent>
        </Card>
    );
}
