import { render, screen, fireEvent, act } from '@testing-library/react';
import { vi } from 'vitest';
import { ProjectFilterSheet } from '../../components/dashboard/ProjectFilterSheet';

describe('ProjectFilterSheet', () => {
  const defaultFilters = {
    statuses: [],
    clientName: '',
    dateRange: { startDate: null, endDate: null },
  };

  it('renders correctly when open', () => {
    render(
      <ProjectFilterSheet
        isOpen={true}
        onOpenChange={vi.fn()}
        filters={defaultFilters}
        onFilterChange={vi.fn()}
        onClearFilters={vi.fn()}
      />,
    );

    expect(screen.getByText('Filter Projects')).toBeInTheDocument();
    expect(screen.getByText('Project Status')).toBeInTheDocument();
    expect(screen.getByText('Client')).toBeInTheDocument();
    expect(screen.getByText('Date Range')).toBeInTheDocument();
  });

  it('does not render sheet content when closed', () => {
    render(
      <ProjectFilterSheet
        isOpen={false}
        onOpenChange={vi.fn()}
        filters={defaultFilters}
        onFilterChange={vi.fn()}
        onClearFilters={vi.fn()}
      />,
    );

    expect(screen.queryByText('Filter Projects')).not.toBeInTheDocument();
  });

  it('renders updated STATUS_OPTIONS: Active, Paused, Completed, On Hold', () => {
    render(
      <ProjectFilterSheet
        isOpen={true}
        onOpenChange={vi.fn()}
        filters={defaultFilters}
        onFilterChange={vi.fn()}
        onClearFilters={vi.fn()}
      />,
    );

    expect(screen.getByLabelText('Active')).toBeInTheDocument();
    expect(screen.getByLabelText('Paused')).toBeInTheDocument();
    expect(screen.getByLabelText('Completed')).toBeInTheDocument();
    expect(screen.getByLabelText('On Hold')).toBeInTheDocument();
    expect(screen.queryByLabelText('Archived')).not.toBeInTheDocument();
  });

  it('calls onClearFilters when "Clear all filters" button is clicked', () => {
    const handleClear = vi.fn();
    render(
      <ProjectFilterSheet
        isOpen={true}
        onOpenChange={vi.fn()}
        filters={defaultFilters}
        onFilterChange={vi.fn()}
        onClearFilters={handleClear}
      />,
    );

    fireEvent.click(screen.getByText('Clear all filters'));
    expect(handleClear).toHaveBeenCalled();
  });

  it('calls onFilterChange with toggled status when Active checkbox is clicked', () => {
    const handleFilterChange = vi.fn();
    render(
      <ProjectFilterSheet
        isOpen={true}
        onOpenChange={vi.fn()}
        filters={defaultFilters}
        onFilterChange={handleFilterChange}
        onClearFilters={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByLabelText('Active'));

    expect(handleFilterChange).toHaveBeenCalledWith({
      ...defaultFilters,
      statuses: ['Active'],
    });
  });

  it('calls onFilterChange to remove a status when already-checked checkbox is clicked', () => {
    const handleFilterChange = vi.fn();
    const filtersWithActive = { ...defaultFilters, statuses: ['Active'] };
    render(
      <ProjectFilterSheet
        isOpen={true}
        onOpenChange={vi.fn()}
        filters={filtersWithActive}
        onFilterChange={handleFilterChange}
        onClearFilters={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByLabelText('Active'));

    expect(handleFilterChange).toHaveBeenCalledWith({
      ...filtersWithActive,
      statuses: [],
    });
  });

  it('calls onFilterChange when On Hold checkbox is clicked (space → hyphen mapping)', () => {
    const handleFilterChange = vi.fn();
    render(
      <ProjectFilterSheet
        isOpen={true}
        onOpenChange={vi.fn()}
        filters={defaultFilters}
        onFilterChange={handleFilterChange}
        onClearFilters={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByLabelText('On Hold'));

    expect(handleFilterChange).toHaveBeenCalledWith({
      ...defaultFilters,
      statuses: ['On Hold'],
    });
  });

  it('shows "Select date range..." button when no dates are set', () => {
    render(
      <ProjectFilterSheet
        isOpen={true}
        onOpenChange={vi.fn()}
        filters={defaultFilters}
        onFilterChange={vi.fn()}
        onClearFilters={vi.fn()}
      />,
    );

    expect(screen.getByText('Select date range...')).toBeInTheDocument();
  });

  it('does not show "Select date range..." button when dates are active', () => {
    const filtersWithDates = {
      ...defaultFilters,
      dateRange: { startDate: new Date('2026-01-01'), endDate: new Date('2026-01-31') },
    };
    render(
      <ProjectFilterSheet
        isOpen={true}
        onOpenChange={vi.fn()}
        filters={filtersWithDates}
        onFilterChange={vi.fn()}
        onClearFilters={vi.fn()}
      />,
    );

    expect(screen.queryByText('Select date range...')).not.toBeInTheDocument();
  });

  it('shows "Clear Date" button only when date range is active', () => {
    const filtersWithDates = {
      ...defaultFilters,
      dateRange: { startDate: new Date('2026-01-01'), endDate: new Date('2026-01-31') },
    };
    render(
      <ProjectFilterSheet
        isOpen={true}
        onOpenChange={vi.fn()}
        filters={filtersWithDates}
        onFilterChange={vi.fn()}
        onClearFilters={vi.fn()}
      />,
    );

    expect(screen.getByText('Clear Date')).toBeInTheDocument();
  });

  it('does not show "Clear Date" button when no date range is active', () => {
    render(
      <ProjectFilterSheet
        isOpen={true}
        onOpenChange={vi.fn()}
        filters={defaultFilters}
        onFilterChange={vi.fn()}
        onClearFilters={vi.fn()}
      />,
    );

    expect(screen.queryByText('Clear Date')).not.toBeInTheDocument();
  });

  it('calls onFilterChange with null dates when "Clear Date" is clicked', () => {
    const handleFilterChange = vi.fn();
    const filtersWithDates = {
      ...defaultFilters,
      dateRange: { startDate: new Date('2026-01-01'), endDate: new Date('2026-01-31') },
    };
    render(
      <ProjectFilterSheet
        isOpen={true}
        onOpenChange={vi.fn()}
        filters={filtersWithDates}
        onFilterChange={handleFilterChange}
        onClearFilters={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByText('Clear Date'));

    expect(handleFilterChange).toHaveBeenCalledWith({
      ...filtersWithDates,
      dateRange: { startDate: null, endDate: null },
    });
  });

  it('debounces client name changes by 300ms before calling onFilterChange', async () => {
    vi.useFakeTimers();
    const handleFilterChange = vi.fn();
    render(
      <ProjectFilterSheet
        isOpen={true}
        onOpenChange={vi.fn()}
        filters={defaultFilters}
        onFilterChange={handleFilterChange}
        onClearFilters={vi.fn()}
      />,
    );

    const input = screen.getByPlaceholderText('Search by client name...');
    fireEvent.change(input, { target: { value: 'Acme' } });

    // Should not fire immediately
    expect(handleFilterChange).not.toHaveBeenCalled();

    // Should fire after 300ms
    await act(async () => {
      vi.advanceTimersByTime(300);
    });
    expect(handleFilterChange).toHaveBeenCalledWith({
      ...defaultFilters,
      clientName: 'Acme',
    });

    vi.useRealTimers();
  });

  it('does not call onFilterChange if client name has not changed', async () => {
    vi.useFakeTimers();
    const handleFilterChange = vi.fn();
    const filtersWithClient = { ...defaultFilters, clientName: 'Acme' };
    render(
      <ProjectFilterSheet
        isOpen={true}
        onOpenChange={vi.fn()}
        filters={filtersWithClient}
        onFilterChange={handleFilterChange}
        onClearFilters={vi.fn()}
      />,
    );

    await act(async () => {
      vi.advanceTimersByTime(400);
    });

    // localClientName === filters.clientName so no call expected
    expect(handleFilterChange).not.toHaveBeenCalled();

    vi.useRealTimers();
  });
});
