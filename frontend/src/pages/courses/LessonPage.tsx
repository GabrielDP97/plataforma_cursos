import { useMemo, useState, useCallback, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, ChevronLeft, ChevronRight, Clock, Menu, X, CheckCircle } from 'lucide-react';
import { AdminPreviewBar } from '../../components/course/AdminPreviewBar';
import { ContentBlockRenderer } from '../../components/course/ContentBlockRenderer';
import { ExerciseShell } from '../../components/course/exercises/ExerciseShell';
import { Button } from '../../components/ui/button';
import { Alert } from '../../components/ui/alert';
import { getPhaseColors } from '../../components/course/phase-colors';
import { deriveSections } from '../../components/course/deriveSections';
import { progressApi } from '../../api/modules/progress';
import type { LessonSection } from '../../components/course/deriveSections';
import type { ViewMode, ModuleJson } from '../../components/course/types';
import courseData from '../../../../courses/programming/course.json';
import mod01 from '../../../../courses/programming/modules/mod-01.json';
import mod02 from '../../../../courses/programming/modules/mod-02.json';
import mod03 from '../../../../courses/programming/modules/mod-03.json';
import mod04 from '../../../../courses/programming/modules/mod-04.json';
import mod05 from '../../../../courses/programming/modules/mod-05.json';
import mod06 from '../../../../courses/programming/modules/mod-06.json';
import mod07 from '../../../../courses/programming/modules/mod-07.json';
import mod08 from '../../../../courses/programming/modules/mod-08.json';
import mod09 from '../../../../courses/programming/modules/mod-09.json';
import mod10 from '../../../../courses/programming/modules/mod-10.json';
import mod11 from '../../../../courses/programming/modules/mod-11.json';
import mod12 from '../../../../courses/programming/modules/mod-12.json';
import mod13 from '../../../../courses/programming/modules/mod-13.json';
import mod14 from '../../../../courses/programming/modules/mod-14.json';
import mod15 from '../../../../courses/programming/modules/mod-15.json';
import mod16 from '../../../../courses/programming/modules/mod-16.json';
import mod17 from '../../../../courses/programming/modules/mod-17.json';
import mod18 from '../../../../courses/programming/modules/mod-18.json';



const ALL_MODULES = {
  'mod-01': mod01, 'mod-02': mod02, 'mod-03': mod03, 'mod-04': mod04,
  'mod-05': mod05, 'mod-06': mod06, 'mod-07': mod07, 'mod-08': mod08,
  'mod-09': mod09, 'mod-10': mod10, 'mod-11': mod11, 'mod-12': mod12,
  'mod-13': mod13, 'mod-14': mod14, 'mod-15': mod15, 'mod-16': mod16,
  'mod-17': mod17, 'mod-18': mod18,
} as Record<string, ModuleJson>;

function getNextLessonInfo(
  currentModuleId: string,
  currentLessonIndex: number,
): { moduleId: string; lessonId: string; isLastInCourse: boolean } | null {
  const allModuleIds = courseData.phases.flatMap((p) => p.modules);
  const currentModulePosition = allModuleIds.indexOf(currentModuleId);

  const mod = ALL_MODULES[currentModuleId];
  if (!mod) return null;

  // Within current module
  if (currentLessonIndex < mod.lessons.length - 1) {
    return { moduleId: currentModuleId, lessonId: mod.lessons[currentLessonIndex + 1].id, isLastInCourse: false };
  }

  // Next module's first lesson
  for (let i = currentModulePosition + 1; i < allModuleIds.length; i++) {
    const nextMod = ALL_MODULES[allModuleIds[i]];
    if (nextMod && nextMod.lessons.length > 0) {
      return { moduleId: allModuleIds[i], lessonId: nextMod.lessons[0].id, isLastInCourse: false };
    }
  }

  // Last lesson in the entire course
  return { moduleId: currentModuleId, lessonId: '', isLastInCourse: true };
}

function getPhaseIdForModule(moduleId: string): string {
  for (const phase of courseData.phases) {
    if (phase.modules.includes(moduleId)) return phase.id;
  }
  return 'phase-1';
}

export default function LessonPage() {
  const { courseId, moduleId, lessonId } = useParams<{ courseId: string; moduleId: string; lessonId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeExerciseIndex, setActiveExerciseIndex] = useState(0);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [lessonCompleted, setLessonCompleted] = useState(false);
  const [completionError, setCompletionError] = useState('');
  const [completedLessonIds, setCompletedLessonIds] = useState<Set<string>>(new Set());

  const mode: ViewMode = searchParams.get('admin_preview') === 'true' ? 'admin_preview' : 'student';
  const mod = moduleId ? ALL_MODULES[moduleId] : undefined;
  const phaseId = moduleId ? getPhaseIdForModule(moduleId) : 'phase-1';
  const colors = getPhaseColors(phaseId);
  const resolvedCourseId = courseId || courseData.id;

  const currentLessonIndex = useMemo(() => {
    if (!mod || !lessonId) return -1;
    return mod.lessons.findIndex((l) => l.id === lessonId);
  }, [mod, lessonId]);

  const currentLesson = mod && currentLessonIndex >= 0 ? mod.lessons[currentLessonIndex] : undefined;
  const previousLessonId = currentLessonIndex > 0 && mod ? mod.lessons[currentLessonIndex - 1].id : undefined;

  // Cross-module: find next lesson across all modules
  const nextLessonInfo = useMemo(() => {
    if (!mod || currentLessonIndex < 0) return null;
    return getNextLessonInfo(moduleId!, currentLessonIndex);
  }, [mod, moduleId, currentLessonIndex]);

  // ── Section derivation ───────────────────────────────────────────────────

  const sections = useMemo<LessonSection[]>(() => {
    if (!currentLesson) return [];
    return deriveSections(currentLesson.contentBlocks, currentLesson.exercises);
  }, [currentLesson]);

  // Section index derived from URL — the URL is the source of truth
  const sectionParam = searchParams.get('section');
  const currentSectionIndex = sectionParam
    ? Math.max(0, Math.min(parseInt(sectionParam, 10) - 1, sections.length - 1))
    : 0;

  // Reset active exercise index when section changes
  useEffect(() => {
    setActiveExerciseIndex(0);
  }, [currentSectionIndex]);

  // Scroll to top when section changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentSectionIndex]);

  // ── Progress tracking ──────────────────────────────────────────────────

  // Check if current lesson is already completed
  useEffect(() => {
    if (!lessonId || mode === 'admin_preview') return;
    progressApi
      .getLessonProgress(lessonId)
      .then((p) => {
        if (p?.status === 'completed') setLessonCompleted(true);
      })
      .catch(() => {});
  }, [lessonId, mode]);

  // Auto-start lesson on mount
  useEffect(() => {
    if (!lessonId || mode === 'admin_preview') return;
    progressApi.startLesson(lessonId).catch(() => {});
  }, [lessonId, mode]);

  // Load sidebar lesson completion states
  useEffect(() => {
    if (mode === 'admin_preview' || !mod) return;
    let cancelled = false;
    const loadProgress = async () => {
      const completed = new Set<string>();
      for (const lesson of mod.lessons) {
        try {
          const p = await progressApi.getLessonProgress(lesson.id);
          if (p?.status === 'completed') completed.add(lesson.id);
        } catch {
          // ignore
        }
      }
      if (!cancelled) setCompletedLessonIds(completed);
    };
    loadProgress();
    return () => { cancelled = true; };
  }, [mod, mode]);

  const currentSection = sections[currentSectionIndex] ?? null;
  const hasPreviousSection = currentSectionIndex > 0;
  const hasNextSection = currentSectionIndex < sections.length - 1;

  const makeSectionUrl = useCallback(
    (targetLessonId: string, sectionIdx: number) => {
      const base = `/courses/${resolvedCourseId}/modules/${moduleId}/lessons/${targetLessonId}`;
      const params = new URLSearchParams();
      if (mode === 'admin_preview') params.set('admin_preview', 'true');
      if (sectionIdx > 0) params.set('section', String(sectionIdx + 1));
      const qs = params.toString();
      return qs ? `${base}?${qs}` : base;
    },
    [resolvedCourseId, moduleId, mode],
  );

  const navigateToSection = useCallback(
    (sectionIdx: number) => {
      if (!currentLesson) return;
      navigate(makeSectionUrl(currentLesson.id, sectionIdx), { replace: false });
    },
    [currentLesson, navigate, makeSectionUrl],
  );

  const makeLessonUrl = useCallback(
    (id: string, startSection = false, targetModuleId?: string) => {
      const base = `/courses/${resolvedCourseId}/modules/${targetModuleId || moduleId}/lessons/${id}`;
      const params = new URLSearchParams();
      if (mode === 'admin_preview') params.set('admin_preview', 'true');
      if (startSection) params.set('section', '1');
      const qs = params.toString();
      return qs ? `${base}?${qs}` : base;
    },
    [resolvedCourseId, moduleId, mode]
  );

  if (!mod || !currentLesson) {
    return (
      <div>
        <div className="mx-auto max-w-7xl px-4 py-20 text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Leccion no encontrada</h1>
          <p className="mt-2 text-gray-500 dark:text-gray-400">La leccion solicitada no existe en este modulo.</p>
          <Button onClick={() => navigate(-1)} className="mt-6">Volver</Button>
        </div>
      </div>
    );
  }

  const sectionBlocks = currentSection?.blocks.map((block) => ({
    type: block.type,
    title: block.title as string | undefined,
    content: block.content,
    metadata: block.metadata ?? {
      language: (block as any).language,
      duration: (block as any).duration,
      description: (block as any).description,
      url: (block as any).url,
    },
  })) ?? [];

  const exercises = currentLesson.exercises ?? [];
  const isExerciseSection = currentSection?.type === 'exercise';
  const moduleProgress = mod.lessons.length > 0 ? Math.round(((currentLessonIndex + 1) / mod.lessons.length) * 100) : 0;

  const handleExerciseNavigate = useCallback((direction: 'prev' | 'next') => {
    setActiveExerciseIndex((prev) => {
      if (direction === 'prev') return Math.max(0, prev - 1);
      return Math.min(exercises.length - 1, prev + 1);
    });
  }, [exercises.length]);

  const handleNextLesson = useCallback(() => {
    if (!nextLessonInfo || nextLessonInfo.isLastInCourse) {
      // Last lesson in course — navigate back to module
      navigate(`/courses/${resolvedCourseId}/modules/${moduleId}${mode === 'admin_preview' ? '?admin_preview=true' : ''}`);
      return;
    }

    // If lesson already completed, skip modal
    if (lessonCompleted) {
      navigate(makeLessonUrl(nextLessonInfo.lessonId, true, nextLessonInfo.moduleId));
      return;
    }

    // Show confirmation modal
    setShowCompletionModal(true);
  }, [nextLessonInfo, lessonCompleted, navigate, resolvedCourseId, moduleId, mode, makeLessonUrl]);

  const handleConfirmComplete = useCallback(async () => {
    setCompleting(true);
    setCompletionError('');
    try {
      await progressApi.completeLesson(lessonId!);
      setLessonCompleted(true);

      // Navigate to next lesson
      // Update sidebar completion
      setCompletedLessonIds((prev) => new Set([...prev, lessonId!]));

      // Navigate to next lesson
      const nextInfo = getNextLessonInfo(moduleId!, currentLessonIndex);
      if (nextInfo && !nextInfo.isLastInCourse && nextInfo.lessonId) {
        navigate(makeLessonUrl(nextInfo.lessonId, true, nextInfo.moduleId));
      }
    } catch {
      setCompletionError('No se ha podido guardar el progreso. Inténtalo de nuevo.');
    } finally {
      setCompleting(false);
    }
  }, [lessonId, moduleId, currentLessonIndex, resolvedCourseId, navigate, makeLessonUrl]);


  return (
    <div>
      {mode === 'admin_preview' && (
        <AdminPreviewBar courseStatus={courseData.status as 'draft' | 'published' | 'archived'} />
      )}

      {/* Mobile sidebar toggle */}
      <div className="sticky top-0 z-40 flex items-center gap-3 border-b border-gray-200 bg-white px-4 py-3 dark:border-gray-700 dark:bg-gray-900 lg:hidden">
        <button
          type="button"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
          aria-label={sidebarOpen ? 'Cerrar menu' : 'Abrir menu'}
        >
          {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
        <div className="min-w-0 flex-1">
          <p className="text-xs text-gray-400 dark:text-gray-500">
            Modulo {mod.position} &middot; Leccion {currentLessonIndex + 1}/{mod.lessons.length}
          </p>
          <p className="truncate text-sm font-semibold text-gray-900 dark:text-white">{currentLesson.title}</p>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={`fixed inset-y-0 left-0 z-30 w-64 overflow-y-auto border-r border-gray-200 bg-white transition-transform dark:border-gray-700 dark:bg-gray-900 lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
          aria-label="Navegacion del modulo"
        >
          <div className="border-b border-gray-200 p-4 dark:border-gray-700">
            <Link
              to={`/courses/${resolvedCourseId}/modules/${moduleId}${mode === 'admin_preview' ? '?admin_preview=true' : ''}`}
              className="mb-3 inline-flex items-center gap-1.5 text-xs font-medium text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Modulo {mod.position}
            </Link>
            <h2 className="text-sm font-bold text-gray-900 dark:text-white">{mod.title}</h2>
            <div className="mt-3">
              <div className="flex items-center justify-between text-xs text-gray-400 dark:text-gray-500">
                <span>Progreso</span>
                <span>{moduleProgress}%</span>
              </div>
              <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                <div
                  className={`h-full rounded-full bg-gradient-to-r ${colors.gradient} transition-all duration-300`}
                  style={{ width: `${moduleProgress}%` }}
                  role="progressbar"
                  aria-valuenow={moduleProgress}
                  aria-valuemin={0}
                  aria-valuemax={100}
                />
              </div>
            </div>
          </div>

          <nav className="p-2">
            <ul className="space-y-1">
              {mod.lessons.map((lesson, idx) => {
                const isCurrent = lesson.id === lessonId;
                return (
                  <li key={lesson.id}>
                    <Link
                      to={makeLessonUrl(lesson.id)}
                      onClick={() => setSidebarOpen(false)}
                      className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all"
                      style={{
                        borderLeftWidth: '3px',
                        borderLeftStyle: 'solid',
                        borderLeftColor: isCurrent ? colors.accent : 'transparent',
                        background: isCurrent
                          ? `linear-gradient(to right, ${colors.accent}18, transparent)`
                          : undefined,
                      }}
                      aria-current={isCurrent ? 'page' : undefined}
                    >
                      {/* Number badge — gradient for current, muted for others */}
                      <span
                        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-xs font-semibold ${
                          isCurrent
                            ? 'text-white'
                            : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'
                        }`}
                        style={{
                          background: isCurrent
                            ? `linear-gradient(135deg, ${colors.accent}, ${colors.accent}BB)`
                            : undefined,
                        }}
                      >
                        {idx + 1}
                      </span>
                      <span
                        className={`line-clamp-1 flex-1 ${
                          isCurrent ? 'font-semibold' : 'text-gray-600 dark:text-gray-400'
                        }`}
                        style={{ color: isCurrent ? colors.accent : undefined }}
                      >
                        {lesson.title}
                      </span>
                      {/* Completion check */}
                      {completedLessonIds.has(lesson.id) && (
                        <CheckCircle className="h-4 w-4 shrink-0 text-emerald-500" />
                      )}
                      {/* Active indicator dot */}
                      {isCurrent && !completedLessonIds.has(lesson.id) && (
                        <span
                          className="h-1.5 w-1.5 shrink-0 rounded-full animate-pulse"
                          style={{ backgroundColor: colors.accent }}
                        />
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        </aside>

        {/* Mobile overlay */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-20 bg-black/40 lg:hidden" onClick={() => setSidebarOpen(false)} aria-hidden="true" />
        )}

        {/* Main content */}
        <main className="min-w-0 flex-1">
          {/* Breadcrumb */}
          <div className="border-b border-gray-200 bg-white px-5 py-2 dark:border-gray-700 dark:bg-gray-900">
            <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-gray-400 dark:text-gray-500">
              <Link to={`/courses/${resolvedCourseId}/home${mode === 'admin_preview' ? '?admin_preview=true' : ''}`} className="transition-colors hover:text-gray-600 dark:hover:text-gray-300">Curso</Link>
              <ChevronRight className="h-3 w-3" />
              <Link to={`/courses/${resolvedCourseId}/modules/${moduleId}${mode === 'admin_preview' ? '?admin_preview=true' : ''}`} className="transition-colors hover:text-gray-600 dark:hover:text-gray-300">Modulo {mod.position}</Link>
              <ChevronRight className="h-3 w-3" />
              <Link to={makeLessonUrl(currentLesson.id)} className="transition-colors hover:text-gray-600 dark:hover:text-gray-300">Leccion {currentLessonIndex + 1}</Link>
              {sections.length > 1 && currentSection && (
                <>
                  <ChevronRight className="h-3 w-3" />
                  <span className="font-medium text-gray-700 dark:text-gray-200">{currentSection.title}</span>
                </>
              )}
            </nav>
          </div>

          {/* Lesson header */}
          <div className="border-b border-gray-200 bg-white px-5 py-5 dark:border-gray-700 dark:bg-gray-900">
            <div className="mx-auto max-w-3xl">
              <div className="mb-2 flex items-center gap-2 text-xs text-gray-400 dark:text-gray-500">
                <Clock className="h-3.5 w-3.5" />
                <span>Leccion {currentLessonIndex + 1} de {mod.lessons.length}</span>
                {sections.length > 1 && (
                  <span className="text-gray-300 dark:text-gray-600">&middot;</span>
                )}
                {sections.length > 1 && (
                  <span>Apartado {currentSectionIndex + 1} de {sections.length}</span>
                )}
              </div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl">{currentLesson.title}</h1>
              <div className="mt-4 max-w-md">
                <div className="flex items-center justify-between text-xs text-gray-400 dark:text-gray-500">
                  <span>Progreso del modulo</span>
                  <span>{moduleProgress}%</span>
                </div>
                <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                  <div className={`h-full rounded-full bg-gradient-to-r ${colors.gradient} transition-all duration-300`} style={{ width: `${moduleProgress}%` }} />
                </div>
              </div>
            </div>
          </div>

          {/* Lesson body */}
          <div className="px-5 py-6">
            <article className="mx-auto max-w-3xl">
              {/* Section title (when multiple sections) */}
              {sections.length > 1 && currentSection && (
                <div className="mb-6">
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white">{currentSection.title}</h2>
                  <div className="mt-2 flex items-center gap-1">
                    {sections.map((s, idx) => (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => navigateToSection(idx)}
                        className={`h-1.5 rounded-full transition-all duration-300 ${
                          idx === currentSectionIndex
                            ? 'w-8 bg-gray-900 dark:bg-white'
                            : 'w-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600'
                        }`}
                        aria-label={`Apartado ${idx + 1}: ${s.title}`}
                        title={s.title}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Current section content */}
              {isExerciseSection ? (
                <section>
                  <h2 className="mb-2 text-lg font-bold text-gray-900 dark:text-white">Ejercicios</h2>
                  <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
                    {exercises.length} ejercicio{exercises.length !== 1 ? 's' : ''} en esta leccion
                  </p>

                  {/* Exercise tabs */}
                  {exercises.length > 1 && (
                    <div className="mb-4 flex gap-1 overflow-x-auto pb-1">
                      {exercises.map((exercise, idx) => (
                        <button
                          key={exercise.id}
                          type="button"
                          onClick={() => setActiveExerciseIndex(idx)}
                          className={`shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                            idx === activeExerciseIndex
                              ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700'
                          }`}
                        >
                          {idx + 1}. {exercise.title}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Active exercise */}
                  {activeExerciseIndex < exercises.length && (
                    <ExerciseShell
                      key={exercises[activeExerciseIndex].id}
                      exercise={{
                        ...exercises[activeExerciseIndex],
                        language: 'java',
                      }}
                      index={activeExerciseIndex}
                      total={exercises.length}
                      onNavigate={exercises.length > 1 ? handleExerciseNavigate : undefined}
                      isAdmin={mode === 'admin_preview'}
                    />
                  )}
                </section>
              ) : (
                <ContentBlockRenderer blocks={sectionBlocks} />
              )}

              {/* Section navigation + Lesson navigation */}
              <div className="mt-8 border-t border-gray-200 pt-5 dark:border-gray-700">
                {/* Section nav (only when multiple sections) */}
                {sections.length > 1 && (
                  <div className="mb-6 flex items-center justify-between">
                    {hasPreviousSection ? (
                      <Button variant="ghost" onClick={() => navigateToSection(currentSectionIndex - 1)}>
                        <ChevronLeft className="h-4 w-4" />
                        <span className="ml-1">Anterior</span>
                      </Button>
                    ) : (
                      <div />
                    )}
                    <span className="text-xs text-gray-400 dark:text-gray-500">
                      Apartado {currentSectionIndex + 1} de {sections.length}
                    </span>
                    {hasNextSection ? (
                      <Button variant="ghost" onClick={() => navigateToSection(currentSectionIndex + 1)}>
                        <span className="mr-1">Siguiente</span>
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    ) : (
                      <div />
                    )}
                  </div>
                )}

                {/* Lesson nav */}
                <div className="flex items-center justify-between">
                  {previousLessonId ? (
                    <Button variant="ghost" onClick={() => navigate(makeLessonUrl(previousLessonId, true))}>
                      <ChevronRight className="h-4 w-4 rotate-180" />
                      Anterior
                    </Button>
                  ) : <div />}
                  {nextLessonInfo ? (
                    <Button variant="primary" onClick={handleNextLesson}>
                      {nextLessonInfo.isLastInCourse ? 'Volver al modulo' : 'Siguiente leccion'}
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  ) : (
                    <Button variant="primary" onClick={() => navigate(`/courses/${resolvedCourseId}/modules/${moduleId}${mode === 'admin_preview' ? '?admin_preview=true' : ''}`)}>
                      Volver al modulo
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </article>
          </div>
        </main>
      </div>

      {/* Completion confirmation modal */}
      {showCompletionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => !completing && setShowCompletionModal(false)} />
          <div className="relative mx-4 w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-gray-900">
            <div className="mb-2 flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-emerald-500" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                ¿Has terminado esta lección?
              </h2>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Si continúas, esta lección se guardará como realizada y se actualizará tu progreso del curso.
            </p>
            {completionError && (
              <Alert variant="error" className="mt-4">
                {completionError}
              </Alert>
            )}
            <div className="mt-6 flex justify-end gap-3">
              <Button variant="ghost" onClick={() => setShowCompletionModal(false)} disabled={completing}>
                Seguir en la lección
              </Button>
              <Button onClick={handleConfirmComplete} loading={completing}>
                Sí, finalizar y continuar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}




