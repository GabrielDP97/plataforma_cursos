import { useEffect, useState, useMemo, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BookOpen, LayoutGrid, List, Search, ArrowRight, AlertCircle } from 'lucide-react';
import { studentApi, type StudentDashboard as DashboardData } from '../../api/modules/student';
import { Button } from '../../components/ui/button';
import { Skeleton } from '../../components/ui/skeleton';
import { EmptyState } from '../../components/ui/empty-state';
import { StudentCourseCard } from '../../components/student/StudentCourseCard';
import { StudentCourseListItem } from '../../components/student/StudentCourseListItem';

type ViewMode = 'cards' | 'list';

const VIEW_STORAGE_KEY = 'student-dashboard-view';

function loadViewPreference(): ViewMode {
  try {
    const stored = localStorage.getItem(VIEW_STORAGE_KEY);
    if (stored === 'cards' || stored === 'list') return stored;
  } catch {
    // localStorage unavailable
  }
  return 'cards';
}

/* ───────── Skeleton ───────── */

function DashboardSkeleton({ view }: { view: ViewMode }) {
  if (view === 'list') {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="flex items-center gap-4 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-raised)] p-4"
          >
            <Skeleton variant="rectangle" width="56px" height="56px" className="hidden shrink-0 sm:block" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-3 w-32" />
            </div>
            <Skeleton className="hidden h-3 w-20 md:block" />
            <Skeleton variant="rectangle" width="80px" height="32px" className="shrink-0 rounded-lg" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="overflow-hidden rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-raised)]"
        >
          <Skeleton variant="rectangle" height="160px" className="rounded-none" />
          <div className="space-y-3 p-5">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-2 w-full rounded-full" />
            <Skeleton className="h-3 w-24" />
            <Skeleton variant="rectangle" height="36px" className="rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  );
}

/* ───────── Error State ───────── */

function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-red-200 bg-red-50/50 py-16 text-center dark:border-red-900/40 dark:bg-red-950/20">
      <AlertCircle className="mb-4 h-10 w-10 text-red-500" />
      <h3 className="text-lg font-medium text-[var(--text-primary)]">
        Error al cargar tus cursos
      </h3>
      <p className="mt-1 max-w-sm text-sm text-[var(--text-muted)]">
        Ocurrió un problema al conectarse con el servidor. Por favor, intenta de nuevo.
      </p>
      <Button variant="outline" size="sm" className="mt-5" onClick={onRetry}>
        Reintentar
      </Button>
    </div>
  );
}

/* ───────── Dashboard ───────── */

export function StudentDashboard() {
  const navigate = useNavigate();
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [view, setView] = useState<ViewMode>(loadViewPreference);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const data = await studentApi.getDashboard();
      setDashboard(data);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleViewChange = (newView: ViewMode) => {
    setView(newView);
    try {
      localStorage.setItem(VIEW_STORAGE_KEY, newView);
    } catch {
      // ignore
    }
  };

  const handleViewCourse = useCallback(
    (courseId: string) => {
      navigate(`/courses/${courseId}/home`);
    },
    [navigate],
  );

  /* Filtered courses */
  const filteredCourses = useMemo(() => {
    if (!dashboard) return [];
    if (!searchQuery.trim()) return dashboard.enrolledCourses;
    const q = searchQuery.toLowerCase();
    return dashboard.enrolledCourses.filter(
      (ec) =>
        ec.course.title.toLowerCase().includes(q) ||
        ec.course.description.toLowerCase().includes(q),
    );
  }, [dashboard, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[var(--text-primary)] sm:text-3xl">
          Mis cursos
        </h1>
        <p className="mt-1 text-sm text-[var(--text-muted)]">
          Accede a tus asignaturas y continúa donde lo dejaste.
        </p>
      </div>

      {/* Loading */}
      {loading && <DashboardSkeleton view={view} />}

      {/* Error */}
      {!loading && error && <ErrorState onRetry={fetchData} />}

      {/* Content */}
      {!loading && !error && dashboard && (
        <>
          {/* Empty state */}
          {dashboard.enrolledCourses.length === 0 ? (
            <EmptyState
              icon={<BookOpen className="h-12 w-12" />}
              title="Aún no estás inscrito en ningún curso"
              message="Explora nuestro catálogo y comienza a aprender hoy."
              action={
                <Link to="/courses">
                  <Button>
                    Explorar Cursos
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              }
            />
          ) : (
            <>
              {/* Toolbar */}
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                {/* View toggle */}
                <div className="flex items-center gap-1 rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-overlay)] p-1">
                  <button
                    type="button"
                    onClick={() => handleViewChange('cards')}
                    className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                      view === 'cards'
                        ? 'bg-[var(--surface-raised)] text-[var(--text-primary)] shadow-sm'
                        : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
                    }`}
                    aria-pressed={view === 'cards'}
                  >
                    <LayoutGrid className="h-4 w-4" />
                    Tarjetas
                  </button>
                  <button
                    type="button"
                    onClick={() => handleViewChange('list')}
                    className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                      view === 'list'
                        ? 'bg-[var(--surface-raised)] text-[var(--text-primary)] shadow-sm'
                        : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
                    }`}
                    aria-pressed={view === 'list'}
                  >
                    <List className="h-4 w-4" />
                    Lista
                  </button>
                </div>

                {/* Search */}
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-subtle)]" />
                  <input
                    type="search"
                    placeholder="Buscar cursos..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-raised)] py-2 pl-9 pr-3 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-subtle)] focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:w-64"
                    aria-label="Buscar cursos"
                  />
                </div>
              </div>

              {/* Filtered empty */}
              {filteredCourses.length === 0 && searchQuery && (
                <p className="py-8 text-center text-sm text-[var(--text-muted)]">
                  No se encontraron cursos que coincidan con "{searchQuery}"
                </p>
              )}

              {/* Grid / List */}
              {view === 'cards' ? (
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {filteredCourses.map((ec) => (
                    <StudentCourseCard
                      key={ec.id}
                      course={ec}
                      onViewCourse={handleViewCourse}
                    />
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredCourses.map((ec) => (
                    <StudentCourseListItem
                      key={ec.id}
                      course={ec}
                      onViewCourse={handleViewCourse}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}
