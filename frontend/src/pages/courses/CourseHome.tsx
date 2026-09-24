import { useMemo, useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { BookOpen, ChevronRight, Layers, GraduationCap, Trophy } from 'lucide-react';
import { ActivityNode } from '../../components/course/ActivityNode';
import { AdminPreviewBar } from '../../components/course/AdminPreviewBar';
import { getPhaseColors } from '../../components/course/phase-colors';
import { progressApi } from '../../api/modules/progress';
import { coursesApi } from '../../api/modules/courses';
import type { ActivityNodeData } from '../../components/course/ActivityNode';
import type { ViewMode, ModuleJson } from '../../components/course/types';
import { getCourseDataBySlug, type CourseRegistryEntry } from '../../data/course-registry';

// -- Helpers ------------------------------------------------------------------

function getPhaseForModule(
  moduleId: string,
  phases: { id: string; title: string; description: string; modules: string[] }[],
) {
  for (const phase of phases) {
    if (phase.modules.includes(moduleId)) return phase;
  }
  return phases[0];
}

function contentTypeToActivityType(type: string): ActivityNodeData['type'] {
  switch (type) {
    case 'code': return 'code';
    case 'text': return 'theory';
    case 'video': return 'theory';
    case 'link': return 'documentation';
    case 'file': return 'documentation';
    default: return 'theory';
  }
}

function extractTitleFromContent(content: string, fallback: string): string {
  // Try to extract first heading from markdown
  const headingMatch = content.match(/^##\s+(.+)$/m);
  if (headingMatch) return headingMatch[1].trim();
  // Try first line as title
  const firstLine = content.split('\n')[0]?.trim();
  if (firstLine && firstLine.length < 100) return firstLine;
  return fallback;
}

function deriveActivities(mod: ModuleJson): ActivityNodeData[] {
  const activities: ActivityNodeData[] = [];
  let position = 1;

  for (const lesson of mod.lessons) {
    for (const block of lesson.contentBlocks) {
      activities.push({
        id: `${lesson.id}-${block.type}-${position}`,
        position,
        title: block.title || extractTitleFromContent(block.content || '', lesson.title),
        type: contentTypeToActivityType(block.type),
        status: 'not_started',
        completedCount: 0,
        totalCount: 1,
      });
      position++;
    }

    for (const exercise of lesson.exercises ?? []) {
      activities.push({
        id: exercise.id,
        position,
        title: exercise.title,
        type: 'exercise',
        status: 'not_started',
        completedCount: 0,
        totalCount: 1,
      });
      position++;
    }
  }

  return activities;
}

// -- Main Component -----------------------------------------------------------

export default function CourseHome() {
  const { courseId } = useParams<{ courseId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const mode: ViewMode = searchParams.get('admin_preview') === 'true' ? 'admin_preview' : 'student';

  // -- Resolve course: fetch metadata from API, then look up registry by slug --
  const [resolved, setResolved] = useState<CourseRegistryEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!courseId) {
      setError('No course ID provided');
      setLoading(false);
      return;
    }

    let cancelled = false;

    coursesApi
      .getById(courseId)
      .then((apiCourse) => {
        if (cancelled) return;
        const slug = apiCourse.slug ?? apiCourse.id;
        const entry = getCourseDataBySlug(slug);
        if (!entry) {
          setError(`Course not found for slug "${slug}"`);
          return;
        }
        setResolved(entry);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : 'Failed to load course');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [courseId]);

  // -- Progress state --------------------------------------------------------

  const courseData = resolved?.courseData;
  const ALL_MODULES = resolved?.modules ?? {} as Record<string, ModuleJson>;
  const [courseProgress, setCourseProgress] = useState({ completedLessons: 0, totalLessons: 0, percentage: 0 });
  const [completedLessonIds, setCompletedLessonIds] = useState<Set<string>>(new Set());

  // Load course-level progress
  useEffect(() => {
    if (!courseId || mode === 'admin_preview') return;
    progressApi
      .getCourseProgress(courseId)
      .then((p) => setCourseProgress(p))
      .catch(() => {});
  }, [courseId, mode]);

  // Load per-lesson progress for module completion calculation
  // Optimized: only load progress for current incomplete module (not all 76 lessons)
  useEffect(() => {
    if (mode === 'admin_preview' || !courseData) return;
    let cancelled = false;
    const load = async () => {
      const completed = new Set<string>();
      const allModuleIds = courseData.phases.flatMap((p) => p.modules);
      for (const modId of allModuleIds) {
        const mod = ALL_MODULES[modId];
        if (!mod) continue;
        const allCompleted = mod.lessons.every((l) => completedLessonIds.has(l.id));
        if (allCompleted && mod.lessons.length > 0) continue;
        for (const lesson of mod.lessons) {
          try {
            const p = await progressApi.getLessonProgress(lesson.id);
            if (p?.status === 'completed') completed.add(lesson.id);
          } catch { /* ignore */ }
        }
        break;
      }
      if (!cancelled) setCompletedLessonIds((prev) => new Set([...prev, ...completed]));
    };
    load();
    return () => { cancelled = true; };
  }, [mode, courseProgress, courseData]);

  // -- Compute stats ----------------------------------------------------------

  const totalModules = useMemo(() => Object.keys(ALL_MODULES).length, [ALL_MODULES]);
  const totalLessons = useMemo(
    () => Object.values(ALL_MODULES).reduce((sum, mod) => sum + mod.lessons.length, 0),
    [ALL_MODULES],
  );
  const totalActivities = useMemo(
    () => Object.values(ALL_MODULES).reduce((sum, mod) => sum + deriveActivities(mod).length, 0),
    [ALL_MODULES],
  );

  // Real progress from API
  const completedLessons = courseProgress.completedLessons;
  const overallPercentage = courseProgress.percentage;
  const completedModules = useMemo(() => {
    let count = 0;
    for (const mod of Object.values(ALL_MODULES)) {
      const allCompleted = mod.lessons.every((l) => completedLessonIds.has(l.id));
      if (allCompleted && mod.lessons.length > 0) count++;
    }
    return count;
  }, [completedLessonIds]);

  // -- Current module (first incomplete module, or first if all completed) ----

  const currentModule = useMemo(() => {
    if (!courseData) return { id: '', title: '', description: '', phase: '', position: 0, learningOutcomes: [], assessmentCriteria: [], officialContents: [], duration: '', difficulty: '', prerequisites: [], lessons: [] } as ModuleJson;
    // Get modules in course order (by phase)
    const allModuleIds = courseData.phases.flatMap((p) => p.modules);
    for (const modId of allModuleIds) {
      const mod = ALL_MODULES[modId];
      if (!mod) continue;
      const allCompleted = mod.lessons.every((l) => completedLessonIds.has(l.id));
      if (!allCompleted && mod.lessons.length > 0) return mod;
    }
    // All completed — return last module
    const lastId = allModuleIds[allModuleIds.length - 1];
    return ALL_MODULES[lastId] || ALL_MODULES['mod-01'];
  }, [completedLessonIds, courseData]);
  const currentPhase = getPhaseForModule(currentModule.id, courseData?.phases ?? []);
  const currentColors = getPhaseColors(currentPhase?.id ?? 'phase-1');
  const currentActivities = useMemo(() => deriveActivities(currentModule), [currentModule]);

  // -- Navigation -------------------------------------------------------------

  const makeModuleUrl = (id: string) =>
    `/courses/${courseId}/modules/${id}${mode === 'admin_preview' ? '?admin_preview=true' : ''}`;

  const handleModuleClick = (moduleId: string) => {
    navigate(makeModuleUrl(moduleId));
  };

  // -- Phase structure --------------------------------------------------------

  const phasesWithModules = useMemo(() => {
    if (!courseData) return [];
    return courseData.phases.map((phase) => ({
      ...phase,
      moduleNodes: phase.modules.map((modId) => ({
        id: modId,
        mod: ALL_MODULES[modId],
        position: ALL_MODULES[modId].position,
        title: ALL_MODULES[modId].title,
        description: ALL_MODULES[modId].description,
        lessonCount: ALL_MODULES[modId].lessons.length,
      })),
    }));
  }, [courseData]);

  // -- Render -----------------------------------------------------------------

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-violet-500 border-t-transparent" />
          <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">Cargando curso...</p>
        </div>
      </div>
    );
  }

  if (error || !courseData) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="text-center">
          <p className="text-lg font-semibold text-gray-900 dark:text-white">Error al cargar el curso</p>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">{error ?? 'Curso no encontrado'}</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Admin preview bar */}
      {mode === 'admin_preview' && (
        <AdminPreviewBar courseStatus={courseData.status as 'draft' | 'published' | 'archived'} />
      )}

      {/* Course header */}
      <div className="border-b border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="mb-4">
            <p className="text-sm font-semibold text-violet-500 dark:text-violet-400">
              1.º DAM/DAW · {courseData.programmingLanguage}
            </p>
            <h1 className="mt-2 text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl">
              {courseData.title}
            </h1>
            <p className="mt-3 max-w-3xl text-base text-gray-600 dark:text-gray-400">
              {courseData.description}
            </p>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-xl border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-800">
              <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                <Layers className="h-4 w-4" />
                <span className="text-xs font-medium">Fases</span>
              </div>
              <p className="mt-1 text-xl font-bold text-gray-900 dark:text-white">
                {courseData.phases.length}
              </p>
            </div>
            <div className="rounded-xl border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-800">
              <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                <BookOpen className="h-4 w-4" />
                <span className="text-xs font-medium">Modulos</span>
              </div>
              <p className="mt-1 text-xl font-bold text-gray-900 dark:text-white">
                {totalModules}
              </p>
            </div>
            <div className="rounded-xl border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-800">
              <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                <GraduationCap className="h-4 w-4" />
                <span className="text-xs font-medium">Lecciones</span>
              </div>
              <p className="mt-1 text-xl font-bold text-gray-900 dark:text-white">
                {totalLessons}
              </p>
            </div>
            <div className="rounded-xl border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-800">
              <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                <Trophy className="h-4 w-4" />
                <span className="text-xs font-medium">Actividades</span>
              </div>
              <p className="mt-1 text-xl font-bold text-gray-900 dark:text-white">
                {totalActivities}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Progress overview */}
        <div className="mb-8 rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-900">
          <h2 className="mb-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
            Progreso del curso
          </h2>
          <div className="mb-3 flex items-center justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">
              {completedLessons} de {totalLessons} lecciones completadas
            </span>
            <span className="font-mono font-semibold text-violet-500 dark:text-violet-400">
              {overallPercentage}%
            </span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
            <div
              className="h-full rounded-full bg-gradient-to-r from-violet-500 via-blue-500 to-cyan-500 transition-all duration-500"
              style={{ width: `${overallPercentage}%` }}
              role="progressbar"
              aria-valuenow={overallPercentage}
              aria-valuemin={0}
              aria-valuemax={100}
            />
          </div>
          <div className="mt-3 flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
            <span>{completedModules} de {totalModules} modulos completados</span>
          </div>
        </div>

        {/* Current module card */}
        <div className="mb-8">
          <h2 className="mb-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
            Modulo actual
          </h2>
          <button
            type="button"
            onClick={() => handleModuleClick(currentModule.id)}
            className="w-full text-left transition-all duration-200"
          >
            <div
              className={`relative rounded-2xl border-2 p-5 transition-all hover:shadow-lg ${
                `border-2 ${currentColors.border} ${currentColors.borderDark} ring-2 ${currentColors.ring} ${currentColors.bg} ${currentColors.bgDark}`
              }`}
            >
              <div className="flex items-start gap-4">
                <div
                  className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${currentColors.gradient} text-lg font-bold text-white shadow-md`}
                >
                  {currentModule.position}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                        {currentModule.title}
                      </h3>
                      <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                        {currentModule.description}
                      </p>
                    </div>
                    <ChevronRight className="h-5 w-5 shrink-0 text-gray-400 dark:text-gray-500" />
                  </div>
                  <div className="mt-3 flex flex-wrap items-center gap-3">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold text-white bg-gradient-to-br ${currentColors.gradient}`}
                    >
                      {currentPhase.title}
                    </span>
                    <span className="text-xs text-gray-400 dark:text-gray-500">
                      {currentModule.lessons.length} leccion{currentModule.lessons.length !== 1 ? 'es' : ''}
                    </span>
                    <span className="text-xs text-gray-400 dark:text-gray-500">
                      {currentActivities.length} actividad{currentActivities.length !== 1 ? 'es' : ''}
                    </span>
                    {currentModule.duration && (
                      <span className="text-xs text-gray-400 dark:text-gray-500">
                        {currentModule.duration}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Activity preview */}
              <div className="mt-4">
                <h4 className="mb-3 text-xs font-semibold text-gray-500 dark:text-gray-400">
                  Mapa de actividades
                </h4>
                <div className="grid grid-cols-4 gap-3 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10">
                  {currentActivities.slice(0, 20).map((activity) => (
                    <ActivityNode
                      key={activity.id}
                      activity={activity}
                      phaseId={currentPhase.id}
                      size="sm"
                    />
                  ))}
                  {currentActivities.length > 20 && (
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 text-xs font-medium text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                      +{currentActivities.length - 20}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </button>
        </div>

        {/* Phase list with modules */}
        <div>
          <h2 className="mb-6 text-sm font-semibold text-gray-700 dark:text-gray-300">
            Ruta de aprendizaje
          </h2>

          <div className="space-y-4">
            {phasesWithModules.map((phase, phaseIndex) => {
              const colors = getPhaseColors(phase.id);

              return (
                <section key={phase.id} className="scroll-mt-20">
                  {/* Phase header */}
                  <div
                    className="rounded-2xl border border-gray-200 bg-white p-4 transition-all dark:border-gray-700 dark:bg-gray-800 sm:p-5"
                  >
                    <div className="flex items-start gap-4">
                      <div
                        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${colors.gradient} text-lg font-bold text-white shadow-md`}
                      >
                        {phaseIndex + 1}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                          {phase.title}
                        </h3>
                        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                          {phase.description}
                        </p>
                        <div className="mt-2 flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                          <span>
                            {phase.moduleNodes.length} modulo{phase.moduleNodes.length !== 1 ? 's' : ''}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Module list */}
                    <div className="mt-4 ml-6 space-y-2 pl-6">
                      {/* Vertical timeline line */}
                      <div
                        className={`absolute left-0 w-0.5 bg-gradient-to-b ${colors.gradient} opacity-20`}
                        style={{ top: 0, bottom: 0 }}
                      />

                      {phase.moduleNodes.map((modNode) => {
                        const mod = ALL_MODULES[modNode.id];
                        const isCurrent = mod.id === currentModule.id;

                        return (
                          <button
                            key={modNode.id}
                            type="button"
                            onClick={() => handleModuleClick(mod.id)}
                            className={`group flex w-full items-center gap-3 rounded-xl border p-3 text-left transition-all hover:shadow-md ${
                              isCurrent
                                ? `border-2 ${colors.border} ${colors.borderDark} ring-2 ${colors.ring} ${colors.bg} ${colors.bgDark}`
                                : 'border-gray-200 bg-white hover:border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:hover:border-gray-600'
                            }`}
                          >
                            <div
                              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-xs font-bold ${
                                isCurrent
                                  ? `bg-gradient-to-br ${colors.gradient} text-white`
                                  : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
                              }`}
                            >
                              {mod.position}
                            </div>
                            <div className="min-w-0 flex-1">
                              <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                                {mod.title}
                              </h4>
                              <div className="mt-1 flex items-center gap-3 text-xs text-gray-400 dark:text-gray-500">
                                <span>{mod.lessons.length} leccion{mod.lessons.length !== 1 ? 'es' : ''}</span>
                                {mod.duration && <span>{mod.duration}</span>}
                                {isCurrent && (
                                  <span className="font-medium text-violet-500 dark:text-violet-400">
                                    Actual
                                  </span>
                                )}
                              </div>
                            </div>
                            <ChevronRight className="h-4 w-4 shrink-0 text-gray-300 transition-colors group-hover:text-gray-500 dark:text-gray-600 dark:group-hover:text-gray-400" />
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </section>
              );
            })}
          </div>
        </div>

        {/* Course metadata footer */}
        <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-900">
          <h2 className="mb-3 text-sm font-semibold text-gray-700 dark:text-gray-300">
            Informacion del curso
          </h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            <div>
              <span className="text-xs text-gray-500 dark:text-gray-400">Titulacion</span>
              <p className="mt-1 text-sm font-medium text-gray-900 dark:text-white">
                {courseData.degrees.join(' / ')}
              </p>
            </div>
            <div>
              <span className="text-xs text-gray-500 dark:text-gray-400">Curso</span>
              <p className="mt-1 text-sm font-medium text-gray-900 dark:text-white">
                {courseData.year}.er
              </p>
            </div>
            <div>
              <span className="text-xs text-gray-500 dark:text-gray-400">ECTS</span>
              <p className="mt-1 text-sm font-medium text-gray-900 dark:text-white">
                {courseData.ects}
              </p>
            </div>
            <div>
              <span className="text-xs text-gray-500 dark:text-gray-400">Horas estimadas</span>
              <p className="mt-1 text-sm font-medium text-gray-900 dark:text-white">
                {courseData.estimatedHours.totalEstimatedLearnerTime}h
              </p>
            </div>
            <div>
              <span className="text-xs text-gray-500 dark:text-gray-400">Lenguaje</span>
              <p className="mt-1 text-sm font-medium text-gray-900 dark:text-white">
                {courseData.programmingLanguage}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
