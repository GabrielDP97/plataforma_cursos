import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, getRoleHomePath } from '../../providers/auth-provider';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { Alert } from '../../components/ui/alert';
import { AuthLayout } from './AuthLayout';
import { Lock } from 'lucide-react';

export function ChangePasswordPage() {
  const { user, changePassword } = useAuth();
  const navigate = useNavigate();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!currentPassword) {
      setError('Introduce tu contraseña actual');
      return;
    }
    if (newPassword.length < 8) {
      setError('La nueva contraseña debe tener al menos 8 caracteres');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }
    if (newPassword === currentPassword) {
      setError('La nueva contraseña debe ser diferente a la actual');
      return;
    }

    setLoading(true);
    try {
      await changePassword(currentPassword, newPassword);
      // Redirect to appropriate dashboard after password change
      const target = getRoleHomePath(user?.role);
      navigate(target, { replace: true });
    } catch (err: unknown) {
      const apiError = err as { code?: string; message?: string };
      if (apiError.code === 'INVALID_CREDENTIALS') {
        setError('La contraseña actual es incorrecta');
      } else {
        setError(apiError.message || 'Error al cambiar la contraseña');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-lg dark:border-gray-700 dark:bg-gray-900">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-cyan-500 shadow-lg shadow-indigo-500/20">
            <Lock className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Cambiar contraseña</h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Debes cambiar tu contraseña para continuar.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5" aria-label="Formulario de cambio de contraseña">
          {error && (
            <div role="alert" aria-live="polite">
              <Alert variant="error">{error}</Alert>
            </div>
          )}

          <Input
            label="Contraseña actual"
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
            placeholder="••••••••"
            autoComplete="current-password"
          />

          <Input
            label="Nueva contraseña"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            minLength={8}
            placeholder="Mínimo 8 caracteres"
            autoComplete="new-password"
          />

          <Input
            label="Confirmar nueva contraseña"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            placeholder="Repite tu nueva contraseña"
            autoComplete="new-password"
          />

          <Button type="submit" loading={loading} className="w-full">
            Cambiar contraseña
          </Button>
        </form>
      </div>
    </AuthLayout>
  );
}
