import { BookOpen, Code, Dumbbell, FlaskConical, CheckCircle2, Circle, PlayCircle, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getPhaseColors } from './phase-colors';
import type { ViewMode } from './types';

export type ActivityType = 'theory' | 'code' | 'exercise' | 'lab' | 'checkpoint';

interface TimelineLesson {
  id: string;
  position: number;
  title: string;
  activityType: ActivityType;
  durationMinutes: number;
  status: 'not_started' | 'in_progress' | 'completed';
  exerciseCount?: number;
}

interface ActivityTimelineProps {
  lessons: TimelineLesson[];
  phaseId: string;
  courseId: string;
  moduleId: string;
  mode: ViewMode;
}

const ACTIVITY_CONFIG: Record<ActivityType, { icon: typeof BookOpen; label: string; colorClass: string }> = {
  theory: {
    icon: BookOpen,
    label: 'Teor\u00eda',
    colorClass: 'text-blue-500 bg-blue-50 dark:bg-blue-900/30 dark:text-blue-400',
  },
  code: {
    icon: Code,
    label: 'C\u00f3digo',
    colorClass: 'text-violet-500 bg-violet-50 dark:bg-violet-900/30 dark:text-violet-400',
  },
  exercise: {
    icon: Dumbbell,
    label: 'Ejercicio',
    colorClass: 'text-amber-500 bg-amber-50 dark:bg-amber-900/30 dark:text-amber-400',
  },
  lab: {
    icon: FlaskConical,
    label: 'Laboratorio',
    colorClass: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-900/30 dark:text-emerald-400',
  },
  checkpoint: {
    icon: CheckCircle2,
    label: 'Checkpoint',
    colorClass: 'text-rose-500 bg-rose-50 dark:bg-rose-900/30 dark:text-rose-400',
  },
};

const STATUS_CONFIG: Record<string, { icon: typeof CheckCircle2; colorClass: string; label: string }> = {
  completed: { icon: CheckCircle2, colorClass: 'text-emerald-500', label: 'Completada' },
  in_progress: { icon: PlayCircle, colorClass: 'text-blue-500', label: 'En progreso' },
  not_started: { icon: Circle, colorClass: 'text-gray-300 dark:text-gray-600', label: 'No iniciada' },
};

/**
 * ActivityTimeline — Vertical timeline showing lessons within a module.
 *
 * Each lesson shows its activity type, title, duration, and status.
 * Clicking navigates to the lesson page.
 */
export function ActivityTimeline({
  lessons,
  phaseId,
  courseId,
  moduleId,

}: ActivityTimelineProps) {
  const colors = getPhaseColors(phaseId);

  return (
    <nav aria-label="Timeline de actividades" className="relative">
      {/* Vertical line */}
      <div
        className={`absolute left-5 top-0 bottom-0 w-0.5 bg-gradient-to-b ${colors.gradient} opacity-20`}
        aria-hidden="true"
      />

      <ol className="space-y-3">
        {lessons.map((lesson) => {
          const activity = ACTIVITY_CONFIG[lesson.activityType];
          const status = STATUS_CONFIG[lesson.status];
          const ActivityIcon = activity.icon;
          const StatusIcon = status.icon;
          const lessonUrl = `/courses/${courseId}/modules/${moduleId}/lessons/${lesson.id}`;

          return (
            <li key={lesson.id} className="relative pl-12">
              {/* Timeline dot */}
              <div
                className={`absolute left-[14px] top-5 z-10 h-3 w-3 rounded-full border-2 border-white dark:border-gray-900 ${
                  lesson.status === 'completed'
                    ? 'bg-emerald-500'
                    : lesson.status === 'in_progress'
                      ? `bg-gradient-to-br ${colors.gradient}`
                      : 'bg-gray-300 dark:bg-gray-600'
                }`}
                aria-hidden="true"
              />

              {/* Lesson card */}
              <Link
                to={lessonUrl}
                className="group block rounded-xl border border-gray-200 bg-white p-4 transition-all hover:border-gray-300 hover:shadow-md dark:border-gray-700 dark:bg-gray-800 dark:hover:border-gray-600"
                aria-label={`${status.label}: Leccion ${lesson.position}, ${lesson.title}`}
              >
                <div className="flex items-start gap-3">
                  {/* Activity type icon */}
                  <div
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${activity.colorClass}`}
                    aria-hidden="true"
                  >
                    <ActivityIcon className="h-4.5 w-4.5" />
                  </div>

                  {/* Content */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <span className="text-xs font-medium text-gray-400 dark:text-gray-500">
                          Leccion {lesson.position}
                        </span>
                        <h4 className="mt-0.5 text-sm font-semibold text-gray-800 group-hover:text-gray-900 dark:text-gray-200 dark:group-hover:text-white line-clamp-1">
                          {lesson.title}
                        </h4>
                      </div>
                      <StatusIcon className={`h-4 w-4 shrink-0 ${status.colorClass}`} aria-hidden="true" />
                    </div>

                    {/* Meta row */}
                    <div className="mt-2 flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                      {/* Activity type badge */}
                      <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-medium ${activity.colorClass}`}>
                        <ActivityIcon className="h-3 w-3" />
                        {activity.label}
                      </span>

                      {/* Duration */}
                      <span className="inline-flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {lesson.durationMinutes} min
                      </span>

                      {/* Exercises */}
                      {lesson.exerciseCount !== undefined && lesson.exerciseCount > 0 && (
                        <span className="inline-flex items-center gap-1">
                          <Dumbbell className="h-3 w-3" />
                          {lesson.exerciseCount} ejercicios
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
