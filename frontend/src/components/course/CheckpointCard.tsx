import {
  CheckCircle2,
  Dumbbell,
  Code,
  Bug,
  Zap,
  ChevronRight,
} from 'lucide-react';
import { getPhaseColors } from './phase-colors';
import type { ViewMode } from './types';

export type CheckpointItemType = 'quick_check' | 'code_challenge' | 'debugging';

interface CheckpointItem {
  id: string;
  title: string;
  type: CheckpointItemType;
  completed: boolean;
}

export interface CheckpointData {
  id: string;
  title: string;
  items: CheckpointItem[];
}

interface CheckpointCardProps {
  checkpoint: CheckpointData;
  phaseId: string;
  mode: ViewMode;
  onStart?: (checkpointId: string) => void;
}

const ITEM_TYPE_CONFIG: Record<
  CheckpointItemType,
  { icon: typeof Dumbbell; label: string; colorClass: string }
> = {
  quick_check: {
    icon: Zap,
    label: 'Verificacion rapida',
    colorClass:
      'text-emerald-500 bg-emerald-50 dark:bg-emerald-900/30 dark:text-emerald-400',
  },
  code_challenge: {
    icon: Code,
    label: 'Desafio de codigo',
    colorClass:
      'text-violet-500 bg-violet-50 dark:bg-violet-900/30 dark:text-violet-400',
  },
  debugging: {
    icon: Bug,
    label: 'Depuracion',
    colorClass:
      'text-amber-500 bg-amber-50 dark:bg-amber-900/30 dark:text-amber-400',
  },
};

/**
 * CheckpointCard — Visual card for module checkpoint exercises.
 *
 * Shows a summary of checkpoint item types, completion progress, and total items.
 * Uses rose-themed badge for differentiation from regular exercises.
 */
export function CheckpointCard({
  checkpoint,
  phaseId,

  onStart,
}: CheckpointCardProps) {
  const colors = getPhaseColors(phaseId);
  const totalItems = checkpoint.items.length;
  const completedItems = checkpoint.items.filter(
    (item) => item.completed,
  ).length;
  const allCompleted = totalItems > 0 && completedItems === totalItems;
  const progressPct =
    totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

  const typeGroups = checkpoint.items.reduce(
    (acc, item) => {
      if (!acc[item.type]) acc[item.type] = { total: 0, completed: 0 };
      acc[item.type].total++;
      if (item.completed) acc[item.type].completed++;
      return acc;
    },
    {} as Record<CheckpointItemType, { total: number; completed: number }>,
  );

  return (
    <div
      className={`relative overflow-hidden rounded-xl border transition-all duration-200 ${
        allCompleted
          ? 'border-emerald-200 bg-emerald-50/50 dark:border-emerald-800 dark:bg-emerald-950/30'
          : 'border-gray-200 bg-white hover:shadow-md dark:border-gray-700 dark:bg-gray-800 dark:hover:border-gray-600'
      }`}
    >
      {/* Header */}
      <div className="p-5">
        <div className="flex items-start gap-4">
          <div
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
              allCompleted
                ? 'bg-emerald-100 dark:bg-emerald-900/30'
                : `${colors.bg} ${colors.bgDark}`
            }`}
            aria-hidden="true"
          >
            {allCompleted ? (
              <CheckCircle2 className="h-5 w-5 text-emerald-500 dark:text-emerald-400" />
            ) : (
              <Dumbbell className={`h-5 w-5 ${colors.text} ${colors.textDark}`} />
            )}
          </div>

          <div className="min-w-0 flex-1">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-100 px-2.5 py-0.5 text-xs font-semibold text-rose-700 dark:bg-rose-900/30 dark:text-rose-400">
              <CheckCircle2 className="h-3 w-3" />
              Checkpoint
            </span>

            <h3 className="mt-2 text-base font-semibold text-gray-900 dark:text-white">
              {checkpoint.title}
            </h3>

            <div className="mt-3 flex items-center gap-3">
              <div className="h-2 w-24 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-rose-500 to-rose-600 transition-all duration-300"
                  style={{ width: `${progressPct}%` }}
                  role="progressbar"
                  aria-valuenow={progressPct}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label={`Progreso del checkpoint: ${completedItems} de ${totalItems}`}
                />
              </div>
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                {completedItems}/{totalItems} ejercicios
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Item type breakdown */}
      <div className="border-t border-gray-100 px-5 py-4 dark:border-gray-700">
        <h4 className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
          Ejercicios del checkpoint
        </h4>
        <div className="space-y-2">
          {(Object.keys(typeGroups) as CheckpointItemType[]).map((type) => {
            const config = ITEM_TYPE_CONFIG[type];
            const group = typeGroups[type];
            const TypeIcon = config.icon;
            return (
              <div
                key={type}
                className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2 dark:bg-gray-700/50"
              >
                <div className="flex items-center gap-2">
                  <span
                    className={`flex h-6 w-6 items-center justify-center rounded-md ${config.colorClass}`}
                  >
                    <TypeIcon className="h-3.5 w-3.5" />
                  </span>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {config.label}
                  </span>
                </div>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {group.completed}/{group.total}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Action */}
      <div className="border-t border-gray-100 px-5 py-3 dark:border-gray-700">
        <button
          type="button"
          onClick={() => onStart?.(checkpoint.id)}
          className={`flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors ${
            allCompleted
              ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:hover:bg-emerald-900/50'
              : 'bg-gradient-to-r from-rose-500 to-rose-600 text-white hover:opacity-90'
          }`}
        >
          {allCompleted ? 'Repasar checkpoint' : 'Iniciar checkpoint'}
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
