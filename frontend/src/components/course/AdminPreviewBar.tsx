import { Eye, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Badge } from '../ui/badge';

interface AdminPreviewBarProps {
  courseStatus: 'draft' | 'published' | 'archived';
}

const statusLabels: Record<string, { label: string; variant: 'default' | 'success' | 'warning' | 'danger' }> = {
  draft: { label: 'Borrador', variant: 'default' },
  published: { label: 'Publicado', variant: 'success' },
  archived: { label: 'Archivado', variant: 'danger' },
};

/**
 * Semi-transparent bar shown at the top of CourseHome when in admin preview mode.
 * Communicates the preview state and provides quick navigation back to admin.
 */
export function AdminPreviewBar({ courseStatus }: AdminPreviewBarProps) {
  const status = statusLabels[courseStatus] ?? statusLabels.draft;

  return (
    <div
      className="sticky top-0 z-50 border-b border-amber-200/60 bg-amber-50/80 backdrop-blur-md dark:border-amber-800/60 dark:bg-amber-950/60"
      role="status"
      aria-label="Vista previa de administrador"
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-2.5 sm:px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900/50">
            <Eye className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
          </div>
          <span className="text-sm font-medium text-amber-800 dark:text-amber-200">
            Vista previa de administrador
          </span>
          <Badge variant={status.variant} size="sm">
            {status.label}
          </Badge>
        </div>

        <Link
          to="/admin/courses"
          className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-amber-700 transition-colors hover:bg-amber-100 dark:text-amber-300 dark:hover:bg-amber-900/50"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Volver al panel</span>
        </Link>
      </div>
    </div>
  );
}
