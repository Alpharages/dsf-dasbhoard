import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi } from 'vitest';
import { InvitationsTable } from '@/components/invitations/InvitationsTable';

const noop = vi.fn();

describe('InvitationsTable', () => {
    it('renders loading skeleton when isLoading is true', () => {
        render(
            <InvitationsTable
                invitations={[]}
                isLoading={true}
                onCopyLink={noop}
                onRevoke={noop}
            />
        );
        // When loading, the filter dropdown and pagination are not present
        expect(screen.queryByText('All Statuses')).toBeNull();
        expect(screen.queryByText('No invitations found.')).toBeNull();
    });

    it('renders empty state without crashing when invitations is an empty array', () => {
        render(
            <InvitationsTable
                invitations={[]}
                isLoading={false}
                onCopyLink={noop}
                onRevoke={noop}
            />
        );
        // Both desktop table and mobile card views render the empty message in jsdom
        const emptyMessages = screen.getAllByText('No invitations found.');
        expect(emptyMessages.length).toBeGreaterThanOrEqual(1);
    });

    it('does not crash when invitations prop is undefined (nullish coalescing guard)', () => {
        // Both useReactTable data and the length display now guard against undefined
        expect(() =>
            render(
                <InvitationsTable
                    invitations={undefined as any}
                    isLoading={false}
                    onCopyLink={noop}
                    onRevoke={noop}
                />
            )
        ).not.toThrow();
    });
});
