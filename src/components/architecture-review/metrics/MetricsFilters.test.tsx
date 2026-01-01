import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MetricsFilters } from './MetricsFilters';
import { describe, it, expect, vi } from 'vitest';
import { useProjects } from '../../../hooks/api/useProjects';

// Mock useProjects hook
vi.mock('../../../hooks/api/useProjects', () => ({
    useProjects: vi.fn(),
}));

describe('MetricsFilters', () => {
    it('renders filter inputs and export button', () => {
        (useProjects as any).mockReturnValue({ data: [], isLoading: false });
        const onFilterChange = vi.fn();
        const onExport = vi.fn();

        render(
            <MetricsFilters
                filters={{}}
                onFilterChange={onFilterChange}
                onExport={onExport}
            />
        );

        expect(screen.getByText('Pick a date range')).toBeInTheDocument();
        expect(screen.getByText('All Projects')).toBeInTheDocument();
        expect(screen.getByText('All Risks')).toBeInTheDocument();
        expect(screen.getByText('Export CSV')).toBeInTheDocument();
    });

    it('calls onExport when export button is clicked', () => {
        (useProjects as any).mockReturnValue({ data: [], isLoading: false });
        const onFilterChange = vi.fn();
        const onExport = vi.fn();

        render(
            <MetricsFilters
                filters={{}}
                onFilterChange={onFilterChange}
                onExport={onExport}
            />
        );

        fireEvent.click(screen.getByText('Export CSV'));
        expect(onExport).toHaveBeenCalledTimes(1);
    });

    it('displays preset options when date picker is clicked', async () => {
        (useProjects as any).mockReturnValue({ data: [], isLoading: false });
        render(<MetricsFilters filters={{}} onFilterChange={vi.fn()} onExport={vi.fn()} />);

        fireEvent.click(screen.getByText('Pick a date range'));

        // Check if presets are visible in the popover
        expect(screen.getByText('Last 7 Days')).toBeInTheDocument();
        expect(screen.getByText('Last 30 Days')).toBeInTheDocument();
        expect(screen.getByText('This Quarter')).toBeInTheDocument();
        expect(screen.getByText('Year to Date')).toBeInTheDocument();
    });
});
