export interface User {
  id: string;
  name: string;
  email: string;
  username?: string | null;
  role: 'student' | 'instructor' | 'admin';
  emailVerified: boolean;
  mustChangePassword?: boolean;
  image?: string;
}

export interface Course {
  id: string;
  title: string;
  description: string | null;
  slug?: string;
  thumbnailUrl: string | null;
  status: 'draft' | 'published' | 'archived';
  publishedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  enrollmentCount?: number;
}

export interface Module {
  id: string;
  courseId: string;
  title: string;
  description: string;
  position: number;
  visible: boolean;
}

export interface Lesson {
  id: string;
  moduleId: string;
  title: string;
  description: string;
  position: number;
  visible: boolean;
  estimatedDurationSeconds: number | null;
}

export interface ContentBlock {
  id: string;
  lessonId: string;
  type: 'text' | 'video' | 'file' | 'code' | 'link';
  content: string;
  metadata: Record<string, unknown>;
  position: number;
}

export interface Enrollment {
  id: string;
  userId: string;
  courseId: string;
  status: 'active' | 'completed' | 'dropped';
  source: string;
  enrolledAt: string;
  completedAt: string | null;
  droppedAt: string | null;
  lastAccessedAt: string | null;
}

export interface LessonProgress {
  id: string;
  userId: string;
  lessonId: string;
  status: 'not_started' | 'in_progress' | 'completed';
  startedAt: string | null;
  completedAt: string | null;
  lastPositionSeconds: number | null;
}

export interface VideoProgress {
  id: string;
  userId: string;
  lessonId: string;
  lastPositionSeconds: number;
  durationSeconds: number;
  completed: boolean;
}

export interface Notification {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  position: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: { page: number; limit: number; total: number };
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    requestId?: string;
  };
  meta?: {
    page: number;
    limit: number;
    total: number;
  };
}

export interface InstructorDashboard {
  courses: Course[];
  totalStudents: number;
  totalCourses: number;
}

export interface AdminDashboard {
  stats: {
    totalUsers: number;
    totalCourses: number;
    totalEnrollments: number;
    activeUsers: number;
    publishedCourses: number;
  };
  recentActivity: {
    recentUsers: User[];
    recentEnrollments: Array<{
      id: string;
      userId: string;
      courseId: string;
      enrolledAt: string;
    }>;
  };
}

export interface CourseDetail {
  id: string;
  title: string;
  description: string | null;
  slug: string;
  status: 'draft' | 'published' | 'archived';
  thumbnailUrl: string | null;
  createdAt: string;
  updatedAt: string;
  instructor: {
    id: string;
    name: string;
    email: string;
  } | null;
  modules: Array<{
    id: string;
    title: string;
    description: string | null;
    position: number;
    visible: boolean;
    lessons: Array<{
      id: string;
      title: string;
      description: string | null;
      position: number;
      visible: boolean;
      contentBlocks: Array<{
        id: string;
        type: 'text' | 'video' | 'file' | 'code' | 'link';
        content: string;
        metadata: Record<string, unknown> | null;
        position: number;
      }>;
    }>;
  }>;
  moduleCount: number;
  lessonCount: number;
}

export interface AdminUserEnrollment {
  courseId: string;
  courseTitle: string;
  status: string;
  enrolledAt: string;
}

export interface AdminEnrollmentDiff {
  added: string[];
  removed: string[];
}
