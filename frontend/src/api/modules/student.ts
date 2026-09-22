import { apiClient } from '../client';

export interface EnrolledCourse {
  id: string;
  courseId: string;
  status: 'active' | 'completed' | 'dropped';
  enrolledAt: string;
  course: {
    title: string;
    description: string;
    thumbnailUrl: string | null;
    slug: string;
  };
  progress: {
    percentage: number;
    completedLessons: number;
    totalLessons: number;
  };
}

export interface StudentDashboard {
  enrolledCourses: EnrolledCourse[];
  stats: {
    totalEnrolled: number;
    inProgress: number;
    completed: number;
  };
}

export const studentApi = {
  getDashboard: async (): Promise<StudentDashboard> => {
    const data = await apiClient<EnrolledCourse[]>('/student/dashboard');
    const enrolledCourses = data;
    const stats = {
      totalEnrolled: enrolledCourses.length,
      inProgress: enrolledCourses.filter(
        (ec) => ec.status === 'active' && ec.progress.percentage < 100,
      ).length,
      completed: enrolledCourses.filter((ec) => ec.status === 'completed').length,
    };
    return { enrolledCourses, stats };
  },
};
