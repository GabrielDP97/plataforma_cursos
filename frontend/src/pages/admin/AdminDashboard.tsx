import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, BookOpen, GraduationCap } from 'lucide-react';
import { useAuth } from '../../providers/auth-provider';
import { adminApi } from '../../api/modules/admin';
import type { AdminDashboard } from '../../api/types';
import { StatsCard } from '../../components/admin/stats-card';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Skeleton } from '../../components/ui/skeleton';
import { Alert } from '../../components/ui/alert';

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div>
        <Skeleton className="h-8 w-64" />
        <Skeleton className="mt-2 h-5 w-40" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
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
      <div className="grid gap-4 sm:grid-cols-2">
        {[1, 2].map((i) => (
          <Card key={i}>
            <Skeleton className="h-5 w-32" />
            <Skeleton className="mt-2 h-4 w-48" />
          </Card>
        ))}
      </div>
    </div>
  );
}

export function AdminDashboard() {
  const { user } = useAuth();
  const [dashboard, setDashboard] = useState<AdminDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const data = await adminApi.getDashboard();
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

  if (loading) return <DashboardSkeleton />;

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Panel de Administración
        </h1>
        <Alert variant="error" title="Error">
          {error}
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="rounded-2xl bg-gradient-to-r from-indigo-500/10 via-cyan-500/5 to-indigo-500/10 p-8 dark:from-indigo-500/20 dark:via-cyan-500/10 dark:to-indigo-500/20">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white sm:text-4xl">
          Panel de Administración
        </h1>
        <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">Bienvenido, {user?.name}</p>
      </div>

      {/* Stats */}
      {dashboard && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <StatsCard
            icon={Users}
            label="Usuarios Totales"
            value={dashboard.stats.totalUsers}
            color="bg-indigo-600"
          />
          <StatsCard
            icon={BookOpen}
            label="Cursos Totales"
            value={dashboard.stats.totalCourses}
            color="bg-emerald-600"
          />
          <StatsCard
            icon={GraduationCap}
            label="Inscripciones"
            value={dashboard.stats.totalEnrollments}
            color="bg-violet-600"
          />
        </div>
      )}

      {/* Quick Actions */}
      <section>
        <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
          Acciones Rápidas
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Link to="/admin/users">
            <Card hover>
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-600">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    Gestionar Usuarios
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Ver, editar y administrar usuarios
                  </p>
                </div>
              </div>
            </Card>
          </Link>
          <Link to="/admin/courses">
            <Card hover>
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-600">
                  <BookOpen className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    Gestionar Cursos
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Ver, editar y administrar cursos
                  </p>
                </div>
              </div>
            </Card>
          </Link>
        </div>
      </section>

      {/* Recent Users */}
      {dashboard && dashboard.recentActivity.recentUsers.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Usuarios Recientes
            </h2>
            <Link to="/admin/users">
              <Button variant="ghost" size="sm">
                Ver todos
              </Button>
            </Link>
          </div>
          <Card padding="none">
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {dashboard.recentActivity.recentUsers.map((recentUser) => (
                <div
                  key={recentUser.id}
                  className="flex items-center justify-between px-6 py-3"
                >
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {recentUser.name}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{recentUser.email}</p>
                  </div>
                  <span className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                    {recentUser.role}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </section>
      )}
    </div>
  );
}
