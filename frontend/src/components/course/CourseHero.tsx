import { BookOpen, Clock, GraduationCap, ChevronRight } from 'lucide-react';
import { Button } from '../ui/button';
import type { CourseProgress } from './types';

interface CourseHeroProps {
  title: string;
  subtitle: string;
  description: string;
  progress: CourseProgress;
  mode: 'student' | 'admin_preview';
  onContinueLearning?: () => void;
}

/**
 * Hero section for CourseHome.
 *
 * Features a configurable gradient background with subtle code-themed decoration,
 * course title/subtitle, description, and a progress stats row.
 *
 * Fully responsive and accessible (WCAG).
 */
export function CourseHero({
  title,
  subtitle,
  description,
  progress,
  mode,
  onContinueLearning,
}: CourseHeroProps) {
  const hasProgress = progress.percentage > 0;

  return (
    <section
      className="relative overflow-hidden"
      aria-labelledby="course-hero-title"
    >
      {/* Gradient background */}
      <div className="hero-gradient absolute inset-0" />

      {/* Grid overlay */}
      <div className="hero-grid absolute inset-0" />

      {/* Decorative code elements */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        {/* Floating code brackets */}
        <span className="hero-glow absolute -top-20 -left-20 h-60 w-60 rounded-full bg-indigo-500/20" />
        <span className="hero-glow absolute -bottom-10 -right-10 h-48 w-48 rounded-full bg-cyan-500/15" style={{ animationDelay: '2s' }} />

        {/* Code snippet decorations */}
        <div className="code-shimmer absolute top-12 right-[10%] hidden rounded-lg border border-white/10 bg-white/5 px-4 py-2 font-mono text-xs text-white/20 lg:block">
          {'public class Main {'}
        </div>
        <div className="code-shimmer absolute bottom-20 left-[8%] hidden rounded-lg border border-white/10 bg-white/5 px-4 py-2 font-mono text-xs text-white/20 lg:block" style={{ animationDelay: '1.5s' }}>
          {'  System.out.println("Hello");'}
        </div>
        <div className="code-shimmer absolute top-1/2 right-[5%] hidden rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 font-mono text-xs text-white/15 xl:block" style={{ animationDelay: '0.8s' }}>
          {'}'}
        </div>
      </div>

      {/* Content */}
      <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
        <div className="max-w-3xl">
          {/* Subtitle */}
          <p className="mb-3 font-mono text-sm font-medium tracking-wide text-indigo-300/90 dark:text-indigo-400/80">
            {subtitle}
          </p>

          {/* Title */}
          <h1
            id="course-hero-title"
            className="text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl"
          >
            {title}
          </h1>

          {/* Description */}
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-slate-300/90 sm:text-lg dark:text-slate-300/80">
            {description}
          </p>

          {/* Progress stats */}
          <div className="mt-8 flex flex-wrap items-center gap-6">
            {/* Stats pills */}
            <div className="flex items-center gap-2 text-sm text-white/70">
              <GraduationCap className="h-4 w-4" />
              <span>
                {progress.completedModules}/{progress.totalModules} módulos
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm text-white/70">
              <BookOpen className="h-4 w-4" />
              <span>
                {progress.completedLessons}/{progress.totalLessons} lecciones
              </span>
            </div>
            {hasProgress && (
              <div className="flex items-center gap-2 text-sm text-white/70">
                <Clock className="h-4 w-4" />
                <span>{progress.percentage}% completado</span>
              </div>
            )}
          </div>

          {/* Progress bar */}
          {hasProgress && (
            <div className="mt-6 max-w-md">
              <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-indigo-400 to-cyan-400 transition-all duration-500"
                  style={{ width: `${progress.percentage}%` }}
                  role="progressbar"
                  aria-valuenow={progress.percentage}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label={`Progreso del curso: ${progress.percentage}%`}
                />
              </div>
            </div>
          )}

          {/* CTA */}
          <div className="mt-8">
            {mode === 'admin_preview' ? (
              <Button
                size="lg"
                onClick={onContinueLearning}
                className="btn-glow bg-white text-slate-900 hover:bg-slate-100"
              >
                Vista previa del curso
                <ChevronRight className="h-4 w-4" />
              </Button>
            ) : hasProgress ? (
              <Button
                size="lg"
                onClick={onContinueLearning}
                className="btn-glow bg-white text-slate-900 hover:bg-slate-100"
              >
                Continuar aprendiendo
                <ChevronRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                size="lg"
                onClick={onContinueLearning}
                className="btn-glow bg-white text-slate-900 hover:bg-slate-100"
              >
                Comenzar curso
                <ChevronRight className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
