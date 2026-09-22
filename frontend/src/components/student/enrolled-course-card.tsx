import { Link } from 'react-router-dom';
import { Play } from 'lucide-react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { ProgressRing } from './progress-ring';
import type { EnrolledCourse } from '../../api/modules/student';

interface EnrolledCourseCardProps {
  enrolledCourse: EnrolledCourse;
}

function formatDate(dateString: string | null): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Hoy';
  if (diffDays === 1) return 'Ayer';
  if (diffDays < 7) return `Hace ${diffDays} días`;
  return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
}

export function EnrolledCourseCard({ enrolledCourse }: EnrolledCourseCardProps) {
  const { courseId, course, progress, enrolledAt } = enrolledCourse;

  const continuePath = `/courses/${courseId}/home`;

  return (
    <Card padding="none" className="overflow-hidden">
      <div className="flex flex-col sm:flex-row">
        {/* Thumbnail */}
        <div className="relative h-40 shrink-0 sm:h-auto sm:w-48">
          {course.thumbnailUrl ? (
            <img
              src={course.thumbnailUrl}
              alt={course.title}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600">
              <Play className="h-10 w-10 text-white/80" />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex flex-1 flex-col justify-between p-4">
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-1">
              {course.title}
            </h3>
            {progress.totalLessons > 0 && (
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {progress.completedLessons} de {progress.totalLessons} lecciones completadas
              </p>
            )}
          </div>

          <div className="mt-3 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <ProgressRing percentage={progress.percentage} size={48} strokeWidth={4} />
              <span className="text-xs text-gray-400 dark:text-gray-500">
                Inscrito: {formatDate(enrolledAt)}
              </span>
            </div>

            <Link to={continuePath}>
              <Button size="sm">
                <Play className="h-4 w-4" />
                Continuar
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </Card>
  );
}
