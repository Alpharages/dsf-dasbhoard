import React from 'react';

export const CapabilitySkeleton: React.FC = () => {
    return (
        <div className="space-y-6">
            {/* Summary Cards Skeleton */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="card-theme rounded-lg p-5">
                        <div className="flex items-start justify-between mb-3">
                            <div className="w-10 h-10 rounded-xl bg-[var(--color-bg-secondary)] animate-pulse" />
                            <div className="w-16 h-6 rounded-full bg-[var(--color-bg-secondary)] animate-pulse" />
                        </div>
                        <div className="space-y-2">
                            <div className="h-8 bg-[var(--color-bg-secondary)] rounded w-2/3 animate-pulse" />
                            <div className="h-4 bg-[var(--color-bg-secondary)] rounded w-full animate-pulse" />
                            <div className="h-3 bg-[var(--color-bg-secondary)] rounded w-1/2 animate-pulse" />
                        </div>
                    </div>
                ))}
            </div>

            {/* Task Type Cards Skeleton */}
            <div className="space-y-4">
                <div className="flex items-center gap-2">
                    <div className="w-1 h-6 rounded-full bg-[var(--color-bg-secondary)] animate-pulse" />
                    <div className="h-6 bg-[var(--color-bg-secondary)] rounded w-40 animate-pulse" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div key={i} className="card-theme rounded-lg p-5">
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-[var(--color-bg-secondary)] animate-pulse" />
                                    <div className="space-y-2">
                                        <div className="h-4 bg-[var(--color-bg-secondary)] rounded w-24 animate-pulse" />
                                        <div className="h-3 bg-[var(--color-bg-secondary)] rounded w-16 animate-pulse" />
                                    </div>
                                </div>
                                <div className="w-8 h-8 rounded-full bg-[var(--color-bg-secondary)] animate-pulse" />
                            </div>
                            <div className="space-y-3">
                                <div className="h-10 bg-[var(--color-bg-secondary)] rounded w-1/3 animate-pulse" />
                                <div className="h-2.5 bg-[var(--color-bg-secondary)] rounded-full animate-pulse" />
                                <div className="h-3 bg-[var(--color-bg-secondary)] rounded w-20 animate-pulse" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Chart Skeleton */}
            <div className="card-theme rounded-lg p-6">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-[var(--color-bg-secondary)] animate-pulse" />
                    <div className="space-y-2">
                        <div className="h-5 bg-[var(--color-bg-secondary)] rounded w-48 animate-pulse" />
                        <div className="h-3 bg-[var(--color-bg-secondary)] rounded w-64 animate-pulse" />
                    </div>
                </div>
                <div className="h-[320px] bg-[var(--color-bg-secondary)] rounded-xl animate-pulse" />
                <div className="mt-6 pt-4 border-t border-[var(--color-border)] flex justify-center gap-6">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded bg-[var(--color-bg-secondary)] animate-pulse" />
                            <div className="h-4 bg-[var(--color-bg-secondary)] rounded w-24 animate-pulse" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default CapabilitySkeleton;
