import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Switch } from '../ui/switch';
import { ChevronDown, ChevronUp, Cloud, Database, RefreshCw, Trash2, Loader2, Settings, Pencil, Check, X, ListChecks } from 'lucide-react';
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
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editName, setEditName] = useState('');

    const handleRename = async (projectId: string) => {
        const name = editName.trim();
        if (!name) return;
        setLoadingStates(prev => ({ ...prev, [`rename-${projectId}`]: true }));
        try {
            await apiClient.patch(`/projects/${projectId}`, { name });
            toast.success('Project renamed successfully');
            setEditingId(null);
            onProjectUpdated?.();
        } catch (error) {
            handleError(error, 'Failed to rename project');
        } finally {
            setLoadingStates(prev => ({ ...prev, [`rename-${projectId}`]: false }));
        }
    };

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
                                    {editingId === project.id ? (
                                        <div className="flex items-center gap-1">
                                            <input
                                                autoFocus
                                                value={editName}
                                                onChange={(e) => setEditName(e.target.value)}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') handleRename(project.id);
                                                    if (e.key === 'Escape') setEditingId(null);
                                                }}
                                                disabled={loadingStates[`rename-${project.id}`]}
                                                className="bg-background border border-border rounded px-2 py-1 text-sm text-foreground w-48"
                                            />
                                            <button
                                                onClick={() => handleRename(project.id)}
                                                disabled={loadingStates[`rename-${project.id}`]}
                                                className="p-1 hover:bg-emerald-500/10 text-emerald-500 rounded transition-colors"
                                                title="Save"
                                            >
                                                {loadingStates[`rename-${project.id}`] ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                                            </button>
                                            <button
                                                onClick={() => setEditingId(null)}
                                                className="p-1 hover:bg-muted text-muted-foreground rounded transition-colors"
                                                title="Cancel"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-1 group">
                                            <span>{project.name}</span>
                                            <button
                                                onClick={() => { setEditingId(project.id); setEditName(project.name); }}
                                                className="p-1 opacity-0 group-hover:opacity-100 hover:bg-muted text-muted-foreground hover:text-foreground rounded transition-all"
                                                title="Rename project"
                                            >
                                                <Pencil className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    )}
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
                                            {/* Destructive action sits apart from the navigation ones so
                                                Delete can't be hit by aiming for Tickets. */}
                                            <div className="col-span-2 pt-3 border-t border-border mt-2 flex flex-wrap items-center justify-between gap-2">
                                                <button
                                                    onClick={() => handleDelete(project.id)}
                                                    disabled={isDeleting === project.id}
                                                    className="inline-flex h-8 items-center gap-2 rounded-lg border border-red-500/20 bg-red-500/10 px-3 text-xs font-bold text-red-500 transition-colors hover:bg-red-500/20 disabled:opacity-50"
                                                >
                                                    {isDeleting === project.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                                                    Delete Project
                                                </button>
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <Link
                                                        to={`/projects/${project.id}/tickets`}
                                                        className="inline-flex h-8 items-center gap-2 rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-3 text-xs font-bold text-emerald-600 transition-colors hover:bg-emerald-500/20"
                                                    >
                                                        <ListChecks className="w-3.5 h-3.5" />
                                                        Tickets
                                                    </Link>
                                                    <Link
                                                        to={`/projects/${project.id}/settings`}
                                                        className="inline-flex h-8 items-center gap-2 rounded-lg border border-blue-500/20 bg-blue-500/10 px-3 text-xs font-bold text-blue-600 transition-colors hover:bg-blue-500/20"
                                                    >
                                                        <Settings className="w-3.5 h-3.5" />
                                                        Project Settings
                                                    </Link>
                                                </div>
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
