import { ArrowRight, User } from 'lucide-react';
import { Button } from '../ui/button';

interface StudentCourseListItemProps {
  course: {
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
    instructors?: Array<{ name: string; email: string; image?: string }>;
    progress: {
      percentage: number;
      completedLessons: number;
      totalLessons: number;
    };
  };
  onViewCourse: (courseId: string) => void;
}

function getProgressColor(pct: number): string {
  if (pct < 30) return 'bg-red-500';
  if (pct <= 70) return 'bg-amber-500';
  return 'bg-emerald-500';
}

function getStatusLabel(status: string): string {
  switch (status) {
    case 'completed':
      return 'Completado';
    case 'dropped':
      return 'Abandonado';
    default:
      return 'En progreso';
  }
}

function getStatusColor(status: string): string {
  switch (status) {
    case 'completed':
      return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400';
    case 'dropped':
      return 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400';
    default:
      return 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400';
  }
}

export function StudentCourseListItem({ course, onViewCourse }: StudentCourseListItemProps) {
  const instructorName = course.instructors?.[0]?.name ?? null;

  return (
    <div className="group flex items-center gap-4 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-raised)] p-4 transition-all duration-200 hover:shadow-sm hover:border-gray-300 dark:hover:border-gray-600">
      {/* Thumbnail */}
      <div className="hidden h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-gray-100 sm:block dark:bg-gray-800">
        {course.course.thumbnailUrl ? (
          <img
            src={course.course.thumbnailUrl}
            alt={course.course.title}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-indigo-500/10 to-cyan-500/10">
            <span className="text-lg font-bold text-indigo-300 dark:text-indigo-600">
              {course.course.title.charAt(0)}
            </span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <h3 className="truncate text-sm font-semibold text-[var(--text-primary)]">
            {course.course.title}
          </h3>
          <span
            className={`hidden shrink-0 rounded-full px-2 py-0.5 text-xs font-medium sm:inline-block ${getStatusColor(course.status)}`}
          >
            {getStatusLabel(course.status)}
          </span>
        </div>

        <div className="mt-1 flex items-center gap-3 text-xs text-[var(--text-muted)]">
          {instructorName && (
            <span className="flex items-center gap-1">
              <User className="h-3 w-3" />
              {instructorName}
            </span>
          )}
          <span>
            {course.progress.completedLessons}/{course.progress.totalLessons} lecciones
          </span>
        </div>
      </div>

      {/* Progress bar — compact */}
      <div className="hidden w-32 shrink-0 md:block">
        <div className="flex items-center justify-between text-xs">
          <span className="font-medium text-[var(--text-secondary)]">
            {Math.round(course.progress.percentage)}%
          </span>
        </div>
        <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-700">
          <div
            className={`h-full rounded-full transition-all duration-500 ${getProgressColor(course.progress.percentage)}`}
            style={{ width: `${course.progress.percentage}%` }}
          />
        </div>
      </div>

      {/* CTA */}
      <Button
        variant="ghost"
        size="sm"
        className="shrink-0"
        onClick={() => onViewCourse(course.courseId)}
      >
        Entrar
        <ArrowRight className="h-4 w-4" />
      </Button>
    </div>
  );
}
