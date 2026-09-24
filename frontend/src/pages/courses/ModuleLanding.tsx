import { useMemo, useState, useCallback, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, BookOpen, ChevronRight, Filter, ChevronDown } from 'lucide-react';
import { ActivityNode } from '../../components/course/ActivityNode';
import { AdminPreviewBar } from '../../components/course/AdminPreviewBar';
import { getPhaseColors } from '../../components/course/phase-colors';
import { deriveSections } from '../../components/course/deriveSections';
import { coursesApi } from '../../api/modules/courses';
import type { ActivityNodeData } from '../../components/course/ActivityNode';
import type { ViewMode, ModuleJson } from '../../components/course/types';
import { getCourseDataBySlug, type CourseRegistryEntry } from '../../data/course-registry';

function getPhaseIdForModule(
  moduleId: string,
  phases: { id: string; modules: string[] }[],
): string {
  for (const phase of phases) {
    if (phase.modules.includes(moduleId)) return phase.id;
  }
  return 'phase-1';
}

// ── Activity derivation helpers ──────────────────────────────────────────────

type FilterTab = 'all' | 'incomplete';

/**
 * Map content block types to ActivityNode types.
 */
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

/**
 * Extract a meaningful title from content block content.
 * Tries first markdown heading, then first line, then fallback.
 */
function extractTitleFromContent(content: string, fallback: string): string {
  if (!content) return fallback;
  const headingMatch = content.match(/^##\s+(.+)$/m);
  if (headingMatch) return headingMatch[1].trim();
  const firstLine = content.split('\n')[0]?.trim();
  if (firstLine && firstLine.length < 100) return firstLine;
  return fallback;
}

/**
 * Derive activity nodes from a module's lessons.
 *
 * Each content block becomes a theory/code/documentation node.
 * Each exercise becomes an exercise node.
 * This gives a fine-grained activity map of the entire module.
 */
function deriveActivities(mod: ModuleJson): ActivityNodeData[] {
  const activities: ActivityNodeData[] = [];
  let position = 1;

  for (const lesson of mod.lessons) {
    // Content blocks → theory/code/doc nodes
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

    // Exercises → exercise nodes
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

// ── Main Component ──────────────────────────────────────────────────────────

export default function ModuleLanding() {
  const { courseId, moduleId } = useParams<{ courseId: string; moduleId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [activeFilter, setActiveFilter] = useState<FilterTab>('all');
  const [expandedLessons, setExpandedLessons] = useState<Set<string>>(new Set());

  const toggleLesson = useCallback((lessonId: string) => {
    setExpandedLessons((prev) => {
      const next = new Set(prev);
      if (next.has(lessonId)) {
        next.delete(lessonId);
      } else {
        next.add(lessonId);
      }
      return next;
    });
  }, []);

  // View mode from query params (same pattern as LessonPage)
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

  // Resolve module data from the resolved course
  const courseData = resolved?.courseData;
  const ALL_MODULES = resolved?.modules ?? {} as Record<string, ModuleJson>;
  const mod = moduleId ? ALL_MODULES[moduleId] : undefined;
  const phaseId = moduleId && courseData ? getPhaseIdForModule(moduleId, courseData.phases) : 'phase-1';
  const colors = getPhaseColors(phaseId);
  const resolvedCourseId = courseId || courseData?.id || '';

  // Derive activity nodes
  const allActivities = useMemo(
    () => (mod ? deriveActivities(mod) : []),
    [mod],
  );

  const filteredActivities = useMemo(() => {
    if (activeFilter === 'incomplete') {
      return allActivities.filter((a) => a.status !== 'completed');
    }
    return allActivities;
  }, [allActivities, activeFilter]);

  // Activity click handler (placeholder — will navigate to lesson)
  const handleActivityClick = useCallback(
    (activityId: string) => {
      // Find which lesson this activity belongs to
      if (!mod) return;
      for (const lesson of mod.lessons) {
        const inExercises = lesson.exercises?.some((e) => e.id === activityId);
        if (inExercises || activityId.startsWith(lesson.id)) {
          navigate(
            `/courses/${resolvedCourseId}/modules/${moduleId}/lessons/${lesson.id}${mode === 'admin_preview' ? '?admin_preview=true' : ''}`,
          );
          return;
        }
      }
    },
    [mod, resolvedCourseId, moduleId, navigate, mode],
  );

  // ── Loading ──────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-violet-500 border-t-transparent" />
          <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">Cargando modulo...</p>
        </div>
      </div>
    );
  }

  // ── Error ────────────────────────────────────────────────────────────

  if (error || !courseData) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="text-center">
          <p className="text-lg font-semibold text-gray-900 dark:text-white">Error al cargar el modulo</p>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">{error ?? 'Curso no encontrado'}</p>
        </div>
      </div>
    );
  }

  // ── Not found ──────────────────────────────────────────────────────────

  if (!mod) {
    return (
      <div>
        <div className="mx-auto max-w-7xl px-4 py-20 text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Modulo no encontrado
          </h1>
          <p className="mt-2 text-gray-500 dark:text-gray-400">
            El modulo solicitado no existe en este curso.
          </p>
          <Link
            to={`/courses/${resolvedCourseId}/home`}
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-700 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-200"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver al curso
          </Link>
        </div>
      </div>
    );
  }

  // ── Render ─────────────────────────────────────────────────────────────

  const makeModuleUrl = (id: string) =>
    `/courses/${resolvedCourseId}/modules/${id}${mode === 'admin_preview' ? '?admin_preview=true' : ''}`;

  const makeLessonUrl = (lessonId: string) =>
    `/courses/${resolvedCourseId}/modules/${moduleId}/lessons/${lessonId}${mode === 'admin_preview' ? '?admin_preview=true' : ''}`;

  return (
    <div>
      {/* Admin preview bar */}
      {mode === 'admin_preview' && (
        <AdminPreviewBar courseStatus={courseData.status as 'draft' | 'published' | 'archived'} />
      )}

      {/* Breadcrumb */}
      <div className="border-b border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900">
        <div className="mx-auto max-w-7xl px-4 py-2.5 sm:px-6 lg:px-8">
          <nav
            aria-label="Breadcrumb"
            className="flex items-center gap-1.5 text-xs text-gray-400 dark:text-gray-500"
          >
            <Link
              to={`/courses/${resolvedCourseId}/home${mode === 'admin_preview' ? '?admin_preview=true' : ''}`}
              className="transition-colors hover:text-gray-600 dark:hover:text-gray-300"
            >
              Curso
            </Link>
            <ChevronRight className="h-3 w-3" />
            <span className="font-medium text-gray-700 dark:text-gray-200">
              Modulo {mod.position}
            </span>
          </nav>
        </div>
      </div>

      {/* Main content */}
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* ── Module Header ─────────────────────────────────────────── */}
        <div className="mb-6">
          <Link
            to={`/courses/${resolvedCourseId}/home${mode === 'admin_preview' ? '?admin_preview=true' : ''}`}
            className="mb-4 inline-flex items-center gap-1.5 text-xs font-medium text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Volver al curso
          </Link>

          <div className="flex items-start gap-4">
            {/* Module number badge */}
            <div
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${colors.gradient} text-base font-bold text-white shadow-md`}
              aria-hidden="true"
            >
              {mod.position}
            </div>

            {/* Module info */}
            <div className="min-w-0 flex-1">
              <h1 className="text-xl font-bold text-gray-900 dark:text-white sm:text-2xl">
                {mod.title}
              </h1>
              {mod.description && (
                <p className="mt-2 max-w-2xl text-sm text-gray-600 dark:text-gray-400">
                  {mod.description}
                </p>
              )}
              <div className="mt-3 flex flex-wrap items-center gap-3">
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold text-white bg-gradient-to-br ${colors.gradient}`}
                >
                  {mod.phase}
                </span>
                <span className="text-xs text-gray-400 dark:text-gray-500">
                  {mod.lessons.length} leccion{mod.lessons.length !== 1 ? 'es' : ''}
                </span>
                <span className="text-xs text-gray-400 dark:text-gray-500">
                  {allActivities.length} actividad{allActivities.length !== 1 ? 'es' : ''}
                </span>
                {mod.duration && (
                  <span className="text-xs text-gray-400 dark:text-gray-500">
                    {mod.duration}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ── Filter Tabs ───────────────────────────────────────────── */}
        <div className="mb-6 flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-400 dark:text-gray-500" />
          <button
            type="button"
            onClick={() => setActiveFilter('all')}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
              activeFilter === 'all'
                ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900'
                : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'
            }`}
          >
            Todas ({allActivities.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter('incomplete')}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
              activeFilter === 'incomplete'
                ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'
            }`}
          >
            Incompletas ({filteredActivities.length})
          </button>
        </div>

        {/* ── Activity Nodes Grid ───────────────────────────────────── */}
        <div className="mb-8">
          <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
            <BookOpen className="h-4 w-4" />
            Mapa de Actividades
          </h2>
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8">
            {filteredActivities.map((activity) => (
              <ActivityNode
                key={activity.id}
                activity={activity}
                phaseId={phaseId}
                onClick={handleActivityClick}
                size="md"
              />
            ))}
          </div>
          {filteredActivities.length === 0 && (
            <p className="py-8 text-center text-sm text-gray-400 dark:text-gray-500">
              No hay actividades que mostrar.
            </p>
          )}
        </div>

        {/* ── Lesson List ───────────────────────────────────────────── */}
        <div>
          <h2 className="mb-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
            Lecciones del Modulo
          </h2>

          <div className="space-y-2">
            {mod.lessons.map((lesson, idx) => {
              const exerciseCount = lesson.exercises?.length ?? 0;
              const contentCount = lesson.contentBlocks.length;
              const totalItems = contentCount + exerciseCount;
              const sections = deriveSections(lesson.contentBlocks, lesson.exercises);
              const hasSections = sections.length > 1;
              const isExpanded = expandedLessons.has(lesson.id);

              return (
                <div
                  key={lesson.id}
                  className="rounded-xl border border-gray-200 bg-white transition-all hover:border-gray-300 hover:shadow-md dark:border-gray-700 dark:bg-gray-800 dark:hover:border-gray-600"
                >
                  {/* Lesson header — clickable to expand or navigate */}
                  <div className="flex items-center gap-3 p-3">
                    {/* Lesson number */}
                    <div
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br ${colors.gradient} text-xs font-bold text-white`}
                      aria-hidden="true"
                    >
                      {idx + 1}
                    </div>

                    {/* Lesson info */}
                    <Link
                      to={makeLessonUrl(lesson.id)}
                      className="min-w-0 flex-1 group/link"
                    >
                      <h3 className="text-sm font-semibold text-gray-900 group-hover/link:text-blue-600 dark:text-white dark:group-hover/link:text-blue-400">
                        {lesson.title}
                      </h3>
                      <div className="mt-1 flex items-center gap-3 text-xs text-gray-400 dark:text-gray-500">
                        {contentCount > 0 && (
                          <span>{contentCount} contenido{contentCount !== 1 ? 's' : ''}</span>
                        )}
                        {exerciseCount > 0 && (
                          <span>{exerciseCount} ejercicio{exerciseCount !== 1 ? 'es' : ''}</span>
                        )}
                        <span>{totalItems} actividad{totalItems !== 1 ? 'es' : ''}</span>
                        {hasSections && (
                          <span>{sections.length} apartado{sections.length !== 1 ? 's' : ''}</span>
                        )}
                      </div>
                    </Link>

                    {/* Expand toggle (only when multiple sections) */}
                    {hasSections && (
                      <button
                        type="button"
                        onClick={() => toggleLesson(lesson.id)}
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:text-gray-500 dark:hover:bg-gray-700 dark:hover:text-gray-300"
                        aria-label={isExpanded ? 'Contraer apartados' : 'Expandir apartados'}
                        aria-expanded={isExpanded}
                      >
                        <ChevronDown
                          className={`h-4 w-4 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                        />
                      </button>
                    )}

                    {/* Arrow (when no sections) */}
                    {!hasSections && (
                      <ChevronRight className="h-4 w-4 shrink-0 text-gray-300 transition-colors group-hover:text-gray-500 dark:text-gray-600 dark:group-hover:text-gray-400" />
                    )}
                  </div>

                  {/* Section sub-items (expandable) */}
                  {hasSections && isExpanded && (
                    <div className="border-t border-gray-100 px-4 py-2 dark:border-gray-700/50">
                      <ul className="space-y-0.5">
                        {sections.map((section) => (
                          <li key={section.id}>
                            <Link
                              to={`${makeLessonUrl(lesson.id)}?section=${section.order}`}
                              className="flex items-center gap-3 rounded-lg px-3 py-2 text-xs transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/50"
                            >
                              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-gray-100 text-[10px] font-semibold text-gray-500 dark:bg-gray-700 dark:text-gray-400">
                                {section.order}
                              </span>
                              <span className="min-w-0 flex-1 truncate text-gray-600 dark:text-gray-400">
                                {section.title}
                              </span>
                              <span className="shrink-0 text-[10px] text-gray-400 dark:text-gray-500">
                                {section.blocks.length} bloque{section.blocks.length !== 1 ? 's' : ''}
                              </span>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Module Navigation Footer ──────────────────────────────── */}
        <div className="mt-8 flex items-center justify-between border-t border-gray-200 pt-5 dark:border-gray-700">
          {mod.position > 1 ? (
            <Link
              to={makeModuleUrl(`mod-${String(mod.position - 1).padStart(2, '0')}`)}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              <ArrowLeft className="h-4 w-4" />
              Modulo anterior
            </Link>
          ) : (
            <div />
          )}

          {mod.position < 18 ? (
            <Link
              to={makeModuleUrl(`mod-${String(mod.position + 1).padStart(2, '0')}`)}
              className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-gray-900 to-gray-700 px-4 py-2.5 text-sm font-medium text-white transition-all hover:from-gray-800 hover:to-gray-600 dark:from-white dark:to-gray-200 dark:text-gray-900 dark:hover:from-gray-100 dark:hover:to-gray-300"
            >
              Siguiente modulo
              <ChevronRight className="h-4 w-4" />
            </Link>
          ) : (
            <Link
              to={`/courses/${resolvedCourseId}/home${mode === 'admin_preview' ? '?admin_preview=true' : ''}`}
              className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-emerald-600 to-emerald-500 px-4 py-2.5 text-sm font-medium text-white transition-all hover:from-emerald-500 hover:to-emerald-400"
            >
              Finalizar curso
              <ChevronRight className="h-4 w-4" />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
