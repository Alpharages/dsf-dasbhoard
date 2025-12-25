import {
    Github,
    ExternalLink,
    MoreVertical,
    ChevronRight
} from 'lucide-react';
import type { Project } from '../../types';

interface ProjectCardProps {
    project: Project;
}

const statusColors: Record<string, string> = {
    active: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
    'on-hold': 'bg-amber-500/10 text-amber-500 border-amber-500/20',
    paused: 'bg-slate-500/10 text-slate-500 border-slate-500/20',
    completed: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
};

export const ProjectCard: React.FC<ProjectCardProps> = ({ project }) => {
    return (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 hover:shadow-2xl hover:shadow-blue-500/5 transition-all group relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-blue-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>

            <div className="flex justify-between items-start mb-6">
                <div>
                    <div className="flex items-center gap-3 mb-1">
                        <h3 className="text-lg font-bold text-slate-100 group-hover:text-blue-400 transition-colors">
                            {project.name}
                        </h3>
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${statusColors[project.status]}`}>
                            {project.status}
                        </span>
                    </div>
                    <p className="text-sm text-slate-500 flex items-center gap-1.5">
                        Client: <span className="text-slate-300 font-medium">{project.client_name}</span>
                    </p>
                </div>
                <button className="text-slate-600 hover:text-slate-300 transition-colors">
                    <MoreVertical className="w-5 h-5" />
                </button>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-slate-950/50 rounded-xl p-3 border border-slate-800/50">
                    <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">Tickets</p>
                    <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-bold text-slate-200">{project.tickets.total}</span>
                        <span className="text-[10px] text-slate-500">Total</span>
                    </div>
                </div>
                <div className="bg-slate-950/50 rounded-xl p-3 border border-slate-800/50">
                    <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">Blocked</p>
                    <div className="flex items-baseline gap-2">
                        <span className={`text-2xl font-bold ${project.tickets.blocked > 0 ? 'text-rose-500' : 'text-slate-200'}`}>
                            {project.tickets.blocked}
                        </span>
                        <span className="text-[10px] text-slate-500">Tickets</span>
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                {/* Progress Bar Simplified */}
                <div className="space-y-1.5">
                    <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-slate-500">
                        <span>Execution Progress</span>
                        <span>{Math.round((project.tickets.completed / project.tickets.total) * 100) || 0}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-blue-600 rounded-full shadow-[0_0_8px_rgba(37,99,235,0.5)] transition-all duration-1000"
                            style={{ width: `${(project.tickets.completed / project.tickets.total) * 100 || 0}%` }}
                        ></div>
                    </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-800/50 mt-4">
                    <div className="flex gap-2">
                        <a
                            href={project.github_repository_url}
                            target="_blank"
                            rel="noreferrer"
                            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-lg transition-all"
                        >
                            <Github className="w-4 h-4" />
                        </a>
                        <button className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-all">
                            <ExternalLink className="w-3.5 h-3.5" />
                            Details
                        </button>
                    </div>

                    <button className="text-xs font-bold text-blue-500 hover:text-blue-400 flex items-center gap-1 py-1 px-2 hover:bg-blue-500/5 rounded-lg transition-all">
                        Open Dashboard
                        <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                </div>
            </div>
        </div>
    );
};
