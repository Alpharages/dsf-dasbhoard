import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Skeleton } from '../../ui/skeleton';
import { Brain, TrendingUp, TrendingDown, AlertCircle } from 'lucide-react';
import type { AiInsight } from '../../../types/architectureReview';

interface AiInsightsGalleryProps {
    insights?: AiInsight[];
    isLoading: boolean;
}

export function AiInsightsGallery({ insights, isLoading }: AiInsightsGalleryProps) {
    if (isLoading) return <InsightsSkeleton />;

    const items = insights || [];
    const hasData = items.length > 0;

    return (
        <Card className="col-span-4">
            <CardHeader className="flex flex-row items-center space-x-2">
                <Brain className="h-5 w-5 text-purple-500" />
                <CardTitle>AI Learning Insights</CardTitle>
            </CardHeader>
            <CardContent>
                {hasData ? (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {items.map((insight) => (
                            <InsightCard key={insight.id} insight={insight} />
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center p-8 text-muted-foreground bg-muted/20 rounded-lg">
                        <Brain className="h-8 w-8 mb-2 opacity-50" />
                        <p>No enough data to generate insights yet.</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

function InsightCard({ insight }: { insight: AiInsight }) {
    let icon = AlertCircle;
    let colorClass = "text-muted-foreground";
    let bgClass = "bg-muted";

    if (insight.type === 'IMPROVEMENT') {
        icon = TrendingUp;
        colorClass = "text-green-600";
        bgClass = "bg-green-50/50 border-green-200";
    } else if (insight.type === 'REGRESSION') {
        icon = TrendingDown;
        colorClass = "text-red-600";
        bgClass = "bg-red-50/50 border-red-200";
    } else if (insight.type === 'PATTERN') {
        icon = Brain;
        colorClass = "text-purple-600";
        bgClass = "bg-purple-50/50 border-purple-200";
    }

    const Icon = icon;

    return (
        <div className={`p-4 rounded-lg border ${bgClass} flex flex-col space-y-2`}>
            <div className="flex items-center justify-between">
                <div className={`flex items-center space-x-2 font-medium ${colorClass}`}>
                    <Icon className="h-4 w-4" />
                    <span className="text-xs uppercase tracking-wider">{insight.type}</span>
                </div>
                {insight.change !== 0 && (
                    <span className={`text-xs font-bold ${insight.change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {insight.change > 0 ? '+' : ''}{insight.change}%
                    </span>
                )}
            </div>
            <p className="text-sm font-medium leading-snug">{insight.message}</p>
            <p className="text-xs text-muted-foreground">Based on {insight.metric}</p>
        </div>
    );
}

function InsightsSkeleton() {
    return (
        <Card className="col-span-4">
            <CardHeader className="flex flex-row items-center space-x-2">
                <Skeleton className="h-5 w-5 rounded-full" />
                <Skeleton className="h-6 w-[200px]" />
            </CardHeader>
            <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="p-4 rounded-lg border flex flex-col space-y-2">
                            <div className="flex items-center justify-between">
                                <Skeleton className="h-4 w-[80px]" />
                                <Skeleton className="h-4 w-[40px]" />
                            </div>
                            <Skeleton className="h-10 w-full" />
                            <Skeleton className="h-3 w-[100px]" />
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
