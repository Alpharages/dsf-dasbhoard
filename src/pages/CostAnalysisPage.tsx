import { BarChart3, TrendingUp, DollarSign, Wallet } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

const STAT_CARDS = [
    { label: 'Monthly Burn', icon: DollarSign, color: 'text-emerald-500' },
    { label: 'AI Token Cost', icon: Wallet, color: 'text-indigo-500' },
    { label: 'Infrastructure', icon: TrendingUp, color: 'text-purple-500' },
    { label: 'Budget Cap', icon: BarChart3, color: 'text-amber-500' },
];

export default function CostAnalysisPage() {
    return (
        <div className="container mx-auto py-8 space-y-6 animate-in fade-in duration-700">
            <div className="space-y-1">
                <div className="flex items-center gap-2">
                    <div className="p-2 bg-blue-500/10 border border-blue-500/20 rounded-lg shadow-sm">
                        <BarChart3 className="h-6 w-6 text-blue-500" />
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">Cost Analysis</h1>
                </div>
                <p className="text-muted-foreground font-medium">
                    Detailed breakdown of infrastructure costs, AI provider token usage, and budget projections.
                </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {STAT_CARDS.map(({ label, icon: Icon, color }) => (
                    <Card key={label} className="bg-card/50 border-border/50">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">{label}</CardTitle>
                            <Icon className={`h-4 w-4 ${color}`} />
                        </CardHeader>
                        <CardContent>
                            <div className="text-xl font-semibold tracking-tight text-muted-foreground">—</div>
                            <p className="text-xs text-muted-foreground mt-1">Data not yet available</p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid gap-4 md:grid-cols-7">
                <Card className="md:col-span-4 bg-card/40 border-border/50 backdrop-blur-md">
                    <CardHeader>
                        <CardTitle>Spending Trends</CardTitle>
                        <CardDescription>Cost allocation across AI agents over time.</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[350px] flex items-center justify-center border-t border-border/40 mt-4">
                        <div className="text-muted-foreground flex flex-col items-center gap-4">
                            <div className="p-4 bg-secondary rounded-full">
                                <BarChart3 className="w-12 h-12 opacity-40" />
                            </div>
                            <p className="font-semibold text-base tracking-tight">Cost visualization coming soon</p>
                            <p className="text-sm max-w-[300px] text-center opacity-70">Connect the cost-tracking API to populate this view.</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="md:col-span-3 bg-card/40 border-border/50 backdrop-blur-md">
                    <CardHeader>
                        <CardTitle>AI Provider Distribution</CardTitle>
                        <CardDescription>Tokens consumed per model family.</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[350px] flex items-center justify-center border-t border-border/40 mt-4">
                        <div className="text-muted-foreground flex flex-col items-center gap-4">
                            <p className="text-sm opacity-70">No usage data available yet.</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
