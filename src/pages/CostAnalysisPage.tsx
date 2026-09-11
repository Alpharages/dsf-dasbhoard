import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { BarChart3, TrendingUp, DollarSign, Wallet, ArrowDownToLine, ArrowUpFromLine, Activity, ChevronDown } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import apiClient from '@/api/client';
import { costsApi, type CostPeriod } from '@/api/costsApi';

/** Sentinel for the workspace-wide view — an empty projectId is never sent. */
const ALL_PROJECTS = '';

/** Money arrives as a decimal string from Prisma — parse once, at the edge. */
const usd = (value: string | number) =>
    Number(value).toLocaleString(undefined, { style: 'currency', currency: 'USD', maximumFractionDigits: 2 });

const compact = (n: number) => n.toLocaleString(undefined, { notation: 'compact', maximumFractionDigits: 1 });

const minutes = (ms: number) => `${(ms / 60000).toFixed(1)} min`;

const PERIOD_LABEL: Record<CostPeriod, string> = {
    day: 'Last 24 hours',
    week: 'Last 7 days',
    month: 'Last 30 days',
};

/** Proportional bar — avoids a chart lib for what is a ranked list of shares. */
function ShareBar({ label, value, share, meta }: { label: string; value: string; share: number; meta?: string }) {
    return (
        <div className="space-y-1.5">
            <div className="flex items-baseline justify-between gap-4">
                <span className="text-sm font-medium text-foreground truncate">{label}</span>
                <span className="text-sm font-semibold tabular-nums text-foreground shrink-0">{value}</span>
            </div>
            <div className="h-2 w-full rounded-full bg-secondary overflow-hidden">
                <div
                    className="h-full rounded-full bg-indigo-500/80 transition-all"
                    style={{ width: `${Math.max(share * 100, share > 0 ? 1.5 : 0)}%` }}
                />
            </div>
            {meta && <p className="text-xs text-muted-foreground">{meta}</p>}
        </div>
    );
}

export default function CostAnalysisPage() {
    const [period, setPeriod] = useState<CostPeriod>('month');
    // Defaults to all projects: this page answers "what is the whole factory
    // costing", and narrowing is the deliberate act.
    const [projectId, setProjectId] = useState<string>(ALL_PROJECTS);

    const { data: projects } = useQuery({
        queryKey: ['pmDashboardProjects'],
        queryFn: async () => {
            const { data } = await apiClient.get('/pm-dashboard/projects');
            return (data?.data ?? []) as { id: string; name: string }[];
        },
        staleTime: 5 * 60 * 1000,
    });

    const summaryQuery = useQuery({
        queryKey: ['costSummary', period, projectId],
        queryFn: () => costsApi.getSummary(period, projectId || undefined),
    });

    const skillsQuery = useQuery({
        queryKey: ['costSkillStats'],
        queryFn: () => costsApi.getSkillComputeStats(),
    });

    const summary = summaryQuery.data;
    const totalTokens = summary ? summary.totalTokensInput + summary.totalTokensOutput : 0;
    const avgPerRun =
        summary && summary.invocationCount > 0 ? Number(summary.totalCostUsd) / summary.invocationCount : 0;

    const statCards = [
        {
            label: 'Total Spend',
            icon: DollarSign,
            color: 'text-emerald-500',
            value: summary ? usd(summary.totalCostUsd) : '—',
            hint: PERIOD_LABEL[period],
        },
        {
            label: 'Input Tokens',
            icon: ArrowDownToLine,
            color: 'text-indigo-500',
            value: summary ? compact(summary.totalTokensInput) : '—',
            hint: 'Cache reads excluded',
        },
        {
            label: 'Output Tokens',
            icon: ArrowUpFromLine,
            color: 'text-purple-500',
            value: summary ? compact(summary.totalTokensOutput) : '—',
            hint: summary ? `${compact(totalTokens)} total` : '',
        },
        {
            label: 'Runs',
            icon: Activity,
            color: 'text-amber-500',
            value: summary ? summary.invocationCount.toLocaleString() : '—',
            hint: summary ? `${usd(avgPerRun)} avg per run` : '',
        },
    ];

    // Every card states its scope: an unlabelled total silently changes meaning
    // when the filter moves, and a project figure read as workspace-wide is worse
    // than no figure.
    const projectName = projects?.find((p) => p.id === projectId)?.name;
    const scopeLabel = projectName ? `, ${projectName}` : ' across all projects';

    const modelCostTotal = summary?.byModel.reduce((sum, m) => sum + Number(m.costUsd), 0) ?? 0;
    const rankedModels = [...(summary?.byModel ?? [])].sort((a, b) => Number(b.costUsd) - Number(a.costUsd));

    // The skill endpoint returns both a workspace roll-up and a per-project
    // breakdown, so the project filter is a client-side pick between them rather
    // than another request.
    const skills = projectId
        ? (skillsQuery.data?.bySkillProject ?? []).filter((s) => s.projectId === projectId)
        : (skillsQuery.data?.bySkill ?? []);
    const skillCostTotal = skills.reduce((sum, s) => sum + Number(s.totalCostUsd), 0);
    const rankedSkills = [...skills].sort((a, b) => Number(b.totalCostUsd) - Number(a.totalCostUsd));

    return (
        <div className="container mx-auto py-8 space-y-6 animate-in fade-in duration-700">
            <div className="flex flex-wrap items-end justify-between gap-4">
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-blue-500/10 border border-blue-500/20 rounded-lg shadow-sm">
                            <BarChart3 className="h-6 w-6 text-blue-500" />
                        </div>
                        <h1 className="text-3xl font-bold tracking-tight text-foreground">Cost Analysis</h1>
                    </div>
                    <p className="text-muted-foreground font-medium">
                        AI token usage and attributed spend per model and per skill.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="relative">
                        <select
                            aria-label="Project"
                            value={projectId}
                            onChange={(e) => setProjectId(e.target.value)}
                            className="appearance-none h-10 bg-card border border-border text-sm text-foreground rounded-md pl-3 pr-9 cursor-pointer hover:border-foreground/20 focus:outline-none focus:ring-2 focus:ring-primary"
                        >
                            <option value={ALL_PROJECTS}>All projects</option>
                            {(projects ?? []).map((project) => (
                                <option key={project.id} value={project.id}>
                                    {project.name}
                                </option>
                            ))}
                        </select>
                        <ChevronDown className="w-4 h-4 text-muted-foreground absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>

                {/* Plain buttons: the shared Tabs primitive is uncontrolled-only
                    (defaultValue + internal state), so it cannot drive this query. */}
                <div className="inline-flex h-10 items-center rounded-md bg-muted p-1">
                    {(['day', 'week', 'month'] as CostPeriod[]).map((p) => (
                        <button
                            key={p}
                            type="button"
                            onClick={() => setPeriod(p)}
                            aria-pressed={period === p}
                            className={`px-3 py-1.5 text-sm font-medium rounded-sm capitalize transition-colors ${
                                period === p
                                    ? 'bg-background text-foreground shadow-sm'
                                    : 'text-muted-foreground hover:text-foreground'
                            }`}
                        >
                            {p}
                        </button>
                    ))}
                    </div>
                </div>
            </div>

            {summaryQuery.isError && (
                <Alert variant="destructive">
                    <AlertTitle>Could not load cost data</AlertTitle>
                    <AlertDescription>
                        {(summaryQuery.error as Error)?.message ?? 'The cost-tracking API did not respond.'}
                    </AlertDescription>
                </Alert>
            )}

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {statCards.map(({ label, icon: Icon, color, value, hint }) => (
                    <Card key={label} className="bg-card/50 border-border/50">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                                {label}
                            </CardTitle>
                            <Icon className={`h-4 w-4 ${color}`} />
                        </CardHeader>
                        <CardContent>
                            {summaryQuery.isLoading ? (
                                <Skeleton className="h-7 w-24" />
                            ) : (
                                <div className="text-2xl font-semibold tracking-tight text-foreground tabular-nums">
                                    {value}
                                </div>
                            )}
                            {hint && <p className="text-xs text-muted-foreground mt-1">{hint}</p>}
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid gap-4 md:grid-cols-7">
                <Card className="md:col-span-4 bg-card/40 border-border/50 backdrop-blur-md">
                    <CardHeader>
                        <CardTitle>Spend by Model</CardTitle>
                        <CardDescription>
                            Attributed cost per model family — {PERIOD_LABEL[period].toLowerCase()}
                            {scopeLabel}.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="border-t border-border/40 pt-6 space-y-5">
                        {summaryQuery.isLoading ? (
                            <div className="space-y-5">
                                {[0, 1, 2].map((i) => (
                                    <Skeleton key={i} className="h-12 w-full" />
                                ))}
                            </div>
                        ) : rankedModels.length === 0 ? (
                            <p className="text-sm text-muted-foreground py-8 text-center">
                                No runs recorded in this period.
                            </p>
                        ) : (
                            rankedModels.map((m) => (
                                <ShareBar
                                    key={m.model}
                                    label={m.model}
                                    value={usd(m.costUsd)}
                                    share={modelCostTotal > 0 ? Number(m.costUsd) / modelCostTotal : 0}
                                    meta={`${compact(m.tokens)} tokens`}
                                />
                            ))
                        )}
                    </CardContent>
                </Card>

                <Card className="md:col-span-3 bg-card/40 border-border/50 backdrop-blur-md">
                    <CardHeader>
                        <CardTitle>Compute by Skill</CardTitle>
                        <CardDescription>
                            All-time cost and average run time per skill{scopeLabel}.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="border-t border-border/40 pt-6 space-y-5">
                        {skillsQuery.isLoading ? (
                            <div className="space-y-5">
                                {[0, 1, 2].map((i) => (
                                    <Skeleton key={i} className="h-12 w-full" />
                                ))}
                            </div>
                        ) : rankedSkills.length === 0 ? (
                            <p className="text-sm text-muted-foreground py-8 text-center">No skill runs recorded yet.</p>
                        ) : (
                            rankedSkills.map((s) => (
                                <ShareBar
                                    key={s.skill}
                                    label={s.skill}
                                    value={usd(s.totalCostUsd)}
                                    share={skillCostTotal > 0 ? Number(s.totalCostUsd) / skillCostTotal : 0}
                                    meta={`${s.runCount} runs · ${minutes(s.avgDurationMs)} avg`}
                                />
                            ))
                        )}
                    </CardContent>
                </Card>
            </div>

            <Card className="bg-card/40 border-border/50">
                <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                        <Wallet className="h-4 w-4 text-muted-foreground" />
                        By provider
                    </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-x-8 gap-y-3">
                    {summaryQuery.isLoading ? (
                        <Skeleton className="h-6 w-64" />
                    ) : (summary?.byProvider.length ?? 0) === 0 ? (
                        <p className="text-sm text-muted-foreground">No provider activity in this period.</p>
                    ) : (
                        summary?.byProvider.map((p) => (
                            <div key={p.provider} className="flex items-baseline gap-2">
                                <TrendingUp className="h-3.5 w-3.5 text-emerald-500 self-center" />
                                <span className="text-sm font-medium">{p.provider}</span>
                                <span className="text-sm font-semibold tabular-nums">{usd(p.costUsd)}</span>
                                <span className="text-xs text-muted-foreground">{compact(p.tokens)} tokens</span>
                            </div>
                        ))
                    )}
                </CardContent>
            </Card>

            <p className="text-xs text-muted-foreground">
                Spend is derived from token counts at published model rates — a valuation of usage, not a billed amount,
                since runs execute on a subscription. Cache reads are excluded from metered totals.
            </p>
        </div>
    );
}
