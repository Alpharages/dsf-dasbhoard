import { renderHook } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import type { Socket } from 'socket.io-client';
import { useProjectUpdates } from '@/hooks/useProjectUpdates';
import type { Project, TicketCounts } from '@/types';

const PROJECTS_KEY = ['pm-dashboard-projects', 'u1'] as const;

function makeTickets(overrides: Partial<TicketCounts> = {}): TicketCounts {
    return { total: 3, in_progress: 1, completed: 1, blocked: 0, awaiting_approval: 0, sync_pending: 0, ...overrides };
}

function makeProject(id: string, overrides: Partial<Project> = {}): Project {
    return {
        id,
        name: `Project ${id}`,
        status: 'active',
        pm_id: 'u1',
        client_name: 'Acme',
        created_at: '2026-01-01T00:00:00Z',
        updated_at: '2026-01-01T00:00:00Z',
        tickets: makeTickets(),
        ...overrides,
    } as Project;
}

type Handler = (payload: unknown) => void;

/**
 * Minimal socket double. Holds a *set* of handlers per event, like socket.io does, so that
 * `off(event)` dropping every listener is distinguishable from `off(event, handler)` dropping one.
 */
function makeSocket() {
    const handlers = new Map<string, Set<Handler>>();
    const socket = {
        on: (event: string, cb: Handler) => {
            const set = handlers.get(event) ?? new Set<Handler>();
            set.add(cb);
            handlers.set(event, set);
        },
        off: (event: string, cb?: Handler) => {
            const set = handlers.get(event);
            if (!set) return;
            if (cb) set.delete(cb);
            else set.clear();
            if (set.size === 0) handlers.delete(event);
        },
    } as unknown as Socket;

    return {
        socket,
        emit: (event: string, payload: unknown) => handlers.get(event)?.forEach((cb) => cb(payload)),
        registered: () => [...handlers.keys()],
    };
}

describe('useProjectUpdates', () => {
    let queryClient: QueryClient;

    beforeEach(() => {
        queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    });

    const wrapper = ({ children }: { children: ReactNode }) => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );

    function mount() {
        const { socket, emit, registered } = makeSocket();
        const view = renderHook(() => useProjectUpdates(socket, PROJECTS_KEY), { wrapper });
        return { socket, emit, registered, ...view };
    }

    it('writes project-updated into the projects query cache', () => {
        queryClient.setQueryData<Project[]>(PROJECTS_KEY, [makeProject('p1'), makeProject('p2')]);
        const { emit } = mount();

        emit('project-updated', makeProject('p2', { name: 'Renamed' }));

        const cached = queryClient.getQueryData<Project[]>(PROJECTS_KEY);
        expect(cached?.map((p) => p.name)).toEqual(['Project p1', 'Renamed']);
    });

    it('replaces ticket counts on ticket-updated for the matching project only', () => {
        queryClient.setQueryData<Project[]>(PROJECTS_KEY, [makeProject('p1'), makeProject('p2')]);
        const { emit } = mount();

        emit('ticket-updated', { project_id: 'p1', tickets: makeTickets({ total: 99 }) });

        const cached = queryClient.getQueryData<Project[]>(PROJECTS_KEY);
        expect(cached?.[0].tickets.total).toBe(99);
        expect(cached?.[1].tickets.total).toBe(3);
    });

    it('increments sync_pending on pm-sync-failed', () => {
        queryClient.setQueryData<Project[]>(PROJECTS_KEY, [makeProject('p1')]);
        const { emit } = mount();

        emit('pm-sync-failed', { projectId: 'p1', ticketId: 't1', provider: 'clickup', reason: 'x', missingFields: [] });

        expect(queryClient.getQueryData<Project[]>(PROJECTS_KEY)?.[0].tickets.sync_pending).toBe(1);
    });

    // Regression: seeding `[]` here would give the cache a fresh dataUpdatedAt, and the
    // projects query's 60s staleTime would then skip its initial fetch.
    it('does not create a cache entry when no projects have loaded yet', () => {
        const { emit } = mount();

        emit('project-updated', makeProject('p1'));
        emit('ticket-updated', { project_id: 'p1', tickets: makeTickets() });
        emit('pm-sync-failed', { projectId: 'p1', ticketId: 't1', provider: 'clickup', reason: 'x', missingFields: [] });

        expect(queryClient.getQueryData(PROJECTS_KEY)).toBeUndefined();
    });

    it('unsubscribes its socket handlers on unmount', () => {
        const { registered, unmount } = mount();
        expect(registered()).toEqual(['project-updated', 'ticket-updated', 'pm-sync-failed']);

        unmount();

        expect(registered()).toEqual([]);
    });

    // Regression: Dashboard registers its own pm-sync-failed toast listener on the same socket.
    // Cleaning up with the one-arg `socket.off('pm-sync-failed')` would drop that one too.
    it('leaves another listener on the same event intact when it unmounts', () => {
        const { socket, emit, unmount } = mount();
        const sibling = vi.fn();
        socket.on('pm-sync-failed', sibling);

        unmount();
        emit('pm-sync-failed', { projectId: 'p1' });

        expect(sibling).toHaveBeenCalledTimes(1);
    });
});
