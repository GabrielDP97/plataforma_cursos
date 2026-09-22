import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth, getRoleHomePath } from '../../providers/auth-provider';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { Alert } from '../../components/ui/alert';
import { AuthLayout } from './AuthLayout';
import { LogIn } from 'lucide-react';

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const from = (location.state as { from?: string })?.from || '';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!identifier) {
      setError('Introduce tu usuario o correo electrónico');
      return;
    }
    if (!password) {
      setError('Introduce tu contraseña');
      return;
    }

    setLoading(true);
    try {
      const loggedInUser = await login(identifier, password);

      // Force password change redirect
      if (loggedInUser.mustChangePassword) {
        navigate('/change-password', { replace: true });
        return;
      }

      // Role-based redirect
      const target = from || getRoleHomePath(loggedInUser.role);
      navigate(target, { replace: true });
    } catch (err: unknown) {
      const apiError = err as { code?: string; message?: string };
      if (apiError.code === 'INVALID_CREDENTIALS' || apiError.code === 'UNAUTHORIZED') {
        setError('Usuario o contraseña incorrectos');
      } else if (apiError.code === 'RATE_LIMITED') {
        setError('Demasiados intentos. Por favor, intenta de nuevo más tarde');
      } else {
        setError(apiError.message || 'Error al iniciar sesión');
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
            <LogIn className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Iniciar sesión</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5" aria-label="Formulario de inicio de sesión">
          {error && (
            <div role="alert" aria-live="polite">
              <Alert variant="error">{error}</Alert>
            </div>
          )}

          <Input
            label="Usuario o email"
            type="text"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            required
            placeholder="tu_usuario o tu@email.com"
            autoComplete="username"
          />

          <Input
            label="Contraseña"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="••••••••"
            autoComplete="current-password"
          />

          <p className="text-sm text-gray-500 dark:text-gray-400">
            Si no puedes acceder,{' '}
            <Link to="/contacto" className="text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300">
              ponte en contacto con nosotros
            </Link>.
          </p>

          <Button type="submit" loading={loading} className="w-full">
            Iniciar sesión
          </Button>
        </form>
      </div>
    </AuthLayout>
  );
}
