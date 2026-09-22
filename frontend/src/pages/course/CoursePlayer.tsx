import { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Menu, X, Trophy } from 'lucide-react';
import { coursesApi } from '../../api/modules/courses';
import { progressApi } from '../../api/modules/progress';
import { enrollmentApi } from '../../api/modules/enrollment';
import type { Course, Module, Lesson, ContentBlock, LessonProgress } from '../../api/types';
import { Sidebar } from '../../components/course/sidebar';
import { ContentRenderer } from '../../components/course/content-renderer';
import { VideoPlayer } from '../../components/course/video-player';
import { LessonNav } from '../../components/course/lesson-nav';
import { ProgressBar } from '../../components/course/progress-bar';
import { Card } from '../../components/ui/card';
import { Skeleton } from '../../components/ui/skeleton';
import { Alert } from '../../components/ui/alert';
import { Button } from '../../components/ui/button';

interface CourseStructure {
  course: Course;
  modules: Module[];
  lessonsByModule: Record<string, Lesson[]>;
  allLessons: Lesson[];
}

export function CoursePlayer() {
  const { courseId, lessonId: urlLessonId } = useParams<{ courseId: string; lessonId: string }>();
  const navigate = useNavigate();

  const [structure, setStructure] = useState<CourseStructure | null>(null);
  const [currentLessonId, setCurrentLessonId] = useState<string | null>(urlLessonId || null);
  const [contentBlocks, setContentBlocks] = useState<ContentBlock[]>([]);
  const [progressByLesson, setProgressByLesson] = useState<Record<string, LessonProgress | null>>({});
  const [courseProgress, setCourseProgress] = useState({ percentage: 0, completedLessons: 0, totalLessons: 0 });
  const [loading, setLoading] = useState(true);
  const [loadingLesson, setLoadingLesson] = useState(false);
  const [error, setError] = useState('');
  const [markingComplete, setMarkingComplete] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [courseCompleted, setCourseCompleted] = useState(false);

  // Load course structure
  useEffect(() => {
    if (!courseId) return;
    loadCourseStructure();
  }, [courseId]);

  // Load enrollment + initial lesson when structure is ready
  useEffect(() => {
    if (!structure || !courseId) return;
    checkEnrollmentAndInit();
  }, [structure, courseId]);

  // Load content when lesson changes
  useEffect(() => {
    if (!currentLessonId) return;
    loadLessonContent(currentLessonId);
  }, [currentLessonId]);

  // Sync URL with current lesson
  useEffect(() => {
    if (currentLessonId && courseId) {
      const expectedPath = `/learn/${courseId}/lesson/${currentLessonId}`;
      if (window.location.pathname !== expectedPath) {
        navigate(expectedPath, { replace: true });
      }
    }
  }, [currentLessonId, courseId, navigate]);

  const loadCourseStructure = async () => {
    if (!courseId) return;
    try {
      const course = await coursesApi.getById(courseId);
      const modules = await coursesApi.listModules(courseId);

      // Sort modules by position
      const sortedModules = modules.sort((a, b) => a.position - b.position);

      // Load lessons for each module
      const lessonsByModule: Record<string, Lesson[]> = {};
      const allLessons: Lesson[] = [];

      for (const mod of sortedModules) {
        try {
          const lessons = await coursesApi.listLessons(mod.id);
          const sortedLessons = lessons
            .filter((l) => l.visible)
            .sort((a, b) => a.position - b.position);
          lessonsByModule[mod.id] = sortedLessons;
          allLessons.push(...sortedLessons);
        } catch {
          lessonsByModule[mod.id] = [];
        }
      }

      setStructure({ course, modules: sortedModules, lessonsByModule, allLessons });

      // Load course progress
      try {
        const progress = await progressApi.getCourseProgress(courseId);
        setCourseProgress(progress);
      } catch {
        // Progress not available
      }
    } catch (err: unknown) {
      const apiError = err as { status?: number; message?: string };
      if (apiError.status === 404) {
        setError('Curso no encontrado');
      } else {
        setError(apiError.message || 'Error al cargar el curso');
      }
    } finally {
      setLoading(false);
    }
  };

  const checkEnrollmentAndInit = async () => {
    if (!courseId || !structure) return;

    // Check enrollment
    try {
      const enrollments = await enrollmentApi.getMyEnrollments();
      const activeEnrollment = enrollments.find(
        (e) => e.courseId === courseId && e.status === 'active'
      );

      if (!activeEnrollment) {
        navigate(`/courses/${courseId}`, { replace: true });
        return;
      }
    } catch {
      navigate(`/courses/${courseId}`, { replace: true });
      return;
    }

    // Determine initial lesson
    if (urlLessonId) {
      setCurrentLessonId(urlLessonId);
    } else if (structure.allLessons.length > 0) {
      // Find first incomplete lesson
      const progressResults = await Promise.allSettled(
        structure.allLessons.map((l) => progressApi.getLessonProgress(l.id))
      );

      const progressMap: Record<string, LessonProgress | null> = {};
      progressResults.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          progressMap[structure.allLessons[index].id] = result.value;
        }
      });
      setProgressByLesson(progressMap);

      const firstIncomplete = structure.allLessons.find((l) => {
        const p = progressMap[l.id];
        return !p || p.status !== 'completed';
      });

      setCurrentLessonId(firstIncomplete?.id || structure.allLessons[0].id);
    }

    // Load all lesson progress for sidebar
    loadAllProgress();
  };

  const loadAllProgress = async () => {
    if (!structure) return;

    const progressResults = await Promise.allSettled(
      structure.allLessons.map((l) => progressApi.getLessonProgress(l.id))
    );

    const progressMap: Record<string, LessonProgress | null> = {};
    progressResults.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        progressMap[structure.allLessons[index].id] = result.value;
      }
    });
    setProgressByLesson(progressMap);

    // Check if course is completed
    const allCompleted = structure.allLessons.every((l) => {
      const p = progressMap[l.id];
      return p && p.status === 'completed';
    });
    if (allCompleted && structure.allLessons.length > 0) {
      setCourseCompleted(true);
    }
  };

  const loadLessonContent = async (lessonId: string) => {
    setLoadingLesson(true);
    try {
      const blocks = await coursesApi.listBlocks(lessonId);
      const sortedBlocks = blocks.sort((a, b) => a.position - b.position);
      setContentBlocks(sortedBlocks);

      // Start lesson progress if not already started
      const existing = progressByLesson[lessonId];
      if (!existing || existing.status === 'not_started') {
        try {
          const progress = await progressApi.startLesson(lessonId);
          setProgressByLesson((prev) => ({ ...prev, [lessonId]: progress }));
        } catch {
          // Lesson might already be started
        }
      }
    } catch {
      setContentBlocks([]);
    } finally {
      setLoadingLesson(false);
    }
  };

  const handleLessonClick = useCallback((lessonId: string) => {
    setCurrentLessonId(lessonId);
    setMobileSidebarOpen(false);
  }, []);

  const handleMarkComplete = useCallback(async () => {
    if (!currentLessonId || markingComplete) return;

    setMarkingComplete(true);
    try {
      const progress = await progressApi.completeLesson(currentLessonId);
      setProgressByLesson((prev) => ({ ...prev, [currentLessonId]: progress }));

      // Refresh course progress
      if (courseId) {
        try {
          const cp = await progressApi.getCourseProgress(courseId);
          setCourseProgress(cp);
        } catch {
          // Ignore
        }
      }

      // Auto-advance to next lesson
      if (structure) {
        const currentIndex = structure.allLessons.findIndex((l) => l.id === currentLessonId);
        if (currentIndex < structure.allLessons.length - 1) {
          const nextLesson = structure.allLessons[currentIndex + 1];
          setCurrentLessonId(nextLesson.id);
        } else {
          // Last lesson completed
          setCourseCompleted(true);
          await loadAllProgress();
        }
      }
    } catch {
      // Error marking complete
    } finally {
      setMarkingComplete(false);
    }
  }, [currentLessonId, markingComplete, courseId, structure]);

  const handleVideoProgress = useCallback((_progress: number) => {
    // Video progress tracked internally by VideoPlayer
  }, []);

  const handleVideoComplete = useCallback(async () => {
    if (!currentLessonId) return;

    try {
      const progress = await progressApi.completeLesson(currentLessonId);
      setProgressByLesson((prev) => ({ ...prev, [currentLessonId]: progress }));

      // Refresh course progress
      if (courseId) {
        try {
          const cp = await progressApi.getCourseProgress(courseId);
          setCourseProgress(cp);
        } catch {
          // Ignore
        }
      }
    } catch {
      // Ignore
    }
  }, [currentLessonId, courseId]);

  const handlePrevious = useCallback(() => {
    if (!structure || !currentLessonId) return;
    const currentIndex = structure.allLessons.findIndex((l) => l.id === currentLessonId);
    if (currentIndex > 0) {
      setCurrentLessonId(structure.allLessons[currentIndex - 1].id);
    }
  }, [structure, currentLessonId]);

  const handleNext = useCallback(() => {
    if (!structure || !currentLessonId) return;
    const currentIndex = structure.allLessons.findIndex((l) => l.id === currentLessonId);
    if (currentIndex < structure.allLessons.length - 1) {
      setCurrentLessonId(structure.allLessons[currentIndex + 1].id);
    }
  }, [structure, currentLessonId]);

  // Compute navigation state
  const navState = useMemo(() => {
    if (!structure || !currentLessonId) {
      return { hasPrevious: false, hasNext: false, isCompleted: false };
    }
    const currentIndex = structure.allLessons.findIndex((l) => l.id === currentLessonId);
    const progress = progressByLesson[currentLessonId];
    return {
      hasPrevious: currentIndex > 0,
      hasNext: currentIndex < structure.allLessons.length - 1,
      isCompleted: progress?.status === 'completed',
    };
  }, [structure, currentLessonId, progressByLesson]);

  // Get current lesson's video block for VideoPlayer
  const videoBlock = useMemo(() => {
    return contentBlocks.find((b) => b.type === 'video');
  }, [contentBlocks]);

  const currentLesson = useMemo(() => {
    if (!structure || !currentLessonId) return null;
    return structure.allLessons.find((l) => l.id === currentLessonId) || null;
  }, [structure, currentLessonId]);

  // Loading state
  if (loading) {
    return (
      <div className="flex h-[calc(100vh-4rem)]">
        {/* Sidebar skeleton */}
        <div className="hidden w-72 border-r border-gray-200 bg-white lg:block">
          <div className="p-4 space-y-3">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </div>
        {/* Content skeleton */}
        <div className="flex-1 p-6">
          <Skeleton className="h-8 w-64 mb-4" />
          <Skeleton variant="rectangle" className="h-96 mb-4" />
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      </div>
    );
  }

  // Error state
  if (error || !structure) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="max-w-md text-center">
          <Alert variant="error">{error || 'Error al cargar el curso'}</Alert>
          <Link to="/dashboard" className="mt-4 inline-block">
            <Button variant="outline">Volver al panel</Button>
          </Link>
        </div>
      </div>
    );
  }

  // Course completed celebration
  if (courseCompleted) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Card className="max-w-md text-center">
          <div className="flex justify-center mb-4">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
              <Trophy className="h-10 w-10 text-green-600" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">¡Curso completado!</h2>
          <p className="mt-2 text-gray-600">
            Felicidades, has completado todas las lecciones de <strong>{structure.course.title}</strong>.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Link to="/dashboard">
              <Button>Volver al panel</Button>
            </Link>
            <Link to={`/courses/${courseId}`}>
              <Button variant="outline">Ver curso</Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] overflow-hidden">
      {/* Mobile sidebar overlay */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
          fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-gray-200 shadow-xl lg:shadow-none transform transition-transform duration-300 ease-in-out
          lg:relative lg:translate-x-0 lg:z-auto
          ${mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
        role="navigation"
        aria-label="Contenido del curso"
      >
        <div className="flex h-full flex-col">
          {/* Sidebar header */}
          <div className="flex items-center justify-between border-b border-gray-200 p-4">
            <Link
              to="/dashboard"
              className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="h-4 w-4" />
              Mis cursos
            </Link>
            <button
              type="button"
              onClick={() => setMobileSidebarOpen(false)}
              className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 lg:hidden"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Sidebar content */}
          <div className="flex-1 overflow-hidden">
            <Sidebar
              modules={structure.modules}
              lessonsByModule={structure.lessonsByModule}
              progressByLesson={progressByLesson}
              currentLessonId={currentLessonId}
              onLessonClick={handleLessonClick}
              courseTitle={structure.course.title}
            />
          </div>

          {/* Sidebar progress */}
          <div className="border-t border-gray-200 p-4">
            <ProgressBar percentage={courseProgress.percentage} showLabel />
          </div>
        </div>
      </div>

      {/* Main content area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Content header */}
        <div className="flex items-center gap-3 border-b border-gray-200 bg-white px-4 py-3 lg:px-6">
          <button
            type="button"
            onClick={() => setMobileSidebarOpen(true)}
            className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 lg:hidden"
            aria-label="Abrir menú"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="min-w-0 flex-1">
            <p className="text-sm text-gray-500">{structure.course.title}</p>
            {currentLesson && (
              <h2 className="truncate font-semibold text-gray-900">{currentLesson.title}</h2>
            )}
          </div>
        </div>

        {/* Content body */}
        <div className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-4xl px-4 py-6 lg:px-8">
            {loadingLesson ? (
              <div className="space-y-4">
                <Skeleton variant="rectangle" className="h-96" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            ) : (
              <>
                {/* Video player (if video block exists) */}
                {videoBlock && (
                  <div className="mb-6">
                    <VideoPlayer
                      src={videoBlock.content}
                      poster={videoBlock.metadata.posterUrl as string | undefined}
                      lessonId={currentLessonId!}
                      initialPosition={
                        (progressByLesson[currentLessonId!]?.lastPositionSeconds as number) || 0
                      }
                      onProgress={handleVideoProgress}
                      onComplete={handleVideoComplete}
                    />
                  </div>
                )}

                {/* Other content blocks (non-video) */}
                <ContentRenderer
                  blocks={contentBlocks.filter((b) => b.type !== 'video')}
                />

                {/* Navigation */}
                <LessonNav
                  hasPrevious={navState.hasPrevious}
                  hasNext={navState.hasNext}
                  isCompleted={navState.isCompleted}
                  onPrevious={handlePrevious}
                  onNext={handleNext}
                  onMarkComplete={handleMarkComplete}
                  markingComplete={markingComplete}
                />
              </>
            )}
          </div>
        </div>

        {/* Bottom progress bar (mobile) */}
        <div className="border-t border-gray-200 bg-white px-4 py-2 lg:hidden">
          <ProgressBar percentage={courseProgress.percentage} showLabel={false} />
          <p className="mt-1 text-xs text-gray-500 text-center">
            {courseProgress.completedLessons}/{courseProgress.totalLessons} lecciones
          </p>
        </div>
      </div>
    </div>
  );
}
