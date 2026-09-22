import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface SolutionToggleProps {
  solution: string;
  isAdmin?: boolean;
}

export function SolutionToggle({ solution, isAdmin = false }: SolutionToggleProps) {
  const [visible, setVisible] = useState(false);

  if (!solution) return null;

  const isVisible = isAdmin || visible;

  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
      <button
        type="button"
        onClick={() => setVisible(!visible)}
        className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm font-medium text-indigo-600 transition-colors hover:bg-gray-50 dark:text-indigo-400 dark:hover:bg-gray-800"
        aria-expanded={isVisible}
      >
        {isVisible ? (
          <ChevronUp className="h-4 w-4 shrink-0" />
        ) : (
          <ChevronDown className="h-4 w-4 shrink-0" />
        )}
        <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
          Comprobar solucion
        </span>
      </button>

      {isVisible && (
        <div className="border-t border-gray-200 dark:border-gray-700">
          <div className="bg-indigo-50/50 px-4 py-2 dark:bg-indigo-950/20">
            <p className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Solucion Propuesta
            </p>
          </div>
          <pre className="overflow-x-auto bg-slate-900 p-4 text-sm leading-relaxed text-slate-100">
            <code>{solution}</code>
          </pre>
        </div>
      )}
    </div>
  );
}
