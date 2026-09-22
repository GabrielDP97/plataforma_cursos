import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Code2, Eye, EyeOff, Loader2, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';

type StatusState = 'loading' | 'available' | 'completed' | 'error' | 'not_configured';

export function AdminSetupPage() {
  const navigate = useNavigate();
  const [statusState, setStatusState] = useState<StatusState>('loading');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showSecret, setShowSecret] = useState(false);
  const [statusError, setStatusError] = useState('');

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    secret: '',
  });

  useEffect(() => {
    checkStatus();
  }, []);

  const checkStatus = async () => {
    setStatusState('loading');
    setStatusError('');

    try {
      const res = await fetch('/api/internal/bootstrap-admin/status');

      // Handle non-JSON responses (502, HTML errors, etc.)
      const text = await res.text();
      if (!text) {
        setStatusState('error');
        setStatusError('El servidor no ha devuelto respuesta. Comprueba que el backend está iniciado.');
        return;
      }

      let data: any;
      try {
        data = JSON.parse(text);
      } catch {
        setStatusState('error');
        setStatusError('Respuesta inesperada del servidor.');
        return;
      }

      // API-level error (500, 404, etc.)
      if (!res.ok || !data.success) {
        setStatusState('error');
        setStatusError(data.error?.message || `Error del servidor (${res.status})`);
        return;
      }

      // Success — check the actual status
      if (data.data?.reason === 'not_configured') {
        setStatusState('not_configured');
      } else if (data.data?.available === true) {
        setStatusState('available');
      } else {
        setStatusState('completed');
      }
    } catch (err) {
      // Network error
      setStatusState('error');
      setStatusError('No se ha podido conectar con el servidor. Comprueba que el backend está iniciado.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (form.password !== form.confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    if (form.password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/internal/bootstrap-admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          password: form.password,
          secret: form.secret,
        }),
      });

      const text = await res.text();
      let data: any;
      try {
        data = JSON.parse(text);
      } catch {
        setError('Respuesta inesperada del servidor.');
        return;
      }

      if (!res.ok) {
        setError(data.error?.message || 'Error al crear la cuenta');
        return;
      }

      setSuccess('Cuenta de administrador creada. Redirigiendo al login...');
      setTimeout(() => navigate('/login'), 2000);
    } catch {
      setError('No se ha podido conectar con el servidor. Comprueba que el backend está iniciado.');
    } finally {
      setLoading(false);
    }
  };

  // LOADING STATE
  if (statusState === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center" role="status" aria-label="Cargando configuración">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  // ERROR STATE
  if (statusState === 'error') {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="max-w-md text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
          <h1 className="mt-4 text-2xl font-bold text-gray-900">Error de conexión</h1>
          <p className="mt-2 text-gray-600">{statusError}</p>
          <Button onClick={checkStatus} className="mt-6" variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" />
            Reintentar
          </Button>
        </div>
      </div>
    );
  }

  // NOT CONFIGURED STATE
  if (statusState === 'not_configured') {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="max-w-md text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-amber-500" />
          <h1 className="mt-4 text-2xl font-bold text-gray-900">Configuración requerida</h1>
          <p className="mt-2 text-gray-600">
            La variable de entorno ADMIN_BOOTSTRAP_SECRET no está configurada.
            Define el secreto de bootstrap en el archivo .dev.vars del backend.
          </p>
          <Button onClick={checkStatus} className="mt-6" variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" />
            Reintentar
          </Button>
        </div>
      </div>
    );
  }

  // COMPLETED STATE
  if (statusState === 'completed') {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="max-w-md text-center">
          <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-500" />
          <h1 className="mt-4 text-2xl font-bold text-gray-900">Configuración completada</h1>
          <p className="mt-2 text-gray-600">
            La cuenta de administrador ya ha sido creada. Esta página ya no está disponible.
          </p>
          <Button onClick={() => navigate('/login')} className="mt-6">
            Iniciar sesión
          </Button>
        </div>
      </div>
    );
  }

  // AVAILABLE STATE — show form
  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-500">
            <Code2 className="h-6 w-6 text-white" />
          </div>
          <h1 className="mt-4 text-2xl font-bold text-gray-900">Configuración inicial</h1>
          <p className="mt-2 text-sm text-gray-600">
            Crea la primera cuenta de administrador de la plataforma.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4" aria-label="Formulario de creación de administrador">
          {error && (
            <div role="alert" className="rounded-lg bg-red-50 p-4 text-sm text-red-700">
              <AlertCircle className="mr-2 inline h-4 w-4" />
              {error}
            </div>
          )}
          {success && (
            <div role="alert" className="rounded-lg bg-emerald-50 p-4 text-sm text-emerald-700">
              <CheckCircle2 className="mr-2 inline h-4 w-4" />
              {success}
            </div>
          )}

          <Input
            label="Nombre"
            type="text"
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />

          <Input
            label="Email"
            type="email"
            required
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />

          <div className="relative">
            <Input
              label="Contraseña"
              type={showPassword ? 'text' : 'password'}
              required
              minLength={8}
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-8 text-gray-400 hover:text-gray-600"
              aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>

          <Input
            label="Confirmar contraseña"
            type={showPassword ? 'text' : 'password'}
            required
            value={form.confirmPassword}
            onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
          />

          <div className="relative">
            <Input
              label="Código de configuración"
              type={showSecret ? 'text' : 'password'}
              required
              value={form.secret}
              onChange={(e) => setForm({ ...form, secret: e.target.value })}
            />
            <button
              type="button"
              onClick={() => setShowSecret(!showSecret)}
              className="absolute right-3 top-8 text-gray-400 hover:text-gray-600"
              aria-label={showSecret ? 'Ocultar código' : 'Mostrar código'}
            >
              {showSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>

          <Button type="submit" loading={loading} className="w-full">
            Crear administrador
          </Button>
        </form>
      </div>
    </div>
  );
}
