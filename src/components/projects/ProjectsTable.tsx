import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Switch } from '../ui/switch';
import { Badge } from '../ui/badge';
import { ChevronDown, ChevronUp, Cloud, Database } from 'lucide-react';
import apiClient from '../../api/client';
import { toast } from 'react-hot-toast';

export interface ProjectRowData {
    id: string;
    name: string;
    provider?: 'CLICKUP' | 'JIRA' | 'ASANA';
    monitor_tasks?: boolean;
    github_repository_url: string;
    status: string;
}

interface ProjectsTableProps {
    projects: ProjectRowData[];
    onProjectUpdated?: () => void;
}

interface ApiErrorResponse {
    message?: string;
    error?: string;
}

export function ProjectsTable({ projects, onProjectUpdated }: ProjectsTableProps) {
    const [expandedRow, setExpandedRow] = useState<string | null>(null);
    const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({});

    const handleToggleMonitoring = async (projectId: string, currentValue: boolean) => {
        setLoadingStates(prev => ({ ...prev, [projectId]: true }));

        try {
            await apiClient.patch(`/projects/${projectId}`, {
                monitor_tasks: !currentValue
            });

            toast.success(`Monitoring ${!currentValue ? 'enabled' : 'disabled'} successfully`);
            onProjectUpdated?.();
        } catch (error) {
            const apiError = error as { response?: { data?: ApiErrorResponse } };
            const errorMessage = apiError.response?.data?.message || apiError.response?.data?.error || 'Failed to update monitoring status';
            console.error('Failed to toggle monitoring:', error);
            toast.error(errorMessage);
        } finally {
            setLoadingStates(prev => ({ ...prev, [projectId]: false }));
        }
    };

    const getProviderIcon = (provider?: string) => {
        switch (provider) {
            case 'CLICKUP':
                return <Cloud className="w-4 h-4 text-purple-400" />;
            case 'JIRA':
                return <Database className="w-4 h-4 text-blue-400" />;
            case 'ASANA':
                return <Database className="w-4 h-4 text-pink-400" />;
            default:
                return <Cloud className="w-4 h-4 text-gray-400" />;
        }
    };

    const getProviderLabel = (provider?: string) => {
        return provider || 'Unknown';
    };

    return (
        <div className="border border-slate-800 rounded-2xl overflow-hidden bg-slate-900/40">
            <Table>
                <TableHeader>
                    <TableRow className="border-slate-800 hover:bg-slate-800/50">
                        <TableHead className="text-slate-400 font-bold text-xs uppercase">Project Name</TableHead>
                        <TableHead className="text-slate-400 font-bold text-xs uppercase">Provider</TableHead>
                        <TableHead className="text-slate-400 font-bold text-xs uppercase">Repository</TableHead>
                        <TableHead className="text-slate-400 font-bold text-xs uppercase">Status</TableHead>
                        <TableHead className="text-slate-400 font-bold text-xs uppercase text-center">Monitoring</TableHead>
                        <TableHead className="w-12"></TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {projects.map((project) => (
                        <React.Fragment key={project.id}>
                            <TableRow
                                className="border-slate-800 hover:bg-slate-800/30 transition-colors"
                            >
                                <TableCell className="font-semibold text-white">
                                    {project.name}
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        {getProviderIcon(project.provider)}
                                        <span className="text-slate-300 text-sm">
                                            {getProviderLabel(project.provider)}
                                        </span>
                                    </div>
                                </TableCell>
                                <TableCell className="text-slate-400 text-sm max-w-xs truncate">
                                    {project.github_repository_url}
                                </TableCell>
                                <TableCell>
                                    <Badge
                                        variant={project.status === 'active' ? 'default' : 'secondary'}
                                        className={
                                            project.status === 'active'
                                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                                : 'bg-slate-500/10 text-slate-400 border-slate-500/20'
                                        }
                                    >
                                        {project.status}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-center">
                                    <div className="flex items-center justify-center">
                                        <Switch
                                            checked={project.monitor_tasks || false}
                                            onCheckedChange={() => handleToggleMonitoring(project.id, project.monitor_tasks || false)}
                                            disabled={loadingStates[project.id]}
                                            className="data-[state=checked]:bg-blue-600"
                                        />
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <button
                                        onClick={() => setExpandedRow(expandedRow === project.id ? null : project.id)}
                                        className="p-1 hover:bg-slate-700 rounded transition-colors"
                                    >
                                        {expandedRow === project.id ? (
                                            <ChevronUp className="w-4 h-4 text-slate-400" />
                                        ) : (
                                            <ChevronDown className="w-4 h-4 text-slate-400" />
                                        )}
                                    </button>
                                </TableCell>
                            </TableRow>
                            {expandedRow === project.id && (
                                <TableRow className="border-slate-800 bg-slate-900/60">
                                    <TableCell colSpan={6} className="py-4">
                                        <div className="grid grid-cols-2 gap-4 text-sm">
                                            <div>
                                                <span className="text-slate-500 font-semibold">Project ID:</span>
                                                <span className="text-slate-300 ml-2 font-mono">{project.id}</span>
                                            </div>
                                            <div>
                                                <span className="text-slate-500 font-semibold">Full Repository URL:</span>
                                                <a
                                                    href={project.github_repository_url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-blue-400 ml-2 hover:underline"
                                                >
                                                    {project.github_repository_url}
                                                </a>
                                            </div>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            )}
                        </React.Fragment>
                    ))}
                </TableBody>
            </Table>
            {projects.length === 0 && (
                <div className="text-center py-12 text-slate-500">
                    No projects found. Click "Add Project" to import from your provider.
                </div>
            )}
        </div>
    );
}
