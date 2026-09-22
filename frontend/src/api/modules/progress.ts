import { apiClient } from '../client';
import type { LessonProgress, VideoProgress } from '../types';

export const progressApi = {
  startLesson: (lessonId: string) =>
    apiClient<LessonProgress>(`/lessons/${lessonId}/start`, { method: 'POST' }),

  completeLesson: (lessonId: string) =>
    apiClient<LessonProgress>(`/lessons/${lessonId}/complete`, { method: 'POST' }),

  getLessonProgress: (lessonId: string) =>
    apiClient<LessonProgress | null>(`/lessons/${lessonId}/progress`),

  updateVideoProgress: (videoId: string, data: { positionSeconds: number; durationSeconds?: number }) =>
    apiClient<VideoProgress>(`/video/${videoId}/position`, { method: 'PATCH', body: data }),

  getVideoProgress: (videoId: string) =>
    apiClient<VideoProgress>(`/video/${videoId}/progress`),

  getCourseProgress: (courseId: string) =>
    apiClient<{ percentage: number; completedLessons: number; totalLessons: number }>(`/courses/${courseId}/progress`),
};
