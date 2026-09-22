import { apiClient } from '../client';
import type { Course, User, PaginatedResponse } from '../types';
import type { AdminDashboard, CourseDetail, AdminUserEnrollment, AdminEnrollmentDiff } from '../types';

export interface CreateUserResult {
  user: {
    id: string;
    name: string;
    email: string;
    username: string;
    role: string;
    mustChangePassword: boolean;
  };
  temporaryPassword: string;
}

export interface ResetPasswordResult {
  userId: string;
  temporaryPassword: string;
}

export const adminApi = {
  getDashboard: () =>
    apiClient<AdminDashboard>('/admin/dashboard'),

  listUsers: (params?: { page?: number; limit?: number; search?: string; role?: string }) => {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set('page', String(params.page));
    if (params?.limit) searchParams.set('limit', String(params.limit));
    if (params?.search) searchParams.set('search', params.search);
    if (params?.role) searchParams.set('role', params.role);
    const query = searchParams.toString();
    return apiClient<PaginatedResponse<User>>(`/admin/users${query ? `?${query}` : ''}`);
  },

  createUser: (data: {
    fullName: string;
    email: string;
    role: 'student' | 'instructor' | 'admin';
    username?: string;
    courseIds?: string[];
  }) =>
    apiClient<CreateUserResult>('/admin/users', { method: 'POST', body: data }),

  updateUser: (userId: string, data: { role?: string; enabled?: boolean }) =>
    apiClient<User>(`/admin/users/${userId}`, { method: 'PATCH', body: data }),

  disableUser: (userId: string) =>
    apiClient<void>(`/admin/users/${userId}/disable`, { method: 'PATCH' }),

  resetPassword: (userId: string) =>
    apiClient<ResetPasswordResult>(`/admin/users/${userId}/reset-password`, { method: 'POST' }),

  listCourses: (params?: { page?: number; limit?: number; search?: string; status?: string }) => {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set('page', String(params.page));
    if (params?.limit) searchParams.set('limit', String(params.limit));
    if (params?.search) searchParams.set('search', params.search);
    if (params?.status) searchParams.set('status', params.status);
    const query = searchParams.toString();
    return apiClient<PaginatedResponse<Course>>(`/admin/courses${query ? `?${query}` : ''}`);
  },

  updateCourse: (courseId: string, data: { status?: string }) =>
    apiClient<Course>(`/admin/courses/${courseId}`, { method: 'PATCH', body: data }),

  getCourseById: (courseId: string) =>
    apiClient<CourseDetail>(`/admin/courses/${courseId}`),

  getUserEnrollments: (userId: string) =>
    apiClient<AdminUserEnrollment[]>(`/admin/users/${userId}/enrollments`),

  setUserEnrollments: (userId: string, courseIds: string[]) =>
    apiClient<AdminEnrollmentDiff>(`/admin/users/${userId}/enrollments`, {
      method: 'PUT',
      body: { courseIds },
    }),
};
