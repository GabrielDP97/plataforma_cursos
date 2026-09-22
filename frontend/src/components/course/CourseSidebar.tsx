import { useState, useMemo } from 'react';
import { ChevronDown, ChevronRight, CheckCircle, Circle, Clock, Lock, GraduationCap } from 'lucide-react';
import type { ModuleNode } from './types';
import { getPhaseColors } from './phase-colors';

interface CourseSidebarProps {
  courseName: string;
  modules: ModuleNode[];
  activeModuleId?: string;
  onModuleClick?: (moduleId: string) => void;
  mode: 'student' | 'admin_preview';
}

const statusIcons: Record<string, typeof Circle> = {
  completed: CheckCircle,
  in_progress: Clock,
  not_started: Circle,
  locked: Lock,
};

const statusColors: Record<string, string> = {
  completed: 'text-emerald-400',
  in_progress: 'text-amber-400',
  not_started: 'text-gray-500',
  locked: 'text-gray-600',
};

/** Phase groups for the programming course sidebar */
const PHASE_GROUPS = [
  { id: 'phase-1', title: 'Fundamentos', range: [1, 2] as const },
  { id: 'phase-2', title: 'Control', range: [3, 4] as const },
  { id: 'phase-3', title: 'Estructuraci\u00f3n', range: [5, 5] as const },
  { id: 'phase-4', title: 'POO', range: [6, 10] as const },
  { id: 'phase-5', title: 'Colecciones', range: [11, 12] as const },
  { id: 'phase-6', title: 'Persistencia', range: [13, 17] as const },
  { id: 'phase-7', title: 'Proyecto', range: [18, 18] as const },
];

export function CourseSidebar({ courseName, modules, activeModuleId, onModuleClick }: CourseSidebarProps) {
  // Auto-expand the phase containing the active module
  const initialPhase = useMemo(() => {
    if (!activeModuleId) return 'phase-1';
    const mod = modules.find(m => m.id === activeModuleId);
    if (!mod) return 'phase-1';
    const group = PHASE_GROUPS.find(g => mod.position >= g.range[0] && mod.position <= g.range[1]);
    return group?.id ?? 'phase-1';
  }, [activeModuleId, modules]);

  const [expandedPhases, setExpandedPhases] = useState<Set<string>>(new Set([initialPhase]));

  const phases = useMemo(() =>
    PHASE_GROUPS.map(pg => ({
      ...pg,
      modules: modules.filter(m => m.position >= pg.range[0] && m.position <= pg.range[1]),
    })),
    [modules]
  );

  // Compute overall progress
  const totalModules = modules.length;
  const completedCount = modules.filter(m => m.status === 'completed').length;
  const overallProgress = totalModules > 0 ? Math.round((completedCount / totalModules) * 100) : 0;

  const togglePhase = (phaseId: string) => {
    setExpandedPhases(prev => {
      const next = new Set(prev);
      if (next.has(phaseId)) next.delete(phaseId);
      else next.add(phaseId);
      return next;
    });
  };

  return (
    <aside className="w-64 bg-[#0a0a0f] border-r border-white/5 flex flex-col h-full overflow-y-auto">
      {/* Course header */}
      <div className="p-4 border-b border-white/5">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600">
            <GraduationCap className="h-4 w-4 text-white" />
          </div>
          <h2 className="text-sm font-bold text-white truncate leading-tight">{courseName}</h2>
        </div>

        {/* Overall progress */}
        <div className="mt-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-medium uppercase tracking-wider text-gray-500">Progreso</span>
            <span className="text-[11px] font-bold text-gray-300 font-mono">{overallProgress}%</span>
          </div>
          <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-violet-500 via-cyan-400 to-emerald-400 rounded-full transition-all duration-500"
              style={{ width: `${overallProgress}%` }}
            />
          </div>
          <div className="mt-1 flex items-center gap-1.5">
            <span className="text-[10px] text-gray-500">{completedCount}/{totalModules} m\u00f3dulos</span>
          </div>
        </div>
      </div>

      {/* Module list */}
      <nav className="flex-1 overflow-y-auto py-1">
        {phases.map(phase => {
          const phaseColors = getPhaseColors(phase.id);
          const hasActiveModule = phase.modules.some(m => m.id === activeModuleId);
          const isExpanded = expandedPhases.has(phase.id);

          return (
            <div key={phase.id} className="mb-0.5">
              <button
                onClick={() => togglePhase(phase.id)}
                className={`w-full flex items-center gap-2 px-3 py-2 text-[11px] font-semibold uppercase tracking-wider transition-colors ${
                  hasActiveModule
                    ? 'text-white'
                    : 'text-gray-500 hover:text-gray-300'
                }`}
                style={hasActiveModule ? { color: phaseColors.accent } : undefined}
              >
                {isExpanded
                  ? <ChevronDown className="w-3 h-3 shrink-0" />
                  : <ChevronRight className="w-3 h-3 shrink-0" />
                }
                <span className="truncate">{phase.title}</span>
                <span className="ml-auto text-[9px] font-mono opacity-50">{phase.modules.length}</span>
              </button>

              {isExpanded && (
                <div className="ml-1.5 border-l border-white/5 pl-1">
                  {phase.modules.map(mod => {
                    const Icon = statusIcons[mod.status] || Circle;
                    const isActive = mod.id === activeModuleId;
                    return (
                      <button
                        key={mod.id}
                        onClick={() => onModuleClick?.(mod.id)}
                        className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 text-xs rounded-md transition-all duration-150 ${
                          isActive
                            ? 'bg-white/10 text-white font-medium'
                            : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
                        }`}
                        style={isActive ? {
                          background: `linear-gradient(to right, ${phaseColors.accent}18, ${phaseColors.accent}08)`,
                          borderLeft: `2px solid ${phaseColors.accent}`,
                          marginLeft: '-1px',
                          paddingLeft: '9px',
                        } : { borderLeft: '2px solid transparent', marginLeft: '-1px', paddingLeft: '9px' }}
                      >
                        <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? '' : statusColors[mod.status]}`}
                          style={isActive ? { color: phaseColors.accent } : undefined}
                        />
                        <span className="truncate">{mod.title}</span>
                        {mod.status === 'completed' && (
                          <span className="ml-auto h-1.5 w-1.5 rounded-full bg-emerald-400 shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>
    </aside>
  );
}
