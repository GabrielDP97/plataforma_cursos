import { useState } from 'react';
import { ChevronDown, ChevronRight, Sparkles } from 'lucide-react';
import { ModuleNode } from './ModuleNode';
import { getPhaseColors } from './phase-colors';
import type { Phase, ViewMode } from './types';

interface PhaseSectionProps {
  phase: Phase;
  index: number;
  mode: ViewMode;
  currentModuleId?: string;
  expandedByDefault?: boolean;
  onModuleClick?: (moduleId: string) => void;
}

/**
 * PhaseSection — Shows a single phase with its modules as a vertical timeline/path.
 *
 * Each phase has a distinct color identity, a header with title/description/progress,
 * and an expandable list of ModuleNode cards.
 */
export function PhaseSection({
  phase,
  index,
  mode,
  currentModuleId,
  expandedByDefault = false,
  onModuleClick,
}: PhaseSectionProps) {
  const [isExpanded, setIsExpanded] = useState(expandedByDefault);
  const colors = getPhaseColors(phase.id);

  const completedCount = phase.modules.filter((m) => m.status === 'completed').length;
  const totalModules = phase.modules.length;
  const phaseProgress = totalModules > 0 ? Math.round((completedCount / totalModules) * 100) : 0;

  return (
    <section
      className="scroll-mt-20"
      aria-labelledby={`phase-${phase.id}-heading`}
    >
      {/* Phase header */}
      <div
        className={`flex items-start gap-4 rounded-2xl border p-5 transition-all sm:p-6 ${
          isExpanded
            ? `border-2 ${colors.border} ${colors.borderDark} ${colors.bg} ${colors.bgDark}`
            : 'border-gray-200 bg-white hover:border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:hover:border-gray-600'
        }`}
      >
        {/* Phase number with accent stripe */}
        <div className="flex flex-col items-center gap-1">
          <div
            className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${colors.gradient} text-lg font-bold text-white shadow-md`}
            aria-hidden="true"
          >
            {index + 1}
          </div>
        </div>

        {/* Phase info */}
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2
                id={`phase-${phase.id}-heading`}
                className="text-lg font-bold text-gray-900 dark:text-white"
              >
                {phase.title}
              </h2>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                {phase.description}
              </p>
            </div>

            {/* Expand toggle */}
            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700 dark:hover:text-gray-300"
              aria-expanded={isExpanded}
              aria-controls={`phase-${phase.id}-modules`}
            >
              {isExpanded ? (
                <ChevronDown className="h-5 w-5" />
              ) : (
                <ChevronRight className="h-5 w-5" />
              )}
            </button>
          </div>

          {/* Meta row */}
          <div className="mt-3 flex flex-wrap items-center gap-4">
            <span className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 dark:text-gray-400">
              <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
              {totalModules} módulo{totalModules !== 1 ? 's' : ''}
            </span>

            {completedCount > 0 && (
              <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                {completedCount}/{totalModules} completado{completedCount !== 1 ? 's' : ''}
              </span>
            )}

            {/* Phase progress bar */}
            {phaseProgress > 0 && (
              <div className="flex items-center gap-2">
                <div className="h-1.5 w-20 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                  <div
                    className={`h-full rounded-full bg-gradient-to-r ${colors.gradient} transition-all duration-300`}
                    style={{ width: `${phaseProgress}%` }}
                    role="progressbar"
                    aria-valuenow={phaseProgress}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label={`Progreso de la fase: ${phaseProgress}%`}
                  />
                </div>
                <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                  {phaseProgress}%
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modules list (expandable) */}
      {isExpanded && (
        <div
          id={`phase-${phase.id}-modules`}
          className="relative mt-4 ml-6"
          role="list"
          aria-label={`Módulos de la fase ${phase.title}`}
        >
          {/* Vertical timeline line */}
          <div
            className={`absolute left-0 top-0 bottom-0 w-0.5 bg-gradient-to-b ${colors.gradient} opacity-20`}
            aria-hidden="true"
          />

          {/* Module nodes */}
          <div className="space-y-3 pl-6">
            {phase.modules.map((mod) => (
              <div key={mod.id} className="relative" role="listitem">
                {/* Timeline dot */}
                <div
                  className={`absolute -left-[25px] top-5 h-2.5 w-2.5 rounded-full border-2 border-white dark:border-gray-900 ${
                    mod.status === 'completed'
                      ? 'bg-emerald-500'
                      : mod.status === 'in_progress'
                        ? `bg-gradient-to-br ${colors.gradient}`
                        : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                  aria-hidden="true"
                />

                <ModuleNode
                  module={mod}
                  phaseId={phase.id}
                  mode={mode}
                  isCurrent={mod.id === currentModuleId}
                  onClick={onModuleClick}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
