/**
 * Course registry — statically imports ALL courses and their modules.
 *
 * Vite resolves static imports at build time, so we import everything here
 * and expose a runtime lookup by courseId.
 */
import programmingCourseData from '../../../courses/programming/course.json';
import databasesCourseData from '../../../courses/databases/course.json';

import programmingMod01 from '../../../courses/programming/modules/mod-01.json';
import programmingMod02 from '../../../courses/programming/modules/mod-02.json';
import programmingMod03 from '../../../courses/programming/modules/mod-03.json';
import programmingMod04 from '../../../courses/programming/modules/mod-04.json';
import programmingMod05 from '../../../courses/programming/modules/mod-05.json';
import programmingMod06 from '../../../courses/programming/modules/mod-06.json';
import programmingMod07 from '../../../courses/programming/modules/mod-07.json';
import programmingMod08 from '../../../courses/programming/modules/mod-08.json';
import programmingMod09 from '../../../courses/programming/modules/mod-09.json';
import programmingMod10 from '../../../courses/programming/modules/mod-10.json';
import programmingMod11 from '../../../courses/programming/modules/mod-11.json';
import programmingMod12 from '../../../courses/programming/modules/mod-12.json';
import programmingMod13 from '../../../courses/programming/modules/mod-13.json';
import programmingMod14 from '../../../courses/programming/modules/mod-14.json';
import programmingMod15 from '../../../courses/programming/modules/mod-15.json';
import programmingMod16 from '../../../courses/programming/modules/mod-16.json';
import programmingMod17 from '../../../courses/programming/modules/mod-17.json';
import programmingMod18 from '../../../courses/programming/modules/mod-18.json';

import databasesMod01 from '../../../courses/databases/modules/mod-01.json';
import databasesMod02 from '../../../courses/databases/modules/mod-02.json';
import databasesMod03 from '../../../courses/databases/modules/mod-03.json';
import databasesMod04 from '../../../courses/databases/modules/mod-04.json';
import databasesMod05 from '../../../courses/databases/modules/mod-05.json';
import databasesMod06 from '../../../courses/databases/modules/mod-06.json';
import databasesMod07 from '../../../courses/databases/modules/mod-07.json';
import databasesMod08 from '../../../courses/databases/modules/mod-08.json';
import databasesMod09 from '../../../courses/databases/modules/mod-09.json';
import databasesMod10 from '../../../courses/databases/modules/mod-10.json';
import databasesMod11 from '../../../courses/databases/modules/mod-11.json';
import databasesMod12 from '../../../courses/databases/modules/mod-12.json';
import databasesMod13 from '../../../courses/databases/modules/mod-13.json';
import databasesMod14 from '../../../courses/databases/modules/mod-14.json';
import databasesMod15 from '../../../courses/databases/modules/mod-15.json';
import databasesMod16 from '../../../courses/databases/modules/mod-16.json';
import databasesMod17 from '../../../courses/databases/modules/mod-17.json';

import type { ModuleJson } from '../components/course/types';

// ---------------------------------------------------------------------------
// Normalization helpers
// ---------------------------------------------------------------------------

type RawModule = Record<string, unknown>;

/** Ensure every module conforms to ModuleJson regardless of source format. */
function normalizeModule(raw: RawModule, fallbackPhase: string): ModuleJson {
  return {
    id: String(raw.id),
    title: String(raw.title ?? ''),
    description: String(raw.description ?? ''),
    phase: String(raw.phase ?? fallbackPhase),
    position: Number(raw.position ?? raw.order ?? 0),
    learningOutcomes: Array.isArray(raw.learningOutcomes) ? (raw.learningOutcomes as string[]) : [],
    assessmentCriteria: Array.isArray(raw.assessmentCriteria) ? (raw.assessmentCriteria as string[]) : [],
    officialContents: Array.isArray(raw.officialContents) ? (raw.officialContents as string[]) : [],
    duration: String(raw.duration ?? (raw.estimatedMinutes != null ? `${raw.estimatedMinutes} min` : '')),
    difficulty: String(raw.difficulty ?? 'beginner'),
    prerequisites: Array.isArray(raw.prerequisites) ? (raw.prerequisites as string[]) : [],
    lessons: Array.isArray(raw.lessons) ? (raw.lessons as ModuleJson['lessons']) : [],
    practice: raw.practice as ModuleJson['practice'],
  };
}

/**
 * Build a single-phase structure for courses whose JSON doesn't include phases.
 * Returns { phases: [{ id, title, description, modules: [...] }] }.
 */
function buildPhasesFromModules(
  modules: ModuleJson[],
  courseId: string,
): { id: string; title: string; description: string; modules: string[] }[] {
  return [
    {
      id: `${courseId}-all`,
      title: 'Contenido completo',
      description: `Todos los módulos del curso ${courseId}`,
      modules: modules.map((m) => m.id),
    },
  ];
}

// ---------------------------------------------------------------------------
// Programming modules
// ---------------------------------------------------------------------------

const programmingModules: Record<string, ModuleJson> = {
  'mod-01': normalizeModule(programmingMod01, 'phase-1'),
  'mod-02': normalizeModule(programmingMod02, 'phase-1'),
  'mod-03': normalizeModule(programmingMod03, 'phase-2'),
  'mod-04': normalizeModule(programmingMod04, 'phase-2'),
  'mod-05': normalizeModule(programmingMod05, 'phase-3'),
  'mod-06': normalizeModule(programmingMod06, 'phase-4'),
  'mod-07': normalizeModule(programmingMod07, 'phase-4'),
  'mod-08': normalizeModule(programmingMod08, 'phase-4'),
  'mod-09': normalizeModule(programmingMod09, 'phase-4'),
  'mod-10': normalizeModule(programmingMod10, 'phase-4'),
  'mod-11': normalizeModule(programmingMod11, 'phase-5'),
  'mod-12': normalizeModule(programmingMod12, 'phase-5'),
  'mod-13': normalizeModule(programmingMod13, 'phase-6'),
  'mod-14': normalizeModule(programmingMod14, 'phase-6'),
  'mod-15': normalizeModule(programmingMod15, 'phase-6'),
  'mod-16': normalizeModule(programmingMod16, 'phase-6'),
  'mod-17': normalizeModule(programmingMod17, 'phase-6'),
  'mod-18': normalizeModule(programmingMod18, 'phase-7'),
};

// ---------------------------------------------------------------------------
// Databases modules
// ---------------------------------------------------------------------------

const databasesModules: Record<string, ModuleJson> = {
  'mod-01': normalizeModule(databasesMod01, 'phase-1'),
  'mod-02': normalizeModule(databasesMod02, 'phase-1'),
  'mod-03': normalizeModule(databasesMod03, 'phase-1'),
  'mod-04': normalizeModule(databasesMod04, 'phase-1'),
  'mod-05': normalizeModule(databasesMod05, 'phase-1'),
  'mod-06': normalizeModule(databasesMod06, 'phase-1'),
  'mod-07': normalizeModule(databasesMod07, 'phase-1'),
  'mod-08': normalizeModule(databasesMod08, 'phase-1'),
  'mod-09': normalizeModule(databasesMod09, 'phase-1'),
  'mod-10': normalizeModule(databasesMod10, 'phase-1'),
  'mod-11': normalizeModule(databasesMod11, 'phase-1'),
  'mod-12': normalizeModule(databasesMod12, 'phase-1'),
  'mod-13': normalizeModule(databasesMod13, 'phase-1'),
  'mod-14': normalizeModule(databasesMod14, 'phase-1'),
  'mod-15': normalizeModule(databasesMod15, 'phase-1'),
  'mod-16': normalizeModule(databasesMod16, 'phase-1'),
  'mod-17': normalizeModule(databasesMod17, 'phase-1'),
};

// ---------------------------------------------------------------------------
// Course data normalization
// ---------------------------------------------------------------------------

interface NormalizedCourseData {
  id: string;
  title: string;
  description: string;
  phases: { id: string; title: string; description: string; modules: string[] }[];
  status: 'draft' | 'published' | 'archived';
  programmingLanguage: string;
  degrees: string[];
  year: number;
  ects: number;
  estimatedHours: { totalEstimatedLearnerTime: number };
}

function normalizeCourseData(
  raw: Record<string, unknown>,
  modules: Record<string, ModuleJson>,
): NormalizedCourseData {
  const hasPhases = Array.isArray(raw.phases) && (raw.phases as unknown[]).length > 0;
  const phases = hasPhases
    ? (raw.phases as NormalizedCourseData['phases'])
    : buildPhasesFromModules(Object.values(modules), String(raw.id));

  return {
    id: String(raw.id),
    title: String(raw.title),
    description: String(raw.description ?? ''),
    phases,
    status: (raw.status as 'draft' | 'published' | 'archived') ?? 'draft',
    programmingLanguage: String(raw.programmingLanguage ?? raw.sgbd ?? ''),
    degrees: Array.isArray(raw.degrees)
      ? (raw.degrees as string[])
      : [String(raw.category ?? '')].filter(Boolean),
    year: Number(raw.year ?? 1),
    ects: Number(raw.ects ?? 0),
    estimatedHours: {
      totalEstimatedLearnerTime: Number(
        typeof raw.estimatedHours === 'object' && raw.estimatedHours !== null
          ? (raw.estimatedHours as Record<string, unknown>).totalEstimatedLearnerTime
          : raw.estimatedHours ?? 0,
      ),
    },
  };
}

// ---------------------------------------------------------------------------
// Public registry
// ---------------------------------------------------------------------------

export interface CourseRegistryEntry {
  courseData: NormalizedCourseData;
  modules: Record<string, ModuleJson>;
}

export const COURSE_REGISTRY: Record<string, CourseRegistryEntry> = {
  [programmingCourseData.id]: {
    courseData: normalizeCourseData(programmingCourseData as unknown as Record<string, unknown>, programmingModules),
    modules: programmingModules,
  },
  [databasesCourseData.id]: {
    courseData: normalizeCourseData(databasesCourseData as unknown as Record<string, unknown>, databasesModules),
    modules: databasesModules,
  },
};

/**
 * Retrieve normalized course data and modules by courseId.
 * Falls back to the programming course if the id is not found.
 */
export function getCourseData(courseId: string): CourseRegistryEntry {
  return COURSE_REGISTRY[courseId] ?? COURSE_REGISTRY[programmingCourseData.id];
}
