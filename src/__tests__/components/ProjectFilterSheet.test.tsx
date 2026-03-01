import { render, screen, fireEvent } from '@testing-library/react';
import { ProjectFilterSheet } from '../../components/dashboard/ProjectFilterSheet';
import { vi } from 'vitest';

describe('ProjectFilterSheet', () => {
  const defaultFilters = {
    statuses: [],
    clientName: '',
    dateRange: { startDate: null, endDate: null }
  };

  it('renders correctly when open', () => {
    render(
      <ProjectFilterSheet 
        isOpen={true} 
        onOpenChange={vi.fn()} 
        filters={defaultFilters} 
        onFilterChange={vi.fn()} 
        onClearFilters={vi.fn()} 
      />
    );
    
    expect(screen.getByText('Filter Projects')).toBeInTheDocument();
    expect(screen.getByText('Project Status')).toBeInTheDocument();
  });

  it('calls onClearFilters when transparent button is clicked', () => {
    const handleClear = vi.fn();
    render(
      <ProjectFilterSheet 
        isOpen={true} 
        onOpenChange={vi.fn()} 
        filters={defaultFilters} 
        onFilterChange={vi.fn()} 
        onClearFilters={handleClear} 
      />
    );
    
    fireEvent.click(screen.getByText('Clear all filters'));
    expect(handleClear).toHaveBeenCalled();
  });

  it('calls onFilterChange when status is toggled', () => {
    const handleFilterChange = vi.fn();
    render(
      <ProjectFilterSheet 
        isOpen={true} 
        onOpenChange={vi.fn()} 
        filters={defaultFilters} 
        onFilterChange={handleFilterChange} 
        onClearFilters={vi.fn()} 
      />
    );
    
    const activeCheckbox = screen.getByLabelText('Active');
    fireEvent.click(activeCheckbox);
    
    expect(handleFilterChange).toHaveBeenCalledWith({
      ...defaultFilters,
      statuses: ['Active']
    });
  });
});
