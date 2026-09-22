import { apiClient } from '../client';
import type { Course, Module, Lesson, ContentBlock, PaginatedResponse } from '../types';

export const coursesApi = {
  list: (params?: { page?: number; limit?: number }) => {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set('page', String(params.page));
    if (params?.limit) searchParams.set('limit', String(params.limit));
    const query = searchParams.toString();
    return apiClient<PaginatedResponse<Course>>(`/courses${query ? `?${query}` : ''}`);
  },

  getById: (id: string) =>
    apiClient<Course>(`/courses/${id}`),

  create: (data: { title: string; description?: string; slug?: string }) =>
    apiClient<Course>('/courses', { method: 'POST', body: data }),

  update: (id: string, data: { title?: string; description?: string; slug?: string }) =>
    apiClient<Course>(`/courses/${id}`, { method: 'PATCH', body: data }),

  delete: (id: string) =>
    apiClient<void>(`/courses/${id}`, { method: 'DELETE' }),

  publish: (id: string) =>
    apiClient<Course>(`/courses/${id}/publish`, { method: 'POST' }),

  unpublish: (id: string) =>
    apiClient<Course>(`/courses/${id}/unpublish`, { method: 'POST' }),

  archive: (id: string) =>
    apiClient<Course>(`/courses/${id}/archive`, { method: 'POST' }),

  search: (params: { q?: string; categoryId?: string; page?: number; limit?: number }) => {
    const searchParams = new URLSearchParams();
    if (params.q) searchParams.set('q', params.q);
    if (params.categoryId) searchParams.set('categoryId', params.categoryId);
    if (params.page) searchParams.set('page', String(params.page));
    if (params.limit) searchParams.set('limit', String(params.limit));
    return apiClient<PaginatedResponse<Course>>(`/courses/search?${searchParams.toString()}`);
  },

  // Modules
  listModules: (courseId: string) =>
    apiClient<Module[]>(`/courses/${courseId}/modules`),

  createModule: (courseId: string, data: { title: string; description?: string }) =>
    apiClient<Module>(`/courses/${courseId}/modules`, { method: 'POST', body: data }),

  updateModule: (courseId: string, moduleId: string, data: { title?: string; description?: string }) =>
    apiClient<Module>(`/courses/${courseId}/modules/${moduleId}`, { method: 'PATCH', body: data }),

  deleteModule: (courseId: string, moduleId: string) =>
    apiClient<void>(`/courses/${courseId}/modules/${moduleId}`, { method: 'DELETE' }),

  // Lessons
  listLessons: (moduleId: string) =>
    apiClient<Lesson[]>(`/modules/${moduleId}/lessons`),

  createLesson: (moduleId: string, data: { title: string; description?: string }) =>
    apiClient<Lesson>(`/modules/${moduleId}/lessons`, { method: 'POST', body: data }),

  updateLesson: (moduleId: string, lessonId: string, data: { title?: string; description?: string }) =>
    apiClient<Lesson>(`/modules/${moduleId}/lessons/${lessonId}`, { method: 'PATCH', body: data }),

  deleteLesson: (moduleId: string, lessonId: string) =>
    apiClient<void>(`/modules/${moduleId}/lessons/${lessonId}`, { method: 'DELETE' }),

  // Content Blocks
  listBlocks: (lessonId: string) =>
    apiClient<ContentBlock[]>(`/lessons/${lessonId}/blocks`),

  createBlock: (lessonId: string, data: { type: ContentBlock['type']; content: string; metadata?: Record<string, unknown> }) =>
    apiClient<ContentBlock>(`/lessons/${lessonId}/blocks`, { method: 'POST', body: data }),

  updateBlock: (lessonId: string, blockId: string, data: { content?: string; metadata?: Record<string, unknown> }) =>
    apiClient<ContentBlock>(`/lessons/${lessonId}/blocks/${blockId}`, { method: 'PATCH', body: data }),

  deleteBlock: (lessonId: string, blockId: string) =>
    apiClient<void>(`/lessons/${lessonId}/blocks/${blockId}`, { method: 'DELETE' }),
};
