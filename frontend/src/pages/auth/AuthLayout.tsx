import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Terminal, Braces, Database, CheckCircle2 } from 'lucide-react';

interface AuthLayoutProps {
  children: ReactNode;
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen">
      {/* Left Panel — Visual Identity */}
      <div className="hero-gradient relative hidden flex-col items-center justify-center p-12 lg:flex lg:w-1/2">
        {/* Grid pattern */}
        <div className="hero-grid absolute inset-0" />

        {/* Glow orbs */}
        <div className="hero-glow absolute -left-32 top-1/4 bg-indigo-500" />
        <div className="hero-glow absolute -right-32 bottom-1/4 bg-cyan-500" style={{ animationDelay: '2s' }} />

        {/* Floating decorative elements */}
        <div className="absolute left-8 top-20 animate-float opacity-20">
          <div className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 font-mono text-xs text-cyan-300 backdrop-blur-sm">
            {'public class App {'}
          </div>
        </div>
        <div className="absolute right-8 top-32 animate-float-delayed opacity-20">
          <div className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 font-mono text-xs text-violet-300 backdrop-blur-sm">
            {'SELECT * FROM alumnos'}
          </div>
        </div>
        <div className="absolute bottom-20 left-1/4 animate-float opacity-10">
          <div className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 font-mono text-xs text-emerald-300 backdrop-blur-sm">
            {'<div class="container">'}
          </div>
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-md text-center">
          <Link to="/" className="inline-flex items-center gap-2.5 mb-8">
            <img src="/branding/auladev-icon.svg" alt="" className="h-12 w-12" />
            <span className="text-2xl font-bold text-white">AulaDev</span>
          </Link>

          <h1 className="text-3xl font-bold text-white sm:text-4xl">
            Refuerza primero de DAM y DAW{' '}
            <span className="bg-gradient-to-r from-cyan-300 to-indigo-300 bg-clip-text text-transparent">
              con la práctica
            </span>
          </h1>

          <p className="mt-6 text-lg text-slate-300">
            Cursos pensados para tu primer año. Explicaciones paso a paso y ejercicios prácticos.
          </p>

          {/* Feature list */}
          <div className="mt-8 space-y-4 text-left">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/20">
                <Terminal className="h-4 w-4 text-indigo-300" />
              </div>
              <span className="text-sm text-slate-300">Ejercicios de programación práctica</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-500/20">
                <Braces className="h-4 w-4 text-cyan-300" />
              </div>
              <span className="text-sm text-slate-300">Java, SQL, HTML, CSS y más</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/20">
                <Database className="h-4 w-4 text-emerald-300" />
              </div>
              <span className="text-sm text-slate-300">Bases de datos y modelado</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-500/20">
                <CheckCircle2 className="h-4 w-4 text-violet-300" />
              </div>
              <span className="text-sm text-slate-300">A tu ritmo, sin presión</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel — Form */}
      <div className="flex flex-1 flex-col">
        <div className="flex flex-1 flex-col items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
          <div className="w-full max-w-md space-y-8">
            {/* Mobile logo */}
            <div className="text-center lg:hidden">
              <Link to="/" className="inline-flex items-center gap-2 text-2xl font-bold text-gray-900">
                <img src="/branding/auladev-icon.svg" alt="" className="h-10 w-10" />
                AulaDev
              </Link>
            </div>
            {children}
          </div>
        </div>
        <footer className="border-t border-gray-200 bg-white py-6">
          <div className="mx-auto max-w-7xl px-4 text-center text-sm text-gray-500">
            © {new Date().getFullYear()} AulaDev. Todos los derechos reservados.
          </div>
        </footer>
      </div>
    </div>
  );
}
