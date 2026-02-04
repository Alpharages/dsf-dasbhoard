/**
 * Production Error Dashboard Page
 * Story 9-U-5: Production Error Dashboard
 *
 * Main dashboard page for monitoring production errors.
 */

import { useState } from 'react';
import { useAuth, useHasRole } from '@/contexts/AuthContext';
import { useProductionErrorSocket } from '@/hooks/useProductionErrorSocket';
import { ErrorOverviewWidget } from '@/components/production-errors/ErrorOverviewWidget';
import { ErrorTrendChart } from '@/components/production-errors/ErrorTrendChart';
import { ApplicationHealthHeatmap } from '@/components/production-errors/ApplicationHealthHeatmap';
import { ErrorListTable } from '@/components/production-errors/ErrorListTable';
import { ErrorDetailModal } from '@/components/production-errors/ErrorDetailModal';
import { BulkActionsToolbar } from '@/components/production-errors/BulkActionsToolbar';
import { useBulkCreateTickets } from '@/hooks/useProductionErrors';
import type { ErrorListFilters, ErrorListItem } from '@/api/production-errors';
import { AlertTriangle } from 'lucide-react';
import { toast } from 'react-hot-toast';

export function ProductionErrorDashboard() {
  useAuth(); // Ensure auth context is available
  const token = localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
  
  // RBAC checks
  const canCreateTickets = useHasRole('MANAGER'); // MANAGER, TL, QA, PM, ADMIN
  const canBulkActions = useHasRole('MANAGER'); // Same as above
  
  // State
  const [filters, setFilters] = useState<ErrorListFilters>({
    page: 1,
    limit: 20,
    sortBy: 'severity',
    sortOrder: 'desc',
  });
  const [selectedErrors, setSelectedErrors] = useState<string[]>([]);
  const [selectedError, setSelectedError] = useState<ErrorListItem | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  
  // Mutations
  const { mutate: bulkCreateTickets } = useBulkCreateTickets();
  
  // Real-time socket connection
  useProductionErrorSocket(token);
  
  // Handlers
  const handleApplicationSelect = (application: string) => {
    setFilters(prev => ({
      ...prev,
      application: [application],
      page: 1,
    }));
    // Scroll to table
    document.getElementById('error-list')?.scrollIntoView({ behavior: 'smooth' });
  };
  
  const handleErrorClick = (error: ErrorListItem) => {
    setSelectedError(error);
    setIsDetailOpen(true);
  };
  
  const handleCreateTicket = (errorId: string) => {
    if (!canCreateTickets) {
      toast.error('You do not have permission to create tickets');
      return;
    }
    
    bulkCreateTickets([errorId], {
      onSuccess: (result) => {
        if (result.created > 0) {
          toast.success('Ticket created successfully');
        } else if (result.skipped > 0) {
          toast('Error already has a ticket');
        }
      },
      onError: () => {
        toast.error('Failed to create ticket');
      },
    });
  };
  
  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-100 flex items-center gap-3">
              <AlertTriangle className="w-8 h-8 text-red-500" />
              Production Error Dashboard
            </h1>
            <p className="text-slate-400 mt-1">
              Monitor and manage production errors across all applications
            </p>
          </div>
        </div>
        
        {/* Overview Widget */}
        <section>
          <ErrorOverviewWidget />
        </section>
        
        {/* Charts Row */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ErrorTrendChart />
          <ApplicationHealthHeatmap onSelectApplication={handleApplicationSelect} />
        </section>
        
        {/* Error List */}
        <section id="error-list" className="space-y-4">
          <h2 className="text-xl font-semibold text-slate-200">Error List</h2>
          
          {/* Bulk Actions */}
          {canBulkActions && (
            <BulkActionsToolbar
              selectedErrors={selectedErrors}
              onClearSelection={() => setSelectedErrors([])}
            />
          )}
          
          {/* Table */}
          <ErrorListTable
            filters={filters}
            onFilterChange={setFilters}
            selectedErrors={selectedErrors}
            onSelectionChange={setSelectedErrors}
            onErrorClick={handleErrorClick}
          />
        </section>
        
        {/* Detail Modal */}
        <ErrorDetailModal
          error={selectedError}
          isOpen={isDetailOpen}
          onClose={() => {
            setIsDetailOpen(false);
            setSelectedError(null);
          }}
          onCreateTicket={canCreateTickets ? handleCreateTicket : undefined}
          canCreateTicket={canCreateTickets}
        />
      </div>
    </div>
  );
}
