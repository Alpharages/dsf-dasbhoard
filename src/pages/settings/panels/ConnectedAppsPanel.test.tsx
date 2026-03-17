// @vitest-environment jsdom
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ConnectedAppsPanel } from './ConnectedAppsPanel';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { useConnectedApps, useDisconnectConnectedApp } from '@/hooks/queries/useConnectedApps';
import { connectedAppsApi } from '@/api/connectedAppsApi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';

// Mock dependencies
vi.mock('@/hooks/queries/useConnectedApps');
vi.mock('@/api/connectedAppsApi');

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('ConnectedAppsPanel', () => {
  const mockRefetch = vi.fn();
  const mockMutate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useConnectedApps).mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
      refetch: mockRefetch,
    } as any);

    vi.mocked(useDisconnectConnectedApp).mockReturnValue({
      mutate: mockMutate,
      isPending: false,
    } as any);
  });

  it('renders provider sections', () => {
    render(<ConnectedAppsPanel />, { wrapper: createWrapper() });
    expect(screen.getByText('ClickUp')).toBeInTheDocument();
    expect(screen.getByText('Jira')).toBeInTheDocument();
    expect(screen.getByText('Asana')).toBeInTheDocument();
  });

  it('shows loading skeletons when data is fetching', () => {
    vi.mocked(useConnectedApps).mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
    } as any);

    const { container } = render(<ConnectedAppsPanel />, { wrapper: createWrapper() });
    expect(container.querySelectorAll('.animate-pulse')).toHaveLength(6); // 2 per provider x 3 providers
  });

  it('renders account cards when apps are connected', () => {
    const mockApps = [
      {
        id: '1',
        provider: 'CLICKUP',
        workspaceName: 'My ClickUp Workspace',
        metadata: { botUsername: 'dsf-bot' },
        connectedAt: new Date().toISOString(),
      },
    ];
    vi.mocked(useConnectedApps).mockReturnValue({
      data: mockApps,
      isLoading: false,
      isError: false,
    } as any);

    render(<ConnectedAppsPanel />, { wrapper: createWrapper() });
    expect(screen.getByText('My ClickUp Workspace')).toBeInTheDocument();
    expect(screen.getByText('Bot: dsf-bot')).toBeInTheDocument();
  });

  it('shows empty state when no apps are connected', () => {
    render(<ConnectedAppsPanel />, { wrapper: createWrapper() });
    expect(screen.getByText('No ClickUp accounts connected')).toBeInTheDocument();
  });

  it('opens disconnect dialog when clicking disconnect', async () => {
    const mockApps = [
      {
        id: '1',
        provider: 'CLICKUP',
        workspaceName: 'My Workspace',
        metadata: { botUsername: 'bot' },
        connectedAt: new Date().toISOString(),
      },
    ];
    vi.mocked(useConnectedApps).mockReturnValue({
      data: mockApps,
      isLoading: false,
      isError: false,
    } as any);

    render(<ConnectedAppsPanel />, { wrapper: createWrapper() });
    
    const disconnectBtn = screen.getByText('Disconnect');
    fireEvent.click(disconnectBtn);

    expect(screen.getByText('Remove My Workspace?')).toBeInTheDocument();
    
    const confirmBtn = screen.getByRole('button', { name: 'Disconnect' });
    fireEvent.click(confirmBtn);

    expect(mockMutate).toHaveBeenCalledWith('1');
  });

  it('initiates ClickUp connection when clicking connect', async () => {
    vi.mocked(connectedAppsApi.getClickUpConnectUrl).mockResolvedValue({ url: 'https://oauth.url' });
    // Mock window.location
    const originalLocation = window.location;
    delete (window as any).location;
    window.location = { ...originalLocation, href: '' } as any;

    render(<ConnectedAppsPanel />, { wrapper: createWrapper() });
    
    const connectBtn = screen.getByText('Connect ClickUp Account');
    fireEvent.click(connectBtn);

    await waitFor(() => {
      expect(connectedAppsApi.getClickUpConnectUrl).toHaveBeenCalledWith('settings');
      expect(window.location.href).toBe('https://oauth.url');
    });

    window.location = originalLocation;
  });

  it('shows Jira and Asana as coming soon', () => {
    render(<ConnectedAppsPanel />, { wrapper: createWrapper() });
    const badges = screen.getAllByText('Coming Soon');
    expect(badges).toHaveLength(2);
    
    const jiraBtn = screen.getByText('Connect Jira Account');
    expect(jiraBtn).toBeDisabled();
  });
});
