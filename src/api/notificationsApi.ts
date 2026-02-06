/**
 * Notifications API Client
 * API calls for notification preferences and in-app notifications
 */

import apiClient from './client';
import type {
  NotificationPreference,
  CreatePreferenceRequest,
  UpdatePreferenceRequest,
  NotificationPreferencesResponse,
  InAppNotificationsResponse,
  MarkAsReadResponse,
  MarkAllAsReadResponse,
} from '@/types/notifications';

const BASE_URL = '/notifications';

// ============================================================================
// Notification Preferences
// ============================================================================

/**
 * Get all notification preferences for current user
 */
export async function getNotificationPreferences(): Promise<NotificationPreferencesResponse> {
  const response = await apiClient.get(`${BASE_URL}/preferences`);
  return response.data;
}

/**
 * Create a new notification preference
 */
export async function createNotificationPreference(
  data: CreatePreferenceRequest
): Promise<NotificationPreference> {
  const response = await apiClient.post(`${BASE_URL}/preferences`, data);
  return response.data;
}

/**
 * Update a notification preference
 */
export async function updateNotificationPreference(
  preferenceId: string,
  data: UpdatePreferenceRequest
): Promise<NotificationPreference> {
  const response = await apiClient.patch(`${BASE_URL}/preferences/${preferenceId}`, data);
  return response.data;
}

/**
 * Delete a notification preference
 */
export async function deleteNotificationPreference(
  preferenceId: string
): Promise<void> {
  await apiClient.delete(`${BASE_URL}/preferences/${preferenceId}`);
}

// ============================================================================
// In-App Notifications
// ============================================================================

/**
 * Get in-app notifications
 */
export async function getInAppNotifications(
  options?: { unreadOnly?: boolean; limit?: number }
): Promise<InAppNotificationsResponse> {
  const params = new URLSearchParams();
  
  if (options?.unreadOnly) {
    params.append('unreadOnly', 'true');
  }
  if (options?.limit) {
    params.append('limit', String(options.limit));
  }

  const response = await apiClient.get(`${BASE_URL}/in-app?${params.toString()}`);
  return response.data;
}

/**
 * Mark a notification as read
 */
export async function markNotificationAsRead(
  notificationId: string
): Promise<MarkAsReadResponse> {
  const response = await apiClient.patch(`${BASE_URL}/in-app/${notificationId}/read`);
  return response.data;
}

/**
 * Mark all notifications as read
 */
export async function markAllNotificationsAsRead(): Promise<MarkAllAsReadResponse> {
  const response = await apiClient.patch(`${BASE_URL}/in-app/read-all`);
  return response.data;
}

/**
 * Get unread notification count
 */
export async function getUnreadNotificationCount(): Promise<{ count: number }> {
  const response = await apiClient.get(`${BASE_URL}/in-app/unread-count`);
  return response.data;
}
