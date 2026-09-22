/**
 * Course Experience V2 — Design System
 *
 * Schematic, tech-forward, activity-focused visual tokens.
 * Dark mode first. Neon accents. Every pixel serves a purpose.
 */

// ─── Neon Color Palette ──────────────────────────────────────────────────────

export const NEON = {
  violet: '#8B5CF6',
  blue: '#3B82F6',
  cyan: '#06B6D4',
  magenta: '#EC4899',
  acidGreen: '#22D3EE',
  emerald: '#10B981',
  amber: '#F59E0B',
  rose: '#F43F5E',
  indigo: '#6366F1',
  teal: '#14B8A6',
} as const;

// ─── Semantic Text Colors ────────────────────────────────────────────────────

export const TEXT = {
  light: {
    primary: '#111827',
    secondary: '#374151',
    muted: '#6B7280',
    subtle: '#9CA3AF',
  },
  dark: {
    primary: '#F8FAFC',
    secondary: '#CBD5E1',
    muted: '#94A3B8',
    subtle: '#64748B',
  },
} as const;

// ─── Surface Colors ──────────────────────────────────────────────────────────

export const SURFACE = {
  dark: {
    base: '#0a0a0f',
    raised: '#12121a',
    overlay: '#1a1a25',
    subtle: '#22222e',
    muted: '#2a2a38',
    border: '#2e2e3e',
    borderSubtle: '#232333',
  },
  light: {
    base: '#f8f9fc',
    raised: '#ffffff',
    overlay: '#f1f3f8',
    subtle: '#e8ebf0',
    muted: '#d5d9e2',
    border: '#d0d5e0',
    borderSubtle: '#e2e6ee',
  },
} as const;

// ─── Glow Effects ────────────────────────────────────────────────────────────

export const GLOW = {
  /** Subtle neon glow for cards and panels */
  subtle: (color: string, intensity = 0.15) =>
    `0 0 20px ${color}${Math.round(intensity * 255).toString(16).padStart(2, '0')}`,
  /** Medium glow for active/hover states */
  medium: (color: string, intensity = 0.25) =>
    `0 0 30px ${color}${Math.round(intensity * 255).toString(16).padStart(2, '0')}, 0 0 60px ${color}${Math.round(intensity * 0.5 * 255).toString(16).padStart(2, '0')}`,
  /** Strong glow for primary actions */
  strong: (color: string, intensity = 0.35) =>
    `0 0 40px ${color}${Math.round(intensity * 255).toString(16).padStart(2, '0')}, 0 0 80px ${color}${Math.round(intensity * 0.5 * 255).toString(16).padStart(2, '0')}, 0 0 120px ${color}${Math.round(intensity * 0.25 * 255).toString(16).padStart(2, '0')}`,
  /** Ring glow for focus/active nodes */
  ring: (color: string) =>
    `0 0 0 3px ${color}33, 0 0 15px ${color}22`,
} as const;

// ─── Shadow / Depth Tokens ───────────────────────────────────────────────────

export const DEPTH = {
  none: 'none',
  xs: '0 1px 2px rgba(0, 0, 0, 0.3)',
  sm: '0 2px 4px rgba(0, 0, 0, 0.3), 0 1px 2px rgba(0, 0, 0, 0.2)',
  md: '0 4px 8px rgba(0, 0, 0, 0.3), 0 2px 4px rgba(0, 0, 0, 0.2)',
  lg: '0 8px 16px rgba(0, 0, 0, 0.3), 0 4px 8px rgba(0, 0, 0, 0.2)',
  xl: '0 16px 32px rgba(0, 0, 0, 0.35), 0 8px 16px rgba(0, 0, 0, 0.25)',
} as const;

// ─── Animation Tokens ────────────────────────────────────────────────────────

export const MOTION = {
  durations: {
    instant: '0ms',
    fast: '150ms',
    normal: '250ms',
    slow: '400ms',
    slower: '600ms',
  },
  easings: {
    default: 'cubic-bezier(0.4, 0, 0.2, 1)',
    in: 'cubic-bezier(0.4, 0, 1, 1)',
    out: 'cubic-bezier(0, 0, 0.2, 1)',
    spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
  },
} as const;

// ─── Layout Tokens ───────────────────────────────────────────────────────────

export const LAYOUT = {
  sidebar: {
    width: '280px',
    collapsedWidth: '0px',
    mobileWidth: '300px',
  },
  header: {
    height: '56px',
  },
  node: {
    size: '56px',
    sizeLg: '64px',
    sizeSm: '44px',
  },
  borderRadius: {
    sm: '6px',
    md: '10px',
    lg: '14px',
    xl: '20px',
    full: '9999px',
  },
} as const;

// ─── Typography ──────────────────────────────────────────────────────────────

export const TYPE = {
  fontFamily: {
    sans: 'Inter, system-ui, -apple-system, sans-serif',
    mono: 'JetBrains Mono, Fira Code, monospace',
  },
  weights: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
} as const;

// ─── Utility Functions ───────────────────────────────────────────────────────

/**
 * Get CSS custom properties for a neon color at runtime.
 */
export function neonVar(color: string, prefix = '--neon') {
  return {
    [`${prefix}-color`]: color,
    [`${prefix}-glow-sm`]: GLOW.subtle(color),
    [`${prefix}-glow-md`]: GLOW.medium(color),
    [`${prefix}-glow-lg`]: GLOW.strong(color),
    [`${prefix}-ring`]: GLOW.ring(color),
  };
}

/**
 * Generate reduced-motion safe transition string.
 */
export function transition(
  properties: string[],
  duration = MOTION.durations.normal,
  easing = MOTION.easings.default,
) {
  return properties.map((p) => `${p} ${duration} ${easing}`).join(', ');
}
