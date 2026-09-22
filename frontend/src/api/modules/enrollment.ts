import { apiClient } from '../client';
import type { Enrollment } from '../types';

/**
 * @deprecated Self-enrollment has been removed. Only admins can create enrollments
 * via the admin panel. This function is retained for backward compatibility but
 * should not be called from student-facing UI.
 */
export const enrollmentApi = {
  enroll: (courseId: string, source?: string) =>
    apiClient<Enrollment>(`/courses/${courseId}/enroll`, {
      method: 'POST',
      body: { source: source || 'admin' },
    }),

  unenroll: (courseId: string) =>
    apiClient<void>(`/courses/${courseId}/unenroll`, { method: 'DELETE' }),

  getMyEnrollments: () =>
    apiClient<Enrollment[]>('/me/enrollments'),

  getCourseStudents: (courseId: string) =>
    apiClient<Enrollment[]>(`/courses/${courseId}/enrolled-students`),
};
