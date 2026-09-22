import { Link } from 'react-router-dom';

export function AppFooter() {
  return (
    <footer className="border-t border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2">
              <img src="/branding/auladev-icon.svg" alt="" className="h-9 w-9" />
              <span className="text-lg font-bold text-gray-900 dark:text-white">AulaDev</span>
            </div>
            <p className="mt-4 text-sm text-gray-500 dark:text-gray-400 max-w-xs">
              Cursos de programación para estudiantes de 1.º de DAM y DAW.
              Explicaciones claras, práctica real, a tu ritmo.
            </p>
          </div>

          {/* Plataforma */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Plataforma</h3>
            <ul className="mt-4 space-y-3">
              <li>
                <Link to="/courses" className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
                  Catálogo de cursos
                </Link>
              </li>
              <li>
                <a href="/#sobre-mi" className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
                  Sobre mí
                </a>
              </li>
              <li>
                <Link to="/login" className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
                  Iniciar sesión
                </Link>
              </li>
            </ul>
          </div>

          {/* Soporte */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Soporte</h3>
            <ul className="mt-4 space-y-3">
              <li>
                <Link to="/contacto" className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
                  Contacto
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Legal</h3>
            <ul className="mt-4 space-y-3">
              <li>
                <Link to="/aviso-legal" className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
                  Aviso legal
                </Link>
              </li>
              <li>
                <Link to="/privacidad" className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
                  Política de privacidad
                </Link>
              </li>
              <li>
                <Link to="/cookies" className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
                  Política de cookies
                </Link>
              </li>
              <li>
                <Link to="/condiciones-de-uso" className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
                  Condiciones de uso
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-gray-200 dark:border-gray-700 pt-8">
          <p className="text-center text-sm text-gray-400 dark:text-gray-500">
            © {new Date().getFullYear()} AulaDev. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}
