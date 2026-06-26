import { useState, useCallback, memo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { 
  Bell, 
  Check, 
  CheckCheck, 
  Loader2,
  Mail,
  AlertCircle
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'react-hot-toast';
import { useSocketIO, useNotificationEvents } from '@/lib/socket/useSocketIO';
import {
  useInAppNotifications,
  useUnreadNotificationCount,
  useMarkNotificationAsRead,
  useMarkAllNotificationsAsRead,
  notificationKeys,
} from '@/hooks/queries/useNotifications';
import type { InAppNotification } from '@/types/notifications';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';

interface NotificationCenterProps {
  maxNotifications?: number;
}

const EVENT_TYPE_ICONS: Record<string, React.ReactNode> = {
  'execution.started': <Loader2 className="w-4 h-4" />,
  'execution.completed': <Check className="w-4 h-4" />,
  'execution.failed': <AlertCircle className="w-4 h-4" />,
  'execution.paused': <Loader2 className="w-4 h-4" />,
  'execution.resumed': <Loader2 className="w-4 h-4" />,
  'execution.timeout': <AlertCircle className="w-4 h-4" />,
  'execution.cancelled': <AlertCircle className="w-4 h-4" />,
  'quality_gate.failed': <AlertCircle className="w-4 h-4" />,
  'quality_gate.passed': <Check className="w-4 h-4" />,
  'approval.required': <Mail className="w-4 h-4" />,
  'deployment.completed': <Check className="w-4 h-4" />,
  'error.production': <AlertCircle className="w-4 h-4" />,
};

const EVENT_TYPE_COLORS: Record<string, string> = {
  'execution.started': 'text-blue-400',
  'execution.completed': 'text-emerald-400',
  'execution.failed': 'text-rose-400',
  'execution.paused': 'text-yellow-400',
  'execution.resumed': 'text-blue-400',
  'execution.timeout': 'text-orange-400',
  'execution.cancelled': 'text-muted-foreground',
  'quality_gate.failed': 'text-rose-400',
  'quality_gate.passed': 'text-emerald-400',
  'approval.required': 'text-blue-400',
  'deployment.completed': 'text-emerald-400',
  'error.production': 'text-rose-400',
};

export const NotificationCenter = memo(function NotificationCenter({ maxNotifications = 10 }: NotificationCenterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const queryClient = useQueryClient();

  // Socket connection
  const { socket, connected } = useSocketIO();

  // Fetch notifications
  const {
    data: notifications = [],
    isLoading,
  } = useInAppNotifications({ limit: maxNotifications });

  // Fetch unread count
  const { data: unreadCount = 0, isError: countFetchFailed } = useUnreadNotificationCount();

  // Mutations
  const markAsRead = useMarkNotificationAsRead();
  const markAllAsRead = useMarkAllNotificationsAsRead();

  // Rely solely on query data — React Query is the single source of truth (AC 3)
  const allNotifications = notifications.slice(0, maxNotifications);

  // Handle real-time notification events via query invalidation (AC 3)
  // Invalidate only the inbox and count queries — not notificationKeys.all, which
  // would unnecessarily bust the preferences cache on every socket event.
  useNotificationEvents(socket, {
    onNew: useCallback((payload: import('@/lib/socket/socketEvents').NotificationPayload) => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.inApp() });
      queryClient.invalidateQueries({ queryKey: notificationKeys.unreadCount() });
      toast.success(payload.title);
    }, [queryClient]),
    onRead: useCallback(() => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.inApp() });
      queryClient.invalidateQueries({ queryKey: notificationKeys.unreadCount() });
    }, [queryClient]),
    onReadAll: useCallback(() => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.inApp() });
      queryClient.invalidateQueries({ queryKey: notificationKeys.unreadCount() });
    }, [queryClient]),
  });

  // Handle mark as read — mutation's onSuccess already invalidates queries via useNotifications
  const handleMarkAsRead = async (notificationId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await markAsRead.mutateAsync(notificationId);
  };

  // Handle mark all as read
  const handleMarkAllAsRead = async () => {
    await markAllAsRead.mutateAsync();
  };

  // Format badge count (only called when count > 0)
  const formatBadgeCount = (count: number): string => {
    if (count > 99) return '99+';
    return String(count);
  };

  // Handle notification click
  const handleNotificationClick = (notification: InAppNotification) => {
    if (!notification.read) {
      markAsRead.mutate(notification.id);
    }
    setIsOpen(false);
    // TODO: Navigate to relevant page based on notification type
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <button
          aria-label={
            countFetchFailed
              ? 'Notifications (count unavailable)'
              : unreadCount > 0
                ? `Notifications, ${unreadCount} unread`
                : 'Notifications'
          }
          className="relative p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-full transition-colors"
        >
          <Bell className="w-5 h-5" />
          {countFetchFailed ? (
            <span
              aria-hidden="true"
              className="absolute top-0 right-0 z-10 min-w-[18px] h-[18px] flex items-center justify-center px-1 bg-yellow-500 text-white text-[10px] font-bold rounded-full border-2 border-background"
            >
              ?
            </span>
          ) : unreadCount > 0 ? (
            <span className="absolute top-0 right-0 z-10 min-w-[18px] h-[18px] flex items-center justify-center px-1 bg-rose-500 text-white text-[10px] font-bold rounded-full border-2 border-background">
              {formatBadgeCount(unreadCount)}
            </span>
          ) : null}
          {!connected && (
            <span
              data-testid="socket-disconnected-indicator"
              className="absolute bottom-1 right-1 w-2 h-2 bg-yellow-500 rounded-full border-2 border-background"
            />
          )}
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent 
        align="end" 
        className="w-96 bg-card border-border p-0"
        sideOffset={8}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-foreground">Notifications</h3>
            {unreadCount > 0 && (
              <Badge variant="secondary" className="bg-blue-500/20 text-blue-400">
                {unreadCount} new
              </Badge>
            )}
          </div>
          {allNotifications.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMarkAllAsRead}
              disabled={markAllAsRead.isPending || unreadCount === 0}
              className="h-8 text-xs text-muted-foreground hover:text-foreground"
            >
              {markAllAsRead.isPending ? (
                <Loader2 className="w-3 h-3 mr-1 animate-spin" />
              ) : (
                <CheckCheck className="w-3 h-3 mr-1" />
              )}
              Mark all read
            </Button>
          )}
        </div>

        {/* Notifications List */}
        <ScrollArea className="max-h-[400px]">
          {isLoading ? (
            <div className="p-4 space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex gap-3">
                  <Skeleton className="w-8 h-8 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : allNotifications.length === 0 ? (
            <div className="py-12 text-center">
              <Bell className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground text-sm">No notifications</p>
              <p className="text-muted-foreground text-xs mt-1">
                You&apos;ll see notifications here when events occur
              </p>
            </div>
          ) : (
            <div className="py-2">
              {allNotifications.map((notification) => (
                <DropdownMenuItem
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className={`px-4 py-3 cursor-pointer focus:bg-muted ${
                    !notification.read ? 'bg-muted/50' : ''
                  }`}
                >
                  <div className="flex gap-3 w-full">
                    {/* Icon */}
                    <div className={`shrink-0 w-8 h-8 rounded-full bg-muted flex items-center justify-center ${
                      EVENT_TYPE_COLORS[notification.eventType] || 'text-muted-foreground'
                    }`}>
                      {EVENT_TYPE_ICONS[notification.eventType] || <Bell className="w-4 h-4" />}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className={`text-sm font-medium truncate ${
                          !notification.read ? 'text-foreground' : 'text-muted-foreground'
                        }`}>
                          {notification.title}
                        </p>
                        {!notification.read && (
                          <span className="w-2 h-2 bg-blue-500 rounded-full shrink-0 mt-1.5" />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                        {notification.message}
                      </p>
                      <p className="text-[10px] text-muted-foreground mt-1">
                        {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                      </p>
                    </div>

                    {/* Mark as read button */}
                    {!notification.read && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => handleMarkAsRead(notification.id, e)}
                        className="shrink-0 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 hover:opacity-100"
                      >
                        <Check className="w-3 h-3" />
                      </Button>
                    )}
                  </div>
                </DropdownMenuItem>
              ))}
            </div>
          )}
        </ScrollArea>

        {/* Footer */}
        {allNotifications.length > 0 && (
          <>
            <DropdownMenuSeparator className="bg-muted" />
            <div className="px-4 py-2">
              <Button
                variant="ghost"
                size="sm"
                className="w-full text-muted-foreground hover:text-foreground"
                onClick={() => {
                  setIsOpen(false);
                  // TODO: Navigate to full notifications page
                  toast('Full notifications page coming soon');
                }}
              >
                View all notifications
              </Button>
            </div>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
});
