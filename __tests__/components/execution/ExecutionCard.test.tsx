import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { ExecutionCard } from '@/components/execution/ExecutionCard';
import type { Execution } from '@/types/execution';
import { TooltipProvider } from '@/components/ui/tooltip';

// Mock dependencies
vi.mock('@/contexts/AuthContext', () => ({
  useAuth: vi.fn(() => ({
    user: { id: 'user-1', role: 'PM' }
  }))
}));

vi.mock('@/hooks/queries/useExecutions', () => ({
  useControlExecution: vi.fn(() => ({
    mutate: vi.fn(),
    isPending: false
  }))
}));

vi.mock('react-hot-toast', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  }
}));

// Mock the lazy-loaded component
vi.mock('@/components/execution/ContainerActivityTimeline', () => ({
  default: () => <div data-testid="activity-timeline">Timeline Mock</div>
}));

function buildMockExecution(overrides: Partial<Execution>): Execution {
  return {
    id: 'exec-test-1',
    ticketId: 'ticket-1',
    projectId: 'proj-1',
    projectName: 'Test Project',
    status: 'IN_PROGRESS',
    aiProvider: 'claude-code',
    currentStep: 'Building',
    percentComplete: 50,
    startTime: new Date().toISOString(),
    duration: 120,
    ...overrides,
  };
}

describe('ExecutionCard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderCard = (execution: Execution, onResolve?: (id: string) => void) => {
    return render(
      <TooltipProvider>
        <ExecutionCard execution={execution} onResolve={onResolve} />
      </TooltipProvider>
    );
  };

  it('renders QA_FAILED status badge with correct label', () => {
    const execution = buildMockExecution({ status: 'QA_FAILED' });
    renderCard(execution);
    expect(screen.getByText('QA Failed')).toBeInTheDocument();
  });

  it('renders QA failure prompt with retry count when status is QA_FAILED', () => {
    const execution = buildMockExecution({ status: 'QA_FAILED', qaRetryCount: 3 });
    renderCard(execution);
    expect(screen.getByText('QA Failed')).toBeInTheDocument();
    expect(screen.getByText(/QA failed after 3 retries — action required/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /resolve/i })).toBeInTheDocument();
  });

  it('renders singular "retry" for count of 1', () => {
    const execution = buildMockExecution({ status: 'QA_FAILED', qaRetryCount: 1 });
    renderCard(execution);
    expect(screen.getByText(/after 1 retry/i)).toBeInTheDocument();
  });

  it('renders "on first attempt" message when qaRetryCount is 0', () => {
    const execution = buildMockExecution({ status: 'QA_FAILED', qaRetryCount: 0 });
    renderCard(execution);
    expect(screen.getByText(/QA failed on first attempt — action required/i)).toBeInTheDocument();
  });

  it('does not render QA failure prompt for non-QA_FAILED status', () => {
    const execution = buildMockExecution({ status: 'IN_PROGRESS' });
    renderCard(execution);
    expect(screen.queryByRole('button', { name: /resolve/i })).not.toBeInTheDocument();
  });

  it('calls onResolve with executionId when Resolve button is clicked', async () => {
    const onResolve = vi.fn();
    const execution = buildMockExecution({ status: 'QA_FAILED', qaRetryCount: 2 });
    renderCard(execution, onResolve);
    await userEvent.click(screen.getByRole('button', { name: /resolve/i }));
    expect(onResolve).toHaveBeenCalledWith(execution.id);
  });
});
