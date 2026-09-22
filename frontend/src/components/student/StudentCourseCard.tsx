import { ArrowRight, User } from 'lucide-react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';

interface StudentCourseCardProps {
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

export function StudentCourseCard({ course, onViewCourse }: StudentCourseCardProps) {
  const instructorName = course.instructors?.[0]?.name ?? null;

  return (
    <Card
      padding="none"
      className="group flex flex-col overflow-hidden transition-all duration-200 hover:shadow-md hover:border-gray-300 dark:hover:border-gray-600"
    >
      {/* Thumbnail */}
      <div className="relative h-40 overflow-hidden bg-gray-100 dark:bg-gray-800">
        {course.course.thumbnailUrl ? (
          <img
            src={course.course.thumbnailUrl}
            alt={course.course.title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-indigo-500/10 to-cyan-500/10">
            <span className="text-4xl font-bold text-indigo-300 dark:text-indigo-600">
              {course.course.title.charAt(0)}
            </span>
          </div>
        )}

        {/* Status badge */}
        {course.status === 'completed' && (
          <span className="absolute right-3 top-3 rounded-full bg-emerald-500 px-2.5 py-0.5 text-xs font-medium text-white">
            Completado
          </span>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col gap-3 p-5">
        {/* Title */}
        <h3
          className="text-base font-semibold leading-tight text-[var(--text-primary)] line-clamp-2"
          title={course.course.title}
        >
          {course.course.title}
        </h3>

        {/* Instructor */}
        {instructorName && (
          <div className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
            <User className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{instructorName}</span>
          </div>
        )}

        {/* Progress */}
        <div className="mt-auto space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium text-[var(--text-secondary)]">Progreso</span>
            <span className="font-semibold text-[var(--text-primary)]">
              {Math.round(course.progress.percentage)}%
            </span>
          </div>

          <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-700">
            <div
              className={`h-full rounded-full transition-all duration-500 ${getProgressColor(course.progress.percentage)}`}
              style={{ width: `${course.progress.percentage}%` }}
            />
          </div>

          <p className="text-xs text-[var(--text-muted)]">
            {course.progress.completedLessons}/{course.progress.totalLessons} lecciones
          </p>
        </div>

        {/* CTA */}
        <Button
          variant="primary"
          size="sm"
          className="mt-1 w-full"
          onClick={() => onViewCourse(course.courseId)}
        >
          Entrar al curso
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </Card>
  );
}
