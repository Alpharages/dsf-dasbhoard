import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Skeleton } from '../../ui/skeleton';
import { ArrowUpRight, ArrowDownRight, Minus, Activity, Clock, Layers, Gauge } from 'lucide-react';
import type { AdrMetricsSummary } from '../../../types/architectureReview';

interface MetricsSummaryGridProps {
    summary?: AdrMetricsSummary;
    isLoading: boolean;
}

export function MetricsSummaryGrid({ summary, isLoading }: MetricsSummaryGridProps) {
    if (isLoading || !summary) {
        return <SummarySkeleton />;
    }

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <MetricCard
                title="Review Volume"
                value={summary.reviewVolume.current}
                previous={summary.reviewVolume.previous}
                trend={summary.reviewVolume.trend}
                icon={Activity}
            />
            <MetricCard
                title="Avg Review Time"
                value={`${summary.averageReviewTimeMinutes.current}m`}
                previous={summary.averageReviewTimeMinutes.previous}
                trend={summary.averageReviewTimeMinutes.trend}
                inverse // Lower is better
                icon={Clock}
            />
            <MetricCard
                title="Queue Depth"
                value={summary.queueDepth.current}
                previous={summary.queueDepth.previous}
                trend={summary.queueDepth.trend}
                inverse // Lower is better
                icon={Layers}
            />
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Est. Throughput</CardTitle>
                    <Gauge className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{summary.estimatedThroughputMinutes}m</div>
                    <p className="text-xs text-muted-foreground">
                        Time to clear queue
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}

interface MetricCardProps {
    title: string;
    value: string | number;
    previous: number;
    trend: number;
    inverse?: boolean;
    icon: React.ElementType;
}

function MetricCard({ title, value, previous, trend, inverse, icon: Icon }: MetricCardProps) {
    // Trend logic: if inverse is true, negative trend is "good" (green)
    const isPositive = trend > 0;
    const isNeutral = trend === 0;

    // Determine color
    // Standard: Positive = Green, Negative = Red
    // Inverse: Positive = Red, Negative = Green
    let colorClass = "text-muted-foreground";
    if (!isNeutral) {
        if (inverse) {
            colorClass = isPositive ? "text-red-500" : "text-green-500";
        } else {
            colorClass = isPositive ? "text-green-500" : "text-red-500";
        }
    }

    const TrendIcon = isPositive ? ArrowUpRight : (isNeutral ? Minus : ArrowDownRight);

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{value}</div>
                <div className="flex items-center text-xs text-muted-foreground">
                    <span className={`flex items-center ${colorClass} mr-1`}>
                        <TrendIcon className="h-3 w-3 mr-1" />
                        {Math.abs(trend)}%
                    </span>
                    from {previous} last period
                </div>
            </CardContent>
        </Card>
    );
}

function SummarySkeleton() {
    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
                <Card key={i}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium"><Skeleton className="h-4 w-[100px]" /></CardTitle>
                        <Skeleton className="h-4 w-4 rounded-full" />
                    </CardHeader>
                    <CardContent>
                        <Skeleton className="h-8 w-[60px] mb-2" />
                        <Skeleton className="h-3 w-[140px]" />
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
