import React from 'react';
import { Navigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { workloadApi } from '../api/workloadApi';
import { UtilizationGauge } from '../components/workload/UtilizationGauge';
import { WorkloadTrendsChart } from '../components/workload/WorkloadTrendsChart';
import { TeamCapacityChart } from '../components/workload/TeamCapacityChart';
import { ReassignmentModal } from '../components/workload/ReassignmentModal';
import { CapacitySettingsModal } from '../components/workload/CapacitySettingsModal';
import { LayoutGrid, AlertTriangle, Settings2, RefreshCw } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useSocket } from '../hooks/useSocket';
import { useAuth, useHasRole, getAccessToken } from '../contexts/AuthContext';

export const WorkloadCapacityPage: React.FC = () => {
    const queryClient = useQueryClient();
    const { user, isLoading: authLoading } = useAuth();
    const pmId = user?.id || '';
    const isManager = useHasRole('MANAGER');
    // Personal utilization/trends only exist for actual PMs (they have a PM record).
    // ADMIN/MANAGER/TL have no PM record, so calling /workload/pm/:id 404s — skip it
    // for them and show only the team view.
    const isPm = user?.role === 'PM';

    // Socket for real-time alerts
    const token = getAccessToken() || '';
    const { socket } = useSocket(token);

    React.useEffect(() => {
        if (!socket) return;

        socket.on('burnout-alert', (payload: { pmName: string }) => {
            toast.error(`🔥 Burnout Alert: ${payload.pmName} crossed 80% utilization!`, {
                duration: 6000,
                icon: '⚠️'
            });
            queryClient.invalidateQueries({ queryKey: ['workload'] });
        });

        socket.on('workload-update', () => {
            queryClient.invalidateQueries({ queryKey: ['workload'] });
        });

        return () => {
            socket.off('burnout-alert');
            socket.off('workload-update');
        };
    }, [socket, queryClient]);

    // Data fetching
    const { data: pmWorkload, isLoading: pmLoading } = useQuery({
        queryKey: ['workload', 'pm', pmId],
        queryFn: () => workloadApi.getPmWorkload(pmId),
        enabled: isPm && !!pmId,
        staleTime: 5 * 60 * 1000,
        retry: 1
    });

    const { data: teamWorkload, isLoading: teamLoading } = useQuery({
        queryKey: ['workload', 'team', pmId],
        queryFn: () => workloadApi.getTeamWorkload(pmId),
        enabled: isManager && !!pmId,
        staleTime: 5 * 60 * 1000
    });

    const { data: trends, isLoading: trendsLoading } = useQuery({
        queryKey: ['workload', 'trends', pmId],
        queryFn: () => workloadApi.getWorkloadTrends(pmId),
        enabled: isPm && !!pmId,
        staleTime: 5 * 60 * 1000
    });

    // Mutations
    const reassignMutation = useMutation({
        mutationFn: ({ projectId, newPmId, reason }: { projectId: string; newPmId: string; reason: string }) =>
            workloadApi.reassignProject(projectId, newPmId, reason),
        onSuccess: () => {
            toast.success('Project reassigned successfully!');
            queryClient.invalidateQueries({ queryKey: ['workload'] });
        },
        onError: () => toast.error('Failed to reassign project')
    });

    const updateCapacityMutation = useMutation({
        mutationFn: (maxTickets: number) => workloadApi.updateMaxTickets(pmId, maxTickets),
        onSuccess: () => {
            toast.success('Capacity settings updated!');
            queryClient.invalidateQueries({ queryKey: ['workload', 'pm', pmId] });
        },
        onError: () => toast.error('Failed to update capacity')
    });

    const [isReassignOpen, setIsReassignOpen] = React.useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = React.useState(false);
    const [selectedProject, setSelectedProject] = React.useState<{ id: string, name: string } | null>(null);

    // Mock project selection for now - ideally this comes from a "Select Project" flow or context
    const handleQuickReassign = () => {
        setSelectedProject({ id: 'proj-select', name: 'Select Project...' });
        setIsReassignOpen(true);
    };

    if (authLoading) {
        return (
            <div className="space-y-8 animate-pulse">
                <div className="h-10 w-64 bg-muted rounded-xl"></div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="h-[400px] bg-card/50 rounded-2xl border border-border"></div>
                    <div className="lg:col-span-2 h-[400px] bg-card/50 rounded-2xl border border-border"></div>
                </div>
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if ((isPm && (pmLoading || trendsLoading)) || (isManager && teamLoading)) {
        return (
            <div className="space-y-8 animate-pulse">
                <div className="h-10 w-64 bg-muted rounded-xl"></div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="h-[400px] bg-card/50 rounded-2xl border border-border"></div>
                    <div className="lg:col-span-2 h-[400px] bg-card/50 rounded-2xl border border-border"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-10 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <div className="flex items-center gap-4 mb-2">
                        <h1 className="text-3xl font-bold text-foreground tracking-tight">
                            Capacity Monitor
                        </h1>
                        <div className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[10px] font-bold rounded-full uppercase tracking-wider h-fit">
                            System Healthy
                        </div>
                    </div>
                    <p className="text-muted-foreground font-medium">
                        Monitor your capacity metrics and manage team distribution.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => queryClient.invalidateQueries({ queryKey: ['workload'] })}
                        className="p-3 bg-card border border-border text-muted-foreground hover:text-foreground rounded-2xl transition-all"
                    >
                        <RefreshCw className="w-5 h-5" />
                    </button>
                    <button
                        onClick={() => setIsSettingsOpen(true)}
                        className="flex items-center gap-2 bg-secondary hover:bg-secondary/80 text-secondary-foreground font-bold py-3 px-6 rounded-2xl border border-secondary/50 shadow-lg transition-all"
                    >
                        <Settings2 className="w-5 h-5" />
                        Configure
                    </button>
                </div>
            </div>

            {/* Top Stats — personal utilization is only available to PMs */}
            {isPm && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* PM Gauge */}
                    {pmWorkload && (
                        <UtilizationGauge
                            utilization={pmWorkload.utilization}
                            activeTickets={pmWorkload.active_tickets}
                            maxTickets={pmWorkload.max_tickets}
                            title="Your Utilization"
                        />
                    )}

                    {/* Trends Chart */}
                    <div className="lg:col-span-2">
                        {trends && <WorkloadTrendsChart data={trends.data} />}
                    </div>
                </div>
            )}

            {/* Manager View */}
            {isManager && teamWorkload && (
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-bold text-foreground flex items-center gap-3">
                            <LayoutGrid className="w-6 h-6 text-primary" />
                            Team Load Balancing
                        </h2>
                        {teamWorkload.data.some(pm => pm.utilization > 80) && (
                            <div className="flex items-center gap-2 px-4 py-2 bg-rose-500/10 border border-rose-500/20 rounded-2xl">
                                <AlertTriangle className="w-4 h-4 text-rose-500" />
                                <span className="text-xs font-bold text-rose-500 uppercase tracking-widest">Action Required: Overloaded Staff</span>
                            </div>
                        )}
                    </div>

                    <TeamCapacityChart
                        data={teamWorkload.data}
                        onPmClick={(clickedPmId) => {
                            toast(`Drilling down into PM: ${clickedPmId}`, { icon: '🔍' });
                        }}
                    />

                    {/* Quick Reassign Section */}
                    <div className="p-8 bg-primary/5 border border-primary/10 rounded-3xl flex flex-col items-center text-center">
                        <div className="w-16 h-16 bg-primary/20 rounded-2xl flex items-center justify-center mb-4">
                            <RefreshCw className="w-8 h-8 text-primary" />
                        </div>
                        <h4 className="text-lg font-bold text-foreground mb-2">Need to rebalance?</h4>
                        <p className="text-sm text-muted-foreground max-w-md mb-6">
                            You can reassign projects manually to prevent burnout.
                        </p>
                        <button
                            onClick={handleQuickReassign}
                            className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-3 px-8 rounded-2xl transition-all shadow-lg shadow-primary/20"
                        >
                            Quick Reassign
                        </button>
                    </div>
                </div>
            )}

            <ReassignmentModal
                isOpen={isReassignOpen}
                onClose={() => setIsReassignOpen(false)}
                projectId={selectedProject?.id || ''}
                projectName={selectedProject?.name || ''}
                currentPmName={pmWorkload?.utilization !== undefined ? (user?.fullName || "Current PM") : ""}
                onReassign={async (projectId, newPmId, reason) => {
                    await reassignMutation.mutateAsync({ projectId, newPmId, reason });
                }}
            />

            <CapacitySettingsModal
                isOpen={isSettingsOpen}
                onClose={() => setIsSettingsOpen(false)}
                currentMaxTickets={pmWorkload?.max_tickets || 5} // Default to 5 if loading
                onSave={async (newMax) => {
                    await updateCapacityMutation.mutateAsync(newMax);
                }}
            />
        </div>
    );
};

