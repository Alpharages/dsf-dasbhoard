import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { CapabilityManagementPage } from '@/pages/CapabilityManagementPage';
import * as useCapabilities from '@/hooks/useCapabilities';

const queryClient = new QueryClient({
    defaultOptions: {
        queries: { retry: false },
    },
});

const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
        <BrowserRouter>
            {children}
        </BrowserRouter>
    </QueryClientProvider>
);

describe('CapabilityManagementPage', () => {
    it('should render page header', () => {
        vi.spyOn(useCapabilities, 'useCapabilityDashboard').mockReturnValue({
            data: { capabilities: [], topLimitations: [] },
            isLoading: false,
            error: null,
        } as any);

        render(<CapabilityManagementPage />, { wrapper });

        expect(screen.getByText('AI Capability Management')).toBeInTheDocument();
        expect(screen.getByText('Monitor AI performance and manage known limitations')).toBeInTheDocument();
    });

    it('should show "Add Limitation" button for TL/ADMIN roles', () => {
        localStorage.setItem('userRole', 'TL');

        vi.spyOn(useCapabilities, 'useCapabilityDashboard').mockReturnValue({
            data: { capabilities: [], topLimitations: [] },
            isLoading: false,
            error: null,
        } as any);

        render(<CapabilityManagementPage />, { wrapper });

        expect(screen.getByText('Add Limitation')).toBeInTheDocument();
    });

    it('should NOT show "Add Limitation" button for PM role', () => {
        localStorage.setItem('userRole', 'PM');

        vi.spyOn(useCapabilities, 'useCapabilityDashboard').mockReturnValue({
            data: { capabilities: [], topLimitations: [] },
            isLoading: false,
            error: null,
        } as any);

        render(<CapabilityManagementPage />, { wrapper });

        // PM should see read-only message
        expect(screen.getByText(/Read-only view/i)).toBeInTheDocument();
        expect(screen.queryByText('Add Limitation')).not.toBeInTheDocument();
    });
});
