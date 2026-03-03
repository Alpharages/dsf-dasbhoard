import React, { useState } from 'react';
import type { Ticket } from '../../api/decisionApi';
import { ExternalLink } from 'lucide-react';
import { DecisionActionDialog } from './DecisionActionDialog';

interface Props {
    tickets: Ticket[];
    onDecisionMade: () => void;
}

export const PendingTicketsTable: React.FC<Props> = ({ tickets, onDecisionMade }) => {
    const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);

    if (tickets.length === 0) {
        return (
            <div className="p-8 text-center text-muted-foreground bg-card rounded-lg border border-border">
                No pending tickets found.
            </div>
        );
    }

    return (
        <>
            <div className="overflow-x-auto bg-card rounded-lg border border-border">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-muted border-b border-border">
                            <th className="p-4 font-semibold text-foreground">Ticket ID</th>
                            <th className="p-4 font-semibold text-foreground">Project</th>
                            <th className="p-4 font-semibold text-foreground">Status</th>
                            <th className="p-4 font-semibold text-foreground">Budget / Spend</th>
                            <th className="p-4 font-semibold text-foreground">Block Cost</th>
                            <th className="p-4 font-semibold text-foreground">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {tickets.map((ticket) => {
                            const budget = ticket.costStats?.projectBudget || 0;
                            const spend = ticket.costStats?.projectSpend || 0;
                            const blockCost = ticket.costStats?.totalCost || 0;
                            const percent = budget > 0 ? (spend / budget) * 100 : 0;
                            const isCritical = percent > 90;

                            // Construct ClickUp URL from task ID
                            const clickupUrl = `https://app.clickup.com/t/${ticket.clickup_task_id}`;

                            return (
                                <tr key={ticket.id} className="border-b border-border hover:bg-muted/50">
                                    <td className="p-4">
                                        <div className="flex items-center gap-2">
                                            <span className="font-mono text-sm">{ticket.clickup_task_id}</span>
                                            <a
                                                href={clickupUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-blue-500 hover:text-blue-700"
                                            >
                                                <ExternalLink size={14} />
                                            </a>
                                        </div>
                                        <div className="text-xs text-muted-foreground">{ticket.title}</div>
                                    </td>
                                    <td className="p-4">{ticket.project.name}</td>
                                    <td className="p-4">
                                        <span className="px-2 py-1 text-xs font-semibold text-yellow-800 bg-yellow-100 rounded-full">
                                            {ticket.status}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex flex-col gap-1">
                                            <span className="text-sm">
                                                ${spend.toFixed(2)} / ${budget.toFixed(2)}
                                            </span>
                                            <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full ${isCritical ? 'bg-red-500' : 'bg-green-500'}`}
                                                    style={{ width: `${Math.min(percent, 100)}%` }}
                                                />
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4 font-medium text-red-600">
                                        ${blockCost.toFixed(2)}
                                    </td>
                                    <td className="p-4">
                                        <button
                                            onClick={() => setSelectedTicket(ticket)}
                                            className="px-4 py-2 text-white bg-blue-600 rounded hover:bg-blue-700 transition font-medium"
                                        >
                                            Review
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* Decision Modal */}
            {selectedTicket && (
                <DecisionActionDialog
                    ticket={selectedTicket}
                    onClose={() => setSelectedTicket(null)}
                    onDecisionMade={onDecisionMade}
                />
            )}
        </>
    );
};
