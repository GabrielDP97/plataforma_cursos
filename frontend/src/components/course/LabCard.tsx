import { useState } from 'react';
import {
  FlaskConical,
  ChevronDown,
  ChevronRight,
  Clock,
  Target,
  Lightbulb,
  Package,
  ListChecks,
} from 'lucide-react';
import { getPhaseColors } from './phase-colors';
import type { ViewMode } from './types';

interface LabStep {
  id: string;
  title: string;
  description?: string;
}

interface LabConcept {
  id: string;
  label: string;
}

export interface LabData {
  id: string;
  title: string;
  objective: string;
  concepts: LabConcept[];
  estimatedMinutes: number;
  steps: LabStep[];
  deliverable: string;
}

interface LabCardProps {
  lab: LabData;
  phaseId: string;
  mode: ViewMode;
  isCompleted?: boolean;
  onStart?: (labId: string) => void;
}

/**
 * LabCard — Visual card for laboratory/practice exercises.
 *
 * Differentiated from regular exercises by the flask icon, objective, concepts, steps, and deliverable.
 * Supports expand/collapse, responsive layout, and accessibility.
 */
export function LabCard({
  lab,
  phaseId,

  isCompleted = false,
  onStart,
}: LabCardProps) {
  const [expanded, setExpanded] = useState(false);
  const colors = getPhaseColors(phaseId);

  return (
    <div
      className={`relative overflow-hidden rounded-xl border transition-all duration-200 ${
        isCompleted
          ? 'border-emerald-200 bg-emerald-50/50 dark:border-emerald-800 dark:bg-emerald-950/30'
          : `border-gray-200 bg-white hover:shadow-md dark:border-gray-700 dark:bg-gray-800 dark:hover:border-gray-600`
      }`}
    >
      {/* Completed overlay */}
      {isCompleted && (
        <div
          className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent pointer-events-none"
          aria-hidden="true"
        />
      )}

      {/* Header — always visible */}
      <button
        type="button"
        onClick={() => setExpanded((prev) => !prev)}
        className="flex w-full items-start gap-4 p-5 text-left"
        aria-expanded={expanded}
        aria-label={`${lab.title}, laboratorio de practica`}
      >
        {/* Lab icon */}
        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${colors.bg} ${colors.bgDark}`}
          aria-hidden="true"
        >
          <FlaskConical className={`h-5 w-5 ${colors.text} ${colors.textDark}`} />
        </div>

        {/* Content */}
        <div className="min-w-0 flex-1">
          {/* Badge */}
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${colors.bg} ${colors.bgDark} ${colors.text} ${colors.textDark}`}
          >
            <FlaskConical className="h-3 w-3" />
            Laboratorio
          </span>

          <h3 className="mt-2 text-base font-semibold text-gray-900 dark:text-white">
            {lab.title}
          </h3>

          {/* Objective preview */}
          <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
            {lab.objective}
          </p>

          {/* Meta row */}
          <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {lab.estimatedMinutes} min
            </span>
            <span className="inline-flex items-center gap-1">
              <ListChecks className="h-3.5 w-3.5" />
              {lab.steps.length} pasos
            </span>
            <span className="inline-flex items-center gap-1">
              <Lightbulb className="h-3.5 w-3.5" />
              {lab.concepts.length} conceptos
            </span>
            {isCompleted && (
              <span className="inline-flex items-center gap-1 font-medium text-emerald-600 dark:text-emerald-400">
                Completado
              </span>
            )}
          </div>
        </div>

        {/* Expand toggle */}
        <div className="mt-1 shrink-0 text-gray-400 dark:text-gray-500">
          {expanded ? (
            <ChevronDown className="h-5 w-5" />
          ) : (
            <ChevronRight className="h-5 w-5" />
          )}
        </div>
      </button>

      {/* Expanded details */}
      {expanded && (
        <div className="border-t border-gray-100 px-5 pb-5 pt-4 dark:border-gray-700">
          {/* Concepts */}
          <div className="mb-4">
            <h4 className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
              <Target className="h-3.5 w-3.5" />
              Conceptos
            </h4>
            <div className="flex flex-wrap gap-2">
              {lab.concepts.map((concept) => (
                <span
                  key={concept.id}
                  className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700 dark:bg-gray-700 dark:text-gray-300"
                >
                  {concept.label}
                </span>
              ))}
            </div>
          </div>

          {/* Steps */}
          <div className="mb-4">
            <h4 className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
              <ListChecks className="h-3.5 w-3.5" />
              Pasos
            </h4>
            <ol className="space-y-2">
              {lab.steps.map((step, idx) => (
                <li
                  key={step.id}
                  className="flex items-start gap-3 rounded-lg bg-gray-50 px-3 py-2 dark:bg-gray-700/50"
                >
                  <span
                    className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${colors.bg} ${colors.bgDark} ${colors.text} ${colors.textDark}`}
                    aria-hidden="true"
                  >
                    {idx + 1}
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                      {step.title}
                    </p>
                    {step.description && (
                      <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                        {step.description}
                      </p>
                    )}
                  </div>
                </li>
              ))}
            </ol>
          </div>

          {/* Deliverable */}
          <div className="mb-4 rounded-lg border border-dashed border-amber-300 bg-amber-50/50 px-4 py-3 dark:border-amber-700 dark:bg-amber-950/30">
            <div className="flex items-start gap-2">
              <Package className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" aria-hidden="true" />
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-amber-700 dark:text-amber-300">
                  Entregable
                </p>
                <p className="mt-1 text-sm text-amber-800 dark:text-amber-200">
                  {lab.deliverable}
                </p>
              </div>
            </div>
          </div>

          {/* Start / Continue button */}
          <button
            type="button"
            onClick={() => onStart?.(lab.id)}
            className={`w-full rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors ${
              isCompleted
                ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:hover:bg-emerald-900/50'
                : `bg-gradient-to-r ${colors.gradient} text-white hover:opacity-90`
            }`}
          >
            {isCompleted ? 'Repasar laboratorio' : 'Iniciar laboratorio'}
          </button>
        </div>
      )}
    </div>
  );
}
