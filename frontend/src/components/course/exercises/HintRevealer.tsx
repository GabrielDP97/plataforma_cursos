import { useState } from 'react';
import { Lightbulb, ChevronDown, ChevronUp } from 'lucide-react';

interface HintRevealerProps {
  hints: string[];
}

export function HintRevealer({ hints }: HintRevealerProps) {
  const [revealedCount, setRevealedCount] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);

  if (!hints || hints.length === 0) return null;

  const revealNext = () => {
    if (revealedCount < hints.length) {
      setRevealedCount((c) => c + 1);
      setIsExpanded(true);
    }
  };

  const allRevealed = revealedCount >= hints.length;

  return (
    <div className="rounded-lg border border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/30">
      <button
        type="button"
        onClick={() => {
          if (!allRevealed) revealNext();
          else setIsExpanded(!isExpanded);
        }}
        className="flex w-full items-center justify-between px-4 py-3 text-left"
      >
        <div className="flex items-center gap-2">
          <Lightbulb className="h-4 w-4 text-amber-600 dark:text-amber-400" />
          <span className="text-sm font-medium text-amber-800 dark:text-amber-300">
            Pistas ({revealedCount}/{hints.length})
          </span>
        </div>
        {revealedCount > 0 && (
          isExpanded ? (
            <ChevronUp className="h-4 w-4 text-amber-600" />
          ) : (
            <ChevronDown className="h-4 w-4 text-amber-600" />
          )
        )}
      </button>

      {isExpanded && revealedCount > 0 && (
        <div className="border-t border-amber-200 px-4 pb-3 dark:border-amber-800">
          <ol className="mt-2 space-y-2">
            {hints.slice(0, revealedCount).map((hint, index) => (
              <li key={index} className="flex gap-2 text-sm text-amber-800 dark:text-amber-200">
                <span className="shrink-0 font-semibold text-amber-500">{index + 1}.</span>
                <span>{hint}</span>
              </li>
            ))}
          </ol>
        </div>
      )}

      {!allRevealed && (
        <div className="border-t border-amber-200 px-4 py-2 dark:border-amber-800">
          <button
            type="button"
            onClick={revealNext}
            className="text-xs font-medium text-amber-600 hover:text-amber-700 dark:text-amber-400 dark:hover:text-amber-300"
          >
            + Mostrar siguiente pista
          </button>
        </div>
      )}
    </div>
  );
}
