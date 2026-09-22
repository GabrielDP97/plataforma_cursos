import { apiClient } from '../client';
import type { Course, PaginatedResponse } from '../types';

export interface CatalogModuleLesson {
  id: string;
  title: string;
  description: string;
  position: number;
}

export interface CatalogModule {
  id: string;
  title: string;
  description: string;
  position: number;
  lessons: CatalogModuleLesson[];
}

export interface CatalogCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
}

export interface CatalogCourseDetail {
  course: Course;
  categories: CatalogCategory[];
  modules: CatalogModule[];
  lessonCount: number;
}

export const catalogApi = {
  list: (params?: { q?: string; categoryId?: string; page?: number; limit?: number }) => {
    const searchParams = new URLSearchParams();
    if (params?.q) searchParams.set('q', params.q);
    if (params?.categoryId) searchParams.set('categoryId', params.categoryId);
    if (params?.page) searchParams.set('page', String(params.page));
    if (params?.limit) searchParams.set('limit', String(params.limit));
    const query = searchParams.toString();
    return apiClient<PaginatedResponse<Course>>(`/catalog${query ? `?${query}` : ''}`);
  },

  getBySlug: (slug: string) =>
    apiClient<CatalogCourseDetail>(`/catalog/${slug}`),
};
