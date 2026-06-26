import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Switch } from '../ui/switch';
import { ChevronDown, ChevronUp, Cloud, Database, RefreshCw, Trash2, Loader2, Settings } from 'lucide-react';
import apiClient from '../../api/client';
import { toast } from 'react-hot-toast';
import { GithubRepoSelector } from '../../features/projects/components/GithubRepoSelector';

export interface ProjectRowData {
    id: string;
    name: string;
    provider?: 'CLICKUP' | 'JIRA' | 'ASANA';
    monitor_tasks?: boolean;
    github_account_id?: string | null;
    github_repository_url: string;
    status: string;
    is_active?: boolean; // New field
}

interface ProjectsTableProps {
    projects: ProjectRowData[];
    onProjectUpdated?: () => void;
}



export function ProjectsTable({ projects, onProjectUpdated }: ProjectsTableProps) {
    const [expandedRow, setExpandedRow] = useState<string | null>(null);
    const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({});
    const [isDeleting, setIsDeleting] = useState<string | null>(null);

    const handleToggleMonitoring = async (projectId: string, currentValue: boolean) => {
        setLoadingStates(prev => ({ ...prev, [projectId]: true }));
        try {
            await apiClient.patch(`/projects/${projectId}`, { monitor_tasks: !currentValue });
            toast.success(`Monitoring ${!currentValue ? 'enabled' : 'disabled'} successfully`);
            onProjectUpdated?.();
        } catch (error) {
            handleError(error, 'Failed to toggle monitoring');
        } finally {
            setLoadingStates(prev => ({ ...prev, [projectId]: false }));
        }
    };

    const handleToggleStatus = async (projectId: string, currentActive: boolean) => {
        setLoadingStates(prev => ({ ...prev, [`status-${projectId}`]: true }));
        try {
            await apiClient.patch(`/projects/${projectId}/status`, { isActive: !currentActive });
            toast.success(`Project ${!currentActive ? 'activated' : 'deactivated'} successfully`);
            onProjectUpdated?.();
        } catch (error) {
            handleError(error, 'Failed to update status');
        } finally {
            setLoadingStates(prev => ({ ...prev, [`status-${projectId}`]: false }));
        }
    };

    const handleSync = async (projectId: string) => {
        setLoadingStates(prev => ({ ...prev, [`sync-${projectId}`]: true }));
        try {
            const response = await apiClient.post(`/projects/${projectId}/sync`);
            const count = response.data?.syncedTasksCount ?? 0;
            toast.success(`Project synced successfully. ${count} tasks updated.`);
            onProjectUpdated?.();
        } catch (error) {
            handleError(error, 'Sync failed');
        } finally {
            setLoadingStates(prev => ({ ...prev, [`sync-${projectId}`]: false }));
        }
    };

    const handleDelete = async (projectId: string, force = false) => {
        if (!force && !window.confirm('Are you sure you want to delete this project?')) return;

        setIsDeleting(projectId);
        try {
            await apiClient.delete(`/projects/${projectId}${force ? '?force=true' : ''}`);
            toast.success('Project deleted successfully');
            onProjectUpdated?.();
        } catch (error: any) {
            if (error.response?.status === 400 && error.response?.data?.message?.includes('active tickets')) {
                if (window.confirm('Project has active tickets. Force delete? This cannot be undone.')) {
                    await handleDelete(projectId, true);
                    return;
                }
            }
            handleError(error, 'Failed to delete project');
        } finally {
            setIsDeleting(null);
        }
    };

    const handleError = (error: any, defaultMsg: string) => {
        const msg = error.response?.data?.message || defaultMsg;
        console.error(error);
        toast.error(msg);
    };

    const getProviderIcon = (provider?: string) => {
        switch (provider) {
            case 'CLICKUP': return <Cloud className="w-4 h-4 text-purple-400" />;
            case 'JIRA': return <Database className="w-4 h-4 text-blue-400" />;
            case 'ASANA': return <Database className="w-4 h-4 text-pink-400" />;
            default: return <Cloud className="w-4 h-4 text-gray-400" />;
        }
    };

    return (
        <div className="border border-border rounded-lg overflow-hidden bg-card">
            <Table>
                <TableHeader>
                    <TableRow className="border-border hover:bg-muted/50">
                        <TableHead className="text-muted-foreground font-bold text-xs uppercase">Project Name</TableHead>
                        <TableHead className="text-muted-foreground font-bold text-xs uppercase">Provider</TableHead>
                        <TableHead className="text-muted-foreground font-bold text-xs uppercase">Status</TableHead>
                        <TableHead className="text-muted-foreground font-bold text-xs uppercase text-center">Monitoring</TableHead>
                        <TableHead className="text-muted-foreground font-bold text-xs uppercase text-center">Sync</TableHead>
                        <TableHead className="w-12"></TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {projects.map((project) => (
                        <React.Fragment key={project.id}>
                            <TableRow className="border-border hover:bg-muted/50 transition-colors">
                                <TableCell className="font-semibold text-foreground">
                                    {project.name}
                                    <div className="text-xs text-muted-foreground font-mono mt-0.5 max-w-[150px] truncate">{project.github_repository_url}</div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        {getProviderIcon(project.provider)}
                                        <span className="text-muted-foreground text-sm">{project.provider || 'Unknown'}</span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        <Switch
                                            checked={project.is_active !== false}
                                            onCheckedChange={() => handleToggleStatus(project.id, project.is_active !== false)}
                                            disabled={loadingStates[`status-${project.id}`]}
                                            className="data-[state=checked]:bg-emerald-600 h-5 w-9"
                                        />
                                        <span className={`text-xs ${project.is_active !== false ? 'text-emerald-500' : 'text-muted-foreground'}`}>
                                            {project.is_active !== false ? 'Active' : 'Inactive'}
                                        </span>
                                    </div>
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
                                <TableCell className="text-center">
                                    <button
                                        onClick={() => handleSync(project.id)}
                                        disabled={loadingStates[`sync-${project.id}`]}
                                        className="p-2 hover:bg-primary/10 text-muted-foreground hover:text-primary rounded-lg transition-colors"
                                        title="Sync from ClickUp"
                                    >
                                        <RefreshCw className={`w-4 h-4 ${loadingStates[`sync-${project.id}`] ? 'animate-spin' : ''}`} />
                                    </button>
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-1">
                                        <button
                                            onClick={() => setExpandedRow(expandedRow === project.id ? null : project.id)}
                                            className="p-1 hover:bg-muted rounded transition-colors"
                                        >
                                            {expandedRow === project.id ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                                        </button>
                                    </div>
                                </TableCell>
                            </TableRow>
                            {expandedRow === project.id && (
                                <TableRow className="border-border bg-muted/30">
                                    <TableCell colSpan={6} className="py-4">
                                        <div className="grid grid-cols-2 gap-4 text-sm">
                                            <div>
                                                <span className="text-muted-foreground font-semibold block mb-1">Project ID</span>
                                                <span className="text-foreground font-mono">{project.id}</span>
                                            </div>
                                            <div className="col-span-2 mt-4">
                                                <GithubRepoSelector project={project} />
                                            </div>
                                            <div className="col-span-2 pt-2 border-t border-border mt-2 flex justify-end">
                                                <button
                                                    onClick={() => handleDelete(project.id)}
                                                    disabled={isDeleting === project.id}
                                                    className="flex items-center gap-2 px-3 py-1.5 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-lg text-xs font-bold transition-colors"
                                                >
                                                    {isDeleting === project.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
                                                    Delete Project
                                                </button>
                                                <Link
                                                    to={`/projects/${project.id}/settings`}
                                                    className="flex items-center gap-2 px-3 py-1.5 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 rounded-lg text-xs font-bold transition-colors"
                                                >
                                                    <Settings className="w-3 h-3" />
                                                    Project Settings
                                                </Link>
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
                <div className="text-center py-12 text-muted-foreground">
                    No projects found. Click "Add Project" to import from your provider.
                </div>
            )}
        </div>
    );
}
