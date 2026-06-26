import React from 'react';
import type { AdrQueueFilters } from '../../types/architectureReview';
import { Filter, X } from 'lucide-react';

interface AdrQueueFiltersProps {
    filters: AdrQueueFilters;
    onFilterChange: (filters: AdrQueueFilters) => void;
    projects?: { id: string; name: string }[];
}

export const AdrQueueFiltersPanel: React.FC<AdrQueueFiltersProps> = ({ filters, onFilterChange, projects = [] }) => {
    const handleRiskChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value as 'HIGH' | 'MEDIUM' | 'LOW' | 'ALL';
        onFilterChange({
            ...filters,
            risk_level: value === 'ALL' ? undefined : value
        });
    };

    const handleProjectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        onFilterChange({
            ...filters,
            project_id: e.target.value || undefined
        });
    };

    const clearFilters = () => {
        onFilterChange({
            sort_by: filters.sort_by,
            sort_order: filters.sort_order
        });
    };

    return (
        <div className="flex flex-wrap items-center gap-4 bg-card border border-border rounded-lg p-4">
            <div className="flex items-center gap-2 text-muted-foreground mr-2">
                <Filter className="w-4 h-4" />
                <span className="text-sm font-semibold">Filters:</span>
            </div>

            <select
                value={filters.risk_level || 'ALL'}
                onChange={handleRiskChange}
                className="bg-background border border-input text-foreground text-sm rounded-md px-3 py-2 focus:ring-2 focus:ring-primary outline-none"
            >
                <option value="ALL">All Risk Levels</option>
                <option value="HIGH">High Risk</option>
                <option value="MEDIUM">Medium Risk</option>
                <option value="LOW">Low Risk</option>
            </select>

            <select
                value={filters.project_id || ''}
                onChange={handleProjectChange}
                className="bg-background border border-input text-foreground text-sm rounded-md px-3 py-2 focus:ring-2 focus:ring-primary outline-none max-w-[200px]"
            >
                <option value="">All Projects</option>
                {projects.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                ))}
            </select>

            {(filters.risk_level || filters.project_id) && (
                <button
                    onClick={clearFilters}
                    className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors ml-auto"
                >
                    <X className="w-3.5 h-3.5" />
                    Clear Filters
                </button>
            )}
        </div>
    );
};
