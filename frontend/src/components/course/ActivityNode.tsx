import { useMemo } from 'react';
import {
  BookOpen, Code2, Pencil, FlaskConical, CheckCircle2, FileText, Star,
  Bug, ShieldCheck, Rocket, Target, CircleDot,
} from 'lucide-react';
import { GLOW } from './design-system';

/**
 * Activity types with per-type visual identity.
 * Each type has a distinct gradient, icon, and accent color.
 */
export type ActivityNodeType =
  | 'theory' | 'code' | 'exercise' | 'documentation'
  | 'lab' | 'checkpoint' | 'debugging' | 'project'
  | 'concept' | 'challenge' | 'quiz';

export interface ActivityNodeData {
  id: string;
  position: number;
  title: string;
  type: ActivityNodeType;
  status: 'not_started' | 'in_progress' | 'completed';
  completedCount: number;
  totalCount: number;
}

interface ActivityNodeProps {
  activity: ActivityNodeData;
  /** @deprecated Per-type colors now used instead of phase colors. */
  phaseId?: string;
  onClick?: (activityId: string) => void;
  size?: 'sm' | 'md' | 'lg';
}

/**
 * Per-type visual configuration — icon, gradient, accent color, label.
 * Each activity type gets a unique neon identity with vivid gradients.
 */
const TYPE_CONFIG: Record<ActivityNodeType, {
  icon: typeof BookOpen;
  label: string;
  accentHex: string;
  gradient: string;
  glowIntensity: number;
}> = {
  theory:       { icon: BookOpen,     label: 'Teoría',         accentHex: '#60A5FA', gradient: 'linear-gradient(135deg, #3B82F6, #60A5FA)', glowIntensity: 0.35 },
  code:         { icon: Code2,        label: 'Código',         accentHex: '#22D3EE', gradient: 'linear-gradient(135deg, #06B6D4, #22D3EE)', glowIntensity: 0.4 },
  exercise:     { icon: Pencil,       label: 'Ejercicio',      accentHex: '#A78BFA', gradient: 'linear-gradient(135deg, #8B5CF6, #A78BFA)', glowIntensity: 0.35 },
  documentation:{ icon: FileText,     label: 'Documentación',  accentHex: '#818CF8', gradient: 'linear-gradient(135deg, #6366F1, #818CF8)', glowIntensity: 0.3 },
  debugging:    { icon: Bug,          label: 'Debugging',      accentHex: '#FBBF24', gradient: 'linear-gradient(135deg, #F59E0B, #FBBF24)', glowIntensity: 0.4 },
  lab:          { icon: FlaskConical, label: 'Laboratorio',    accentHex: '#34D399', gradient: 'linear-gradient(135deg, #10B981, #34D399)', glowIntensity: 0.35 },
  checkpoint:   { icon: ShieldCheck,  label: 'Checkpoint',     accentHex: '#FB7185', gradient: 'linear-gradient(135deg, #F43F5E, #FB7185)', glowIntensity: 0.4 },
  project:      { icon: Rocket,       label: 'Proyecto',       accentHex: '#F472B6', gradient: 'linear-gradient(135deg, #EC4899, #F472B6, #C084FC)', glowIntensity: 0.45 },
  concept:      { icon: Star,         label: 'Concepto',       accentHex: '#FBBF24', gradient: 'linear-gradient(135deg, #F59E0B, #FBBF24)', glowIntensity: 0.35 },
  challenge:    { icon: Target,       label: 'Reto',           accentHex: '#2DD4BF', gradient: 'linear-gradient(135deg, #14B8A6, #2DD4BF)', glowIntensity: 0.35 },
  quiz:         { icon: CircleDot,    label: 'Quiz',           accentHex: '#F472B6', gradient: 'linear-gradient(135deg, #EC4899, #F472B6)', glowIntensity: 0.35 },
};

const SIZE_MAP = {
  sm: { outer: 40, icon: 'h-4 w-4', badge: 'h-3.5 w-3.5 text-[7px]' },
  md: { outer: 56, icon: 'h-5 w-5', badge: 'h-4 w-4 text-[8px]' },
  lg: { outer: 64, icon: 'h-6 w-6', badge: 'h-5 w-5 text-[9px]' },
};

/**
 * ActivityNode — Circular node representing a single activity.
 *
 * Visual: per-type gradient background, neon glow on hover/active, position badge,
 * type label, progress ring, and completed status indicator.
 */
export function ActivityNode({
  activity,
  onClick,
  size = 'md',
}: ActivityNodeProps) {
  const config = TYPE_CONFIG[activity.type] ?? TYPE_CONFIG.theory;
  const Icon = config.icon;
  const isComplete = activity.status === 'completed';
  const isActive = activity.status === 'in_progress';
  const sizeConfig = SIZE_MAP[size];

  const circleStyle = useMemo<React.CSSProperties>(() => {
    const base: React.CSSProperties = {
      width: sizeConfig.outer,
      height: sizeConfig.outer,
      borderRadius: '50%',
      border: '2px solid transparent',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
    };

    if (isComplete) {
      return {
        ...base,
        borderColor: '#10B981',
        background: 'linear-gradient(135deg, rgba(16,185,129,0.3), rgba(52,211,153,0.1))',
        boxShadow: `${GLOW.ring('#10B981')}, ${GLOW.subtle('#10B981', 0.2)}`,
      };
    }

    if (isActive) {
      return {
        ...base,
        borderColor: config.accentHex,
        background: `linear-gradient(135deg, ${config.accentHex}38, ${config.accentHex}12)`,
        boxShadow: `${GLOW.medium(config.accentHex, config.glowIntensity)}, inset 0 0 12px ${config.accentHex}15`,
      };
    }

    // Not started — subtle per-type tint; stronger border for light mode visibility
    return {
      ...base,
      borderColor: `${config.accentHex}50`,
      background: `linear-gradient(135deg, ${config.accentHex}10, ${config.accentHex}08)`,
      boxShadow: 'none',
    };
  }, [isComplete, isActive, config, sizeConfig]);

  const iconColor = isComplete ? '#34D399' : isActive ? config.accentHex : `${config.accentHex}CC`;

  return (
    <button
      type="button"
      onClick={() => onClick?.(activity.id)}
      className="group relative flex flex-col items-center gap-2 transition-all duration-300"
      aria-label={`${config.label} ${activity.position}: ${activity.title}`}
    >
      {/* Hover glow — radial neon bloom */}
      <div
        className="pointer-events-none absolute -inset-4 rounded-full opacity-0 blur-2xl transition-opacity duration-400 group-hover:opacity-100"
        style={{
          background: `radial-gradient(circle, ${config.accentHex}40 0%, ${config.accentHex}15 40%, transparent 70%)`,
        }}
        aria-hidden="true"
      />

      {/* Node circle */}
      <div className="relative">
        <div style={circleStyle}>
          {/* Progress ring (SVG) */}
          {activity.totalCount > 0 && (
            <svg
              className="absolute inset-0 -rotate-90"
              viewBox="0 0 100 100"
              aria-hidden="true"
            >
              <circle
                cx="50" cy="50" r="46"
                fill="none"
                stroke={isComplete ? '#10B981' : isActive ? `${config.accentHex}60` : `${config.accentHex}20`}
                strokeWidth="3"
                strokeDasharray={`${(activity.completedCount / Math.max(activity.totalCount, 1)) * 289} 289`}
                strokeLinecap="round"
                className="transition-all duration-500"
              />
            </svg>
          )}

          {/* Icon */}
          <span className="relative z-10">
            {isComplete ? (
              <CheckCircle2 className={sizeConfig.icon} style={{ color: '#34D399' }} />
            ) : (
              <Icon className={sizeConfig.icon} style={{ color: iconColor }} />
            )}
          </span>
        </div>

        {/* Position badge — tinted with type accent */}
        <span
          className={`absolute -top-1 -right-1 flex items-center justify-center rounded-full font-bold dark:bg-gray-900 bg-white ${sizeConfig.badge}`}
          style={{
            border: `1.5px solid ${isActive || isComplete ? config.accentHex : '#9CA3AF'}`,
            background: isActive
              ? `linear-gradient(135deg, ${config.accentHex}40, ${config.accentHex}20)`
              : undefined,
            color: isActive ? config.accentHex : '#6B7280',
          }}
        >
          {activity.position}
        </span>

        {/* Active pulse */}
        {isActive && (
          <span
            className="absolute inset-0 animate-ping rounded-full opacity-15"
            style={{ backgroundColor: config.accentHex }}
            aria-hidden="true"
          />
        )}
      </div>

      {/* Labels */}
      <div className="flex flex-col items-center gap-0.5 max-w-[80px]">
        <span
          className="text-[10px] font-semibold uppercase tracking-wider transition-colors duration-200 dark:text-gray-400"
          style={{ color: isActive ? config.accentHex : isComplete ? '#34D399' : undefined }}
        >
          {config.label}
        </span>
        <span className="text-[11px] font-medium text-center leading-tight line-clamp-2 text-gray-700 dark:text-gray-300">
          {activity.title}
        </span>
      </div>
    </button>
  );
}

/** Label map — re-exported for filter tabs and accessibility. */
export const ACTIVITY_LABELS: Record<ActivityNodeType, string> = Object.fromEntries(
  Object.entries(TYPE_CONFIG).map(([type, cfg]) => [type, cfg.label])
) as Record<ActivityNodeType, string>;
