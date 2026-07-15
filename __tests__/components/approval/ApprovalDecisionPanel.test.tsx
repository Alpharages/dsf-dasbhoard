import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ApprovalDecisionPanel } from '@/components/approval/ApprovalDecisionPanel';

describe('ApprovalDecisionPanel', () => {
  it('blocks approve when persisted review evidence is missing', () => {
    render(
      <ApprovalDecisionPanel
        onSubmit={vi.fn()}
        isSubmitting={false}
        canApprove={false}
        approvalBlockedReason="Review evidence is missing"
      />,
    );

    expect(screen.getByRole('button', { name: /approve & push/i })).toBeDisabled();
    expect(screen.getByRole('alert')).toHaveTextContent('Review evidence is missing');
  });

  it('allows approve when persisted review evidence exists', () => {
    const onSubmit = vi.fn();
    render(
      <ApprovalDecisionPanel onSubmit={onSubmit} isSubmitting={false} canApprove />,
    );

    fireEvent.click(screen.getByRole('button', { name: /submit approve & push/i }));

    expect(onSubmit).toHaveBeenCalledWith('APPROVE', '');
  });
});
