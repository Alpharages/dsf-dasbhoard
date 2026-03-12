import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PmIntegrationPanel } from '@/pages/settings/panels/PmIntegrationPanel';
import * as integrationsApi from '@/api/integrationsApi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import React from 'react';

// Mock the API client
vi.mock('@/api/integrationsApi');

// Mock react-router-dom useParams
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useParams: () => ({ id: 'p1' }),
    };
});

// FIX M5: Added required `status` field to match PmIntegration interface
const mockIntegration = {
    id: 'int1',
    projectId: 'p1',
    provider: 'CLICKUP',
    status: 'ACTIVE' as const,
    workspaceId: 'ws1',
    workspaceName: 'My Workspace',
    botUsername: 'dsf_bot',
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
    pollingEnabled: true,
    pollingIntervalMin: 15,
    pollingLastRunAt: '2025-01-02T10:00:00Z',
    webhookEnabled: false,
    webhookId: null,
};

const createQueryClient = () => new QueryClient({
    defaultOptions: {
        queries: {
            retry: false,
        },
    },
});

describe('PmIntegrationPanel', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders provider cards and handles empty state', async () => {
        (integrationsApi.getPmIntegrations as any).mockResolvedValue([]);
        const queryClient = createQueryClient();
        render(
            <QueryClientProvider client={queryClient}>
                <MemoryRouter>
                    <PmIntegrationPanel />
                </MemoryRouter>
            </QueryClientProvider>
        );

        expect(screen.getByText('PM Tool Integrations')).toBeInTheDocument();
        await waitFor(() => {
            expect(screen.getByText('ClickUp')).toBeInTheDocument();
            expect(screen.getByText('Connect')).toBeInTheDocument();
        });
    });

    it('renders connected integration with sync settings', async () => {
        (integrationsApi.getPmIntegrations as any).mockResolvedValue([mockIntegration]);
        const queryClient = createQueryClient();
        render(
            <QueryClientProvider client={queryClient}>
                <MemoryRouter>
                    <PmIntegrationPanel />
                </MemoryRouter>
            </QueryClientProvider>
        );

        await waitFor(() => {
            expect(screen.getByText('Connected')).toBeInTheDocument();
            expect(screen.getByText('My Workspace')).toBeInTheDocument();
            expect(screen.getByText('Polling Configuration')).toBeInTheDocument();
            expect(screen.getByText('Webhook Configuration')).toBeInTheDocument();
        });
    });

    // FIX M5: Added test for INACTIVE integration — sync settings must NOT render
    it('does not render sync settings for INACTIVE integration', async () => {
        (integrationsApi.getPmIntegrations as any).mockResolvedValue([{
            ...mockIntegration,
            status: 'INACTIVE',
        }]);
        const queryClient = createQueryClient();
        render(
            <QueryClientProvider client={queryClient}>
                <MemoryRouter>
                    <PmIntegrationPanel />
                </MemoryRouter>
            </QueryClientProvider>
        );

        await waitFor(() => {
            expect(screen.queryByText('Polling Configuration')).not.toBeInTheDocument();
            expect(screen.queryByText('Webhook Configuration')).not.toBeInTheDocument();
            expect(screen.queryByText('Save Settings')).not.toBeInTheDocument();
        });
    });

    it('handles sync settings update', async () => {
        (integrationsApi.getPmIntegrations as any).mockResolvedValue([mockIntegration]);
        (integrationsApi.updateSyncSettings as any).mockResolvedValue({ ...mockIntegration, pollingIntervalMin: 30 });

        const queryClient = createQueryClient();
        render(
            <QueryClientProvider client={queryClient}>
                <MemoryRouter>
                    <PmIntegrationPanel />
                </MemoryRouter>
            </QueryClientProvider>
        );

        await waitFor(() => screen.getByText('Save Settings'));

        // Polling switch is the first one
        const pollingSwitch = screen.getAllByRole('switch')[0];
        fireEvent.click(pollingSwitch); // Toggle off

        const saveButton = screen.getByText('Save Settings');
        fireEvent.click(saveButton);

        await waitFor(() => {
            expect(integrationsApi.updateSyncSettings).toHaveBeenCalledWith('int1', expect.objectContaining({
                polling_enabled: false
            }));
        });
    });

    it('shows warning when both sync methods are disabled', async () => {
        (integrationsApi.getPmIntegrations as any).mockResolvedValue([{
            ...mockIntegration,
            pollingEnabled: false,
            webhookEnabled: false
        }]);
        const queryClient = createQueryClient();
        render(
            <QueryClientProvider client={queryClient}>
                <MemoryRouter>
                    <PmIntegrationPanel />
                </MemoryRouter>
            </QueryClientProvider>
        );

        await waitFor(() => {
            expect(screen.getByText('No sync method active')).toBeInTheDocument();
        });
    });

    it('shows webhook status badge always (not gated by toggle)', async () => {
        (integrationsApi.getPmIntegrations as any).mockResolvedValue([{
            ...mockIntegration,
            webhookEnabled: false,
            webhookId: null,
        }]);
        const queryClient = createQueryClient();
        render(
            <QueryClientProvider client={queryClient}>
                <MemoryRouter>
                    <PmIntegrationPanel />
                </MemoryRouter>
            </QueryClientProvider>
        );

        await waitFor(() => {
            expect(screen.getByText('Not Registered')).toBeInTheDocument();
        });
    });
});
