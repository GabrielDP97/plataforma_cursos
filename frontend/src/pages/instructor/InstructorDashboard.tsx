import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, PlusCircle, Eye, FileText, Archive, Pencil } from 'lucide-react';
import { useAuth } from '../../providers/auth-provider';
import {
  instructorApi,
  type InstructorDashboardData,
} from '../../api/modules/instructor';
import { coursesApi } from '../../api/modules/courses';
import type { Course } from '../../api/types';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Skeleton } from '../../components/ui/skeleton';
import { EmptyState } from '../../components/ui/empty-state';
import { Alert } from '../../components/ui/alert';
import { Dialog } from '../../components/ui/dialog';

function StatCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: typeof BookOpen;
  label: string;
  value: number;
  color: string;
}) {
  return (
    <Card className="transition-all duration-300 hover:shadow-md hover:-translate-y-0.5">
      <div className="flex items-center gap-4">
        <div
          className={`flex h-12 w-12 items-center justify-center rounded-xl ${color}`}
        >
          <Icon className="h-6 w-6 text-white" />
        </div>
        <div>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          <p className="text-sm text-gray-500">{label}</p>
        </div>
      </div>
    </Card>
  );
}

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

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div>
        <Skeleton className="h-8 w-64" />
        <Skeleton className="mt-2 h-5 w-40" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <div className="flex items-center gap-4">
              <Skeleton variant="circle" width="48px" height="48px" />
              <div className="flex-1">
                <Skeleton className="h-7 w-12" />
                <Skeleton className="mt-1 h-4 w-24" />
              </div>
            </div>
          </Card>
        ))}
      </div>
      <Skeleton className="h-6 w-48" />
      {[1, 2, 3].map((i) => (
        <Card key={i}>
          <div className="flex items-center justify-between">
            <Skeleton className="h-5 w-48" />
            <Skeleton className="h-8 w-20" />
          </div>
        </Card>
      ))}
    </div>
  );
}

export function InstructorDashboard() {
  const { user } = useAuth();
  const [dashboard, setDashboard] = useState<InstructorDashboardData | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [archivingCourseId, setArchivingCourseId] = useState<string | null>(
    null,
  );
  const [showArchiveDialog, setShowArchiveDialog] = useState(false);
  const [archiveTarget, setArchiveTarget] = useState<Course | null>(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const data = await instructorApi.getDashboard();
        setDashboard(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Error al cargar el panel',
        );
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

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

  if (loading) return <DashboardSkeleton />;

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Panel del Instructor</h1>
        <Alert variant="error" title="Error">
          {error}
        </Alert>
      </div>
    );
  }

  const recentCourses = dashboard?.courses.slice(0, 5) ?? [];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="rounded-2xl bg-gradient-to-r from-indigo-500/10 via-cyan-500/5 to-indigo-500/10 p-8 flex-1">
          <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">
            Panel del Instructor
          </h1>
          <p className="mt-2 text-lg text-gray-600">Bienvenido, {user?.name}</p>
        </div>
        <Link to="/instructor/courses/new">
          <Button>
            <PlusCircle className="h-4 w-4" />
            Crear Curso
          </Button>
        </Link>
      </div>

      {/* Stats */}
      {dashboard && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            icon={BookOpen}
            label="Total Cursos"
            value={dashboard.totalCourses}
            color="bg-indigo-600"
          />
          <StatCard
            icon={Eye}
            label="Publicados"
            value={dashboard.publishedCount}
            color="bg-emerald-600"
          />
          <StatCard
            icon={FileText}
            label="Borradores"
            value={dashboard.draftCount}
            color="bg-amber-500"
          />
          <StatCard
            icon={Archive}
            label="Archivados"
            value={dashboard.archivedCount}
            color="bg-gray-500"
          />
        </div>
      )}

      {/* Recent Courses */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">
            Tus cursos recientes
          </h2>
          {recentCourses.length > 0 && (
            <Link to="/instructor/courses">
              <Button variant="ghost" size="sm">
                Ver todos
              </Button>
            </Link>
          )}
        </div>

        {recentCourses.length === 0 ? (
          <EmptyState
            icon={<BookOpen className="h-12 w-12" />}
            title="Aún no tienes cursos"
            message="Crea tu primer curso para comenzar a enseñar."
            action={
              <Link to="/instructor/courses/new">
                <Button>
                  <PlusCircle className="h-4 w-4" />
                  Crear Curso
                </Button>
              </Link>
            }
          />
        ) : (
          <div className="space-y-3">
            {recentCourses.map((course) => (
              <Card key={course.id} padding="sm">
                <div className="flex items-center justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="truncate font-medium text-gray-900">
                        {course.title}
                      </h3>
                      {statusBadge(course.status)}
                    </div>
                    <p className="mt-1 truncate text-sm text-gray-500">
                      {course.description || 'Sin descripción'}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
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
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>

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
