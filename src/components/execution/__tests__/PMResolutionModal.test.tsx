import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { PMResolutionModal } from '../PMResolutionModal';

// Mock the API function — vi.mock hoisting applies
vi.mock('@/api/executionsApi', () => ({
  resolveQaFailure: vi.fn(),
}));
// Mock react-hot-toast — avoid actual DOM side effects
vi.mock('react-hot-toast', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

import { resolveQaFailure } from '@/api/executionsApi';
const mockResolveQaFailure = resolveQaFailure as ReturnType<typeof vi.fn>;

const defaultProps = {
  isOpen: true,
  executionId: 'exec-abc-123',
  branchName: 'feature/fix-ticket-abc',
  branchUrl: 'https://github.com/org/repo/tree/feature/fix-ticket-abc',
  errorMessage: 'lint: 3 errors in src/foo.ts',
  onClose: vi.fn(),
  onResolved: vi.fn(),
};

describe('PMResolutionModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders branch name and QA error message', () => {
    render(<PMResolutionModal {...defaultProps} />);
    expect(screen.getByText('feature/fix-ticket-abc')).toBeInTheDocument();
    expect(screen.getByText(/lint: 3 errors/i)).toBeInTheDocument();
  });

  it('shows confirmation step when Open PR Anyway is clicked', async () => {
    render(<PMResolutionModal {...defaultProps} />);
    await userEvent.click(screen.getByRole('button', { name: /open a pull request despite failing qa/i }));
    expect(screen.getByText(/are you sure\?/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /confirm opening a pr/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /go back/i })).toBeInTheDocument();
  });

  it('returns to idle state when Back is clicked from confirmation', async () => {
    render(<PMResolutionModal {...defaultProps} />);
    await userEvent.click(screen.getByRole('button', { name: /open a pull request despite failing qa/i }));
    await userEvent.click(screen.getByRole('button', { name: /go back/i }));
    expect(screen.queryByText(/are you sure\?/i)).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /open a pull request despite failing qa/i })).toBeInTheDocument();
  });

  it('calls onResolved and onClose on successful open_pr', async () => {
    mockResolveQaFailure.mockResolvedValueOnce({ action: 'open_pr', prUrl: 'https://github.com/pr/1', prNumber: 42 });
    render(<PMResolutionModal {...defaultProps} />);
    await userEvent.click(screen.getByRole('button', { name: /open a pull request despite failing qa/i }));
    await userEvent.click(screen.getByRole('button', { name: /confirm opening a pr/i }));
    await waitFor(() => expect(defaultProps.onResolved).toHaveBeenCalledWith(
      expect.objectContaining({ action: 'open_pr', prNumber: 42 })
    ));
    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  it('shows cancellation confirmation message on successful cancel', async () => {
    mockResolveQaFailure.mockResolvedValueOnce({ action: 'cancel', branchName: 'feature/fix-ticket-abc' });
    render(<PMResolutionModal {...defaultProps} />);
    await userEvent.click(screen.getByRole('button', { name: /cancel this execution/i }));
    await waitFor(() =>
      expect(screen.getByText(/execution cancelled/i)).toBeInTheDocument()
    );
    expect(defaultProps.onResolved).toHaveBeenCalledWith(expect.objectContaining({ action: 'cancel' }));
  });

  // P7: assert onClose fires after the 2s cancel auto-close timer
  it('auto-closes after 2s when cancel succeeds', async () => {
    vi.useFakeTimers();
    mockResolveQaFailure.mockResolvedValueOnce({ action: 'cancel', branchName: 'feature/fix-ticket-abc' });
    render(<PMResolutionModal {...defaultProps} />);
    await userEvent.click(screen.getByRole('button', { name: /cancel this execution/i }));
    await waitFor(() =>
      expect(screen.getByText(/execution cancelled/i)).toBeInTheDocument()
    );
    expect(defaultProps.onClose).not.toHaveBeenCalled();
    vi.advanceTimersByTime(2000);
    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
  });

  it('shows 404 error message inline without closing', async () => {
    mockResolveQaFailure.mockRejectedValueOnce({ response: { status: 404 } });
    render(<PMResolutionModal {...defaultProps} />);
    await userEvent.click(screen.getByRole('button', { name: /open a pull request despite failing qa/i }));
    await userEvent.click(screen.getByRole('button', { name: /confirm opening a pr/i }));
    await waitFor(() =>
      expect(screen.getByText(/execution not found/i)).toBeInTheDocument()
    );
    expect(defaultProps.onClose).not.toHaveBeenCalled();
  });

  it('shows 422 error message inline without closing', async () => {
    mockResolveQaFailure.mockRejectedValueOnce({ response: { status: 422 } });
    render(<PMResolutionModal {...defaultProps} />);
    await userEvent.click(screen.getByRole('button', { name: /open a pull request despite failing qa/i }));
    await userEvent.click(screen.getByRole('button', { name: /confirm opening a pr/i }));
    await waitFor(() =>
      expect(screen.getByText(/invalid action/i)).toBeInTheDocument()
    );
    expect(defaultProps.onClose).not.toHaveBeenCalled();
  });

  it('auto-closes after 3s when 409 error is returned', async () => {
    vi.useFakeTimers();
    mockResolveQaFailure.mockRejectedValueOnce({ response: { status: 409 } });
    render(<PMResolutionModal {...defaultProps} />);
    await userEvent.click(screen.getByRole('button', { name: /open a pull request despite failing qa/i }));
    await userEvent.click(screen.getByRole('button', { name: /confirm opening a pr/i }));
    await waitFor(() =>
      expect(screen.getByText(/no longer in QA Failed state/i)).toBeInTheDocument()
    );
    expect(defaultProps.onClose).not.toHaveBeenCalled();
    vi.advanceTimersByTime(3000);
    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
  });
});
