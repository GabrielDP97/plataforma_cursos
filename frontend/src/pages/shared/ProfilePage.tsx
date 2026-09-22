import { useState, useEffect } from 'react';
import { useAuth } from '../../providers/auth-provider';
import { userApi } from '../../api/modules/user';
import type { User } from '../../api/types';
import { Card } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { Skeleton } from '../../components/ui/skeleton';
import { Alert } from '../../components/ui/alert';
import { CheckCircle } from 'lucide-react';

function ProfileSkeleton() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Skeleton className="h-8 w-48" />
      <Card>
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <Skeleton variant="circle" width="80px" height="80px" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-4 w-56" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
          <div className="border-t border-gray-200 pt-4">
            <Skeleton className="h-5 w-32 mb-2" />
            <Skeleton className="h-10 w-full" />
          </div>
          <Skeleton className="h-10 w-40" />
        </div>
      </Card>
    </div>
  );
}

const roleLabels: Record<string, string> = {
  student: 'Estudiante',
  instructor: 'Instructor',
  admin: 'Administrador',
};

export function ProfilePage() {
  const { loading: authLoading } = useAuth();
  const [profile, setProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);
  const [nameError, setNameError] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await userApi.getProfile();
        setProfile(data);
        setName(data.name);
      } catch (err: unknown) {
        const apiError = err as { message?: string };
        setError(apiError.message || 'No se pudo cargar el perfil');
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading) {
      fetchProfile();
    }
  }, [authLoading]);

  const validate = (): boolean => {
    if (!name.trim()) {
      setNameError('El nombre es requerido');
      return false;
    }
    if (name.trim().length < 1) {
      setNameError('El nombre debe tener al menos 1 carácter');
      return false;
    }
    setNameError('');
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!validate()) return;

    setSaving(true);
    try {
      const updated = await userApi.updateProfile({ name: name.trim() });
      setProfile(updated);
      setSuccess('Perfil actualizado correctamente');
    } catch (err: unknown) {
      const apiError = err as { message?: string };
      setError(apiError.message || 'No se pudo actualizar el perfil');
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || loading) {
    return <ProfileSkeleton />;
  }

  if (error && !profile) {
    return (
      <div className="mx-auto max-w-2xl space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Mi Perfil</h1>
        <Alert variant="error">{error}</Alert>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Mi Perfil</h1>

      <Card>
        <div className="space-y-6">
          {/* User info */}
          <div className="flex items-center gap-6">
            <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-cyan-500 text-3xl font-bold text-white shadow-lg shadow-indigo-500/20">
              {profile?.image ? (
                <img
                  src={profile.image}
                  alt={profile.name}
                  className="h-24 w-24 rounded-2xl object-cover"
                />
              ) : (
                profile?.name.charAt(0).toUpperCase()
              )}
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">{profile?.name}</h2>
              <p className="text-gray-500">{profile?.email}</p>
              <div className="mt-2 flex items-center gap-2">
                <span className="inline-flex items-center rounded-full bg-indigo-100 px-2.5 py-1 text-xs font-medium text-indigo-700">
                  {roleLabels[profile?.role ?? ''] ?? profile?.role}
                </span>
                <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${
                  profile?.emailVerified
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-gray-100 text-gray-500'
                }`}>
                  {profile?.emailVerified ? '✓ Verificado' : 'Pendiente'}
                </span>
              </div>
            </div>
          </div>

          {/* Edit section */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="mb-4 text-sm font-semibold text-gray-900 uppercase tracking-wide">
              Editar perfil
            </h3>

            {success && (
              <div role="status" aria-live="polite">
                <Alert variant="success" className="mb-4">
                  <CheckCircle className="inline h-4 w-4 mr-1" />
                  {success}
                </Alert>
              </div>
            )}

            {error && profile && (
              <div role="alert" aria-live="polite">
                <Alert variant="error" className="mb-4">
                  {error}
                </Alert>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4" aria-label="Editar perfil">
              <Input
                label="Nombre"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (nameError) setNameError('');
                }}
                error={nameError}
                required
                disabled={saving}
                autoComplete="name"
              />

              <Button type="submit" loading={saving} disabled={saving}>
                Guardar cambios
              </Button>
            </form>
          </div>
        </div>
      </Card>
    </div>
  );
}
