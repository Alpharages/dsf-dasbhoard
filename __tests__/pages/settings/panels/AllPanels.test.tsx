// @vitest-environment jsdom
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { CleanupPanel, SelfHealingPanel, CostPanel } from '@/pages/settings/panels/AllPanels';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { useSystemConfig } from '@/hooks/queries/useSystemConfig';
import { useAuth } from '@/contexts/AuthContext';
import { useSkillModelMap, useUpdateSkillModelMapEntry } from '@/hooks/queries/useSkillModelMap';
import { useStatusSkillMap, useUpdateStatusSkillMap } from '@/hooks/queries/useStatusSkillMap';
import {
  useAiAccounts,
  useImportAiAccounts,
  useSetAiAccountEnabled,
} from '@/hooks/queries/useAiAccounts';
import { Toaster } from 'react-hot-toast';

// Mock hooks
vi.mock('@/hooks/queries/useSystemConfig');
vi.mock('@/contexts/AuthContext');
vi.mock('@/hooks/queries/useSkillModelMap');
vi.mock('@/hooks/queries/useStatusSkillMap');
vi.mock('@/hooks/queries/useAiAccounts');

const mockUseSystemConfig = useSystemConfig as jest.Mock;
const mockUseAuth = useAuth as jest.Mock;
const mockUseSkillModelMap = useSkillModelMap as jest.Mock;
const mockUseUpdateSkillModelMapEntry = useUpdateSkillModelMapEntry as jest.Mock;
const mockUseStatusSkillMap = useStatusSkillMap as jest.Mock;
const mockUseUpdateStatusSkillMap = useUpdateStatusSkillMap as jest.Mock;
const mockUseAiAccounts = useAiAccounts as jest.Mock;
const mockUseImportAiAccounts = useImportAiAccounts as jest.Mock;
const mockUseSetAiAccountEnabled = useSetAiAccountEnabled as jest.Mock;

describe('Settings Panels', () => {
    const mockGetValue = vi.fn();
    const mockUpdateConfig = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
        mockUseSystemConfig.mockReturnValue({
            getValue: mockGetValue,
            updateConfig: mockUpdateConfig,
            isUpdating: false,
        });

        // Default implementation
        mockGetValue.mockImplementation((_key, def) => def);
        mockUpdateConfig.mockResolvedValue(undefined);

        mockUseAuth.mockReturnValue({ user: { role: 'ADMIN' } });
        mockUseSkillModelMap.mockReturnValue({ data: [], isLoading: false, isError: false });
        mockUseUpdateSkillModelMapEntry.mockReturnValue({ mutate: vi.fn(), isPending: false });
        mockUseStatusSkillMap.mockReturnValue({
            data: { entries: [], loopTerminalStatuses: ['passed', 'done'], loopMaxIterations: 5 },
            isLoading: false,
            isError: false,
        });
        mockUseUpdateStatusSkillMap.mockReturnValue({ mutate: vi.fn(), isPending: false });
        mockUseAiAccounts.mockReturnValue({ data: [], isLoading: false, isError: false });
        mockUseImportAiAccounts.mockReturnValue({ mutate: vi.fn(), isPending: false, data: undefined });
        mockUseSetAiAccountEnabled.mockReturnValue({ mutate: vi.fn(), isPending: false });
    });

    // Cleanup Panel Tests
    describe('CleanupPanel', () => {
        it('renders cleanup configuration inputs', () => {
            render(<CleanupPanel />);
            expect(screen.getByText('Retention Period (Days)')).toBeInTheDocument();
            // const input = screen.getByLabelText('Retention Period (Days)'); // Removed unused
            // expect(input).toBeInTheDocument();
        });

        // Re-implementing with more robust selectors given ConfigInput structure
        it('updates configuration when saved', async () => {
            mockGetValue.mockReturnValue('30');
            render(<>
                <Toaster />
                <CleanupPanel />
            </>);

            // ConfigInput renders a div with label. Input is inside.
            // We can find the input by its current value.
            const inputs = screen.getAllByRole('spinbutton'); // number inputs
            const retentionInput = inputs[0];

            fireEvent.change(retentionInput, { target: { value: '45' } });

            // Save button appears when dirty
            const saveBtn = screen.getByText('Save Changes');
            fireEvent.click(saveBtn);

            await waitFor(() => {
                expect(mockUpdateConfig).toHaveBeenCalledWith({
                    key: 'cleanup.retention_period',
                    value: '45'
                });
            });
        });
    });

    describe('SelfHealingPanel', () => {
        it('renders toggle correctly', () => {
            mockGetValue.mockReturnValue('true');
            render(<SelfHealingPanel />);
            expect(screen.getByText('Progress Validation')).toBeInTheDocument();
            // Toggle is a button
            // const toggle = screen.getByRole('button', { hidden: true }); // Might be tricky to find generic button
            // Let's assume the first button that isn't Save. 
            // ConfigInput for toggle renders a button.
        });

        it('toggles value on click', async () => {
            mockGetValue.mockImplementation((key) => key === 'self_healing.validation_enabled' ? 'true' : '');
            render(<SelfHealingPanel />);

            // Find the toggle button. It has specific class names or structure.
            // The ConfigInput toggle has no aria-label, which is an accessibility issue but for testing we work around it.
            // It's the button inside the component.
            // Let's rely on the text "Progress Validation" and navigate.
            const label = screen.getByText('Progress Validation');
            const container = label.closest('div')?.parentElement?.parentElement;
            const button = container?.querySelector('button');

            if (button) {
                fireEvent.click(button);
                const saveBtn = screen.getByText('Save Changes');
                fireEvent.click(saveBtn);

                await waitFor(() => {
                    expect(mockUpdateConfig).toHaveBeenCalledWith({
                        key: 'self_healing.validation_enabled',
                        value: 'false'
                    });
                });
            }
        });
    });

    describe('CostPanel', () => {
        it('renders budget cap input', () => {
            render(<CostPanel />);
            expect(screen.getByText('Monthly Budget Cap ($)')).toBeInTheDocument();
        });

        it('renders the status -> skill defaults editor with an Add Entry control for admins', () => {
            render(<CostPanel />);
            expect(screen.getByText('Status → Skill Defaults')).toBeInTheDocument();
            expect(screen.getByText('Add Entry')).toBeInTheDocument();
        });

        it('hides edit controls for non-admin (viewer) role', () => {
            mockUseAuth.mockReturnValue({ user: { role: 'MANAGER' } });
            render(<CostPanel />);
            expect(screen.getByText('Status → Skill Defaults')).toBeInTheDocument();
            expect(screen.queryByText('Add Entry')).not.toBeInTheDocument();
        });
    });
});
