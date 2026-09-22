import { apiClient } from '../client';
import type { User } from '../types';

/** Better Auth sign-in response */
interface SignInResponse {
  redirect: boolean;
  token: string;
  url: string | null;
  user: User;
}

/** Better Auth session response (GET /get-session) */
interface SessionResponse {
  session: { id: string; token: string; expiresAt: string } | null;
  user: User | null;
}

export const authApi = {
  /**
   * Login with username (or email) + password.
   * Uses Better Auth's native sign-in/username endpoint.
   * Cookies are set by Better Auth's handler automatically.
   */
  login: (data: { email?: string; username?: string; password: string }) => {
    // Use Better Auth's native endpoint for username-based login
    if (data.username) {
      return apiClient<SignInResponse>('/auth/sign-in/username', {
        method: 'POST',
        body: { username: data.username, password: data.password },
        raw: true,
      });
    }
    // Fallback to email-based login
    return apiClient<SignInResponse>('/auth/sign-in/email', {
      method: 'POST',
      body: { email: data.email, password: data.password },
      raw: true,
    });
  },

  logout: () =>
    apiClient<{ success: boolean }>('/auth/sign-out', {
      method: 'POST',
      raw: true,
    }),

  getSession: () =>
    apiClient<SessionResponse>('/auth/get-session', {
      raw: true,
    }),

  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    apiClient<{ success: boolean }>('/account/change-initial-password', {
      method: 'POST',
      body: data,
      raw: true,
    }),
};
