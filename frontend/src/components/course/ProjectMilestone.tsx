import { useState } from 'react';
import {
  Rocket,
  ChevronDown,
  ChevronRight,
  CheckCircle2,
  Circle,
  PlayCircle,
  Lock,
  Code2,
  Wrench,
} from 'lucide-react';

import type { ViewMode } from './types';

export type MilestoneStatus = 'locked' | 'not_started' | 'in_progress' | 'completed';

interface MilestonePhase {
  id: string;
  title: string;
  description: string;
  status: MilestoneStatus;
  deliverables: string[];
}

export interface ProjectData {
  id: string;
  title: string;
  description: string;
  technologies: string[];
  phases: MilestonePhase[];
  progress: number;
}

interface ProjectMilestoneProps {
  project: ProjectData;
  phaseId: string;
  mode: ViewMode;
  onStartPhase?: (phaseId: string) => void;
}

const MILESTONE_STATUS_CONFIG: Record<
  MilestoneStatus,
  { icon: typeof CheckCircle2; label: string; colorClass: string; bgClass: string }
> = {
  completed: {
    icon: CheckCircle2,
    label: 'Completada',
    colorClass: 'text-emerald-500 dark:text-emerald-400',
    bgClass: 'bg-emerald-100 dark:bg-emerald-900/30',
  },
  in_progress: {
    icon: PlayCircle,
    label: 'En progreso',
    colorClass: 'text-blue-500 dark:text-blue-400',
    bgClass: 'bg-blue-100 dark:bg-blue-900/30',
  },
  not_started: {
    icon: Circle,
    label: 'No iniciada',
    colorClass: 'text-gray-400 dark:text-gray-500',
    bgClass: 'bg-gray-100 dark:bg-gray-700',
  },
  locked: {
    icon: Lock,
    label: 'Bloqueada',
    colorClass: 'text-gray-300 dark:text-gray-600',
    bgClass: 'bg-gray-50 dark:bg-gray-800',
  },
};

/**
 * ProjectMilestone — Special card for the final project (Module 18).
 *
 * Features milestone phases, technology stack, progress tracking,
 * and a distinct visual treatment to differentiate from regular modules.
 */
export function ProjectMilestone({
  project,

  mode,
  onStartPhase,
}: ProjectMilestoneProps) {
  const [expandedPhases, setExpandedPhases] = useState<Set<string>>(new Set());
  // colors removed - not used in this component

  const completedPhases = project.phases.filter((p) => p.status === 'completed').length;
  const totalPhases = project.phases.length;

  const togglePhase = (pid: string) => {
    setExpandedPhases((prev) => {
      const next = new Set(prev);
      if (next.has(pid)) {
        next.delete(pid);
      } else {
        next.add(pid);
      }
      return next;
    });
  };

  return (
    <div className="relative overflow-hidden rounded-2xl border-2 border-indigo-200 bg-white dark:border-indigo-800 dark:bg-gray-800">
      {/* Gradient header */}
      <div className="relative bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-600 px-6 py-6">
        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
          <div className="absolute -top-8 -right-8 h-32 w-32 rounded-full bg-white/10" />
          <div className="absolute -bottom-4 -left-4 h-24 w-24 rounded-full bg-white/5" />
        </div>

        <div className="relative">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-bold text-white backdrop-blur-sm">
            <Rocket className="h-3.5 w-3.5" />
            Proyecto Final
          </span>

          <h3 className="mt-3 text-xl font-bold text-white sm:text-2xl">
            {project.title}
          </h3>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-indigo-100/90">
            {project.description}
          </p>

          {/* Technologies */}
          <div className="mt-4 flex flex-wrap gap-2">
            {project.technologies.map((tech) => (
              <span
                key={tech}
                className="inline-flex items-center gap-1 rounded-full bg-white/15 px-2.5 py-1 text-xs font-medium text-white/90 backdrop-blur-sm"
              >
                <Code2 className="h-3 w-3" />
                {tech}
              </span>
            ))}
          </div>

          {/* Progress bar */}
          <div className="mt-5 max-w-md">
            <div className="mb-1.5 flex items-center justify-between text-xs">
              <span className="font-medium text-white/80">
                {completedPhases}/{totalPhases} fases completadas
              </span>
              <span className="font-bold text-white">{project.progress}%</span>
            </div>
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-white/20">
              <div
                className="h-full rounded-full bg-gradient-to-r from-cyan-300 to-white transition-all duration-500"
                style={{ width: `${project.progress}%` }}
                role="progressbar"
                aria-valuenow={project.progress}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`Progreso del proyecto: ${project.progress}%`}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Milestone phases */}
      <div className="px-6 py-5">
        <h4 className="mb-4 flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-white">
          <Wrench className="h-4 w-4 text-gray-400" />
          Fases del proyecto
        </h4>

        <div className="space-y-3">
          {project.phases.map((milestone) => {
            const statusConfig = MILESTONE_STATUS_CONFIG[milestone.status];
            const StatusIcon = statusConfig.icon;
            const isExpanded = expandedPhases.has(milestone.id);
            const isClickable =
              milestone.status !== 'locked' || mode === 'admin_preview';

            return (
              <div key={milestone.id}>
                {/* Phase header */}
                <button
                  type="button"
                  onClick={() => isClickable && togglePhase(milestone.id)}
                  disabled={!isClickable}
                  className={`flex w-full items-center gap-3 rounded-lg p-3 text-left transition-colors ${
                    isClickable
                      ? 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
                      : 'cursor-not-allowed opacity-60'
                  }`}
                  aria-expanded={isExpanded}
                >
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4 shrink-0 text-gray-400" />
                  ) : (
                    <ChevronRight className="h-4 w-4 shrink-0 text-gray-400" />
                  )}

                  <div
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${statusConfig.bgClass}`}
                  >
                    <StatusIcon className={`h-4 w-4 ${statusConfig.colorClass}`} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                      {milestone.title}
                    </p>
                    <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                      {milestone.description}
                    </p>
                  </div>

                  <span
                    className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${statusConfig.bgClass} ${statusConfig.colorClass}`}
                  >
                    {statusConfig.label}
                  </span>
                </button>

                {/* Expanded deliverables */}
                {isExpanded && (
                  <div className="ml-11 mt-1 rounded-lg bg-gray-50 px-4 py-3 dark:bg-gray-700/30">
                    <h5 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                      Entregables
                    </h5>
                    <ul className="space-y-1.5">
                      {milestone.deliverables.map((deliverable, idx) => (
                        <li
                          key={idx}
                          className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300"
                        >
                          <CheckCircle2
                            className={`mt-0.5 h-3.5 w-3.5 shrink-0 ${
                              milestone.status === 'completed'
                                ? 'text-emerald-500'
                                : 'text-gray-300 dark:text-gray-600'
                            }`}
                          />
                          {deliverable}
                        </li>
                      ))}
                    </ul>

                    {milestone.status !== 'locked' && milestone.status !== 'completed' && (
                      <button
                        type="button"
                        onClick={() => onStartPhase?.(milestone.id)}
                        className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-indigo-700"
                      >
                        {milestone.status === 'in_progress' ? 'Continuar fase' : 'Iniciar fase'}
                        <ChevronRight className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
