/**
 * Decision Dashboard - Dark Theme Version
 * Go/No-Go Decision Dashboard for reviewing high-risk AI executions
 */

import React, { useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { decisionApi } from '../api/decisionApi';
import type { Ticket } from '../api/decisionApi';
import { PendingTicketsTable } from '../components/decision/PendingTicketsTable';
import { RoiCalculatorCard } from '../components/decision/RoiCalculatorCard';
import { BudgetUtilizationWidget } from '../components/decision/BudgetUtilizationWidget';
import { AlertCircle, RefreshCw, TrendingUp, DollarSign } from 'lucide-react';

export const DecisionDashboard: React.FC = () => {
    const queryClient = useQueryClient();
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);

    const { data, isLoading, error, refetch } = useQuery({
        queryKey: ['pendingTickets'],
        queryFn: decisionApi.getPendingTickets,
    });

    const { data: metrics } = useQuery({
        queryKey: ['decisionMetrics'],
        queryFn: decisionApi.getMetrics,
    });

    useEffect(() => {
        if (data) {
            setTickets(data);
            // Auto-select first ticket for preview
            if (data.length > 0 && !selectedTicket) {
                setSelectedTicket(data[0]);
            }
        }
    }, [data]);

    const handleRefresh = () => {
        refetch();
        queryClient.invalidateQueries({ queryKey: ['decisionMetrics'] });
    };

    if (isLoading) {
        return (
            <div className="flex h-96 items-center justify-center">
                <div className="text-center">
                    <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                    <p className="text-muted-foreground">Loading pending decisions...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                        <TrendingUp className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-semibold text-foreground">
                            Go/No-Go Decision Dashboard
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Review and approve high-risk AI executions
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {/* Pending Count Card */}
                    <div className="flex items-center gap-3 rounded-lg border border-border bg-card px-4 py-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-amber-500/10">
                            <AlertCircle className="h-4 w-4 text-amber-500" />
                        </div>
                        <div>
                            <div className="text-xl font-semibold text-amber-500">
                                {metrics?.pendingCount || 0}
                            </div>
                            <div className="text-xs text-muted-foreground">
                                Pending
                            </div>
                        </div>
                    </div>

                    {/* Blocked Cost Card */}
                    <div className="flex items-center gap-3 rounded-lg border border-border bg-card px-4 py-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-destructive/10">
                            <DollarSign className="h-4 w-4 text-destructive" />
                        </div>
                        <div>
                            <div className="text-xl font-semibold text-destructive">
                                ${metrics?.totalBlockedCost?.toFixed(2) || '0.00'}
                            </div>
                            <div className="text-xs text-muted-foreground">
                                Blocked Cost
                            </div>
                        </div>
                    </div>

                    {/* Refresh Button */}
                    <button
                        onClick={handleRefresh}
                        className="flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground hover:text-foreground transition-colors"
                    >
                        <RefreshCw className="h-4 w-4" />
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 items-start">
                {/* Left Column - Tickets */}
                <div className="space-y-3 flex flex-col">
                    {/* Section Header */}
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-medium text-foreground">
                            Pending Approvals
                        </h2>
                        <span className="text-sm text-muted-foreground">
                            {tickets.length} tickets awaiting review
                        </span>
                    </div>

                    {error ? (
                        <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-6 text-destructive flex-1 flex items-center">
                            <div className="flex items-center gap-2">
                                <AlertCircle className="h-4 w-4" />
                                <p className="text-sm">Error loading tickets. Please check API connection.</p>
                            </div>
                        </div>
                    ) : (
                        <div className="rounded-lg border border-border bg-card flex-1">
                            <PendingTicketsTable tickets={tickets} onDecisionMade={handleRefresh} />
                        </div>
                    )}
                </div>

                {/* Right Column - Sidebar Widgets */}
                <div className="space-y-3 flex flex-col">
                    {/* Section Header */}
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-medium text-foreground">
                            Quick Analysis
                        </h2>
                        <span className="text-sm text-muted-foreground">
                            {selectedTicket ? 'Selected ticket' : 'No selection'}
                        </span>
                    </div>
                    {selectedTicket ? (
                        <>
                            <RoiCalculatorCard ticket={selectedTicket} />
                            <BudgetUtilizationWidget ticket={selectedTicket} />
                        </>
                    ) : tickets.length > 0 ? (
                        <div className="rounded-lg border border-border bg-card p-8 text-center flex-1 flex flex-col items-center justify-center">
                            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                                <TrendingUp className="h-6 w-6 text-muted-foreground" />
                            </div>
                            <p className="text-sm text-muted-foreground">
                                Select a ticket to view ROI analysis
                            </p>
                        </div>
                    ) : (
                        <div className="rounded-lg border border-border bg-card p-8 text-center flex-1 flex items-center justify-center">
                            <p className="text-sm text-muted-foreground">No tickets pending review</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
