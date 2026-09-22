/**
 * Types for the Course Experience V2 — Learning Path system.
 */

export type ModuleStatus = 'not_started' | 'in_progress' | 'completed' | 'locked';

export interface ModuleNode {
  id: string;
  position: number;
  title: string;
  description?: string;
  lessonCount: number;
  progress?: number; // 0–100
  status: ModuleStatus;
}

export interface Phase {
  id: string;
  title: string;
  description: string;
  color: string; // accent color hex
  modules: ModuleNode[];
}

export type ViewMode = 'student' | 'admin_preview';

export interface ContentBlockJson { [key: string]: unknown;
  type: string;
  title?: string;
  content?: string;
  language?: string;
  duration?: string;
  description?: string;
  url?: string;
  metadata?: Record<string, unknown>;
}

export interface LessonJson {
  id: string;
  title: string;
  objectives?: string[];
  contentBlocks: ContentBlockJson[];
  exercises?: Array<{ id: string; title: string; difficulty: string; description: string; solution?: string; expectedOutput?: string; }>;
  learningOutcomes?: string[];
  assessmentCriteria?: string[];
}

export interface ModuleJson {
  id: string;
  title: string;
  description: string;
  phase: string;
  position: number;
  learningOutcomes: string[];
  assessmentCriteria: string[];
  officialContents: string[];
  duration: string;
  difficulty: string;
  prerequisites: string[];
  lessons: LessonJson[];
  practice?: { title: string; description: string; };
}

export interface ActivityType {
  type: 'theory' | 'code' | 'exercise' | 'lab' | 'checkpoint';
  label: string;
  icon: string;
}

export const ACTIVITY_TYPES: ActivityType[] = [
  { type: 'theory', label: 'Teor\u00eda', icon: 'BookOpen' },
  { type: 'code', label: 'C\u00f3digo', icon: 'Code2' },
  { type: 'exercise', label: 'Ejercicio', icon: 'Pencil' },
  { type: 'lab', label: 'Laboratorio', icon: 'FlaskConical' },
  { type: 'checkpoint', label: 'Checkpoint', icon: 'Flag' },
];

export interface CourseProgress {
  percentage: number;
  completedModules: number;
  totalModules: number;
  completedLessons: number;
  totalLessons: number;
}

export interface CourseData {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  phases: Phase[];
  progress: CourseProgress;
  status: 'draft' | 'published' | 'archived';
}
