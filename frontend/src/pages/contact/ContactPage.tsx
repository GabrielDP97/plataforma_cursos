import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Send, CheckCircle2, AlertCircle, Mail } from 'lucide-react';
import { contactApi } from '../../api/modules/contact';
import { catalogApi } from '../../api/modules/catalog';
import type { Course } from '../../api/types';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';

/* ============================================================================
   CONTACT PAGE — Public contact form
   ============================================================================ */

export function ContactPage() {
  const [searchParams] = useSearchParams();
  const preselectedCourseSlug = searchParams.get('course') || '';

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [courseId, setCourseId] = useState('');
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  // Load courses for the select dropdown
  useEffect(() => {
    loadCourses();
  }, []);

  // Preselect course from URL params
  useEffect(() => {
    if (preselectedCourseSlug && courses.length > 0) {
      const match = courses.find((c) => c.slug === preselectedCourseSlug || c.id === preselectedCourseSlug);
      if (match) {
        setCourseId(match.id);
      }
    }
  }, [preselectedCourseSlug, courses]);

  const loadCourses = async () => {
    try {
      const result = await catalogApi.list({ limit: 100 });
      setCourses(result.data || []);
    } catch {
      // Silently handle — courses dropdown is optional
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await contactApi.send({
        name: name.trim(),
        email: email.trim(),
        courseId: courseId || undefined,
        message: message.trim(),
      });
      setSuccess(true);
    } catch (err: unknown) {
      const apiError = err as { code?: string; message?: string };
      if (apiError.code === 'RATE_LIMITED') {
        setError('Demasiadas solicitudes. Por favor, espera un momento antes de intentar de nuevo.');
      } else {
        setError(apiError.message || 'No se ha podido enviar el mensaje. Inténtalo de nuevo.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-lg dark:border-gray-700 dark:bg-gray-900 sm:p-12">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/50">
            <CheckCircle2 className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Mensaje enviado
          </h1>
          <p className="mt-4 text-gray-600 dark:text-gray-400">
            Hemos recibido tu consulta. Nos pondremos en contacto contigo lo antes posible.
          </p>
          <Link
            to="/"
            className="mt-8 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-indigo-700"
          >
            Volver al inicio
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      {/* Header */}
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-cyan-500 shadow-lg shadow-indigo-500/20">
          <Mail className="h-7 w-7 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white sm:text-4xl">
          Contacta con nosotros
        </h1>
        <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
          Si estás interesado en acceder a uno de nuestros cursos o necesitas ayuda, envíanos un mensaje.
        </p>
      </div>

      {/* Service context banner */}
      {searchParams.get('service') === 'clase-particular' && (
        <div className="mb-6 rounded-xl border border-indigo-200 bg-indigo-50 p-4 dark:border-indigo-800 dark:bg-indigo-950/30">
          <p className="text-sm font-medium text-indigo-700 dark:text-indigo-300">
            Clase particular
          </p>
          <p className="mt-1 text-xs text-indigo-600 dark:text-indigo-400">
            Incluye clase individual + ejercicios personalizados.
          </p>
        </div>
      )}

      {/* Form */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-lg dark:border-gray-700 dark:bg-gray-900 sm:p-8">
        <form onSubmit={handleSubmit} className="space-y-5" aria-label="Formulario de contacto">
          {error && (
            <div role="alert" aria-live="polite" className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-950/50">
              <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-600 dark:text-red-400" />
              <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
            </div>
          )}

          <Input
            label="Nombre"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="Tu nombre"
            autoComplete="name"
          />

          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="tu@email.com"
            autoComplete="email"
          />

          <div>
            <label
              htmlFor="course-select"
              className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Curso de interés (opcional)
            </label>
            <select
              id="course-select"
              value={courseId}
              onChange={(e) => setCourseId(e.target.value)}
              className="block w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 shadow-sm transition-colors focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:focus:border-indigo-400"
            >
              <option value="">Selecciona un curso (opcional)</option>
              {courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="message"
              className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Mensaje
            </label>
            <textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
              placeholder="Cuéntanos en qué podemos ayudarte."
              rows={5}
              className="block w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 shadow-sm transition-colors placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-500 dark:focus:border-indigo-400"
            />
          </div>

          <Button type="submit" loading={loading} className="w-full">
            <Send className="h-4 w-4" />
            {loading ? 'Enviando...' : 'Enviar mensaje'}
          </Button>
        </form>

        <p className="mt-4 text-xs text-gray-500 dark:text-gray-400">
          Los datos enviados se utilizarán para responder a tu consulta.{' '}
          Consulta la <Link to="/privacidad" className="underline">Política de privacidad</Link>.
        </p>
      </div>
    </div>
  );
}
