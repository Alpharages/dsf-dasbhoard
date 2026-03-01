import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ExternalLink, CheckCircle } from 'lucide-react';
import type { Project } from '../../types';

interface ProjectCardListViewProps {
    projects: Project[];
    onReview?: (project: Project) => void;
}

const statusColors: Record<string, string> = {
    active: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
    'on-hold': 'bg-amber-500/10 text-amber-500 border-amber-500/20',
    paused: 'bg-slate-500/10 text-slate-500 border-slate-500/20',
    completed: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
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
        <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
                <table className="w-full min-w-max text-left border-collapse">
                    <thead>
                        <tr className="bg-secondary/30 border-b border-border text-xs uppercase tracking-wider text-muted-foreground">
                            <th className="py-4 px-6 font-bold">Project Name</th>
                            <th className="py-4 px-6 font-bold">Status</th>
                            <th className="py-4 px-6 font-bold">Client</th>
                            <th className="py-4 px-6 font-bold text-center">Tickets</th>
                            <th className="py-4 px-6 font-bold text-center">Blocked</th>
                            <th className="py-4 px-6 font-bold">Last Activity</th>
                            <th className="py-4 px-6 font-bold text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border/50">
                        {projects.map((project) => (
                            <tr key={project.id} className="hover:bg-secondary/20 transition-colors group">
                                <td className="py-4 px-6">
                                    <h3
                                        className="text-sm font-bold text-card-foreground group-hover:text-primary transition-colors cursor-pointer"
                                        onClick={() => navigate(`/projects/${project.id}`)}
                                    >
                                        {project.name}
                                    </h3>
                                </td>
                                <td className="py-4 px-6">
                                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${statusColors[project.status] || statusColors.paused}`}>
                                        {project.status}
                                    </span>
                                </td>
                                <td className="py-4 px-6 text-sm text-muted-foreground font-medium">
                                    {project.client_name}
                                </td>
                                <td className="py-4 px-6 text-center">
                                    <span className="text-sm font-bold text-foreground">
                                        {project.tickets?.total ?? 0}
                                    </span>
                                </td>
                                <td className="py-4 px-6 text-center">
                                    <span className={`text-sm font-bold ${(project.tickets?.blocked ?? 0) > 0 ? 'text-destructive' : 'text-foreground'}`}>
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
                                                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 transition-all shadow-md shadow-blue-500/20"
                                                title="Review Execution"
                                            >
                                                <CheckCircle className="w-3.5 h-3.5" />
                                                Review
                                            </button>
                                        ) : (
                                            <button
                                                className="px-3 py-1.5 bg-secondary hover:bg-secondary/80 text-muted-foreground hover:text-foreground text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-all"
                                                title="View Details"
                                                onClick={() => navigate(`/projects/${project.id}`)}
                                            >
                                                <ExternalLink className="w-3.5 h-3.5" />
                                                Details
                                            </button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
