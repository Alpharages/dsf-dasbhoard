/**
 * Project Selector Component
 * Allow switching between projects for financial analysis
 */

import { useState, useEffect } from 'react';
import { ChevronDown, Briefcase } from 'lucide-react';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1';

interface Project {
    id: string;
    name: string;
}

interface ProjectSelectorProps {
    selectedProjectId: string | null;
    onProjectChange: (projectId: string) => void;
}

export function ProjectSelector({ selectedProjectId, onProjectChange }: ProjectSelectorProps) {
    const [projects, setProjects] = useState<Project[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchProjects();
    }, []);

    useEffect(() => {
        // Auto-select first project if none selected
        if (!selectedProjectId && projects.length > 0) {
            const lastSelected = localStorage.getItem('lastSelectedProject');
            const projectToSelect = lastSelected && projects.find(p => p.id === lastSelected)
                ? lastSelected
                : projects[0].id;
            onProjectChange(projectToSelect);
        }
    }, [projects, selectedProjectId, onProjectChange]);

    const fetchProjects = async () => {
        try {
            const token = localStorage.getItem('token') || 'dummy-token';
            const { data } = await axios.get(`${API_BASE_URL}/pm-dashboard/projects`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setProjects(data.data || []);
        } catch (err) {
            console.error('Failed to fetch projects:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleProjectSelect = (projectId: string) => {
        onProjectChange(projectId);
        localStorage.setItem('lastSelectedProject', projectId);
        setIsOpen(false);
    };

    const selectedProject = projects.find(p => p.id === selectedProjectId);

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 rounded-xl font-medium transition-all min-w-[200px]"
            >
                <Briefcase className="w-4 h-4" />
                {loading ? 'Loading...' : selectedProject?.name || 'Select Project'}
                <ChevronDown className={`w-4 h-4 ml-auto transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <>
                    <div
                        className="fixed inset-0 z-10"
                        onClick={() => setIsOpen(false)}
                    />
                    <div className="absolute top-full mt-2 left-0 right-0 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl overflow-hidden z-20">
                        <div className="max-h-64 overflow-y-auto">
                            {projects.map((project) => (
                                <button
                                    key={project.id}
                                    onClick={() => handleProjectSelect(project.id)}
                                    className={`w-full text-left px-4 py-3 hover:bg-slate-800 transition-colors ${project.id === selectedProjectId
                                            ? 'bg-blue-600/10 text-blue-400 font-semibold'
                                            : 'text-slate-300'
                                        }`}
                                >
                                    {project.name}
                                </button>
                            ))}
                            {projects.length === 0 && !loading && (
                                <div className="px-4 py-3 text-slate-500 text-sm">No projects available</div>
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
