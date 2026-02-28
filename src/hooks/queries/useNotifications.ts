/**
 * Notifications Query Hooks
 * TanStack Query hooks for notification data fetching and caching
 */

import { 
  useQuery, 
  useMutation, 
  useQueryClient,
  type UseQueryOptions 
} from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import {
  getNotificationPreferences,
  createNotificationPreference,
  updateNotificationPreference,
  deleteNotificationPreference,
  getInAppNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  getUnreadNotificationCount,
} from '@/api/notificationsApi';
import type {
  NotificationPreference,
  InAppNotification,
  CreatePreferenceRequest,
  UpdatePreferenceRequest,
  MarkAsReadResponse,
} from '@/types/notifications';

// Query keys
export const notificationKeys = {
  all: ['notifications'] as const,
  preferences: () => [...notificationKeys.all, 'preferences'] as const,
  inApp: () => [...notificationKeys.all, 'in-app'] as const,
  inAppUnread: () => [...notificationKeys.inApp(), 'unread'] as const,
  unreadCount: () => [...notificationKeys.all, 'unread-count'] as const,
};

// ============================================================================
// Preference Queries & Mutations
// ============================================================================

/**
 * Hook to fetch notification preferences
 */
export function useNotificationPreferences(
  options?: Omit<UseQueryOptions<NotificationPreference[], Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: notificationKeys.preferences(),
    queryFn: () => getNotificationPreferences().then(r => r.preferences),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false, // Prevent 429 bursts on tab switching (QA-FR12)
    ...options,
  });
}

/**
 * Hook to create a notification preference
 */
export function useCreateNotificationPreference() {
  const queryClient = useQueryClient();

  return useMutation<NotificationPreference, Error, CreatePreferenceRequest>({
    mutationFn: createNotificationPreference,
    onSuccess: () => {
      toast.success('Notification preference created');
      queryClient.invalidateQueries({ queryKey: notificationKeys.preferences() });
    },
    onError: (error) => {
      toast.error(`Failed to create preference: ${error.message}`);
    },
  });
}

/**
 * Hook to update a notification preference
 */
export function useUpdateNotificationPreference() {
  const queryClient = useQueryClient();

  return useMutation<
    NotificationPreference, 
    Error, 
    { preferenceId: string; data: UpdatePreferenceRequest }
  >({
    mutationFn: ({ preferenceId, data }) => updateNotificationPreference(preferenceId, data),
    onSuccess: () => {
      toast.success('Notification preference updated');
      queryClient.invalidateQueries({ queryKey: notificationKeys.preferences() });
    },
    onError: (error) => {
      toast.error(`Failed to update preference: ${error.message}`);
    },
  });
}

/**
 * Hook to delete a notification preference
 */
export function useDeleteNotificationPreference() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: deleteNotificationPreference,
    onSuccess: () => {
      toast.success('Notification preference deleted');
      queryClient.invalidateQueries({ queryKey: notificationKeys.preferences() });
    },
    onError: (error) => {
      toast.error(`Failed to delete preference: ${error.message}`);
    },
  });
}

// ============================================================================
// In-App Notification Queries & Mutations
// ============================================================================

/**
 * Hook to fetch in-app notifications
 */
export function useInAppNotifications(
  options?: { unreadOnly?: boolean; limit?: number },
  queryOptions?: Omit<UseQueryOptions<InAppNotification[], Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: [...notificationKeys.inApp(), options],
    queryFn: () => getInAppNotifications(options).then(r => r.notifications),
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 300_000, // Poll every 5 min as fallback (QA-FR12: prevent 429 bursts)
    refetchOnWindowFocus: false, // Prevent 429 bursts when switching tabs (QA-NFR7)
    ...queryOptions,
  });
}

/**
 * Hook to get unread notification count
 */
export function useUnreadNotificationCount(
  options?: Omit<UseQueryOptions<number, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: notificationKeys.unreadCount(),
    queryFn: () => getUnreadNotificationCount().then(r => r.count),
    staleTime: 30 * 1000,
    refetchInterval: 300_000, // Poll every 5 min (QA-FR12)
    refetchOnWindowFocus: false, // Prevent 429 bursts on tab switching (QA-NFR7)
    ...options,
  });
}

/**
 * Hook to mark a notification as read
 */
export function useMarkNotificationAsRead() {
  const queryClient = useQueryClient();

  return useMutation<MarkAsReadResponse, Error, string>({
    mutationFn: markNotificationAsRead,
    onSuccess: () => {
      // Invalidate both notifications and count
      queryClient.invalidateQueries({ queryKey: notificationKeys.inApp() });
      queryClient.invalidateQueries({ queryKey: notificationKeys.unreadCount() });
    },
  });
}

/**
 * Hook to mark all notifications as read
 */
export function useMarkAllNotificationsAsRead() {
  const queryClient = useQueryClient();

  return useMutation<{ count: number }, Error, void>({
    mutationFn: markAllNotificationsAsRead,
    onSuccess: (data) => {
      toast.success(`${data.count} notifications marked as read`);
      queryClient.invalidateQueries({ queryKey: notificationKeys.inApp() });
      queryClient.invalidateQueries({ queryKey: notificationKeys.unreadCount() });
    },
    onError: (error) => {
      toast.error(`Failed to mark notifications as read: ${error.message}`);
    },
  });
}
