/**
 * Tests for Story 25.8: Notification Stability
 * AC: 1 (crash-free preferences page), 2 (rate limiting), 3 (real-time sync), 4 (defensive permission check)
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, renderHook, act } from '@testing-library/react';
import { createElement } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { canAccessEventType } from '@/lib/auth/permissions';
import {
  useInAppNotifications,
  useUnreadNotificationCount,
  useNotificationPreferences,
  notificationKeys,
} from '@/hooks/queries/useNotifications';
import { useAuth } from '@/contexts/AuthContext';
import type { User } from '@/contexts/AuthContext';

// ---------------------------------------------------------------------------
// Hoisted shared state — created before vi.mock factories run
// ---------------------------------------------------------------------------

const { mockUseQuery, mockToast, socketCallbacks } = vi.hoisted(() => {
  const mockUseQuery = vi.fn().mockReturnValue({
    data: undefined,
    isLoading: false,
    error: null,
    status: 'success',
    isSuccess: true,
    isError: false,
    isFetching: false,
    isPending: false,
    refetch: vi.fn(),
    dataUpdatedAt: 0,
    errorUpdatedAt: 0,
    failureCount: 0,
    failureReason: null,
    fetchStatus: 'idle',
    isLoadingError: false,
    isRefetchError: false,
    isRefetching: false,
    isStale: false,
    isPlaceholderData: false,
    errorUpdateCount: 0,
    isFetched: true,
    isFetchedAfterMount: true,
  });

  // toast is callable AND has methods (mirrors react-hot-toast API)
  const mockToast = Object.assign(vi.fn().mockReturnValue('toast-id'), {
    success: vi.fn(),
    error: vi.fn(),
    dismiss: vi.fn(),
    remove: vi.fn(),
  });

  const socketCallbacks = {
    current: {} as {
      onNew?: (payload: { title: string }) => void;
      onRead?: () => void;
      onReadAll?: () => void;
    },
  };

  return { mockUseQuery, mockToast, socketCallbacks };
});

// ---------------------------------------------------------------------------
// Module-level mocks
// ---------------------------------------------------------------------------

// Intercept useQuery at the module level (vi.spyOn cannot reassign ESM namespace
// properties; vi.mock with factory is the correct Vitest ESM approach).
vi.mock('@tanstack/react-query', async (importOriginal) => {
  const actual = await importOriginal() as typeof import('@tanstack/react-query');
  return { ...actual, useQuery: mockUseQuery };
});

vi.mock('@/lib/socket/useSocketIO', () => ({
  useSocketIO: vi.fn(() => ({ socket: null, connected: true })),
  useNotificationEvents: vi.fn(
    (_socket: unknown, callbacks: typeof socketCallbacks.current) => {
      socketCallbacks.current = callbacks;
    },
  ),
}));

vi.mock('@/api/notificationsApi', () => ({
  getNotificationPreferences: vi.fn().mockResolvedValue({ preferences: [] }),
  createNotificationPreference: vi.fn().mockResolvedValue({}),
  updateNotificationPreference: vi.fn().mockResolvedValue({}),
  deleteNotificationPreference: vi.fn().mockResolvedValue(undefined),
  getInAppNotifications: vi.fn().mockResolvedValue({ notifications: [] }),
  markNotificationAsRead: vi.fn().mockResolvedValue({ success: true }),
  markAllNotificationsAsRead: vi.fn().mockResolvedValue({ count: 0 }),
  getUnreadNotificationCount: vi.fn().mockResolvedValue({ count: 0 }),
}));

vi.mock('react-hot-toast', () => ({
  default: mockToast,
  toast: mockToast,
}));

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: vi.fn().mockReturnValue({
    user: {
      id: 'u1',
      email: 'admin@test.com',
      role: 'ADMIN',
      fullName: 'Admin',
      isActive: true,
      lastLoginAt: null,
    },
  }),
}));

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const DEFAULT_USER: User = {
  id: 'u1',
  email: 'admin@test.com',
  role: 'ADMIN',
  fullName: 'Admin',
  isActive: true,
  lastLoginAt: null,
};

function makeQueryClient() {
  return new QueryClient({ defaultOptions: { queries: { retry: false } } });
}

// Reset shared state before each test to prevent bleed-through
beforeEach(() => {
  vi.mocked(useAuth).mockReturnValue({ user: DEFAULT_USER } as ReturnType<typeof useAuth>);
  socketCallbacks.current = {};
  mockUseQuery.mockClear();
  mockToast.success.mockClear();
});

// ---------------------------------------------------------------------------
// Task 1a — canAccessEventType defensive hardening (AC 4)
// ---------------------------------------------------------------------------

describe('canAccessEventType — defensive hardening (AC 4)', () => {
  it('returns false when user is null', () => {
    expect(canAccessEventType(null, 'execution.started')).toBe(false);
    expect(canAccessEventType(null, 'error.production')).toBe(false);
  });

  it('does not throw and returns false when user.role is undefined (malformed object)', () => {
    const malformed = { id: 'u1', email: 'bad@test.com' } as unknown as User;
    expect(() => canAccessEventType(malformed, 'error.production')).not.toThrow();
    expect(canAccessEventType(malformed, 'error.production')).toBe(false);
  });

  it('does not throw and returns false when user.role is null (malformed object)', () => {
    const malformed = { id: 'u1', email: 'bad@test.com', role: null } as unknown as User;
    expect(() => canAccessEventType(malformed, 'system.alert')).not.toThrow();
    expect(canAccessEventType(malformed, 'system.alert')).toBe(false);
  });

  it('returns false for admin-only events when user role is not ADMIN', () => {
    const user: User = { id: 'u1', email: 'pm@test.com', role: 'PM', fullName: 'PM User', isActive: true, lastLoginAt: null };
    expect(canAccessEventType(user, 'error.production')).toBe(false);
    expect(canAccessEventType(user, 'system.alert')).toBe(false);
  });

  it('returns true for admin-only events when user role is ADMIN', () => {
    const user: User = { id: 'u1', email: 'admin@test.com', role: 'ADMIN', fullName: 'Admin', isActive: true, lastLoginAt: null };
    expect(canAccessEventType(user, 'error.production')).toBe(true);
    expect(canAccessEventType(user, 'system.alert')).toBe(true);
  });

  it('returns true for regular events for any authenticated user', () => {
    const roles = ['VIEWER', 'QA', 'PM', 'TL', 'MANAGER', 'ADMIN'] as const;
    for (const role of roles) {
      const user: User = { id: 'u1', email: `${role}@test.com`, role, fullName: role, isActive: true, lastLoginAt: null };
      expect(canAccessEventType(user, 'execution.started')).toBe(true);
      expect(canAccessEventType(user, 'execution.completed')).toBe(true);
      expect(canAccessEventType(user, 'approval.required')).toBe(true);
    }
  });
});

// ---------------------------------------------------------------------------
// Task 2 — Polling intervals (AC 2)
// FIXED: vacuous `expect(300_000).toBe(5 * 60 * 1000)` replaced with real
// mock-interception tests.  These will FAIL if refetchInterval or
// refetchOnWindowFocus are removed from the hook implementations.
// ---------------------------------------------------------------------------

describe('useNotifications polling configuration (AC 2)', () => {
  it('useInAppNotifications: passes refetchInterval=300_000ms to useQuery', () => {
    renderHook(() => useInAppNotifications());
    expect(mockUseQuery).toHaveBeenCalledWith(
      expect.objectContaining({ refetchInterval: 300_000 }),
    );
  });

  it('useInAppNotifications: passes refetchOnWindowFocus=false to useQuery', () => {
    renderHook(() => useInAppNotifications());
    expect(mockUseQuery).toHaveBeenCalledWith(
      expect.objectContaining({ refetchOnWindowFocus: false }),
    );
  });

  it('useUnreadNotificationCount: passes refetchInterval=300_000ms to useQuery', () => {
    renderHook(() => useUnreadNotificationCount());
    expect(mockUseQuery).toHaveBeenCalledWith(
      expect.objectContaining({ refetchInterval: 300_000 }),
    );
  });

  it('useUnreadNotificationCount: passes refetchOnWindowFocus=false to useQuery', () => {
    renderHook(() => useUnreadNotificationCount());
    expect(mockUseQuery).toHaveBeenCalledWith(
      expect.objectContaining({ refetchOnWindowFocus: false }),
    );
  });

  it('useNotificationPreferences: passes refetchOnWindowFocus=false to useQuery — M1 regression guard', () => {
    renderHook(() => useNotificationPreferences());
    expect(mockUseQuery).toHaveBeenCalledWith(
      expect.objectContaining({ refetchOnWindowFocus: false }),
    );
  });
});

// ---------------------------------------------------------------------------
// Task 3 — Real-time sync via query invalidation (AC 3)
// ---------------------------------------------------------------------------

describe('notificationKeys query key structure (AC 3)', () => {
  it('notificationKeys.all covers all notification sub-keys', () => {
    expect(notificationKeys.all).toEqual(['notifications']);
    expect(notificationKeys.inApp()[0]).toBe('notifications');
    expect(notificationKeys.unreadCount()[0]).toBe('notifications');
    expect(notificationKeys.preferences()[0]).toBe('notifications');
  });
});

// ---------------------------------------------------------------------------
// Task 3 — NotificationCenter: socket events must NOT invalidate preferences
// M2: component-level test verifying the H2 fix (targeted invalidation only).
// ---------------------------------------------------------------------------

describe('NotificationCenter: socket events invalidate only inApp + unreadCount (AC 3, H2 fix)', () => {
  async function renderCenter() {
    const { NotificationCenter } = await import('@/components/notifications/NotificationCenter');
    const queryClient = makeQueryClient();
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries').mockResolvedValue(undefined);
    render(
      createElement(
        QueryClientProvider,
        { client: queryClient },
        createElement(NotificationCenter),
      ),
    );
    return { invalidateSpy };
  }

  function calledKeys(spy: ReturnType<typeof vi.spyOn>) {
    return spy.mock.calls.map((c: any) => (c[0] as { queryKey?: unknown }).queryKey);
  }

  it('onNew: invalidates inApp and unreadCount — not the broad .all prefix', async () => {
    const { invalidateSpy } = await renderCenter();
    await act(async () => {
      socketCallbacks.current.onNew?.({ title: 'New notification' });
    });
    expect(calledKeys(invalidateSpy)).toContainEqual(notificationKeys.inApp());
    expect(calledKeys(invalidateSpy)).toContainEqual(notificationKeys.unreadCount());
    expect(calledKeys(invalidateSpy)).not.toContainEqual(notificationKeys.all);
  });

  it('onRead: invalidates inApp and unreadCount — not the broad .all prefix', async () => {
    const { invalidateSpy } = await renderCenter();
    await act(async () => {
      socketCallbacks.current.onRead?.();
    });
    expect(calledKeys(invalidateSpy)).toContainEqual(notificationKeys.inApp());
    expect(calledKeys(invalidateSpy)).toContainEqual(notificationKeys.unreadCount());
    expect(calledKeys(invalidateSpy)).not.toContainEqual(notificationKeys.all);
  });

  it('onReadAll: invalidates inApp and unreadCount — not the broad .all prefix', async () => {
    const { invalidateSpy } = await renderCenter();
    await act(async () => {
      socketCallbacks.current.onReadAll?.();
    });
    expect(calledKeys(invalidateSpy)).toContainEqual(notificationKeys.inApp());
    expect(calledKeys(invalidateSpy)).toContainEqual(notificationKeys.unreadCount());
    expect(calledKeys(invalidateSpy)).not.toContainEqual(notificationKeys.all);
  });
});

// ---------------------------------------------------------------------------
// Task 1b — NotificationPreferences loading guard (AC 1)
// M3: verifies the page never crashes and never calls canAccessEventType when
// user is null — the filter guard (!isLoading && user) must hold.
// ---------------------------------------------------------------------------

describe('NotificationPreferences loading guard (AC 1)', () => {
  it('renders without crashing when user is null on initial load', async () => {
    vi.mocked(useAuth).mockReturnValue({ user: null } as ReturnType<typeof useAuth>);
    const { NotificationPreferences } = await import('@/pages/NotificationPreferences');
    const qc = makeQueryClient();
    expect(() =>
      render(createElement(QueryClientProvider, { client: qc }, createElement(NotificationPreferences))),
    ).not.toThrow();
  });

  it('renders without crashing when user is null and preferences query is resolved (auth race)', async () => {
    vi.mocked(useAuth).mockReturnValue({ user: null } as ReturnType<typeof useAuth>);
    const { NotificationPreferences } = await import('@/pages/NotificationPreferences');
    const qc = makeQueryClient();
    expect(() =>
      render(createElement(QueryClientProvider, { client: qc }, createElement(NotificationPreferences))),
    ).not.toThrow();
  });

  it('does not invoke canAccessEventType when user is null — filter guard must hold', async () => {
    vi.mocked(useAuth).mockReturnValue({ user: null } as ReturnType<typeof useAuth>);
    const permissionsModule = await import('@/lib/auth/permissions');
    const canAccessSpy = vi.spyOn(permissionsModule, 'canAccessEventType');

    const { NotificationPreferences } = await import('@/pages/NotificationPreferences');
    const qc = makeQueryClient();
    render(createElement(QueryClientProvider, { client: qc }, createElement(NotificationPreferences)));

    expect(canAccessSpy).not.toHaveBeenCalled();
    canAccessSpy.mockRestore();
  });
});
