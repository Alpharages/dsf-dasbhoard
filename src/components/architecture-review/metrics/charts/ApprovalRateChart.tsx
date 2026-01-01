import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '../../../ui/card';
import { Skeleton } from '../../../ui/skeleton';
import type { AdrApprovalRateTrend } from '../../../../types/architectureReview';

interface ApprovalRateChartProps {
    data?: AdrApprovalRateTrend[];
    isLoading: boolean;
}

export function ApprovalRateChart({ data, isLoading }: ApprovalRateChartProps) {
    if (isLoading) return <ChartSkeleton title="Approval Rate Trend" />;
    if (!data || data.length === 0) return <NoDataChart title="Approval Rate Trend" />;

    return (
        <Card className="col-span-2">
            <CardHeader>
                <CardTitle>Approval Rate Trend</CardTitle>
            </CardHeader>
            <CardContent className="pl-2">
                <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={data}>
                        <defs>
                            <linearGradient id="colorApproved" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#22c55e" stopOpacity={0.8} />
                                <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="colorRejected" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8} />
                                <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <XAxis
                            dataKey="date"
                            stroke="#888888"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                            tickFormatter={(value) => new Date(value).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        />
                        <YAxis
                            stroke="#888888"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                            tickFormatter={(value) => `${value}%`}
                        />
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                        <Tooltip />
                        <Legend />
                        <Area
                            type="monotone"
                            dataKey="approvalRate"
                            name="Approval Rate"
                            stroke="#22c55e"
                            fillOpacity={1}
                            fill="url(#colorApproved)"
                        />
                        <Area
                            type="monotone"
                            dataKey="rejectionRate"
                            name="Rejection Rate"
                            stroke="#ef4444"
                            fillOpacity={1}
                            fill="url(#colorRejected)"
                        />
                    </AreaChart>
                </ResponsiveContainer>
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

function NoDataChart({ title }: { title: string }) {
    return (
        <Card className="col-span-2">
            <CardHeader>
                <CardTitle>{title}</CardTitle>
            </CardHeader>
            <CardContent className="h-[300px] flex items-center justify-center text-muted-foreground">
                No data available for the selected period
            </CardContent>
        </Card>
    );
}
