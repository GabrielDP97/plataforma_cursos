import { apiClient } from '../client';

export const contactApi = {
  send: (data: { name: string; email: string; courseId?: string; message: string }) =>
    apiClient<{ success: boolean }>('/contact', { method: 'POST', body: data, raw: true }),
};
