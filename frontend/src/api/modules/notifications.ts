import { apiClient } from '../client';
import type { Notification } from '../types';

export const notificationsApi = {
  list: (params?: { page?: number; limit?: number; unreadOnly?: boolean }) => {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set('page', String(params.page));
    if (params?.limit) searchParams.set('limit', String(params.limit));
    if (params?.unreadOnly) searchParams.set('unreadOnly', 'true');
    const query = searchParams.toString();
    return apiClient<{ notifications: Notification[]; unreadCount: number }>(
      `/notifications${query ? `?${query}` : ''}`,
    );
  },

  markRead: (notificationId: string) =>
    apiClient<void>(`/notifications/${notificationId}/read`, { method: 'PATCH' }),

  markAllRead: () =>
    apiClient<void>('/notifications/read-all', { method: 'PATCH' }),

  getUnreadCount: () =>
    apiClient<{ count: number }>('/notifications/unread-count'),
};
