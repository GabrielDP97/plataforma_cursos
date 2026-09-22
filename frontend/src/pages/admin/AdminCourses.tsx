import { useEffect, useState, useCallback, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Search, Trash2, ChevronLeft, ChevronRight, Eye, ExternalLink } from 'lucide-react';
import { adminApi } from '../../api/modules/admin';
import type { Course } from '../../api/types';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
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

const STATUS_TABS: { value: StatusFilter; label: string }[] = [
  { value: 'all', label: 'Todos' },
  { value: 'published', label: 'Publicados' },
  { value: 'draft', label: 'Borradores' },
  { value: 'archived', label: 'Archivados' },
];

const PAGE_SIZE = 10;

function CoursesSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-10 w-64" />
      <div className="flex gap-2">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-10 w-24" />
        ))}
      </div>
      <Card padding="none">
        <div className="p-4 space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Skeleton className="h-5 w-48" />
                <Skeleton className="h-5 w-32" />
              </div>
              <Skeleton className="h-8 w-24" />
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

export function AdminCourses() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const currentPage = Math.max(1, Number(searchParams.get('page')) || 1);
  const currentSearch = searchParams.get('search') || '';
  const currentStatus = (searchParams.get('status') as StatusFilter) || 'all';

  const [courses, setCourses] = useState<Course[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchInput, setSearchInput] = useState(currentSearch);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null);

  const [statusLoading, setStatusLoading] = useState<string | null>(null);
  const [deletingCourse, setDeletingCourse] = useState<Course | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const updateParams = useCallback(
    (updates: Record<string, string>) => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        Object.entries(updates).forEach(([key, value]) => {
          if (value) {
            next.set(key, value);
          } else {
            next.delete(key);
          }
        });
        if (updates.search !== undefined || updates.status !== undefined) {
          next.set('page', '1');
        }
        return next;
      });
    },
    [setSearchParams],
  );

  const fetchCourses = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params: {
        page: number;
        limit: number;
        search?: string;
        status?: string;
      } = {
        page: currentPage,
        limit: PAGE_SIZE,
      };
      if (currentSearch) params.search = currentSearch;
      if (currentStatus !== 'all') params.status = currentStatus;

      const result = await adminApi.listCourses(params);
      setCourses(result.data);
      setTotal(result.meta.total);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Error al cargar cursos',
      );
    } finally {
      setLoading(false);
    }
  }, [currentPage, currentSearch, currentStatus]);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  useEffect(() => {
    setSearchInput(currentSearch);
  }, [currentSearch]);

  const handleSearchChange = (value: string) => {
    setSearchInput(value);
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    debounceRef.current = setTimeout(() => {
      updateParams({ search: value });
    }, 300);
  };

  const handleStatusChange = async (courseId: string, newStatus: string) => {
    setStatusLoading(courseId);
    try {
      await adminApi.updateCourse(courseId, { status: newStatus });
      // Refetch to get the updated course list (backend returns { message }, not Course)
      await fetchCourses();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Error al cambiar el estado del curso',
      );
    } finally {
      setStatusLoading(null);
    }
  };

  const handleDeleteCourse = async () => {
    if (!deletingCourse) return;
    setDeleteLoading(true);
    try {
      await adminApi.updateCourse(deletingCourse.id, { status: 'archived' });
      setCourses((prev) => prev.filter((c) => c.id !== deletingCourse.id));
      setTotal((prev) => Math.max(0, prev - 1));
      setDeletingCourse(null);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Error al eliminar el curso',
      );
    } finally {
      setDeleteLoading(false);
    }
  };

  if (loading && courses.length === 0) return <CoursesSkeleton />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Gestión de Cursos</h1>

      {/* Error */}
      {error && (
        <div role="alert" aria-live="polite">
          <Alert variant="error" title="Error" onClose={() => setError(null)}>
            {error}
          </Alert>
        </div>
      )}

      {/* Search */}
      <div className="max-w-md">
        <label htmlFor="admin-course-search" className="sr-only">
          Buscar cursos
        </label>
        <div className="relative">
          <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
          <input
            id="admin-course-search"
            type="text"
            placeholder="Buscar por título..."
            value={searchInput}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full rounded-xl border border-gray-300 bg-white py-3 pl-12 pr-4 text-sm placeholder-gray-400 shadow-sm transition-all focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:placeholder-gray-500 dark:focus:border-indigo-400"
            aria-label="Buscar cursos"
          />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex border-b border-gray-200 dark:border-gray-700">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.value}
            type="button"
            onClick={() =>
              updateParams({ status: tab.value === 'all' ? '' : tab.value })
            }
            className={`px-4 py-2.5 text-sm font-medium transition-colors ${
              currentStatus === tab.value
                ? 'border-b-2 border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
                : 'text-gray-500 hover:text-gray-700 hover:border-b-2 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:border-gray-600'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Courses Table */}
      {courses.length === 0 && !loading ? (
        <Card>
          <EmptyState
            icon={<Search className="h-12 w-12" />}
            title={
              currentSearch || currentStatus !== 'all'
                ? 'No se encontraron cursos'
                : 'No hay cursos'
            }
            message={
              currentSearch || currentStatus !== 'all'
                ? 'Intenta con otros filtros de búsqueda.'
                : 'Aún no hay cursos creados.'
            }
          />
        </Card>
      ) : (
        <Card padding="none">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Título</TableHead>
                <TableHead>Instructor</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Inscritos</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {courses.map((course) => (
                <TableRow key={course.id}>
                  <TableCell>
                    <button
                      type="button"
                      onClick={() => navigate(`/admin/courses/${course.id}`)}
                      className="text-left hover:underline"
                    >
                      <p className="font-medium text-gray-900 dark:text-white">{course.title}</p>
                    </button>
                    <p className="max-w-xs truncate text-xs text-gray-500 dark:text-gray-400">
                      {course.description || 'Sin descripción'}
                    </p>
                  </TableCell>
                  <TableCell>
                    <p className="text-sm text-gray-600 dark:text-gray-400">—</p>
                  </TableCell>
                  <TableCell>
                    <label htmlFor={`status-${course.id}`} className="sr-only">
                      Estado del curso {course.title}
                    </label>
                    <select
                      id={`status-${course.id}`}
                      value={course.status}
                      onChange={(e) =>
                        handleStatusChange(course.id, e.target.value)
                      }
                      disabled={statusLoading === course.id}
                      className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm transition-all focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:focus:border-indigo-400"
                    >
                      <option value="draft">Borrador</option>
                      <option value="published">Publicado</option>
                      <option value="archived">Archivado</option>
                    </select>
                  </TableCell>
                  <TableCell>
                    <p className="text-sm text-gray-600 dark:text-gray-400">—</p>
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate(`/courses/${course.id}/home?admin_preview=true`)}
                        aria-label={`Vista previa del curso ${course.title}`}
                        title="Vista previa del curso"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate(`/admin/courses/${course.id}`)}
                        aria-label={`Ver detalles de ${course.title}`}
                        title="Ver detalles"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeletingCourse(course)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Página {currentPage} de {totalPages} ({total} cursos)
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage <= 1}
              onClick={() => updateParams({ page: String(currentPage - 1) })}
            >
              <ChevronLeft className="h-4 w-4" />
              Anterior
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage >= totalPages}
              onClick={() => updateParams({ page: String(currentPage + 1) })}
            >
              Siguiente
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={!!deletingCourse}
        onClose={() => setDeletingCourse(null)}
        title="Eliminar Curso"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            ¿Estás seguro de que deseas eliminar el curso{' '}
            <strong>{deletingCourse?.title}</strong>?
          </p>
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => setDeletingCourse(null)}
            >
              Cancelar
            </Button>
            <Button
              variant="danger"
              loading={deleteLoading}
              onClick={handleDeleteCourse}
            >
              Archivar
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
