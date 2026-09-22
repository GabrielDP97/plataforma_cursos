import { ChevronLeft, ChevronRight, Monitor } from 'lucide-react';
import { HintRevealer } from './HintRevealer';
import { SolutionToggle } from './SolutionToggle';

interface Exercise {
  id: string;
  title: string;
  description: string;
  difficulty: string;
  solution?: string;
  starterCode?: string;
  expectedOutput?: string;
  sampleInput?: string;
  hints?: string[];
  language?: string;
}

interface ExerciseShellProps {
  exercise: Exercise;
  index: number;
  total: number;
  onNavigate?: (direction: 'prev' | 'next') => void;
  isAdmin?: boolean;
}

const DIFFICULTY_CONFIG = {
  basic: { label: 'Basico', classes: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' },
  intermediate: { label: 'Intermedio', classes: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
  advanced: { label: 'Avanzado', classes: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
} as const;

export function ExerciseShell({ exercise, index, total, onNavigate }: ExerciseShellProps) {
  
  const diffConfig = DIFFICULTY_CONFIG[exercise.difficulty as keyof typeof DIFFICULTY_CONFIG] || DIFFICULTY_CONFIG.basic;

  return (
    <div className="rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
      {/* Header */}
      <div className="border-b border-gray-100 px-5 py-4 dark:border-gray-700">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="mb-1.5 flex items-center gap-2">
              <span className="text-xs font-medium text-gray-400">Ejercicio {index + 1}/{total}</span>
              <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${diffConfig.classes}`}>{diffConfig.label}</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{exercise.title}</h3>
          </div>
        </div>
        <p className="mt-2 text-sm leading-relaxed text-gray-600 dark:text-gray-400">{exercise.description}</p>
      </div>

      {/* Expected Output */}
      {exercise.expectedOutput && (
        <div className="mx-5 mb-4 rounded-lg border border-amber-200 bg-amber-50/60 px-5 py-4 dark:border-amber-800/40 dark:bg-amber-950/20">
          <p className="mb-2 text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">Formato de Salida Esperado</p>
          <pre className="overflow-x-auto rounded-md border border-gray-200 bg-white px-4 py-3 font-mono text-sm text-gray-800 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-200">{exercise.expectedOutput}</pre>
          <p className="mt-2 text-xs text-amber-600 dark:text-amber-500">Tu solucion debe producir EXACTAMENTE esta salida. Los espacios, saltos de linea y formato son importantes.</p>
        </div>
      )}

      {/* Sample Input */}
      {exercise.sampleInput && (
        <div className="mx-5 mb-4 rounded-lg border border-blue-200 bg-blue-50/60 px-5 py-4 dark:border-blue-800/40 dark:bg-blue-950/20">
          <p className="mb-2 text-xs font-bold uppercase tracking-wider text-blue-700 dark:text-blue-400">Entrada de Ejemplo</p>
          <pre className="overflow-x-auto rounded-md border border-gray-200 bg-white px-4 py-3 font-mono text-sm text-gray-800 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-200">{exercise.sampleInput}</pre>
        </div>
      )}

      {/* Eclipse callout */}
      <div className="mx-5 mb-4 flex items-center gap-3 rounded-lg border border-indigo-200 bg-indigo-50/60 px-5 py-3 dark:border-indigo-800/40 dark:bg-indigo-950/20">
        <Monitor className="h-5 w-5 shrink-0 text-indigo-600 dark:text-indigo-400" />
        <p className="text-sm text-indigo-700 dark:text-indigo-300">Realiza este ejercicio en Eclipse.</p>
      </div>

      {/* Solution */}
      {exercise.solution && (
        <div className="px-5 pb-4">
          <SolutionToggle solution={exercise.solution} />
        </div>
      )}

      {/* Hints */}
      {exercise.hints && exercise.hints.length > 0 && (
        <div className="px-5 pb-4">
          <HintRevealer hints={exercise.hints} />
        </div>
      )}

      {/* Navigation */}
      {onNavigate && (
        <div className="flex items-center justify-between border-t border-gray-100 px-5 py-3 dark:border-gray-700">
          <button type="button" onClick={() => onNavigate('prev')} disabled={index === 0} className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 disabled:opacity-30 dark:text-gray-400 dark:hover:text-gray-200">
            <ChevronLeft className="h-4 w-4" /> Anterior
          </button>
          <button type="button" onClick={() => onNavigate('next')} disabled={index === total - 1} className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 disabled:opacity-30 dark:text-gray-400 dark:hover:text-gray-200">
            Siguiente <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}
