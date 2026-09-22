/**
 * Phase color system — Vivid neon palette.
 *
 * Each phase has a distinct, highly saturated neon identity for visual hierarchy.
 * Works in both dark and light mode via Tailwind CSS v4.
 * More vivid gradients, stronger glow, better contrast per Algorithmics research.
 *
 * Light mode uses darker text shades (600-700) for contrast on white backgrounds.
 * Dark mode uses lighter text shades (300-400) for contrast on dark backgrounds.
 */
export const PHASE_COLORS = {
  'phase-1': {
    bg: 'bg-violet-500/15',
    bgDark: 'dark:bg-violet-500/25',
    text: 'text-violet-600',
    textDark: 'dark:text-violet-300',
    border: 'border-violet-400/35',
    borderDark: 'dark:border-violet-400/55',
    ring: 'ring-violet-400/35',
    accent: '#A78BFA',
    gradient: 'from-violet-400 via-purple-500 to-violet-600',
    glow: 'shadow-violet-400/35',
    lightBg: 'bg-violet-50',
    lightBgDark: 'dark:bg-violet-950/70',
  },
  'phase-2': {
    bg: 'bg-blue-500/15',
    bgDark: 'dark:bg-blue-500/25',
    text: 'text-blue-600',
    textDark: 'dark:text-blue-300',
    border: 'border-blue-400/35',
    borderDark: 'dark:border-blue-400/55',
    ring: 'ring-blue-400/35',
    accent: '#60A5FA',
    gradient: 'from-blue-400 via-sky-500 to-blue-600',
    glow: 'shadow-blue-400/35',
    lightBg: 'bg-blue-50',
    lightBgDark: 'dark:bg-blue-950/70',
  },
  'phase-3': {
    bg: 'bg-cyan-500/15',
    bgDark: 'dark:bg-cyan-500/25',
    text: 'text-cyan-600',
    textDark: 'dark:text-cyan-300',
    border: 'border-cyan-400/35',
    borderDark: 'dark:border-cyan-400/55',
    ring: 'ring-cyan-400/35',
    accent: '#22D3EE',
    gradient: 'from-cyan-300 via-cyan-400 to-teal-500',
    glow: 'shadow-cyan-400/35',
    lightBg: 'bg-cyan-50',
    lightBgDark: 'dark:bg-cyan-950/70',
  },
  'phase-4': {
    bg: 'bg-amber-500/15',
    bgDark: 'dark:bg-amber-500/25',
    text: 'text-amber-600',
    textDark: 'dark:text-amber-300',
    border: 'border-amber-400/35',
    borderDark: 'dark:border-amber-400/55',
    ring: 'ring-amber-400/35',
    accent: '#FBBF24',
    gradient: 'from-amber-400 via-orange-400 to-amber-500',
    glow: 'shadow-amber-400/35',
    lightBg: 'bg-amber-50',
    lightBgDark: 'dark:bg-amber-950/70',
  },
  'phase-5': {
    bg: 'bg-emerald-500/15',
    bgDark: 'dark:bg-emerald-500/25',
    text: 'text-emerald-600',
    textDark: 'dark:text-emerald-300',
    border: 'border-emerald-400/35',
    borderDark: 'dark:border-emerald-400/55',
    ring: 'ring-emerald-400/35',
    accent: '#34D399',
    gradient: 'from-emerald-400 via-teal-400 to-emerald-500',
    glow: 'shadow-emerald-400/35',
    lightBg: 'bg-emerald-50',
    lightBgDark: 'dark:bg-emerald-950/70',
  },
  'phase-6': {
    bg: 'bg-teal-500/15',
    bgDark: 'dark:bg-teal-500/25',
    text: 'text-teal-600',
    textDark: 'dark:text-teal-300',
    border: 'border-teal-400/35',
    borderDark: 'dark:border-teal-400/55',
    ring: 'ring-teal-400/35',
    accent: '#2DD4BF',
    gradient: 'from-teal-300 via-cyan-400 to-teal-500',
    glow: 'shadow-teal-400/35',
    lightBg: 'bg-teal-50',
    lightBgDark: 'dark:bg-teal-950/70',
  },
  'phase-7': {
    bg: 'bg-indigo-500/15',
    bgDark: 'dark:bg-indigo-500/25',
    text: 'text-indigo-600',
    textDark: 'dark:text-indigo-300',
    border: 'border-indigo-400/35',
    borderDark: 'dark:border-indigo-400/55',
    ring: 'ring-indigo-400/35',
    accent: '#818CF8',
    gradient: 'from-indigo-400 via-violet-400 to-indigo-500',
    glow: 'shadow-indigo-400/35',
    lightBg: 'bg-indigo-50',
    lightBgDark: 'dark:bg-indigo-950/70',
  },
  'phase-8': {
    bg: 'bg-rose-500/15',
    bgDark: 'dark:bg-rose-500/25',
    text: 'text-rose-600',
    textDark: 'dark:text-rose-300',
    border: 'border-rose-400/35',
    borderDark: 'dark:border-rose-400/55',
    ring: 'ring-rose-400/35',
    accent: '#FB7185',
    gradient: 'from-rose-400 via-pink-400 to-rose-500',
    glow: 'shadow-rose-400/35',
    lightBg: 'bg-rose-50',
    lightBgDark: 'dark:bg-rose-950/70',
  },
} as const;

export type PhaseId = keyof typeof PHASE_COLORS;

/**
 * Get the color set for a phase ID, with fallback to phase-1.
 */
export function getPhaseColors(phaseId: string) {
  return PHASE_COLORS[phaseId as PhaseId] ?? PHASE_COLORS['phase-1'];
}
