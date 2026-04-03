import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect } from 'vitest';
import { QAResultsPanel } from '@/components/execution/QAResultsPanel';
import type { QAAttempt } from '@/types/execution';

const attempt1Failed: QAAttempt = {
  attemptNumber: 1,
  lintStatus: 'failed',
  lintErrors: { count: 2, details: ['src/foo.ts:10 error', 'src/bar.ts:5 error'] },
  testStatus: 'failed',
  testResults: { passed: 3, failed: 1, details: ['test "foo" failed: expected true'] },
  durationMs: 4200,
};

const attempt2Passed: QAAttempt = {
  attemptNumber: 2,
  lintStatus: 'passed',
  testStatus: 'passed',
  testResults: { passed: 4, failed: 0, details: [] },
  durationMs: 3100,
};

// Test A — empty/null state
it('renders empty state when qaAttempts is null', () => {
  render(<QAResultsPanel qaAttempts={null} />);
  expect(screen.getByText(/No QA attempt data available/i)).toBeInTheDocument();
});

it('renders empty state when qaAttempts is an empty array', () => {
  render(<QAResultsPanel qaAttempts={[]} />);
  expect(screen.getByText(/No QA attempt data available/i)).toBeInTheDocument();
});

// Test B — attempt rows
it('renders attempt rows with correct labels', () => {
  render(<QAResultsPanel qaAttempts={[attempt1Failed, attempt2Passed]} />);
  expect(screen.getByText('Attempt 1')).toBeInTheDocument();
  expect(screen.getByText('Attempt 2')).toBeInTheDocument();
});

// Test C — lint error badge
it('shows lint error count badge on failed lint attempt', () => {
  render(<QAResultsPanel qaAttempts={[attempt1Failed]} />);
  expect(screen.getByText('2 err')).toBeInTheDocument();
});

// Test D — test result counts
it('shows test pass/fail counts', () => {
  render(<QAResultsPanel qaAttempts={[attempt1Failed]} />);
  expect(screen.getByText(/3 passed \/ 1 failed/i)).toBeInTheDocument();
});

// Test E — Self-healed vs Passed badge derivation from array (no qaStatus prop)
describe('outcome badge derivation', () => {
  it('shows Self-healed badge on final passing attempt when prior failures exist', () => {
    render(<QAResultsPanel qaAttempts={[attempt1Failed, attempt2Passed]} />);
    expect(screen.getByText('Self-healed')).toBeInTheDocument();
    expect(screen.getByText('Failed')).toBeInTheDocument();
  });

  it('shows Passed badge (not Self-healed) when only one attempt and it passed', () => {
    render(<QAResultsPanel qaAttempts={[attempt2Passed]} />);
    expect(screen.getByText('Passed')).toBeInTheDocument();
    expect(screen.queryByText('Self-healed')).not.toBeInTheDocument();
  });
});

// Test F — expand/collapse
it('expands lint error details on row toggle', async () => {
  render(<QAResultsPanel qaAttempts={[attempt1Failed]} />);
  const expandBtn = screen.getByRole('button', { name: /Expand details for attempt 1/i });
  await userEvent.click(expandBtn);
  expect(screen.getByText('src/foo.ts:10 error')).toBeInTheDocument();
});

// Test G — aria-live when isLive
it('has aria-live polite when isLive is true', () => {
  const { container } = render(
    <QAResultsPanel qaAttempts={[attempt2Passed]} isLive={true} />,
  );
  expect(container.querySelector('[aria-live="polite"]')).not.toBeNull();
});
