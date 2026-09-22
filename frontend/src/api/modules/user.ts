import { apiClient } from '../client';
import type { User } from '../types';

export interface ConsentHistory {
  id: string;
  termsVersion: string;
  acceptedAt: string;
}

export interface ConsentData {
  currentVersion: string;
  history: ConsentHistory[];
}

export const userApi = {
  getProfile: () =>
    apiClient<User>('/me'),

  updateProfile: (data: { name?: string; image?: string }) =>
    apiClient<User>('/me', { method: 'PATCH', body: data }),

  uploadAvatar: (file: File) => {
    const formData = new FormData();
    formData.append('avatar', file);
    return apiClient<{ url: string }>('/me/avatar', {
      method: 'POST',
      body: formData,
      headers: {},
    });
  },

  exportData: async () => {
    const response = await fetch('/api/me/export', {
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Failed to export data');
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mis-datos-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  },

  getConsent: () =>
    apiClient<ConsentData>('/me/consent'),

  deleteAccount: () =>
    apiClient<{ message: string; scheduledFor: string }>('/me/delete', { method: 'POST' }),

  cancelDeleteAccount: () =>
    apiClient<{ message: string }>('/me/delete/cancel', { method: 'POST' }),
};
