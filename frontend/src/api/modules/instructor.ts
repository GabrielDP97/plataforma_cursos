import { apiClient } from '../client';
import type { Course, PaginatedResponse } from '../types';

export interface InstructorDashboardData {
  courses: Course[];
  totalStudents: number;
  totalCourses: number;
  publishedCount: number;
  draftCount: number;
  archivedCount: number;
}

export interface CourseManagementView {
  course: Course;
  modules: { id: string; title: string; lessons: { id: string; title: string }[] }[];
  enrolledStudents: { userId: string; enrolledAt: string; status: string }[];
}

export const instructorApi = {
  getDashboard: () =>
    apiClient<InstructorDashboardData>('/instructor/dashboard'),

  getCourses: () =>
    apiClient<Course[]>('/instructor/courses'),

  getCourseManagement: (courseId: string) =>
    apiClient<CourseManagementView>(`/instructor/courses/${courseId}`),

  getEnrolledStudents: (courseId: string, params?: { page?: number; limit?: number }) => {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set('page', String(params.page));
    if (params?.limit) searchParams.set('limit', String(params.limit));
    const query = searchParams.toString();
    return apiClient<PaginatedResponse<{ userId: string; enrolledAt: string; status: string }>>(
      `/instructor/courses/${courseId}/students${query ? `?${query}` : ''}`,
    );
  },

  createAnnouncement: (courseId: string, data: { title: string; message: string }) =>
    apiClient<void>(`/instructor/courses/${courseId}/announcements`, {
      method: 'POST',
      body: data,
    }),
};
