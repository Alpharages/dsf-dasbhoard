/**
 * Project Selector Component
 * Allow switching between projects for financial analysis
 */

import { useState, useEffect } from 'react';
import { ChevronDown, Briefcase } from 'lucide-react';
import apiClient from '../../../api/client';



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
            const { data } = await apiClient.get('/pm-dashboard/projects');
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
                className="flex items-center gap-2 px-3 py-2 h-10 bg-card border border-border text-foreground hover:border-foreground/20 rounded-lg font-medium transition-all w-[160px]"
            >
                <Briefcase className="w-4 h-4 flex-shrink-0 text-muted-foreground" />
                <span className="truncate text-sm">
                    {loading ? 'Loading...' : selectedProject?.name || 'Select Project'}
                </span>
                <ChevronDown className={`w-4 h-4 flex-shrink-0 ml-auto text-muted-foreground transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <>
                    <div
                        className="fixed inset-0 z-10"
                        onClick={() => setIsOpen(false)}
                    />
                    <div className="absolute top-full mt-1 left-0 bg-card border border-border rounded-lg shadow-lg overflow-hidden z-20 w-[220px]">
                        <div className="max-h-60 overflow-y-auto">
                            {projects.map((project) => (
                                <button
                                    key={project.id}
                                    onClick={() => handleProjectSelect(project.id)}
                                    className={`w-full text-left px-3 py-2.5 hover:bg-muted transition-colors text-sm truncate ${project.id === selectedProjectId
                                        ? 'bg-primary/10 text-primary font-semibold'
                                        : 'text-foreground'
                                        }`}
                                    title={project.name}
                                >
                                    {project.name}
                                </button>
                            ))}
                            {projects.length === 0 && !loading && (
                                <div className="px-3 py-2 text-muted-foreground text-sm">No projects available</div>
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
