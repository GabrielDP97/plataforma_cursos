import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { BookOpen, Users, ChevronDown, Check, ArrowLeft } from 'lucide-react';
import { catalogApi, type CatalogModule, type CatalogCategory } from '../../api/modules/catalog';
import { coursesApi } from '../../api/modules/courses';
import { enrollmentApi } from '../../api/modules/enrollment';
import { useAuth } from '../../providers/auth-provider';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Skeleton } from '../../components/ui/skeleton';
import { Alert } from '../../components/ui/alert';
import { MODULE_OUTCOMES } from '../../lib/module-outcomes';
import type { Course, Enrollment } from '../../api/types';

/** Returns true when any category slug corresponds to the DAM/DAW curriculum. */
const isDamDawCategory = (categories?: CatalogCategory[]): boolean => {
  if (!categories || categories.length === 0) return false;
  return categories.some((c) => {
    const s = c.slug.toLowerCase();
    return s === '1-dam-daw' || s === 'dam-daw' || s === 'dam' || s === 'daw';
  });
};

interface CourseWithModules extends Course {
  modules?: CatalogModule[];
}

export function CourseDetailPage() {
  const { courseId } = useParams<{ courseId: string }>();
  const { user } = useAuth();
  

  const [course, setCourse] = useState<CourseWithModules | null>(null);
  const [modules, setModules] = useState<CatalogModule[]>([]);
  const [categories, setCategories] = useState<CatalogCategory[]>([]);
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedModuleId, setExpandedModuleId] = useState<string | null>(null);

  useEffect(() => {
    if (courseId) {
      loadCourse();
      if (user) {
        checkEnrollment();
      }
    }
  }, [courseId, user]);

  const loadCourse = async () => {
    try {
      const catalogData = await catalogApi.getBySlug(courseId!);
      setCourse({ ...catalogData.course, modules: catalogData.modules });
      setModules(catalogData.modules);
      if (catalogData.categories) {
        setCategories(catalogData.categories);
      }
    } catch {
      try {
        // Fallback: use courses API (no per-module lesson requests — those don't exist)
        const data = await coursesApi.getById(courseId!);
        setCourse(data);
        // Try to get modules from catalog endpoint using slug
        try {
          const slug = data.slug || courseId!;
          const catalogFallback = await catalogApi.getBySlug(slug);
          if (catalogFallback.modules?.length > 0) {
            setModules(catalogFallback.modules);
            setCourse((prev) => prev ? { ...prev, modules: catalogFallback.modules } : prev);
          }
        } catch {
          // Modules unavailable — course still loads without lesson details
        }
      } catch {
        setError('No se pudo cargar el curso. Verifica que la URL sea correcta.');
      }
    } finally {
      setLoading(false);
    }
  };

  const checkEnrollment = async () => {
    try {
      const enrollments = await enrollmentApi.getMyEnrollments();
      const match = enrollments.find((e) => e.courseId === courseId && e.status === 'active');
      setEnrollment(match ?? null);
    } catch {
      // Enrollment check is non-blocking
    }
  };

  const getModulesList = (): CatalogModule[] => {
    if (course?.modules && course.modules.length > 0) return course.modules;
    return modules;
  };

  const getTotalLessons = (): number => {
    const mods = getModulesList();
    return mods.reduce((sum, mod) => sum + (mod.lessons?.length ?? 0), 0);
  };

  const toggleModule = (id: string) => {
    setExpandedModuleId((prev) => (prev === id ? null : id));
  };

  // ── Loading state ──────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        <div className="mx-auto max-w-3xl px-4 py-8">
          <Skeleton className="mb-4 h-6 w-32" />
          <Skeleton className="mb-6 h-10 w-3/4" />
          <Skeleton className="mb-4 h-20 w-full" />
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ── Error state ────────────────────────────────────────────────────────
  if (error || !course) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        <div className="mx-auto max-w-3xl px-4 py-8">
          <Alert variant="error">{error || 'Curso no encontrado'}</Alert>
          <Button className="mt-4">
            <Link to="/courses">Volver al catálogo</Link>
          </Button>
        </div>
      </div>
    );
  }

  const moduleList = getModulesList();
  const totalLessons = course.modules
    ? course.modules.reduce((s, m) => s + (m.lessons?.length ?? 0), 0)
    : getTotalLessons();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="mx-auto max-w-3xl px-4 py-8">
        {/* ── Back link ──────────────────────────────────────────────── */}
        <Link
          to="/courses"
          className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-gray-600 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver al catálogo
        </Link>

        {/* ── Hero ───────────────────────────────────────────────────── */}
        <header className="mb-8">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-50">
              {course.title}
            </h1>
            {course.status && (
              <Badge variant={course.status === 'published' ? 'success' : 'warning'}>
                {course.status === 'published' ? 'Publicado' : course.status === 'draft' ? 'Borrador' : 'Archivado'}
              </Badge>
            )}
          </div>

          {course.description && (
            <p className="text-base leading-relaxed text-gray-600 dark:text-gray-400">
              {course.description}
            </p>
          )}
        </header>

        {/* ── Metadata bar ───────────────────────────────────────────── */}
        <Card className="mb-6 p-4 dark:bg-gray-900">
          <div className="flex flex-wrap items-center gap-6 text-sm text-gray-600 dark:text-gray-400">
            <span className="inline-flex items-center gap-1.5">
              <BookOpen className="h-4 w-4" />
              {moduleList.length} {moduleList.length === 1 ? 'módulo' : 'módulos'}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Users className="h-4 w-4" />
              {totalLessons} {totalLessons === 1 ? 'lección' : 'lecciones'}
            </span>
            {isDamDawCategory(categories) && (
              <div className="flex items-center gap-2 rounded-lg bg-indigo-50 px-3 py-2 dark:bg-indigo-950/30">
                <BookOpen className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                <span className="text-xs text-indigo-700 dark:text-indigo-300">
                  Basado en el currículo oficial
                </span>
              </div>
            )}
          </div>
        </Card>

        {/* ── Enrollment CTA ─────────────────────────────────────────── */}
        <Card className="mb-8 p-6 dark:bg-gray-900">
          {enrollment ? (
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                <Check className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="font-medium text-gray-900 dark:text-gray-50">
                  Ya estás inscrito en este curso
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Continúa desde donde lo dejaste
                </p>
              </div>
              <Button className="ml-auto">
                <Link to={`/courses/${courseId}/learn`}>Continuar</Link>
              </Button>
            </div>
          ) : user?.role === 'admin' || user?.role === 'instructor' ? (
            <div className="flex items-center gap-3">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                La inscripción para este curso se gestiona desde el panel de administración.
              </p>
            </div>
          ) : (
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="font-medium text-gray-900 dark:text-gray-50">
                  ¿Te interesa este curso?
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Ponte en contacto con nosotros para solicitar información o acceso.
                </p>
              </div>
              <Link
                to={`/contacto?course=${course?.slug || courseId}`}
                className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-700"
              >
                Solicitar información
              </Link>
            </div>
          )}
        </Card>

        {/* ── Course Content Accordion ───────────────────────────────── */}
        <section>
          <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-gray-50">
            Contenido del curso
          </h2>

          {moduleList.length === 0 ? (
            <Card className="p-6 text-center dark:bg-gray-900">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                La información del contenido aún no está disponible.
              </p>
            </Card>
          ) : (
            <div className="space-y-2">
              {moduleList
                .slice()
                .sort((a, b) => a.position - b.position)
                .map((mod, index) => {
                  const isExpanded = expandedModuleId === mod.id;
                  const outcomes = MODULE_OUTCOMES[mod.id] ?? [];
                  const sortedLessons = (mod.lessons ?? [])
                    .slice()
                    .sort((a, b) => a.position - b.position);
                  const lessonCount = mod.lessons?.length ?? 0;

                  return (
                    <Card
                      key={mod.id}
                      className="overflow-hidden dark:bg-gray-900"
                    >
                      {/* Module header (always visible) */}
                      <button
                        type="button"
                        onClick={() => toggleModule(mod.id)}
                        className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
                        aria-expanded={isExpanded}
                      >
                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
                          {index + 1}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-medium text-gray-900 dark:text-gray-50">
                            {mod.title}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {lessonCount} {lessonCount === 1 ? 'lección' : 'lecciones'}
                          </p>
                        </div>
                        <ChevronDown
                          className={`h-5 w-5 shrink-0 text-gray-400 transition-transform duration-200 ${
                            isExpanded ? 'rotate-180' : ''
                          }`}
                        />
                      </button>

                      {/* Expandable content */}
                      <div
                        className={`grid transition-all duration-200 ease-in-out ${
                          isExpanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
                        }`}
                      >
                        <div className="overflow-hidden">
                          <div className="border-t border-gray-100 px-4 pb-4 pt-3 dark:border-gray-800">
                            {/* Learning outcomes */}
                            {outcomes.length > 0 && (
                              <div className="mb-4">
                                <p className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                                  En este módulo aprenderás:
                                </p>
                                <ul className="space-y-1.5">
                                  {outcomes.map((outcome, oi) => (
                                    <li
                                      key={oi}
                                      className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400"
                                    >
                                      <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-green-500 dark:text-green-400" />
                                      {outcome}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            {/* Lessons */}
                            {sortedLessons.length > 0 && (
                              <div>
                                <p className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                                  Lecciones incluidas
                                </p>
                                <ul className="space-y-1">
                                  {sortedLessons.map((lesson) => (
                                    <li
                                      key={lesson.id}
                                      className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-gray-600 transition-colors hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-800/50"
                                    >
                                      <BookOpen className="h-3.5 w-3.5 shrink-0 text-gray-400 dark:text-gray-500" />
                                      {lesson.title}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </Card>
                  );
                })}
            </div>
          )}
        </section>

        {/* ── Footer note ────────────────────────────────────────────── */}
        <p className="mt-8 text-center text-xs text-gray-400 dark:text-gray-600">
          El contenido del curso puede actualizarse. Al inscribirte tendrás acceso a todas las futuras actualizaciones.
        </p>
      </div>
    </div>
  );
}
