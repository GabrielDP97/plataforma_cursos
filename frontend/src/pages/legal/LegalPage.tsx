import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

interface LegalPageProps {
  title: string;
  lastUpdated: string;
  children: React.ReactNode;
}

/* ============================================================================
   LEGAL PAGE — Reusable layout for all legal pages
   ============================================================================ */

export function LegalPage({ title, lastUpdated, children }: LegalPageProps) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Back link */}
      <Link
        to="/"
        className="mb-8 inline-flex items-center gap-1.5 text-sm text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver al inicio
      </Link>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white sm:text-4xl">
          {title}
        </h1>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          Última actualización: {lastUpdated}
        </p>
      </div>

      {/* Content */}
      <article className="prose prose-gray dark:prose-invert max-w-none prose-headings:text-gray-900 dark:prose-headings:text-white prose-p:text-gray-600 dark:prose-p:text-gray-400 prose-li:text-gray-600 dark:prose-li:text-gray-400 prose-a:text-indigo-600 dark:prose-a:text-indigo-400 prose-strong:text-gray-900 dark:prose-strong:text-white">
        {children}
      </article>

      {/* Footer nav */}
      <div className="mt-12 flex flex-wrap items-center gap-4 border-t border-gray-200 pt-6 dark:border-gray-700">
        <Link
          to="/aviso-legal"
          className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          Aviso legal
        </Link>
        <span className="text-gray-300 dark:text-gray-600">·</span>
        <Link
          to="/privacidad"
          className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          Privacidad
        </Link>
        <span className="text-gray-300 dark:text-gray-600">·</span>
        <Link
          to="/cookies"
          className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          Cookies
        </Link>
        <span className="text-gray-300 dark:text-gray-600">·</span>
        <Link
          to="/condiciones-de-uso"
          className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          Condiciones de uso
        </Link>
      </div>
    </div>
  );
}
