import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, ChevronDown, ChevronRight, BookOpen, FileText, Code, Video, Link as LinkIcon, File, EyeOff, ExternalLink } from 'lucide-react';
import { adminApi } from '../../api/modules/admin';
import type { CourseDetail } from '../../api/types';
import { Card } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Skeleton } from '../../components/ui/skeleton';

const STATUS_LABELS: Record<string, string> = {
  draft: 'Borrador',
  published: 'Publicado',
  archived: 'Archivado',
};

const STATUS_VARIANTS: Record<string, 'warning' | 'success' | 'default'> = {
  draft: 'warning',
  published: 'success',
  archived: 'default',
};

const BLOCK_TYPE_ICONS: Record<string, typeof FileText> = {
  text: FileText,
  code: Code,
  video: Video,
  file: File,
  link: LinkIcon,
};

const BLOCK_TYPE_LABELS: Record<string, string> = {
  text: 'Texto',
  code: 'Código',
  video: 'Video',
  file: 'Archivo',
  link: 'Enlace',
};

function DetailSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-6 w-32" />
      <Skeleton className="h-8 w-64" />
      <div className="grid grid-cols-2 gap-4">
        <Skeleton className="h-20" />
        <Skeleton className="h-20" />
      </div>
      <Skeleton className="h-40" />
    </div>
  );
}

function ContentBlockPreview({ block }: { block: CourseDetail['modules'][0]['lessons'][0]['contentBlocks'][0] }) {
  const Icon = BLOCK_TYPE_ICONS[block.type] || FileText;
  const label = BLOCK_TYPE_LABELS[block.type] || block.type;

  return (
    <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-800">
      <div className="mb-2 flex items-center gap-2">
        <Icon className="h-4 w-4 text-gray-500 dark:text-gray-400" />
        <span className="text-xs font-medium text-gray-600 dark:text-gray-400">{label}</span>
      </div>
      {block.type === 'code' ? (
        <pre className="overflow-x-auto rounded bg-gray-900 p-3 text-xs text-gray-100">
          <code>{block.content}</code>
        </pre>
      ) : block.type === 'video' ? (
        <p className="text-sm text-gray-600 dark:text-gray-400">Video: {block.content}</p>
      ) : block.type === 'link' ? (
        <a
          href={block.content}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-indigo-600 hover:underline break-all dark:text-indigo-400"
        >
          {block.content}
        </a>
      ) : block.type === 'file' ? (
        <p className="text-sm text-gray-600 dark:text-gray-400">Archivo: {block.content}</p>
      ) : (
        <p className="text-sm text-gray-700 whitespace-pre-wrap dark:text-gray-300">{block.content}</p>
      )}
    </div>
  );
}

export function AdminCourseDetail() {
  const { courseId } = useParams<{ courseId: string }>();
  
  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());
  const [expandedLessons, setExpandedLessons] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!courseId) return;

    async function fetchCourse() {
      setLoading(true);
      setError(null);
      try {
        const data = await adminApi.getCourseById(courseId!);
        setCourse(data);
      } catch (err) {
        if (err instanceof Error && 'status' in err && (err as any).status === 404) {
          setError('NOT_FOUND');
        } else {
          setError(err instanceof Error ? err.message : 'Error al cargar el curso');
        }
      } finally {
        setLoading(false);
      }
    }

    fetchCourse();
  }, [courseId]);

  const toggleModule = (moduleId: string) => {
    setExpandedModules((prev) => {
      const next = new Set(prev);
      if (next.has(moduleId)) {
        next.delete(moduleId);
      } else {
        next.add(moduleId);
      }
      return next;
    });
  };

  const toggleLesson = (lessonId: string) => {
    setExpandedLessons((prev) => {
      const next = new Set(prev);
      if (next.has(lessonId)) {
        next.delete(lessonId);
      } else {
        next.add(lessonId);
      }
      return next;
    });
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <DetailSkeleton />
      </div>
    );
  }

  if (error === 'NOT_FOUND') {
    return (
      <div className="space-y-6">
        <Link
          to="/admin/courses"
          className="inline-flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver a cursos
        </Link>
        <Card>
          <div className="py-12 text-center">
            <p className="text-lg font-medium text-gray-900 dark:text-white">Curso no encontrado</p>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              El curso que buscas no existe o ha sido eliminado.
            </p>
          </div>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <Link
          to="/admin/courses"
          className="inline-flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver a cursos
        </Link>
        <Card>
          <div className="py-12 text-center">
            <p className="text-lg font-medium text-red-600 dark:text-red-400">Error</p>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{error}</p>
          </div>
        </Card>
      </div>
    );
  }

  if (!course) return null;

  return (
    <div className="space-y-6">
      {/* Back link */}
      <Link
        to="/admin/courses"
        className="inline-flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver a cursos
      </Link>

      {/* Header */}
      <div>
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{course.title}</h1>
            {course.description && (
              <p className="mt-2 text-gray-600 dark:text-gray-400">{course.description}</p>
            )}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Badge variant={STATUS_VARIANTS[course.status] || 'default'} size="md">
              {STATUS_LABELS[course.status] || course.status}
            </Badge>
            <Link
              to={`/courses/${courseId}/home?admin_preview=true`}
              className="inline-flex items-center gap-1.5 rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-sm font-medium text-indigo-700 transition-colors hover:bg-indigo-100 dark:border-indigo-800 dark:bg-indigo-950/50 dark:text-indigo-300 dark:hover:bg-indigo-900/50"
              aria-label="Vista de aprendizaje del curso"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Vista de aprendizaje</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Meta info cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card padding="sm">
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Instructor</p>
          <p className="mt-1 text-sm font-semibold text-gray-900 dark:text-white">
            {course.instructor ? course.instructor.name : 'Sin instructor asignado'}
          </p>
          {course.instructor && (
            <p className="text-xs text-gray-500 dark:text-gray-400">{course.instructor.email}</p>
          )}
        </Card>
        <Card padding="sm">
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Slug</p>
          <p className="mt-1 font-mono text-sm text-gray-900 dark:text-gray-200">{course.slug}</p>
        </Card>
        <Card padding="sm">
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Módulos</p>
          <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">{course.moduleCount}</p>
        </Card>
        <Card padding="sm">
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Lecciones</p>
          <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">{course.lessonCount}</p>
        </Card>
      </div>

      {/* Modules */}
      <div>
        <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">
          Estructura del curso ({course.moduleCount} módulos)
        </h2>

        {course.modules.length === 0 ? (
          <Card>
            <p className="py-8 text-center text-sm text-gray-500 dark:text-gray-400">
              Este curso aún no tiene módulos.
            </p>
          </Card>
        ) : (
          <div className="space-y-3">
            {course.modules.map((mod) => {
              const isExpanded = expandedModules.has(mod.id);
              return (
                <Card key={mod.id} padding="none">
                  {/* Module header */}
                  <button
                    type="button"
                    onClick={() => toggleModule(mod.id)}
                    className="flex w-full items-center gap-3 p-4 text-left hover:bg-gray-50 transition-colors dark:hover:bg-gray-800/50"
                    aria-expanded={isExpanded}
                  >
                    {isExpanded ? (
                      <ChevronDown className="h-5 w-5 flex-shrink-0 text-gray-400 dark:text-gray-500" />
                    ) : (
                      <ChevronRight className="h-5 w-5 flex-shrink-0 text-gray-400 dark:text-gray-500" />
                    )}
                    <BookOpen className="h-5 w-5 flex-shrink-0 text-indigo-500 dark:text-indigo-400" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-gray-400 dark:text-gray-500">
                          #{mod.position}
                        </span>
                        <p className="font-medium text-gray-900 truncate dark:text-white">{mod.title}</p>
                      </div>
                      {mod.description && (
                        <p className="mt-0.5 text-xs text-gray-500 truncate dark:text-gray-400">
                          {mod.description}
                        </p>
                      )}
                    </div>
                    <span className="flex-shrink-0 text-xs text-gray-400 dark:text-gray-500">
                      {mod.lessons.length} lecciones
                    </span>
                    {!mod.visible && (
                      <EyeOff className="h-4 w-4 flex-shrink-0 text-gray-400" />
                    )}
                  </button>

                  {/* Lessons */}
                  {isExpanded && mod.lessons.length > 0 && (
                    <div className="border-t border-gray-100 dark:border-gray-700/50">
                      {mod.lessons.map((les) => {
                        const isLesExpanded = expandedLessons.has(les.id);
                        return (
                          <div key={les.id}>
                            {/* Lesson header */}
                            <button
                              type="button"
                              onClick={() => toggleLesson(les.id)}
                              className="flex w-full items-center gap-3 px-8 py-3 text-left hover:bg-gray-50 transition-colors dark:hover:bg-gray-800/50"
                              aria-expanded={isLesExpanded}
                            >
                              {isLesExpanded ? (
                                <ChevronDown className="h-4 w-4 flex-shrink-0 text-gray-400 dark:text-gray-500" />
                              ) : (
                                <ChevronRight className="h-4 w-4 flex-shrink-0 text-gray-400 dark:text-gray-500" />
                              )}
                              <FileText className="h-4 w-4 flex-shrink-0 text-gray-400 dark:text-gray-500" />
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2">
                                  <span className="text-xs text-gray-400 dark:text-gray-500">
                                    #{les.position}
                                  </span>
                                  <p className="text-sm font-medium text-gray-800 truncate dark:text-gray-200">
                                    {les.title}
                                  </p>
                                </div>
                              </div>
                              <span className="flex-shrink-0 text-xs text-gray-400 dark:text-gray-500">
                                {les.contentBlocks.length} bloques
                              </span>
                              {!les.visible && (
                                <EyeOff className="h-3.5 w-3.5 flex-shrink-0 text-gray-400" />
                              )}
                            </button>

                            {/* Content blocks */}
                            {isLesExpanded && les.contentBlocks.length > 0 && (
                              <div className="space-y-2 px-12 pb-3">
                                {les.contentBlocks.map((block) => (
                                  <ContentBlockPreview key={block.id} block={block} />
                                ))}
                              </div>
                            )}
                            {isLesExpanded && les.contentBlocks.length === 0 && (
                              <p className="px-12 pb-3 text-xs text-gray-400 dark:text-gray-500">
                                Sin bloques de contenido
                              </p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                  {isExpanded && mod.lessons.length === 0 && (
                    <div className="border-t border-gray-100 px-8 py-3 dark:border-gray-700/50">
                      <p className="text-xs text-gray-400 dark:text-gray-500">Sin lecciones</p>
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
