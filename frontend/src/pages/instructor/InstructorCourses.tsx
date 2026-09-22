import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  PlusCircle,
  Pencil,
  Eye,
  Archive,
  Search,
  BookOpen,
} from 'lucide-react';
import {
  instructorApi,
  type InstructorDashboardData,
} from '../../api/modules/instructor';
import { coursesApi } from '../../api/modules/courses';
import type { Course } from '../../api/types';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
  TableHead,
} from '../../components/ui/table';
import { Skeleton } from '../../components/ui/skeleton';
import { EmptyState } from '../../components/ui/empty-state';
import { Alert } from '../../components/ui/alert';
import { Dialog } from '../../components/ui/dialog';

type StatusFilter = 'all' | 'published' | 'draft' | 'archived';

function statusBadge(status: Course['status']) {
  switch (status) {
    case 'published':
      return <Badge variant="success">Publicado</Badge>;
    case 'draft':
      return <Badge variant="warning">Borrador</Badge>;
    case 'archived':
      return <Badge variant="default">Archivado</Badge>;
  }
}

function CoursesSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-10 w-32" />
      </div>
      <Skeleton className="h-10 w-64" />
      <div className="flex gap-2">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-10 w-24" />
        ))}
      </div>
      <Card padding="none">
        <div className="p-4 space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center justify-between">
              <Skeleton className="h-5 w-48" />
              <Skeleton className="h-8 w-24" />
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

const FILTER_TABS: { value: StatusFilter; label: string }[] = [
  { value: 'all', label: 'Todos' },
  { value: 'published', label: 'Publicados' },
  { value: 'draft', label: 'Borradores' },
  { value: 'archived', label: 'Archivados' },
];

export function InstructorCourses() {
  const [dashboard, setDashboard] = useState<InstructorDashboardData | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<StatusFilter>('all');
  const [archivingCourseId, setArchivingCourseId] = useState<string | null>(
    null,
  );
  const [showArchiveDialog, setShowArchiveDialog] = useState(false);
  const [archiveTarget, setArchiveTarget] = useState<Course | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await instructorApi.getDashboard();
        setDashboard(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Error al cargar los cursos',
        );
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredCourses = useMemo(() => {
    if (!dashboard) return [];
    let courses = dashboard.courses;

    if (activeFilter !== 'all') {
      courses = courses.filter((c) => c.status === activeFilter);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      courses = courses.filter((c) => c.title.toLowerCase().includes(q));
    }

    return courses;
  }, [dashboard, activeFilter, searchQuery]);

  const filterCounts = useMemo(
    () => ({
      all: dashboard?.courses.length ?? 0,
      published: dashboard?.publishedCount ?? 0,
      draft: dashboard?.draftCount ?? 0,
      archived: dashboard?.archivedCount ?? 0,
    }),
    [dashboard],
  );

  const handlePublish = async (courseId: string) => {
    try {
      const updated = await coursesApi.publish(courseId);
      setDashboard((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          courses: prev.courses.map((c) =>
            c.id === courseId ? updated : c,
          ),
          publishedCount: prev.publishedCount + 1,
          draftCount: Math.max(0, prev.draftCount - 1),
        };
      });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Error al publicar el curso',
      );
    }
  };

  const handleUnpublish = async (courseId: string) => {
    try {
      const updated = await coursesApi.unpublish(courseId);
      setDashboard((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          courses: prev.courses.map((c) =>
            c.id === courseId ? updated : c,
          ),
          publishedCount: Math.max(0, prev.publishedCount - 1),
          draftCount: prev.draftCount + 1,
        };
      });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Error al despublicar el curso',
      );
    }
  };

  const handleArchive = async () => {
    if (!archiveTarget) return;
    setArchivingCourseId(archiveTarget.id);
    try {
      const updated = await coursesApi.archive(archiveTarget.id);
      setDashboard((prev) => {
        if (!prev) return prev;
        const wasPublished = archiveTarget.status === 'published';
        return {
          ...prev,
          courses: prev.courses.map((c) =>
            c.id === archiveTarget.id ? updated : c,
          ),
          publishedCount: wasPublished
            ? Math.max(0, prev.publishedCount - 1)
            : prev.publishedCount,
          draftCount:
            archiveTarget.status === 'draft'
              ? Math.max(0, prev.draftCount - 1)
              : prev.draftCount,
          archivedCount: prev.archivedCount + 1,
        };
      });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Error al archivar el curso',
      );
    } finally {
      setArchivingCourseId(null);
      setShowArchiveDialog(false);
      setArchiveTarget(null);
    }
  };

  const openArchiveDialog = (course: Course) => {
    setArchiveTarget(course);
    setShowArchiveDialog(true);
  };

  if (loading) return <CoursesSkeleton />;

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Mis Cursos</h1>
        <Alert variant="error" title="Error">
          {error}
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Mis Cursos</h1>
        <Link to="/instructor/courses/new">
          <Button>
            <PlusCircle className="h-4 w-4" />
            Crear Curso
          </Button>
        </Link>
      </div>

      {/* Search */}
      <div className="max-w-md">
        <label htmlFor="instructor-search" className="sr-only">
          Buscar cursos
        </label>
        <div className="relative">
          <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
          <input
            id="instructor-search"
            type="text"
            placeholder="Buscar por título..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-gray-300 bg-white py-3 pl-12 pr-4 text-sm placeholder-gray-400 shadow-sm transition-all focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            aria-label="Buscar cursos"
          />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex border-b border-gray-200">
        {FILTER_TABS.map((tab) => (
          <button
            key={tab.value}
            type="button"
            onClick={() => setActiveFilter(tab.value)}
            className={`px-4 py-2.5 text-sm font-medium transition-colors ${
              activeFilter === tab.value
                ? 'border-b-2 border-indigo-600 text-indigo-600'
                : 'text-gray-500 hover:text-gray-700 hover:border-b-2 hover:border-gray-300'
            }`}
          >
            {tab.label} ({filterCounts[tab.value]})
          </button>
        ))}
      </div>

      {/* Courses Table */}
      {filteredCourses.length === 0 ? (
        <Card>
          <EmptyState
            icon={<BookOpen className="h-12 w-12" />}
            title={
              searchQuery || activeFilter !== 'all'
                ? 'No se encontraron cursos'
                : 'Aún no tienes cursos'
            }
            message={
              searchQuery || activeFilter !== 'all'
                ? 'Intenta con otros filtros de búsqueda.'
                : 'Crea tu primer curso para comenzar.'
            }
            action={
              !searchQuery && activeFilter === 'all' ? (
                <Link to="/instructor/courses/new">
                  <Button>
                    <PlusCircle className="h-4 w-4" />
                    Crear Curso
                  </Button>
                </Link>
              ) : undefined
            }
          />
        </Card>
      ) : (
        <Card padding="none">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Título</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Módulos</TableHead>
                <TableHead>Clases</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCourses.map((course) => (
                <TableRow key={course.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium text-gray-900">
                        {course.title}
                      </p>
                      <p className="max-w-xs truncate text-xs text-gray-500">
                        {course.description || 'Sin descripción'}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>{statusBadge(course.status)}</TableCell>
                  <TableCell>—</TableCell>
                  <TableCell>—</TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-1">
                      <Link to={`/instructor/courses/${course.id}`}>
                        <Button variant="ghost" size="sm">
                          <Pencil className="h-4 w-4" />
                          Editar
                        </Button>
                      </Link>
                      {course.status === 'draft' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handlePublish(course.id)}
                        >
                          <Eye className="h-4 w-4" />
                          Publicar
                        </Button>
                      )}
                      {course.status === 'published' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleUnpublish(course.id)}
                        >
                          Despublicar
                        </Button>
                      )}
                      {course.status !== 'archived' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openArchiveDialog(course)}
                        >
                          <Archive className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      {/* Archive confirmation dialog */}
      <Dialog
        open={showArchiveDialog}
        onClose={() => {
          setShowArchiveDialog(false);
          setArchiveTarget(null);
        }}
        title="Archivar Curso"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            ¿Estás seguro de que deseas archivar{' '}
            <strong>{archiveTarget?.title}</strong>? El curso no será visible
            para los estudiantes.
          </p>
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => {
                setShowArchiveDialog(false);
                setArchiveTarget(null);
              }}
            >
              Cancelar
            </Button>
            <Button
              variant="danger"
              loading={archivingCourseId === archiveTarget?.id}
              onClick={handleArchive}
            >
              Archivar
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
