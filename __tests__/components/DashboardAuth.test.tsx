import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Dashboard } from '../../pages/Dashboard';
import * as AuthContext from '../../contexts/AuthContext';
import type { User } from '../../contexts/AuthContext';
import * as SocketContext from '../../hooks/useSocket';
import * as ProjectUpdates from '../../hooks/useProjectUpdates';
import apiClient from '../../api/client';

// Mock all complex children and context hooks that are irrelevant to this test
vi.mock('../../components/dashboard/StatsGrid', () => ({ StatsGrid: () => <div data-testid="stats-grid" /> }));
vi.mock('../../components/dashboard/ExecutionKPISection', () => ({ ExecutionKPISection: () => <div data-testid="execution-kpi" /> }));
vi.mock('../../components/dashboard/FinancialKPISection', () => ({ FinancialKPISection: () => <div data-testid="financial-kpi" /> }));
vi.mock('../../components/dashboard/ProviderDistributionChart', () => ({ ProviderDistributionChart: () => <div data-testid="provider-distribution" /> }));
vi.mock('../../components/dashboard/ProjectCard', () => ({ ProjectCard: () => <div data-testid="project-card" /> }));
vi.mock('../../components/dashboard/NewProjectDialog', () => ({ NewProjectDialog: () => <div data-testid="new-project" /> }));
vi.mock('../../components/dashboard/ProjectFilterSheet', () => ({ ProjectFilterSheet: () => <div data-testid="filter-sheet" /> }));
vi.mock('../../components/quality-gate/ReviewModal', () => ({ ReviewModal: () => <div data-testid="review-modal" /> }));
vi.mock('../../components/conversations/ConversationListWidget', () => ({ ConversationListWidget: () => <div data-testid="conversations" /> }));
vi.mock('../../components/financial/FinancialMetricsSection', () => ({ FinancialMetricsSection: () => <div data-testid="financial-metrics" /> }));
vi.mock('../../components/ux/CommandPalette', () => ({ CommandPalette: () => <div data-testid="command-palette" /> }));
vi.mock('../../components/ux/HelpModal', () => ({ HelpModal: () => <div data-testid="help-modal" /> }));
vi.mock('../../components/dashboard/ProjectCardListView', () => ({ ProjectCardListView: () => <div data-testid="project-list" /> }));
vi.mock('../../api/client');

const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider
        client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}
    >
        <BrowserRouter>
            {children}
        </BrowserRouter>
    </QueryClientProvider>
);

function makeAuthMock(user: User | null): AuthContext.AuthContextValue {
    return {
        user,
        isAuthenticated: user !== null,
        isLoading: false,
        login: vi.fn<AuthContext.AuthContextValue['login']>(),
        logout: vi.fn<AuthContext.AuthContextValue['logout']>(),
        refreshToken: vi.fn<AuthContext.AuthContextValue['refreshToken']>(),
    };
}

describe('Dashboard Auth & Role Guards', () => {
    beforeEach(() => {
        vi.resetAllMocks();

        // Default API mock resolutions
        vi.mocked(apiClient.get).mockImplementation((url: string) => {
            if (url === '/pm-dashboard/projects') return Promise.resolve({ data: { data: [] } });
            if (url === '/pm-dashboard/summary') return Promise.resolve({ data: {} });
            return Promise.resolve({ data: {} });
        });

        // Default socket mock
        vi.spyOn(SocketContext, 'useSocket').mockReturnValue({
            socket: null,
            connected: true,
        });

        vi.spyOn(ProjectUpdates, 'useProjectUpdates').mockImplementation(() => {});
    });

    it('renders FinancialMetricsSection for MANAGER role', async () => {
        vi.spyOn(AuthContext, 'useAuth').mockReturnValue(makeAuthMock(
            { id: 'u1', role: 'MANAGER', email: 'test@test.com', fullName: 'Test', isActive: true, lastLoginAt: null },
        ));

        render(<Dashboard />, { wrapper });

        await waitFor(() => {
            expect(screen.getByTestId('financial-metrics')).toBeInTheDocument();
        });
    });

    it('renders FinancialMetricsSection for ADMIN role', async () => {
        vi.spyOn(AuthContext, 'useAuth').mockReturnValue(makeAuthMock(
            { id: 'u2', role: 'ADMIN', email: 'test@test.com', fullName: 'Test', isActive: true, lastLoginAt: null },
        ));

        render(<Dashboard />, { wrapper });

        await waitFor(() => {
            expect(screen.getByTestId('financial-metrics')).toBeInTheDocument();
        });
    });

    it('does NOT render FinancialMetricsSection for VIEWER role', async () => {
        vi.spyOn(AuthContext, 'useAuth').mockReturnValue(makeAuthMock(
            { id: 'u3', role: 'VIEWER', email: 'test@test.com', fullName: 'Test', isActive: true, lastLoginAt: null },
        ));

        render(<Dashboard />, { wrapper });

        await waitFor(() => {
            expect(screen.queryByTestId('financial-metrics')).not.toBeInTheDocument();
        });
    });

    it('does NOT render FinancialMetricsSection for PM role', async () => {
        vi.spyOn(AuthContext, 'useAuth').mockReturnValue(makeAuthMock(
            { id: 'u4', role: 'PM', email: 'test@test.com', fullName: 'Test', isActive: true, lastLoginAt: null },
        ));

        render(<Dashboard />, { wrapper });

        await waitFor(() => {
            expect(screen.queryByTestId('financial-metrics')).not.toBeInTheDocument();
        });
    });

    it('does NOT render FinancialMetricsSection for TL role', async () => {
        vi.spyOn(AuthContext, 'useAuth').mockReturnValue(makeAuthMock(
            { id: 'u5', role: 'TL', email: 'test@test.com', fullName: 'Test', isActive: true, lastLoginAt: null },
        ));

        render(<Dashboard />, { wrapper });

        await waitFor(() => {
            expect(screen.queryByTestId('financial-metrics')).not.toBeInTheDocument();
        });
    });

    it('does NOT render FinancialMetricsSection for QA role', async () => {
        vi.spyOn(AuthContext, 'useAuth').mockReturnValue(makeAuthMock(
            { id: 'u6', role: 'QA', email: 'test@test.com', fullName: 'Test', isActive: true, lastLoginAt: null },
        ));

        render(<Dashboard />, { wrapper });

        await waitFor(() => {
            expect(screen.queryByTestId('financial-metrics')).not.toBeInTheDocument();
        });
    });

    it('does NOT render FinancialMetricsSection when user is null (unauthenticated)', async () => {
        vi.spyOn(AuthContext, 'useAuth').mockReturnValue(makeAuthMock(null));

        render(<Dashboard />, { wrapper });

        await waitFor(() => {
            expect(screen.queryByTestId('financial-metrics')).not.toBeInTheDocument();
        });
    });

    it('refetches data when user session changes (reactivity)', async () => {
        let currentUser: User = { id: 'u7', role: 'MANAGER', email: 'a@a.com', fullName: 'A', isActive: true, lastLoginAt: null };

        vi.spyOn(AuthContext, 'useAuth').mockImplementation(() =>
            makeAuthMock(currentUser),
        );

        const { rerender } = render(<Dashboard />, { wrapper });

        await waitFor(() => {
            // 1 call to /projects, 1 to /summary -> total 2
            expect(apiClient.get).toHaveBeenCalledTimes(2);
        });

        // Simulate a user auth change by updating the user the mock returns
        currentUser = { id: 'u8', role: 'MANAGER', email: 'b@b.com', fullName: 'B', isActive: true, lastLoginAt: null };

        rerender(<Dashboard />);

        await waitFor(() => {
            // 2 more calls for new user id
            expect(apiClient.get).toHaveBeenCalledTimes(4);
        });
    });
});
