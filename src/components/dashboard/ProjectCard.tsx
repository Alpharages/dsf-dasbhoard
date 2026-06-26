import {
    Github,
    ExternalLink,
    MoreVertical,
    ChevronRight,
    CheckCircle,
    AlertCircle,
    Clock
} from 'lucide-react';
import type { Project } from '../../types';
import { motion } from 'framer-motion';

interface ProjectCardProps {
    project: Project;
    onReview?: (project: Project) => void;
}

const statusConfig: Record<string, { bg: string; text: string; border: string; glow: string; label: string }> = {
    active: { 
        bg: 'bg-emerald-500/10', 
        text: 'text-emerald-400', 
        border: 'border-emerald-500/20',
        glow: 'shadow-emerald-500/10',
        label: 'Active'
    },
    'on-hold': { 
        bg: 'bg-amber-500/10', 
        text: 'text-amber-400', 
        border: 'border-amber-500/20',
        glow: 'shadow-amber-500/10',
        label: 'On Hold'
    },
    paused: {
        bg: 'bg-muted',
        text: 'text-muted-foreground',
        border: 'border-border',
        glow: '',
        label: 'Paused'
    },
    completed: { 
        bg: 'bg-blue-500/10', 
        text: 'text-blue-400', 
        border: 'border-blue-500/20',
        glow: 'shadow-blue-500/10',
        label: 'Completed'
    },
};

export const ProjectCard: React.FC<ProjectCardProps> = ({ project, onReview }) => {
    const status = statusConfig[project.status] || statusConfig.paused;
    const progress = Math.round((project.tickets.completed / project.tickets.total) * 100) || 0;
    
    return (
        <motion.div 
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            className="stats-card group relative overflow-hidden rounded-lg border border-[var(--card-border)] bg-card transition-all duration-300 hover:border-[var(--border-hover)]"
        >
            <div className="relative p-5">
                {/* Header */}
                <div className="flex justify-between items-start mb-4">
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-base font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                                {project.name}
                            </h3>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${status.bg} ${status.text} ${status.border} ${status.glow}`}>
                                {status.label}
                            </span>
                        </div>
                        <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                            <span className="truncate">Client: <span className="text-foreground/80 font-medium">{project.client_name}</span></span>
                        </p>
                    </div>
                    
                    <div className="flex items-center gap-2">
                        {(project.tickets.sync_pending ?? 0) > 0 && (
                            <div className="flex flex-col items-end gap-1">
                                <span className="bg-amber-500/20 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded-md text-[10px] font-bold animate-pulse flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    SYNC PENDING
                                </span>
                                <span className="text-[10px] text-muted-foreground">
                                    {project.tickets.sync_pending} ticket(s)
                                </span>
                            </div>
                        )}
                        {project.tickets.awaiting_approval > 0 && (
                            <div className="flex flex-col items-end gap-1">
                                <span className="bg-blue-500/20 text-blue-400 border border-blue-500/30 px-2 py-0.5 rounded-md text-[10px] font-bold animate-pulse flex items-center gap-1">
                                    <AlertCircle className="w-3 h-3" />
                                    APPROVAL
                                </span>
                                <span className="text-[10px] text-muted-foreground">
                                    {project.tickets.awaiting_approval} ticket(s)
                                </span>
                            </div>
                        )}
                        <button className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-[var(--surface-1)] transition-colors">
                            <MoreVertical className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="bg-[var(--surface-1)] rounded-md p-3 border border-[var(--card-border)]">
                        <div className="flex items-center gap-1.5 mb-1">
                            <CheckCircle className="w-3.5 h-3.5 text-muted-foreground" />
                            <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Tickets</p>
                        </div>
                        <div className="flex items-baseline gap-1.5">
                            <span className="data-figure tabular-nums text-xl font-semibold text-foreground">{project.tickets.total}</span>
                            <span className="text-[10px] text-muted-foreground">total</span>
                        </div>
                    </div>

                    <div className="bg-[var(--surface-1)] rounded-md p-3 border border-[var(--card-border)]">
                        <div className="flex items-center gap-1.5 mb-1">
                            <AlertCircle className={`w-3.5 h-3.5 ${project.tickets.blocked > 0 ? 'text-rose-400' : 'text-muted-foreground'}`} />
                            <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Blocked</p>
                        </div>
                        <div className="flex items-baseline gap-1.5">
                            <span className={`data-figure tabular-nums text-xl font-semibold ${project.tickets.blocked > 0 ? 'text-rose-400' : 'text-foreground'}`}>
                                {project.tickets.blocked}
                            </span>
                            <span className="text-[10px] text-muted-foreground">tickets</span>
                        </div>
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider">
                        <span className="text-muted-foreground flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            Progress
                        </span>
                        <span className="text-foreground">{progress}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-[var(--surface-1)] rounded-full overflow-hidden">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 0.8, ease: 'easeOut' }}
                            className="h-full rounded-full bg-primary"
                        />
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="flex items-center justify-between pt-3 border-t border-[var(--border)]">
                    <div className="flex gap-2">
                        <a
                            href={project.github_repository_url}
                            target="_blank"
                            rel="noreferrer"
                            className="p-2 rounded-lg bg-[var(--surface-1)] border border-[var(--card-border)] text-muted-foreground hover:text-foreground hover:border-[var(--border-hover)] transition-all"
                            title="Open GitHub Repository"
                        >
                            <Github className="w-4 h-4" />
                        </a>
                        
                        {project.tickets.awaiting_approval > 0 ? (
                            <button
                                onClick={() => onReview?.(project)}
                                className="px-3 py-1.5 bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold rounded-md flex items-center gap-1.5 transition-all"
                            >
                                <CheckCircle className="w-3.5 h-3.5" />
                                Review
                            </button>
                        ) : (
                            <button
                                className="px-3 py-1.5 bg-[var(--surface-1)] border border-[var(--card-border)] text-muted-foreground hover:text-foreground hover:border-[var(--border-hover)] text-xs font-medium rounded-lg flex items-center gap-1.5 transition-all"
                            >
                                <ExternalLink className="w-3.5 h-3.5" />
                                Details
                            </button>
                        )}
                    </div>

                    <button
                        className="text-xs font-semibold text-primary hover:text-primary/80 flex items-center gap-1 py-1.5 px-2 hover:bg-primary/5 rounded-lg transition-all group/btn"
                    >
                        Open
                        <ChevronRight className="w-3.5 h-3.5 transition-transform group-hover/btn:translate-x-0.5" />
                    </button>
                </div>
            </div>
        </motion.div>
    );
};
