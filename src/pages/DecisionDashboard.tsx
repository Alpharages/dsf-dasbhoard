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
import { motion } from 'framer-motion';

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
                    <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-blue-500 border-t-transparent"></div>
                    <p className="text-slate-400">Loading pending decisions...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <motion.header 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between"
            >
                <div>
                    <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10">
                            <TrendingUp className="h-6 w-6 text-blue-400" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-slate-100">
                                Go/No-Go Decision Dashboard
                            </h1>
                            <p className="text-slate-400">
                                Review and approve high-risk AI executions
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    {/* Pending Count Card */}
                    <motion.div 
                        whileHover={{ scale: 1.02 }}
                        className="flex items-center gap-4 rounded-xl border border-slate-800 bg-slate-900/50 px-6 py-4"
                    >
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10">
                            <AlertCircle className="h-5 w-5 text-amber-400" />
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-amber-400">
                                {metrics?.pendingCount || 0}
                            </div>
                            <div className="text-xs font-medium uppercase tracking-wider text-slate-500">
                                Pending
                            </div>
                        </div>
                    </motion.div>

                    {/* Blocked Cost Card */}
                    <motion.div 
                        whileHover={{ scale: 1.02 }}
                        className="flex items-center gap-4 rounded-xl border border-slate-800 bg-slate-900/50 px-6 py-4"
                    >
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-rose-500/10">
                            <DollarSign className="h-5 w-5 text-rose-400" />
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-rose-400">
                                ${metrics?.totalBlockedCost?.toFixed(2) || '0.00'}
                            </div>
                            <div className="text-xs font-medium uppercase tracking-wider text-slate-500">
                                Blocked Cost
                            </div>
                        </div>
                    </motion.div>

                    {/* Refresh Button */}
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleRefresh}
                        className="flex h-12 w-12 items-center justify-center rounded-xl border border-slate-700 bg-slate-800 text-slate-400 transition-colors hover:border-slate-600 hover:text-slate-200"
                    >
                        <RefreshCw className="h-5 w-5" />
                    </motion.button>
                </div>
            </motion.header>

            {/* Main Content */}
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                {/* Tickets Table */}
                <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                    className="lg:col-span-2 space-y-4"
                >
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-semibold text-slate-200">
                            Pending Approvals
                        </h2>
                        <span className="text-sm text-slate-500">
                            {tickets.length} tickets awaiting review
                        </span>
                    </div>

                    {error ? (
                        <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 p-6 text-rose-400">
                            <div className="flex items-center gap-3">
                                <AlertCircle className="h-5 w-5" />
                                <p>Error loading tickets. Please check API connection.</p>
                            </div>
                        </div>
                    ) : (
                        <div className="rounded-xl border border-slate-800 bg-slate-900/30">
                            <PendingTicketsTable tickets={tickets} onDecisionMade={handleRefresh} />
                        </div>
                    )}
                </motion.div>

                {/* Sidebar Widgets */}
                <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="space-y-6"
                >
                    {selectedTicket ? (
                        <>
                            <RoiCalculatorCard ticket={selectedTicket} />
                            <BudgetUtilizationWidget ticket={selectedTicket} />
                        </>
                    ) : tickets.length > 0 ? (
                        <div className="rounded-xl border border-slate-800 bg-slate-900/30 p-8 text-center">
                            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-800">
                                <TrendingUp className="h-8 w-8 text-slate-600" />
                            </div>
                            <p className="text-slate-400">
                                Select a ticket to view ROI analysis
                            </p>
                        </div>
                    ) : (
                        <div className="rounded-xl border border-slate-800 bg-slate-900/30 p-8 text-center">
                            <p className="text-slate-500">No tickets pending review</p>
                        </div>
                    )}
                </motion.div>
            </div>
        </div>
    );
};
