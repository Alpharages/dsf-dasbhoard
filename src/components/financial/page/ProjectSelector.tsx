/**
 * Project Selector Component
 * Allow switching between projects for financial analysis
 */

import { useState, useEffect, useMemo } from 'react';
import { ChevronDown, Briefcase, Search } from 'lucide-react';
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
    // Type-to-filter: the dropdown lists every project in one scroll pane, which
    // stops being navigable somewhere around a dozen — a workspace with 50+ makes
    // finding one a scroll hunt.
    const [query, setQuery] = useState('');

    const visibleProjects = useMemo(() => {
        const q = query.trim().toLowerCase();
        return q ? projects.filter((p) => p.name.toLowerCase().includes(q)) : projects;
    }, [projects, query]);

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
        // Reset so the next open starts from the full list rather than the last search.
        setQuery('');
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
                        <div className="relative border-b border-border">
                            <Search className="w-3.5 h-3.5 text-muted-foreground absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                            <input
                                autoFocus
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="Filter projects…"
                                className="w-full bg-transparent text-sm text-foreground pl-8 pr-3 py-2 focus:outline-none placeholder:text-muted-foreground"
                            />
                        </div>
                        <div className="max-h-60 overflow-y-auto">
                            {visibleProjects.map((project) => (
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
                            {visibleProjects.length === 0 && !loading && (
                                <div className="px-3 py-2 text-muted-foreground text-sm">
                                    {query ? `No projects match "${query}"` : 'No projects available'}
                                </div>
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
