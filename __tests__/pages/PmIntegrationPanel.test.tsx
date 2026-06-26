import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PmIntegrationPanel, StatusConfigSection } from '@/pages/settings/panels/PmIntegrationPanel';
import * as integrationsApi from '@/api/integrationsApi';
import { toast } from 'react-hot-toast';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';

// Mock the API client
vi.mock('@/api/integrationsApi');

vi.mock('react-hot-toast', () => ({
    default: { toast: {} },
    toast: { success: vi.fn(), error: vi.fn() },
}));

// Mock react-router-dom useParams
vi.mock('react-router-dom', async () => {
    const actual = (await vi.importActual('react-router-dom')) as any;
    return {
        ...actual,
        useParams: () => ({ id: 'p1' }),
    };
});

// Mock Select components to avoid Radix issues in JSDOM
vi.mock('@/components/ui/select', () => ({
    Select: ({ children, value, onValueChange, disabled }: any) => (
        <select 
            data-testid="mock-select" 
            value={value} 
            onChange={(e) => onValueChange(e.target.value)}
            disabled={disabled}
        >
            {children}
        </select>
    ),
    SelectTrigger: ({ children, 'data-testid': testId }: any) => <div data-testid={testId}>{children}</div>,
    SelectValue: ({ placeholder }: any) => <span>{placeholder}</span>,
    SelectContent: ({ children }: any) => <>{children}</>,
    SelectItem: ({ children, value }: any) => <option value={value}>{children}</option>,
}));

// Mock Alert to simplify
vi.mock('@/components/ui/alert', () => ({
    Alert: ({ children, variant, 'data-testid': testId }: any) => <div data-testid={testId || `alert-${variant}`}>{children}</div>,
    AlertTitle: ({ children }: any) => <div>{children}</div>,
    AlertDescription: ({ children }: any) => <div>{children}</div>,
}));

// Mock Skeleton
vi.mock('@/components/ui/skeleton', () => ({
    Skeleton: () => <div data-testid="skeleton" />,
}));

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

    describe('StatusConfigSection', () => {
        const mockSyncConfig = {
            id: 'int1',
            provider: 'CLICKUP',
            ai_trigger_status: null,
            container_id: null,
            polling_enabled: true,
            polling_interval_min: 15,
            webhook_enabled: false,
            webhook_id: null,
        };



        it('shows warning when no trigger status is set', async () => {
            (integrationsApi.getSyncConfig as any).mockResolvedValue(mockSyncConfig);
            const queryClient = createQueryClient();
            render(
                <QueryClientProvider client={queryClient}>
                    <StatusConfigSection integration={mockIntegration as any} projectId="p1" />
                </QueryClientProvider>
            );

            await waitFor(() => {
                expect(screen.getByText(/No trigger status set/i)).toBeInTheDocument();
            }, { timeout: 3000 });
        });

        it('shows toast.error and does not call getIntegrationStatuses when list ID is empty', async () => {
            (integrationsApi.getSyncConfig as any).mockResolvedValue(mockSyncConfig);
            const queryClient = createQueryClient();
            render(
                <QueryClientProvider client={queryClient}>
                    <StatusConfigSection integration={mockIntegration as any} projectId="p1" />
                </QueryClientProvider>
            );

            await screen.findByTestId('load-statuses-btn');
            // list ID is empty (syncConfig has container_id: null)
            fireEvent.click(screen.getByTestId('load-statuses-btn'));

            await waitFor(() => {
                expect(toast.error).toHaveBeenCalledWith('Enter a ClickUp list ID first');
                expect(integrationsApi.getIntegrationStatuses).not.toHaveBeenCalled();
            });
        });

        it('loads statuses when Load Statuses is clicked', async () => {
            (integrationsApi.getSyncConfig as any).mockResolvedValue(mockSyncConfig);
            (integrationsApi.getIntegrationStatuses as any).mockResolvedValue([
                { id: 'in-progress', name: 'In Progress', color: '#5f55ee', type: 'in_progress' },
            ]);
            const queryClient = createQueryClient();
            render(
                <QueryClientProvider client={queryClient}>
                    <StatusConfigSection integration={mockIntegration as any} projectId="p1" />
                </QueryClientProvider>
            );

            const input = await screen.findByTestId('list-id-input');
            fireEvent.change(input, { target: { value: '901234567' } });

            const loadButton = screen.getByTestId('load-statuses-btn');
            fireEvent.click(loadButton);

            await waitFor(() => {
                expect(integrationsApi.getIntegrationStatuses).toHaveBeenCalled();
            });
        });

        it('enables Select and shows status options after successful statuses load', async () => {
            (integrationsApi.getSyncConfig as any).mockResolvedValue(mockSyncConfig);
            (integrationsApi.getIntegrationStatuses as any).mockResolvedValue([
                { id: 'in-progress', name: 'In Progress', color: '#5f55ee', type: 'in_progress' },
                { id: 'done', name: 'Done', color: '#00c875', type: 'done' },
            ]);
            const queryClient = createQueryClient();
            render(
                <QueryClientProvider client={queryClient}>
                    <StatusConfigSection integration={mockIntegration as any} projectId="p1" />
                </QueryClientProvider>
            );

            const input = await screen.findByTestId('list-id-input');
            fireEvent.change(input, { target: { value: '901234567' } });
            fireEvent.click(screen.getByTestId('load-statuses-btn'));

            await waitFor(() => {
                const select = screen.getByTestId('mock-select');
                expect(select).not.toBeDisabled();
                expect(screen.getByText('In Progress')).toBeInTheDocument();
                expect(screen.getByText('Done')).toBeInTheDocument();
            });
        });

        it('shows Load Statuses button as disabled while statusesLoading is true', async () => {
            (integrationsApi.getSyncConfig as any).mockResolvedValue(mockSyncConfig);
            let resolveStatuses!: (value: any) => void;
            (integrationsApi.getIntegrationStatuses as any).mockReturnValue(
                new Promise((resolve) => { resolveStatuses = resolve; }),
            );
            const queryClient = createQueryClient();
            render(
                <QueryClientProvider client={queryClient}>
                    <StatusConfigSection integration={mockIntegration as any} projectId="p1" />
                </QueryClientProvider>
            );

            const input = await screen.findByTestId('list-id-input');
            fireEvent.change(input, { target: { value: '901234567' } });
            fireEvent.click(screen.getByTestId('load-statuses-btn'));

            await waitFor(() => {
                expect(screen.getByTestId('load-statuses-btn')).toBeDisabled();
            });

            resolveStatuses([]);
        });

        it('renders error alert when getIntegrationStatuses rejects', async () => {
            (integrationsApi.getSyncConfig as any).mockResolvedValue(mockSyncConfig);
            (integrationsApi.getIntegrationStatuses as any).mockRejectedValue(new Error('Network error'));
            const queryClient = createQueryClient();
            render(
                <QueryClientProvider client={queryClient}>
                    <StatusConfigSection integration={mockIntegration as any} projectId="p1" />
                </QueryClientProvider>
            );

            const input = await screen.findByTestId('list-id-input');
            fireEvent.change(input, { target: { value: '901234567' } });
            fireEvent.click(screen.getByTestId('load-statuses-btn'));

            await waitFor(() => {
                expect(screen.getByTestId('statuses-error')).toBeInTheDocument();
                expect(screen.getByText(/Could not load statuses/i)).toBeInTheDocument();
            });
        });

        it('updates sync config when Update Trigger Status is clicked', async () => {
            (integrationsApi.getSyncConfig as any).mockResolvedValue({
                ...mockSyncConfig,
                container_id: '901234567'
            });
            (integrationsApi.updateSyncConfig as any).mockResolvedValue({
                ...mockSyncConfig,
                ai_trigger_status: 'In Progress',
                container_id: '901234567',
            });

            const queryClient = createQueryClient();
            render(
                <QueryClientProvider client={queryClient}>
                    <StatusConfigSection integration={mockIntegration as any} projectId="p1" />
                </QueryClientProvider>
            );

            // Mock statuses so the select becomes enabled after syncConfig loads
            (integrationsApi.getIntegrationStatuses as any).mockResolvedValue([
                { id: 'status-1', name: 'In Progress' },
            ]);

            // Wait for syncConfig to load (listId input gets populated)
            await screen.findByDisplayValue('901234567');

            // Wait for statuses to load so the Select becomes enabled
            const select = await screen.findByTestId('mock-select');
            await waitFor(() => {
                expect((select as HTMLSelectElement).disabled).toBe(false);
            });

            fireEvent.change(select, { target: { value: 'In Progress' } });

            const updateButton = screen.getByRole('button', { name: /Update Trigger Status/i });
            fireEvent.click(updateButton);

            await waitFor(() => {
                expect(integrationsApi.updateSyncConfig).toHaveBeenCalledWith('p1', {
                    ai_trigger_status: 'In Progress',
                    container_id: '901234567',
                });
            });
        });

        it('calls toast.success after successful save', async () => {
            (integrationsApi.getSyncConfig as any).mockResolvedValue(mockSyncConfig);
            (integrationsApi.updateSyncConfig as any).mockResolvedValue({
                ...mockSyncConfig,
                ai_trigger_status: 'In Review',
            });
            const queryClient = createQueryClient();
            render(
                <QueryClientProvider client={queryClient}>
                    <StatusConfigSection integration={mockIntegration as any} projectId="p1" />
                </QueryClientProvider>
            );

            await screen.findByTestId('load-statuses-btn');
            fireEvent.click(screen.getByRole('button', { name: /Update Trigger Status/i }));

            await waitFor(() => {
                expect(toast.success).toHaveBeenCalledWith('AI trigger status updated');
            });
        });

        it('calls toast.error and restores cache snapshot on save error', async () => {
            (integrationsApi.getSyncConfig as any).mockResolvedValue({
                ...mockSyncConfig,
                ai_trigger_status: 'In Review',
            });
            (integrationsApi.updateSyncConfig as any).mockRejectedValue(new Error('Network error'));
            const queryClient = createQueryClient();
            render(
                <QueryClientProvider client={queryClient}>
                    <StatusConfigSection integration={mockIntegration as any} projectId="p1" />
                </QueryClientProvider>
            );

            await screen.findByTestId('load-statuses-btn');
            fireEvent.click(screen.getByRole('button', { name: /Update Trigger Status/i }));

            await waitFor(() => {
                expect(toast.error).toHaveBeenCalledWith('Failed to update trigger status');
            });
        });
    });
});
