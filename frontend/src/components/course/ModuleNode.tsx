import { CheckCircle2, Circle, Lock, PlayCircle, BookOpen } from 'lucide-react';
import { getPhaseColors } from './phase-colors';
import type { ModuleNode as ModuleNodeType, ModuleStatus } from './types';

interface ModuleNodeProps {
  module: ModuleNodeType;
  phaseId: string;
  mode: 'student' | 'admin_preview';
  isCurrent?: boolean;
  onClick?: (moduleId: string) => void;
}

const statusConfig: Record<ModuleStatus, { icon: typeof CheckCircle2; label: string; colorClass: string }> = {
  completed: {
    icon: CheckCircle2,
    label: 'Completado',
    colorClass: 'text-emerald-500 dark:text-emerald-400',
  },
  in_progress: {
    icon: PlayCircle,
    label: 'En progreso',
    colorClass: 'text-blue-500 dark:text-blue-400',
  },
  not_started: {
    icon: Circle,
    label: 'No iniciado',
    colorClass: 'text-gray-400 dark:text-gray-500',
  },
  locked: {
    icon: Lock,
    label: 'Bloqueado',
    colorClass: 'text-gray-300 dark:text-gray-600',
  },
};

/**
 * ModuleNode — A card representing a single module in the learning path.
 *
 * Shows: module number, title, lesson count, progress indicator, status badge, and click handler.
 * Respects the phase color system for visual identity.
 */
export function ModuleNode({
  module,
  phaseId,
  mode,
  isCurrent = false,
  onClick,
}: ModuleNodeProps) {
  const colors = getPhaseColors(phaseId);
  const status = statusConfig[module.status];
  const StatusIcon = status.icon;
  const isClickable = module.status !== 'locked' || mode === 'admin_preview';

  return (
    <button
      type="button"
      onClick={() => isClickable && onClick?.(module.id)}
      disabled={!isClickable}
      className={`group w-full text-left transition-all duration-200 ${
        isClickable
          ? 'cursor-pointer'
          : 'cursor-not-allowed opacity-60'
      }`}
      aria-label={`${status.label}: ${module.title}, ${module.lessonCount} lecciones`}
    >
      <div
        className={`relative flex items-start gap-4 rounded-xl border p-4 transition-all duration-200 sm:p-5 ${
          isCurrent
            ? `border-2 ${colors.border} ${colors.borderDark} ring-2 ${colors.ring} ${colors.bg} ${colors.bgDark}`
            : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md dark:border-gray-700 dark:bg-gray-800 dark:hover:border-gray-600'
        }`}
      >
        {/* Module number */}
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-sm font-bold ${
            isCurrent
              ? `${colors.bg} ${colors.bgDark} ${colors.text} ${colors.textDark}`
              : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
          }`}
          aria-hidden="true"
        >
          {module.position}
        </div>

        {/* Content */}
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h3
              className={`text-sm font-semibold leading-tight ${
                isCurrent
                  ? 'text-gray-900 dark:text-white'
                  : 'text-gray-800 dark:text-gray-200'
              }`}
            >
              {module.title}
            </h3>
            <StatusIcon className={`h-4 w-4 shrink-0 ${status.colorClass}`} aria-hidden="true" />
          </div>

          {module.description && (
            <p className="mt-1 line-clamp-2 text-xs text-gray-500 dark:text-gray-400">
              {module.description}
            </p>
          )}

          {/* Meta row */}
          <div className="mt-2 flex items-center gap-3">
            {/* Lesson count */}
            <span className="inline-flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
              <BookOpen className="h-3 w-3" aria-hidden="true" />
              {module.lessonCount} leccion{module.lessonCount !== 1 ? 'es' : ''}
            </span>

            {/* Progress */}
            {module.progress !== undefined && module.progress > 0 && (
              <div className="flex items-center gap-2">
                <div className="h-1.5 w-16 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                  <div
                    className={`h-full rounded-full bg-gradient-to-r ${colors.gradient} transition-all duration-300`}
                    style={{ width: `${module.progress}%` }}
                    role="progressbar"
                    aria-valuenow={module.progress}
                    aria-valuemin={0}
                    aria-valuemax={100}
                  />
                </div>
                <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                  {module.progress}%
                </span>
              </div>
            )}

            {/* Status text */}
            <span className="ml-auto text-xs font-medium text-gray-400 dark:text-gray-500">
              {status.label}
            </span>
          </div>
        </div>
      </div>
    </button>
  );
}
