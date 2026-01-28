import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus, RefreshCw } from 'lucide-react';
import { ProjectsTable } from '../components/projects/ProjectsTable';
import { ClickUpImportModal } from '../components/projects/ClickUpImportModal';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import apiClient from '../api/client';
import type { ProjectRowData } from '../components/projects/ProjectsTable';

export function ProjectsSyncPage() {
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [activeFilter, setActiveFilter] = useState<string>('all');

    const { data: projects = [], isLoading, refetch } = useQuery<ProjectRowData[]>({
        queryKey: ['projects', activeFilter],
        queryFn: async () => {
            const response = await apiClient.get('/projects', {
                params: { active: activeFilter }
            });
            return response.data;
        },
        staleTime: 2 * 60 * 1000 // 2 minutes
    });

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-extrabold text-white tracking-tight">
                        Projects & Sync
                    </h1>
                    <p className="text-slate-500 font-medium mt-2">
                        Manage which ClickUp lists are monitored for incoming tasks
                    </p>
                </div>

                <div className="flex items-center gap-4">
                    <div className="w-[180px]">
                        <Select value={activeFilter} onValueChange={setActiveFilter}>
                            <SelectTrigger className="bg-slate-900 border-slate-800 text-slate-300">
                                <SelectValue placeholder="Filter projects" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Projects</SelectItem>
                                <SelectItem value="true">Active Only</SelectItem>
                                <SelectItem value="false">Inactive Only</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <button
                        onClick={() => refetch()}
                        className="p-3 bg-slate-900 border border-slate-800 text-slate-400 hover:text-white rounded-2xl transition-all"
                        title="Refresh Projects"
                    >
                        <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
                    </button>
                    <button
                        onClick={() => setIsImportModalOpen(true)}
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-6 rounded-2xl shadow-lg shadow-blue-500/20 transition-all hover:translate-y-[-2px] active:translate-y-0"
                    >
                        <Plus className="w-5 h-5" />
                        Add Project
                    </button>
                </div>
            </div>

            {/* Projects Table */}
            {isLoading ? (
                <div className="h-64 bg-slate-900/50 border border-slate-800 animate-pulse rounded-2xl flex items-center justify-center">
                    <div className="text-slate-500">Loading projects...</div>
                </div>
            ) : (
                <ProjectsTable
                    projects={projects}
                    onProjectUpdated={() => refetch()}
                />
            )}

            {/* Info Panel */}
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-6">
                <h3 className="text-blue-400 font-bold text-lg mb-2">💡 How it works</h3>
                <ul className="text-slate-300 space-y-2 text-sm">
                    <li>• <strong>Add Project:</strong> Import a ClickUp list to sync tasks automatically</li>
                    <li>• <strong>Monitoring Toggle:</strong> Enable/disable task syncing for each project</li>
                    <li>• <strong>Multi-Provider:</strong> Support for Jira and Asana coming soon</li>
                </ul>
            </div>

            {/* Import Modal */}
            <ClickUpImportModal
                isOpen={isImportModalOpen}
                onClose={() => setIsImportModalOpen(false)}
                onImportSuccess={() => refetch()}
            />
        </div>
    );
}
