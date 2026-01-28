import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Switch } from '../ui/switch';
import { ChevronDown, ChevronUp, Cloud, Database, RefreshCw, Trash2, Edit2, Save, X, Loader2 } from 'lucide-react';
import apiClient from '../../api/client';
import { toast } from 'react-hot-toast';

export interface ProjectRowData {
    id: string;
    name: string;
    provider?: 'CLICKUP' | 'JIRA' | 'ASANA';
    monitor_tasks?: boolean;
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
    const [editingRepo, setEditingRepo] = useState<string | null>(null);
    const [repoUrlInput, setRepoUrlInput] = useState('');
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
            await apiClient.post(`/projects/${projectId}/sync`);
            toast.success('Project synced with ClickUp successfully');
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

    const handleSaveRepo = async (projectId: string) => {
        try {
            await apiClient.patch(`/projects/${projectId}/repository`, { repositoryUrl: repoUrlInput });
            toast.success('Repository updated successfully');
            setEditingRepo(null);
            onProjectUpdated?.();
        } catch (error) {
            handleError(error, 'Failed to update repository');
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
        <div className="border border-slate-800 rounded-2xl overflow-hidden bg-slate-900/40">
            <Table>
                <TableHeader>
                    <TableRow className="border-slate-800 hover:bg-slate-800/50">
                        <TableHead className="text-slate-400 font-bold text-xs uppercase">Project Name</TableHead>
                        <TableHead className="text-slate-400 font-bold text-xs uppercase">Provider</TableHead>
                        <TableHead className="text-slate-400 font-bold text-xs uppercase">Status</TableHead>
                        <TableHead className="text-slate-400 font-bold text-xs uppercase text-center">Monitoring</TableHead>
                        <TableHead className="text-slate-400 font-bold text-xs uppercase text-center">Sync</TableHead>
                        <TableHead className="w-12"></TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {projects.map((project) => (
                        <React.Fragment key={project.id}>
                            <TableRow className="border-slate-800 hover:bg-slate-800/30 transition-colors">
                                <TableCell className="font-semibold text-white">
                                    {project.name}
                                    <div className="text-xs text-slate-500 font-mono mt-0.5 max-w-[150px] truncate">{project.github_repository_url}</div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        {getProviderIcon(project.provider)}
                                        <span className="text-slate-300 text-sm">{project.provider || 'Unknown'}</span>
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
                                        <span className={`text-xs ${project.is_active !== false ? 'text-emerald-400' : 'text-slate-500'}`}>
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
                                        className="p-2 hover:bg-blue-500/10 text-slate-400 hover:text-blue-400 rounded-lg transition-colors"
                                        title="Sync from ClickUp"
                                    >
                                        <RefreshCw className={`w-4 h-4 ${loadingStates[`sync-${project.id}`] ? 'animate-spin' : ''}`} />
                                    </button>
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-1">
                                        <button
                                            onClick={() => setExpandedRow(expandedRow === project.id ? null : project.id)}
                                            className="p-1 hover:bg-slate-700 rounded transition-colors"
                                        >
                                            {expandedRow === project.id ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                                        </button>
                                    </div>
                                </TableCell>
                            </TableRow>
                            {expandedRow === project.id && (
                                <TableRow className="border-slate-800 bg-slate-900/60">
                                    <TableCell colSpan={6} className="py-4">
                                        <div className="grid grid-cols-2 gap-4 text-sm">
                                            <div>
                                                <span className="text-slate-500 font-semibold block mb-1">Project ID</span>
                                                <span className="text-slate-300 font-mono">{project.id}</span>
                                            </div>
                                            <div>
                                                <span className="text-slate-500 font-semibold block mb-1">GitHub Repository</span>
                                                {editingRepo === project.id ? (
                                                    <div className="flex items-center gap-2">
                                                        <input
                                                            value={repoUrlInput}
                                                            onChange={(e) => setRepoUrlInput(e.target.value)}
                                                            className="bg-slate-950 border border-slate-700 rounded px-2 py-1 text-slate-200 text-sm focus:outline-none focus:border-blue-500 w-full"
                                                            placeholder="https://github.com/owner/repo"
                                                        />
                                                        <button onClick={() => handleSaveRepo(project.id)} className="p-1.5 bg-blue-600 text-white rounded hover:bg-blue-500"><Save className="w-3 h-3" /></button>
                                                        <button onClick={() => setEditingRepo(null)} className="p-1.5 bg-slate-700 text-slate-300 rounded hover:bg-slate-600"><X className="w-3 h-3" /></button>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center gap-2 group">
                                                        <a href={project.github_repository_url} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline truncate max-w-[200px]">{project.github_repository_url}</a>
                                                        <button
                                                            onClick={() => { setEditingRepo(project.id); setRepoUrlInput(project.github_repository_url); }}
                                                            className="opacity-0 group-hover:opacity-100 p-1 hover:bg-slate-700 rounded text-slate-400"
                                                        >
                                                            <Edit2 className="w-3 h-3" />
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="col-span-2 pt-2 border-t border-slate-800 mt-2 flex justify-end">
                                                <button
                                                    onClick={() => handleDelete(project.id)}
                                                    disabled={isDeleting === project.id}
                                                    className="flex items-center gap-2 px-3 py-1.5 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-lg text-xs font-bold transition-colors"
                                                >
                                                    {isDeleting === project.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
                                                    Delete Project
                                                </button>
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
