import { PhaseSection } from './PhaseSection';
import type { Phase, ViewMode } from './types';

interface LearningPathProps {
  phases: Phase[];
  moduleProgress?: Record<string, number>;
  currentModuleId?: string;
  mode: ViewMode;
  onModuleClick?: (moduleId: string) => void;
}

/**
 * LearningPath — A reusable component that shows the course learning path with phases and modules.
 *
 * Renders phases in order, each with a vertical timeline of ModuleNode cards.
 * Supports student and admin_preview modes.
 */
export function LearningPath({
  phases,
  currentModuleId,
  mode,
  onModuleClick,
}: LearningPathProps) {
  // Find which phase the current module belongs to, for expanded-by-default
  const currentPhaseId = currentModuleId
    ? phases.find((p) => p.modules.some((m) => m.id === currentModuleId))?.id
    : undefined;

  return (
    <nav aria-label="Ruta de aprendizaje">
      <div className="space-y-6">
        {phases.map((phase, index) => (
          <PhaseSection
            key={phase.id}
            phase={phase}
            index={index}
            mode={mode}
            currentModuleId={currentModuleId}
            expandedByDefault={phase.id === currentPhaseId}
            onModuleClick={onModuleClick}
          />
        ))}
      </div>
    </nav>
  );
}
