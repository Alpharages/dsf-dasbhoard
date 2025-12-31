import React, { useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { decisionApi } from '../api/decisionApi';
import type { Ticket } from '../api/decisionApi';
import { PendingTicketsTable } from '../components/decision/PendingTicketsTable';
import { RoiCalculatorCard } from '../components/decision/RoiCalculatorCard';
import { BudgetUtilizationWidget } from '../components/decision/BudgetUtilizationWidget';

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

    if (isLoading) return <div className="p-8 text-center">Loading pending decisions...</div>;

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <header className="mb-8 flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Go/No-Go Decision Dashboard</h1>
                    <p className="text-gray-600">Review and approve high-risk AI executions</p>
                </div>
                <div className="flex gap-4">
                    <div className="bg-white p-4 rounded shadow text-center min-w-[120px]">
                        <div className="text-2xl font-bold text-orange-600">{metrics?.pendingCount || 0}</div>
                        <div className="text-xs text-gray-500 uppercase">Pending</div>
                    </div>
                    <div className="bg-white p-4 rounded shadow text-center min-w-[120px]">
                        <div className="text-2xl font-bold text-red-600">${metrics?.totalBlockedCost?.toFixed(2) || '0.00'}</div>
                        <div className="text-xs text-gray-500 uppercase">Blocked Cost</div>
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                <div className="lg:col-span-2 space-y-4">
                    <h2 className="text-xl font-semibold text-gray-800">Pending Approvals</h2>
                    {error ? (
                        <div className="text-red-500 bg-red-50 p-4 rounded">Error loading tickets. Please check API connection.</div>
                    ) : (
                        <PendingTicketsTable tickets={tickets} onDecisionMade={handleRefresh} />
                    )}
                </div>

                <div className="space-y-4">
                    {selectedTicket && (
                        <>
                            <RoiCalculatorCard ticket={selectedTicket} />
                            <BudgetUtilizationWidget ticket={selectedTicket} />
                        </>
                    )}
                    {!selectedTicket && tickets.length > 0 && (
                        <div className="bg-white p-6 rounded-lg shadow text-center text-gray-500">
                            Select a ticket to view ROI analysis
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
