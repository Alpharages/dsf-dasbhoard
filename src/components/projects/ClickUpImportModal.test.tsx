import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ClickUpImportModal } from './ClickUpImportModal';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { useConnectedApps, useAppHierarchy } from '../../hooks/queries/useConnectedApps';
import { useImportProject } from '../../hooks/useImportProject';
import * as connectedAppsApiModule from '../../api/connectedAppsApi';

// Mock hooks
vi.mock('../../hooks/queries/useConnectedApps');
vi.mock('../../hooks/useImportProject');
vi.mock('../../api/connectedAppsApi', () => ({
    connectedAppsApi: {
        getClickUpConnectUrl: vi.fn().mockResolvedValue({ url: 'https://clickup.com/oauth' }),
        getAppHierarchy: vi.fn(),
        getConnectedApps: vi.fn(),
        disconnectApp: vi.fn(),
    },
}));

const mockImportProject = vi.fn();
const mockOnClose = vi.fn();

const mockConnectedApps = [
    {
        id: 'acc1',
        provider: 'clickup',
        bot_username: 'User One',
        workspace_name: 'Workspace One',
        bot_user_id: 'u1',
        workspace_id: 'w1',
        created_at: new Date().toISOString()
    },
    {
        id: 'acc2',
        provider: 'clickup',
        bot_username: 'User Two',
        workspace_name: 'Workspace Two',
        bot_user_id: 'u2',
        workspace_id: 'w2',
        created_at: new Date().toISOString()
    }
];

describe('ClickUpImportModal', () => {
    const originalLocation = window.location;

    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.clear();
        Object.defineProperty(window, 'location', {
            writable: true,
            value: { href: '' },
        });
        (useImportProject as any).mockReturnValue({
            mutate: mockImportProject,
            isPending: false
        });
        (useConnectedApps as any).mockReturnValue({
            data: mockConnectedApps,
            isLoading: false,
            isError: false,
            refetch: vi.fn(),
        });
        (useAppHierarchy as any).mockReturnValue({
            data: null,
            isLoading: false
        });
    });

    afterEach(() => {
        Object.defineProperty(window, 'location', {
            writable: true,
            value: originalLocation,
        });
    });

    it('renders account selection initially when multiple accounts exist', () => {
        render(<ClickUpImportModal isOpen={true} onClose={mockOnClose} />);
        expect(screen.getByText('Select Account')).toBeInTheDocument();
        expect(screen.getByText('User One')).toBeInTheDocument();
        expect(screen.getByText('User Two')).toBeInTheDocument();
    });

    it('auto-selects single account and shows confirmed state on step 0', async () => {
        (useConnectedApps as any).mockReturnValue({
            data: [mockConnectedApps[0]],
            isLoading: false,
            isError: false,
            refetch: vi.fn(),
        });

        render(<ClickUpImportModal isOpen={true} onClose={mockOnClose} />);

        // Step 0 is still shown (not skipped), confirmed state displayed
        expect(screen.getByText('Select Account')).toBeInTheDocument();
        expect(screen.getByText('Workspace One')).toBeInTheDocument();
        // Next button is enabled because account was auto-selected
        const nextButton = screen.getByRole('button', { name: /next/i });
        expect(nextButton).not.toBeDisabled();
    });

    it('shows organization list after selecting account and clicking Next', async () => {
        const orgs = [
            { id: 'org1', name: 'Org One', spaces: [] },
            { id: 'org2', name: 'Org Two', spaces: [] }
        ];
        (useAppHierarchy as any).mockReturnValue({
            data: { organizations: orgs },
            isLoading: false
        });

        render(<ClickUpImportModal isOpen={true} onClose={mockOnClose} />);

        // Select account (card click — no advance)
        fireEvent.click(screen.getByText('User One'));
        // Next button is now enabled — click to advance
        fireEvent.click(screen.getByRole('button', { name: /next/i }));

        expect(screen.getByText('Choose Workspace')).toBeInTheDocument();
        expect(screen.getByText('Org One')).toBeInTheDocument();
        expect(screen.getByText('Org Two')).toBeInTheDocument();
    });

    it('navigates to hierarchy after selecting account, clicking Next, then selecting organization', async () => {
        const orgs = [
            {
                id: 'org1',
                name: 'Org One',
                spaces: [{ id: 'space1', name: 'Space One', lists: [{ id: 'list1', name: 'List One' }] }]
            },
            { id: 'org2', name: 'Org Two', spaces: [] }
        ];
        (useAppHierarchy as any).mockReturnValue({
            data: { organizations: orgs },
            isLoading: false
        });

        render(<ClickUpImportModal isOpen={true} onClose={mockOnClose} />);

        fireEvent.click(screen.getByText('User One'));
        fireEvent.click(screen.getByRole('button', { name: /next/i }));
        fireEvent.click(screen.getByText('Org One'));

        expect(screen.getByText('Select Location')).toBeInTheDocument();
        expect(screen.getByText('Space One')).toBeInTheDocument();
    });

    it('calls importProject with correct parameters when list is selected', () => {
        const orgs = [
            { 
                id: 'org1', 
                name: 'Org One', 
                spaces: [{ id: 'space1', name: 'Space One', lists: [{ id: 'list1', name: 'List One' }] }] 
            }
        ];
        (useAppHierarchy as any).mockReturnValue({
            data: { organizations: orgs },
            isLoading: false
        });
        (useConnectedApps as any).mockReturnValue({
            data: [mockConnectedApps[0]],
            isLoading: false
        });

        render(<ClickUpImportModal isOpen={true} onClose={mockOnClose} />);
        
        // Auto-skipped account and organization (if mocked correctly)
        // Let's manually select just in case
        // Wait, auto-skip logic:
        // clickUpAccounts.length === 1 -> auto-select account
        // hierarchyData.organizations.length === 1 -> auto-select org

        fireEvent.click(screen.getByText('Space One'));
        fireEvent.click(screen.getByText('List One'));
        fireEvent.click(screen.getByText('Import Project'));

        expect(mockImportProject).toHaveBeenCalledWith({
            provider: 'CLICKUP',
            resourceId: 'list1',
            accountId: 'acc1'
        });
    });

    it('handles back button correctly', () => {
        (useAppHierarchy as any).mockReturnValue({
            data: {
                organizations: [
                    { id: 'org1', name: 'Org One', spaces: [] },
                    { id: 'org2', name: 'Org Two', spaces: [] }
                ]
            },
            isLoading: false
        });

        render(<ClickUpImportModal isOpen={true} onClose={mockOnClose} />);

        fireEvent.click(screen.getByText('User One'));
        fireEvent.click(screen.getByRole('button', { name: /next/i }));
        expect(screen.getByText('Choose Workspace')).toBeInTheDocument();

        const backButton = screen.getByLabelText('Back');
        fireEvent.click(backButton);
        expect(screen.getByText('Select Account')).toBeInTheDocument();
    });

    // --- Missing test cases (AC #8, #9, #5, #6) ---

    it('shows SkeletonCard while accounts are loading', () => {
        (useConnectedApps as any).mockReturnValue({
            data: undefined,
            isLoading: true,
            isError: false,
            refetch: vi.fn(),
        });

        render(<ClickUpImportModal isOpen={true} onClose={mockOnClose} />);
        // SkeletonCard renders animated pulse divs — there should be no account buttons
        expect(screen.queryByText('User One')).not.toBeInTheDocument();
        expect(screen.queryByText('Connect ClickUp')).not.toBeInTheDocument();
    });

    it('zero accounts: shows empty state and Connect button initiates OAuth', async () => {
        (useConnectedApps as any).mockReturnValue({
            data: [],
            isLoading: false,
            isError: false,
            refetch: vi.fn(),
        });

        render(<ClickUpImportModal isOpen={true} onClose={mockOnClose} />);

        expect(screen.getByText('No ClickUp accounts connected')).toBeInTheDocument();
        const connectButton = screen.getByRole('button', { name: /connect clickup/i });

        await fireEvent.click(connectButton);

        await waitFor(() => {
            expect(connectedAppsApiModule.connectedAppsApi.getClickUpConnectUrl).toHaveBeenCalledWith('import');
        });
        expect(localStorage.getItem('dsf:pendingImport')).toBe(JSON.stringify({ returnedFromOAuth: true }));
        expect(window.location.href).toBe('https://clickup.com/oauth');
    });

    it('footer Next button is disabled when no account selected (multiple accounts)', () => {
        render(<ClickUpImportModal isOpen={true} onClose={mockOnClose} />);

        const nextButton = screen.getByRole('button', { name: /next/i });
        expect(nextButton).toBeDisabled();
    });

    it('footer Next button enabled after selecting an account', () => {
        render(<ClickUpImportModal isOpen={true} onClose={mockOnClose} />);

        const nextButton = screen.getByRole('button', { name: /next/i });
        expect(nextButton).toBeDisabled();

        fireEvent.click(screen.getByText('User One'));
        expect(nextButton).not.toBeDisabled();
    });

    it('clears dsf:pendingImport from localStorage when modal opens', () => {
        localStorage.setItem('dsf:pendingImport', JSON.stringify({ returnedFromOAuth: true }));

        render(<ClickUpImportModal isOpen={true} onClose={mockOnClose} />);

        expect(localStorage.getItem('dsf:pendingImport')).toBeNull();
    });

    it('footer Back button is NOT in the DOM on step 0', () => {
        render(<ClickUpImportModal isOpen={true} onClose={mockOnClose} />);

        // The footer Back button should not exist on step 'account'
        const backButtons = screen.queryAllByRole('button', { name: /^back$/i });
        expect(backButtons).toHaveLength(0);
    });
});
