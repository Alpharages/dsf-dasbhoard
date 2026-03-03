import { render, screen, fireEvent } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NotificationCenter } from '@/components/notifications/NotificationCenter';
import {
  useUnreadNotificationCount,
  useInAppNotifications,
  useMarkAllNotificationsAsRead,
} from '@/hooks/queries/useNotifications';
import { useSocketIO } from '@/lib/socket/useSocketIO';

// Mocks
vi.mock('@/hooks/queries/useNotifications', () => ({
  useInAppNotifications: vi.fn().mockReturnValue({ data: [], isLoading: false }),
  useUnreadNotificationCount: vi.fn().mockReturnValue({ data: 0, isError: false }),
  useMarkNotificationAsRead: vi.fn().mockReturnValue({ mutate: vi.fn(), mutateAsync: vi.fn(), isPending: false }),
  useMarkAllNotificationsAsRead: vi.fn().mockReturnValue({ mutate: vi.fn(), mutateAsync: vi.fn().mockResolvedValue({ count: 0 }), isPending: false }),
  notificationKeys: {
    inApp: vi.fn(),
    unreadCount: vi.fn(),
  },
}));

vi.mock('@/lib/socket/useSocketIO', () => ({
  useSocketIO: vi.fn().mockReturnValue({ socket: null, connected: true }),
  useNotificationEvents: vi.fn(),
}));

vi.mock('@tanstack/react-query', () => ({
  useQueryClient: vi.fn().mockReturnValue({ invalidateQueries: vi.fn() }),
}));

const MOCK_NOTIFICATION = {
  id: '1',
  title: 'Test Notification',
  message: 'Something happened',
  read: false,
  eventType: 'execution.completed',
  createdAt: new Date().toISOString(),
};

describe('NotificationCenter', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useUnreadNotificationCount).mockReturnValue({ data: 0, isError: false } as any);
    vi.mocked(useSocketIO).mockReturnValue({ socket: null, connected: true } as any);
    vi.mocked(useInAppNotifications).mockReturnValue({ data: [], isLoading: false } as any);
    vi.mocked(useMarkAllNotificationsAsRead).mockReturnValue({
      mutate: vi.fn(),
      mutateAsync: vi.fn().mockResolvedValue({ count: 0 }),
      isPending: false,
    } as any);
  });

  // --- Badge visibility ---

  it('renders without badge when unread count is 0', () => {
    render(<NotificationCenter />);

    expect(screen.getByRole('button', { name: 'Notifications' })).toBeInTheDocument();
    // No numeric badge text should appear in the trigger area
    expect(screen.queryByText(/^\d+$|^99\+$/)).not.toBeInTheDocument();
  });

  it('renders badge with correct unread count', () => {
    vi.mocked(useUnreadNotificationCount).mockReturnValue({ data: 5, isError: false } as any);
    render(<NotificationCenter />);

    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('5')).toHaveClass('bg-rose-500', 'text-white', 'border-background');
  });

  it('renders "99+" when unread count exceeds 99', () => {
    vi.mocked(useUnreadNotificationCount).mockReturnValue({ data: 150, isError: false } as any);
    render(<NotificationCenter />);

    expect(screen.getByText('99+')).toBeInTheDocument();
  });

  // --- Accessibility (aria-label) ---

  it('has accessible label "Notifications" when count is zero', () => {
    render(<NotificationCenter />);

    expect(screen.getByRole('button', { name: 'Notifications' })).toBeInTheDocument();
  });

  it('has accessible label that includes unread count when above zero', () => {
    vi.mocked(useUnreadNotificationCount).mockReturnValue({ data: 7, isError: false } as any);
    render(<NotificationCenter />);

    expect(screen.getByRole('button', { name: 'Notifications, 7 unread' })).toBeInTheDocument();
  });

  // --- Error state ---

  it('renders "?" badge when unread count fetch fails', () => {
    vi.mocked(useUnreadNotificationCount).mockReturnValue({ data: 0, isError: true } as any);
    render(<NotificationCenter />);

    expect(screen.getByText('?')).toBeInTheDocument();
  });

  it('has accessible label indicating count unavailable when fetch fails', () => {
    vi.mocked(useUnreadNotificationCount).mockReturnValue({ data: 0, isError: true } as any);
    render(<NotificationCenter />);

    expect(
      screen.getByRole('button', { name: 'Notifications (count unavailable)' }),
    ).toBeInTheDocument();
  });

  // --- Socket disconnection indicator ---

  it('renders disconnection indicator when socket is not connected', () => {
    vi.mocked(useSocketIO).mockReturnValue({ socket: null, connected: false } as any);
    render(<NotificationCenter />);

    expect(screen.getByTestId('socket-disconnected-indicator')).toBeInTheDocument();
  });

  it('does not render disconnection indicator when socket is connected', () => {
    render(<NotificationCenter />);

    expect(screen.queryByTestId('socket-disconnected-indicator')).not.toBeInTheDocument();
  });

  // --- Dropdown interaction ---

  it('opens dropdown and exposes mark-all-read button when bell is clicked', async () => {
    const mockMutateAsync = vi.fn().mockResolvedValue({ count: 1 });
    vi.mocked(useMarkAllNotificationsAsRead).mockReturnValue({
      mutate: vi.fn(),
      mutateAsync: mockMutateAsync,
      isPending: false,
    } as any);
    vi.mocked(useInAppNotifications).mockReturnValue({
      data: [MOCK_NOTIFICATION],
      isLoading: false,
    } as any);
    vi.mocked(useUnreadNotificationCount).mockReturnValue({ data: 1, isError: false } as any);

    render(<NotificationCenter />);

    fireEvent.click(screen.getByRole('button', { name: 'Notifications, 1 unread' }));

    const markAllBtn = await screen.findByRole('button', { name: /mark all read/i });
    expect(markAllBtn).toBeInTheDocument();

    fireEvent.click(markAllBtn);
    expect(mockMutateAsync).toHaveBeenCalledTimes(1);
  });
});
