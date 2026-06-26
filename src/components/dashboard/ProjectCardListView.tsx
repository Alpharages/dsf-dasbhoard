import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ExternalLink, CheckCircle } from 'lucide-react';
import type { Project } from '../../types';
import { motion } from 'framer-motion';

interface ProjectCardListViewProps {
    projects: Project[];
    onReview?: (project: Project) => void;
}

const statusConfig: Record<string, { bg: string; text: string; border: string; label: string }> = {
    active: { 
        bg: 'bg-emerald-500/10', 
        text: 'text-emerald-400', 
        border: 'border-emerald-500/20',
        label: 'Active'
    },
    'on-hold': { 
        bg: 'bg-amber-500/10', 
        text: 'text-amber-400', 
        border: 'border-amber-500/20',
        label: 'On Hold'
    },
    paused: {
        bg: 'bg-muted',
        text: 'text-muted-foreground',
        border: 'border-border',
        label: 'Paused'
    },
    completed: { 
        bg: 'bg-blue-500/10', 
        text: 'text-blue-400', 
        border: 'border-blue-500/20',
        label: 'Completed'
    },
};

const formatDate = (dateString?: string | null) => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid Date';
    return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
    }).format(date);
};

export const ProjectCardListView: React.FC<ProjectCardListViewProps> = ({ projects, onReview }) => {
    const navigate = useNavigate();

    return (
        <div className="bg-card border border-[var(--card-border)] rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full min-w-max text-left border-collapse">
                    <thead>
                        <tr className="bg-[var(--surface-1)] border-b border-[var(--border)] text-xs uppercase tracking-wider text-muted-foreground">
                            <th className="py-4 px-6 font-bold">Project Name</th>
                            <th className="py-4 px-6 font-bold">Status</th>
                            <th className="py-4 px-6 font-bold">Client</th>
                            <th className="py-4 px-6 font-bold text-center">Tickets</th>
                            <th className="py-4 px-6 font-bold text-center">Blocked</th>
                            <th className="py-4 px-6 font-bold">Last Activity</th>
                            <th className="py-4 px-6 font-bold text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--border)]">
                        {projects.map((project, index) => {
                            const status = statusConfig[project.status] || statusConfig.paused;
                            return (
                                <motion.tr 
                                    key={project.id} 
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.03 }}
                                    className="hover:bg-[var(--surface-1)]/50 transition-colors group"
                                >
                                    <td className="py-4 px-6">
                                        <h3
                                            className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors cursor-pointer"
                                            onClick={() => navigate(`/projects/${project.id}`)}
                                        >
                                            {project.name}
                                        </h3>
                                    </td>
                                    <td className="py-4 px-6">
                                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${status.bg} ${status.text} ${status.border}`}>
                                            {status.label}
                                        </span>
                                    </td>
                                    <td className="py-4 px-6 text-sm text-muted-foreground font-medium">
                                        {project.client_name}
                                    </td>
                                    <td className="py-4 px-6 text-center">
                                        <span className="data-figure tabular-nums text-sm font-semibold text-foreground">
                                            {project.tickets?.total ?? 0}
                                        </span>
                                    </td>
                                    <td className="py-4 px-6 text-center">
                                        <span className={`data-figure tabular-nums text-sm font-semibold ${(project.tickets?.blocked ?? 0) > 0 ? 'text-rose-400' : 'text-foreground'}`}>
                                            {project.tickets?.blocked ?? 0}
                                        </span>
                                    </td>
                                    <td className="py-4 px-6 text-sm text-muted-foreground whitespace-nowrap">
                                        {formatDate(project.last_activity || project.updated_at)}
                                    </td>
                                    <td className="py-4 px-6 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            {(project.tickets?.awaiting_approval ?? 0) > 0 ? (
                                                <button
                                                    onClick={() => onReview?.(project)}
                                                    className="px-3 py-1.5 bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold rounded-md flex items-center gap-1.5 transition-all"
                                                    title="Review Execution"
                                                >
                                                    <CheckCircle className="w-3.5 h-3.5" />
                                                    Review
                                                </button>
                                            ) : (
                                                <button
                                                    className="px-3 py-1.5 bg-[var(--surface-1)] border border-[var(--card-border)] hover:border-[var(--border-hover)] text-muted-foreground hover:text-foreground text-xs font-medium rounded-lg flex items-center gap-1.5 transition-all"
                                                    title="View Details"
                                                    onClick={() => navigate(`/projects/${project.id}`)}
                                                >
                                                    <ExternalLink className="w-3.5 h-3.5" />
                                                    Details
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </motion.tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
