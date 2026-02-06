import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AdrReviewQueueTable } from '../components/architecture-review/AdrReviewQueueTable';
import { AdrQueueFiltersPanel } from '../components/architecture-review/AdrQueueFilters';
import { AdrDetailModal } from '../components/architecture-review/AdrDetailModal';
import { useAdrQueue, useSubmitAdrReview } from '../hooks/useAdrQueue';
import type { Project } from '../api/projectsApi';
import { projectsApi } from '../api/projectsApi';
import type { AdrQueueFilters, AdrQueueItem } from '../types/architectureReview';
import { ShieldAlert, Info } from 'lucide-react';

export const ArchitectureReviewQueuePage: React.FC = () => {
    const [searchParams, setSearchParams] = useSearchParams();

    // Parse filters from URL
    const getFiltersFromUrl = (): AdrQueueFilters => ({
        risk_level: searchParams.get('risk') as AdrQueueFilters['risk_level'] || undefined,
        project_id: searchParams.get('project') || undefined,
        sort_by: (searchParams.get('sort') as AdrQueueFilters['sort_by']) || 'risk_level',
        sort_order: (searchParams.get('order') as AdrQueueFilters['sort_order']) || 'asc',
    });

    const [filters, setFilters] = useState<AdrQueueFilters>(getFiltersFromUrl());
    const [selectedAdr, setSelectedAdr] = useState<AdrQueueItem | null>(null);
    const [projects, setProjects] = useState<Project[]>([]);

    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const data = await projectsApi.getProjects();
                setProjects(data);
            } catch (err) {
                console.error('Failed to fetch projects', err);
            }
        };
        fetchProjects();
    }, []);

    // Sync state with URL when filters change
    const handleFilterChange = (newFilters: AdrQueueFilters) => {
        setFilters(newFilters);
        const params: Record<string, string> = {};
        if (newFilters.risk_level) params.risk = newFilters.risk_level;
        if (newFilters.project_id) params.project = newFilters.project_id;
        if (newFilters.sort_by) params.sort = newFilters.sort_by;
        if (newFilters.sort_order) params.order = newFilters.sort_order;
        setSearchParams(params);
    };

    const handleSort = (column: 'risk_level' | 'created_at' | 'confidence') => {
        const isSameColumn = filters.sort_by === column;
        const newOrder = isSameColumn && filters.sort_order === 'asc' ? 'desc' : 'asc';
        handleFilterChange({ ...filters, sort_by: column, sort_order: newOrder });
    };

    const { data, isLoading, error } = useAdrQueue(filters);
    const { mutateAsync: submitReview } = useSubmitAdrReview();

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-foreground tracking-tight">Architecture Review Queue</h1>
                        <p className="text-muted-foreground">
                            Review and approve AI-generated Architecture Decision Records (ADRs).
                        </p>
                    </div>
                    {data?.total !== undefined && (
                        <div className="flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-xl border border-primary/20">
                            <Info className="w-5 h-5 text-primary" />
                            <span className="text-primary font-semibold">{data.total} Decisions Pending</span>
                        </div>
                    )}
                </div>
            </div>

            {error && (
                <div className="bg-destructive/10 border border-destructive/20 rounded-2xl p-4 flex items-center gap-3 text-destructive">
                    <ShieldAlert className="w-5 h-5 flex-shrink-0" />
                    <p className="font-medium">Failed to load ADR queue. Please try refreshing.</p>
                </div>
            )}

            <AdrQueueFiltersPanel
                filters={filters}
                onFilterChange={handleFilterChange}
                projects={projects}
            />

            <AdrReviewQueueTable
                items={data?.items || []}
                isLoading={isLoading}
                onReview={setSelectedAdr}
                onSort={handleSort}
                sortBy={filters.sort_by}
                sortOrder={filters.sort_order}
            />

            {selectedAdr && (
                <AdrDetailModal
                    adr={selectedAdr}
                    onClose={() => setSelectedAdr(null)}
                    onSubmitReview={async (action, notes) => {
                        await submitReview({
                            adrId: selectedAdr.id,
                            action,
                            notes
                        });
                        // Queries invalidate automatically in hook
                    }}
                />
            )}
        </div>
    );
};
