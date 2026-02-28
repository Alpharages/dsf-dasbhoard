import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '../../../ui/card';
import { Skeleton } from '../../../ui/skeleton';
import type { AdrWorkloadByProject } from '../../../../types/architectureReview';

interface WorkloadByProjectChartProps {
    data?: AdrWorkloadByProject[];
    isLoading: boolean;
}

export function WorkloadByProjectChart({ data, isLoading }: WorkloadByProjectChartProps) {
    if (isLoading) return <ChartSkeleton title="Review Workload by Project" />;

    const chartData = data || [];
    const hasData = chartData.length > 0;

    return (
        <Card className="col-span-2">
            <CardHeader>
                <CardTitle>Review Workload by Project</CardTitle>
            </CardHeader>
            <CardContent className="min-w-0">
                {hasData ? (
                    <ResponsiveContainer width="100%" height={300} debounce={100}>
                        <BarChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="projectName" fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis fontSize={12} tickLine={false} axisLine={false} />
                            <Tooltip cursor={{ fill: 'rgba(0,0,0,0.1)' }} />
                            <Legend />
                            <Bar dataKey="reviewCount" name="Reviews" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                        No workload data available
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

function ChartSkeleton({ title }: { title: string }) {
    return (
        <Card className="col-span-2">
            <CardHeader>
                <CardTitle>{title}</CardTitle>
            </CardHeader>
            <CardContent>
                <Skeleton className="h-[300px] w-full" />
            </CardContent>
        </Card>
    );
}
