import { ChevronLeft, ChevronRight, CheckCircle2 } from 'lucide-react';
import { Button } from '../ui/button';

interface LessonNavProps {
  hasPrevious: boolean;
  hasNext: boolean;
  isCompleted: boolean;
  onPrevious: () => void;
  onNext: () => void;
  onMarkComplete: () => void;
  markingComplete?: boolean;
}

export function LessonNav({
  hasPrevious,
  hasNext,
  isCompleted,
  onPrevious,
  onNext,
  onMarkComplete,
  markingComplete = false,
}: LessonNavProps) {
  return (
    <div className="flex items-center justify-between border-t border-gray-200 pt-4 mt-6">
      <Button
        variant="ghost"
        onClick={onPrevious}
        disabled={!hasPrevious}
      >
        <ChevronLeft className="h-4 w-4" />
        Anterior
      </Button>

      <div className="flex items-center gap-3">
        {!isCompleted ? (
          <Button
            variant="primary"
            onClick={onMarkComplete}
            loading={markingComplete}
          >
            <CheckCircle2 className="h-4 w-4" />
            Marcar como completada
          </Button>
        ) : (
          <span className="flex items-center gap-2 text-sm font-medium text-green-600">
            <CheckCircle2 className="h-5 w-5" />
            Completada
          </span>
        )}
      </div>

      <Button
        variant="ghost"
        onClick={onNext}
        disabled={!hasNext}
      >
        Siguiente
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}
