import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, LogOut, User, Settings, Bell, Sun, Moon } from 'lucide-react';
import { useAuth } from '../../providers/auth-provider';
import { useTheme } from '../../providers/theme-provider';
import { Badge } from '../ui/badge';

export function AppHeader() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const isHome = location.pathname === '/';

  const isActive = (to: string) => {
    if (to.startsWith('/#')) {
      return location.pathname === '/' && location.hash === to.slice(1);
    }
    return location.pathname === to;
  };

  const navLinks = user
    ? user.role === 'admin'
      ? [
          { to: '/courses', label: 'Catálogo' },
          { to: '/#precios', label: 'Precios' },
          { to: '/#sobre-mi', label: 'Sobre mí' },
          { to: '/contacto', label: 'Contacto' },
          { to: '/admin', label: 'Admin' },
        ]
      : user.role === 'instructor'
      ? [
          { to: '/courses', label: 'Catálogo' },
          { to: '/#precios', label: 'Precios' },
          { to: '/#sobre-mi', label: 'Sobre mí' },
          { to: '/contacto', label: 'Contacto' },
          { to: '/instructor', label: 'Instructor' },
        ]
      : [
          { to: '/courses', label: 'Catálogo' },
          { to: '/#precios', label: 'Precios' },
          { to: '/#sobre-mi', label: 'Sobre mí' },
          { to: '/contacto', label: 'Contacto' },
          { to: '/dashboard', label: 'Mi Panel' },
        ]
    : [
        { to: '/courses', label: 'Catálogo' },
        { to: '/#precios', label: 'Precios' },
        { to: '/#sobre-mi', label: 'Sobre mí' },
        { to: '/contacto', label: 'Contacto' },
        { to: '/login', label: 'Iniciar Sesión' },
      ];

  const handleLogoClick = (e: React.MouseEvent) => {
    // If already on home, scroll to top smoothly
    if (location.pathname === '/') {
      e.preventDefault();
      const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      window.scrollTo({ top: 0, behavior: prefersReduced ? 'auto' : 'smooth' });
      // Clear hash if present
      if (location.hash) {
        window.history.replaceState(null, '', '/');
      }
    }
    // Close mobile menu if open
    setMobileMenuOpen(false);
  };

  return (
    <header
      className={`sticky top-0 z-40 border-b backdrop-blur-xl transition-colors ${
        isHome
          ? 'border-white/10 bg-slate-900/80 dark:border-white/10 dark:bg-slate-900/80'
          : 'border-gray-200 bg-white/95 dark:border-gray-700 dark:bg-gray-900/95'
      }`}
    >
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link to="/" onClick={handleLogoClick} className="flex items-center gap-2.5 group" aria-label="Ir al inicio">
          <img src="/branding/auladev-icon.svg" alt="" className="h-9 w-9" />
          <span
            className={`text-lg font-bold tracking-tight hidden sm:block ${
              isHome ? 'text-white' : 'text-gray-900 dark:text-white'
            }`}
          >
            AulaDev
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                isActive(link.to)
                  ? isHome
                    ? 'bg-white/10 text-white'
                    : 'bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-white'
                  : isHome
                  ? 'text-slate-300 hover:text-white hover:bg-white/5'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-800'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right section */}
        <div className="flex items-center gap-2">
          {/* Theme toggle */}
          <button
            type="button"
            onClick={toggleTheme}
            className={`rounded-lg p-2 transition-colors ${
              isHome
                ? 'text-slate-300 hover:text-white hover:bg-white/10'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-800'
            }`}
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>

          {user ? (
            <>
              {/* Notifications */}
              <Link
                to="/notifications"
                className={`relative rounded-lg p-2 transition-colors ${
                  isHome
                    ? 'text-slate-300 hover:text-white hover:bg-white/10'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-800'
                }`}
              >
                <Bell className="h-5 w-5" />
              </Link>

              {/* User menu */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className={`flex items-center gap-2 rounded-lg p-1.5 transition-colors ${
                    isHome ? 'hover:bg-white/10' : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-cyan-500 text-sm font-medium text-white shadow-sm">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <span
                    className={`hidden sm:block text-sm font-medium ${
                      isHome ? 'text-white' : 'text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    {user.name}
                  </span>
                </button>

                {userMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
                    <div className="absolute right-0 z-50 mt-2 w-56 rounded-xl border border-gray-200 bg-white py-1 shadow-xl dark:border-gray-700 dark:bg-gray-900">
                      <div className="border-b border-gray-100 px-4 py-3 dark:border-gray-700">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{user.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{user.email}</p>
                        <Badge
                          variant={user.role === 'admin' ? 'danger' : user.role === 'instructor' ? 'info' : 'default'}
                          className="mt-1.5"
                        >
                          {user.role === 'admin' ? 'Admin' : user.role === 'instructor' ? 'Instructor' : 'Estudiante'}
                        </Badge>
                      </div>
                      <Link
                        to="/profile"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors dark:text-gray-300 dark:hover:bg-gray-800"
                      >
                        <User className="h-4 w-4" />
                        Mi Perfil
                      </Link>
                      <Link
                        to="/settings/privacy"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors dark:text-gray-300 dark:hover:bg-gray-800"
                      >
                        <Settings className="h-4 w-4" />
                        Configuración
                      </Link>
                      <button
                        type="button"
                        onClick={() => {
                          setUserMenuOpen(false);
                          handleLogout();
                        }}
                        className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors dark:text-red-400 dark:hover:bg-red-900/20"
                      >
                        <LogOut className="h-4 w-4" />
                        Cerrar Sesión
                      </button>
                    </div>
                  </>
                )}
              </div>
            </>
          ) : null}

          {/* Mobile menu button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className={`rounded-lg p-2 md:hidden transition-colors ${
              isHome
                ? 'text-slate-300 hover:text-white hover:bg-white/10'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-800'
            }`}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile nav */}
      {mobileMenuOpen && (
        <div
          className={`border-t md:hidden ${
            isHome ? 'border-white/10 bg-slate-900/95 dark:border-white/10 dark:bg-slate-900/95' : 'border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900'
          }`}
        >
          <nav className="space-y-1 px-4 py-3">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMobileMenuOpen(false)}
                className={`block rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive(link.to)
                    ? isHome
                      ? 'bg-white/10 text-white'
                      : 'bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-white'
                    : isHome
                    ? 'text-slate-300 hover:bg-white/5 hover:text-white'
                    : 'text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
