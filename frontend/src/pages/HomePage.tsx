import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen,
  Code2,
  ArrowRight,
  CheckCircle2,
  Terminal,
  ChevronRight,
  Database,
  FileCode,
  MonitorCog,
  Server,
  Clock,
  GraduationCap,
  Lightbulb,
  Braces,
} from 'lucide-react';
import { useAuth } from '../providers/auth-provider';
import { catalogApi } from '../api/modules/catalog';
import type { Course } from '../api/types';
import { Badge } from '../components/ui/badge';
import { Skeleton } from '../components/ui/skeleton';
import { ScrollReveal } from '../components/ui/ScrollReveal';

/* ============================================================================
   HOME PAGE — Plataforma para 1.º de DAM y DAW
   ============================================================================ */

export function HomePage() {
  const { user } = useAuth();
  const [featuredCourses, setFeaturedCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFeaturedCourses();
  }, []);

  const loadFeaturedCourses = async () => {
    try {
      const result = await catalogApi.list({ limit: 6 });
      setFeaturedCourses(result.data || []);
    } catch {
      // Silently handle error for homepage
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      {/* ====================================================================
          SECTION 1 — HERO
          ==================================================================== */}
      <section className="hero-gradient relative overflow-hidden px-4 py-24 text-white sm:px-6 sm:py-32 lg:px-8">
        {/* Grid pattern */}
        <div className="hero-grid absolute inset-0" />

        {/* Glow orbs */}
        <div className="hero-glow absolute -left-32 top-1/4 bg-indigo-500" />
        <div className="hero-glow absolute -right-32 top-1/3 bg-cyan-500" style={{ animationDelay: '2s' }} />

        {/* Floating decorative elements — developer theme */}
        <div className="absolute left-8 top-20 animate-float opacity-20 sm:left-16 lg:left-32">
          <div className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 font-mono text-xs text-cyan-300 backdrop-blur-sm">
            {'public class App {'}
          </div>
        </div>
        <div className="absolute right-8 top-32 animate-float-delayed opacity-20 sm:right-16 lg:right-32">
          <div className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 font-mono text-xs text-violet-300 backdrop-blur-sm">
            {'SELECT * FROM alumnos'}
          </div>
        </div>
        <div className="absolute bottom-20 left-1/4 animate-float opacity-10">
          <div className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 font-mono text-xs text-emerald-300 backdrop-blur-sm">
            {'<div class="container">'}
          </div>
        </div>

        <div className="relative mx-auto max-w-7xl">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            {/* Left — Copy */}
            <ScrollReveal delay={0}>
            <div>
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-sm text-indigo-200 backdrop-blur-sm">
                <GraduationCap className="h-4 w-4 text-indigo-300" />
                Para estudiantes de 1.º de DAM y DAW
              </div>

              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
                Refuerza primero de DAM y DAW{' '}
                <span className="bg-gradient-to-r from-cyan-300 via-blue-300 to-indigo-300 bg-clip-text text-transparent">
                  con la práctica que necesitas
                </span>
              </h1>

              <p className="mt-6 max-w-lg text-lg leading-relaxed text-slate-300">
                Cursos pensados para tu primer año. Explicaciones paso a paso,
                ejercicios prácticos y contenido creado desde más de 7 años
                de experiencia impartiendo formación.
              </p>

              <div className="mt-10 flex flex-col gap-4 sm:flex-row">
                <Link
                  to="/courses"
                  className="btn-glow inline-flex items-center justify-center gap-2 rounded-xl bg-white px-8 py-4 text-base font-semibold text-slate-900 shadow-lg shadow-black/10 transition-all hover:bg-slate-100 hover:shadow-xl hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
                >
                  Explorar cursos
                  <ArrowRight className="h-5 w-5" />
                </Link>

                {!user && (
                  <Link
                    to="/courses"
                    className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-white/30 bg-white/5 px-8 py-4 text-base font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/10 hover:border-white/50 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
                  >
                    Ver contenidos de 1.º
                  </Link>
                )}
              </div>
            </div>
            </ScrollReveal>

            {/* Right — Code snippet + progress preview */}
            <ScrollReveal delay={200} direction="left">
            <div className="hidden lg:block">
              {/* Code snippet card — Java (DAM) */}
              <div className="animate-float rounded-2xl border border-white/10 bg-slate-900/80 p-6 shadow-2xl backdrop-blur-xl">
                <div className="mb-4 flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-red-400" />
                  <div className="h-3 w-3 rounded-full bg-yellow-400" />
                  <div className="h-3 w-3 rounded-full bg-green-400" />
                  <span className="ml-2 font-mono text-xs text-slate-500">Alumno.java</span>
                </div>
                <pre className="code-shimmer overflow-x-auto text-sm leading-relaxed">
                  <code className="code-block">
                    <span className="text-violet-400">public class</span>{' '}
                    <span className="text-cyan-300">Alumno</span> {'{'}
                    {'\n  '}
                    <span className="text-violet-400">private</span>{' '}
                    <span className="text-cyan-300">String</span>{' '}
                    <span className="text-slate-300">nombre</span>;
                    {'\n  '}
                    <span className="text-violet-400">private</span>{' '}
                    <span className="text-cyan-300">String</span>{' '}
                    <span className="text-slate-300">email</span>;
                    {'\n\n  '}
                    <span className="text-violet-400">public</span>{' '}
                    <span className="text-cyan-300">Alumno</span>
                    <span className="text-slate-400">(</span>
                    <span className="text-cyan-300">String</span>{' '}
                    <span className="text-slate-300">nombre</span>
                    <span className="text-slate-400">) {'{'}</span>
                    {'\n    '}
                    <span className="text-violet-400">this</span>
                    <span className="text-slate-400">.</span>
                    <span className="text-slate-300">nombre</span>{' '}
                    <span className="text-slate-400">=</span>{' '}
                    <span className="text-slate-300">nombre</span>;
                    {'\n  '}
                    <span className="text-slate-400">{'}'}</span>
                    {'\n'}
                    {'}'}
                  </code>
                </pre>
              </div>

              {/* Floating mini-cards */}
              <div className="animate-float-delayed mt-6 flex justify-end gap-4">
                <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-sm">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    <span className="text-xs text-slate-300">Lección completada</span>
                  </div>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-sm">
                  <div className="flex items-center gap-2">
                    <Terminal className="h-4 w-4 text-cyan-400" />
                    <span className="text-xs text-slate-300">Ejercicio practico</span>
                  </div>
                </div>
              </div>
            </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* ====================================================================
          SECTION 2 — PENSADO PARA 1.º DE DAM Y DAW
          ==================================================================== */}
      <section className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <ScrollReveal>
          <div className="text-center">
            <Badge variant="info" size="md" className="mb-4">
              Para tu primer año
            </Badge>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white sm:text-4xl">
              Pensado para estudiantes de{' '}
              <span className="text-indigo-600">1.º de DAM y DAW</span>
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-600 dark:text-gray-400">
              No partimos de la base de que ya sabes programar.
              Cada curso está diseñado para ayudarte a entender, practicar y consolidar
              lo que ves en clase.
            </p>
          </div>
          </ScrollReveal>

          <div className="mt-16 grid gap-8 sm:grid-cols-2">
            <ScrollReveal delay={100}>
            <FeatureCard
              icon={<Lightbulb className="h-6 w-6" />}
              iconColor="indigo"
              title="Explicaciones paso a paso"
              description="No damos por hecho que ya sabes programar. Cada concepto se explica desde la base, con ejemplos claros y sin prisa."
            />
            </ScrollReveal>
            <ScrollReveal delay={200}>
            <FeatureCard
              icon={<Code2 className="h-6 w-6" />}
              iconColor="cyan"
              title="Ejercicios y practica real"
              description="Refuerza cada tema con ejercicios y pequeños proyectos que te ayudan a entender lo que estas haciendo, no solo a memorizar."
            />
            </ScrollReveal>
            <ScrollReveal delay={300}>
            <FeatureCard
              icon={<BookOpen className="h-6 w-6" />}
              iconColor="emerald"
              title="Refuerzo para clase y examenes"
              description="Repasa conceptos, practica y consolida lo que vas viendo durante el curso. Ideal para preparar evaluaciones."
            />
            </ScrollReveal>
            <ScrollReveal delay={400}>
            <FeatureCard
              icon={<Clock className="h-6 w-6" />}
              iconColor="violet"
              title="Aprende a tu ritmo"
              description="Avanza cuando quieras y vuelve a las lecciones tantas veces como necesites. Sin presion, sin limites de tiempo."
            />
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* ====================================================================
          SECTION 3 — CONTENIDO / AREAS
          ==================================================================== */}
      <section className="bg-gray-50 dark:bg-gray-900 px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <ScrollReveal>
          <div className="text-center">
            <Badge variant="success" size="md" className="mb-4">
              Contenido
            </Badge>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white sm:text-4xl">
              Contenido orientado a{' '}
              <span className="text-indigo-600">1.º de DAM y DAW</span>
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-600 dark:text-gray-400">
              Las areas fundamentales que necesitas dominar en tu primer año.
            </p>
          </div>
          </ScrollReveal>

          <div className="mt-16 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            <ScrollReveal delay={100}>
            <AreaCard
              icon={<Braces className="h-7 w-7" />}
              name="Programacion"
              description="Java, bases de la programacion orientada a objetos"
              color="indigo"
            />
            </ScrollReveal>
            <ScrollReveal delay={150}>
            <AreaCard
              icon={<Database className="h-7 w-7" />}
              name="Bases de Datos"
              description="SQL, modelado de datos, MySQL y PostgreSQL"
              color="cyan"
            />
            </ScrollReveal>
            <ScrollReveal delay={200}>
            <AreaCard
              icon={<FileCode className="h-7 w-7" />}
              name="Lenguajes de Marcas"
              description="HTML, CSS, XML y fundamentos web"
              color="emerald"
            />
            </ScrollReveal>
            <ScrollReveal delay={250}>
            <AreaCard
              icon={<MonitorCog className="h-7 w-7" />}
              name="Entornos de Desarrollo"
              description="IDEs, herramientas, flujo de trabajo del desarrollador"
              color="violet"
            />
            </ScrollReveal>
            <ScrollReveal delay={300}>
            <AreaCard
              icon={<Server className="h-7 w-7" />}
              name="Sistemas Informaticos"
              description="Sistemas operativos, redes, hardware"
              color="amber"
            />
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* ====================================================================
          SECTION 4 — CURSOS DESTACADOS
          ==================================================================== */}
      <section id="catalogo" className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <ScrollReveal>
          <div className="flex items-end justify-between">
            <div>
              <Badge variant="info" size="md" className="mb-4">
                Catalogo
              </Badge>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white sm:text-4xl">
                Cursos disponibles
              </h2>
              <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">
                Contenido actualizado para tu primer año
              </p>
            </div>
            <Link
              to="/courses"
              className="hidden items-center gap-1 text-sm font-semibold text-indigo-600 transition-colors hover:text-indigo-700 sm:flex"
            >
              Ver todos
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
          </ScrollReveal>

          {loading ? (
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                  <Skeleton variant="rectangle" className="h-48 rounded-none" />
                  <div className="p-5 space-y-3">
                    <Skeleton className="h-4 w-1/3" />
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : featuredCourses.length === 0 ? (
            <div className="mt-10 rounded-2xl border-2 border-dashed border-gray-300 dark:border-gray-700 py-16 text-center">
              <BookOpen className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
              <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-white">Proximamente</h3>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                Estamos preparando cursos para ayudarte con primero de DAM y DAW.
              </p>
            </div>
          ) : (
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {featuredCourses.map((course, index) => (
                <ScrollReveal key={course.id} delay={index * 100}>
                <CourseCard course={course} index={index} />
                </ScrollReveal>
              ))}
            </div>
          )}

          <div className="mt-10 text-center sm:hidden">
            <Link
              to="/courses"
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-indigo-700"
            >
              Ver todos los cursos
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ====================================================================
          SECTION 5 — SOBRE MÍ
          ==================================================================== */}
      <section id="sobre-mi" className="bg-gray-50 dark:bg-gray-900 px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <ScrollReveal>
          <div className="relative overflow-hidden rounded-3xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-8 sm:p-12">
            {/* Decorative glow */}
            <div className="absolute -right-20 -top-20 h-40 w-40 rounded-full bg-indigo-500/5 blur-3xl" />
            <div className="absolute -bottom-20 -left-20 h-40 w-40 rounded-full bg-cyan-500/5 blur-3xl" />

            <div className="relative flex flex-col items-center text-center">
              <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-cyan-500 shadow-lg shadow-indigo-500/20">
                <GraduationCap className="h-8 w-8 text-white" />
              </div>

              <h2 className="text-3xl font-bold text-gray-900 dark:text-white sm:text-4xl">
                Desde 2020 formando a estudiantes de FP
              </h2>

              <ScrollReveal delay={100}>
              <p className="mt-6 max-w-2xl text-lg leading-relaxed text-gray-600 dark:text-gray-400">
                Desde 2020 ayudo a estudiantes de Formación Profesional a entender la programación de una forma práctica y cercana.
              </p>
              </ScrollReveal>

              <ScrollReveal delay={200}>
              <p className="mt-4 max-w-2xl text-lg leading-relaxed text-gray-600 dark:text-gray-400">
                Mi objetivo no es que memorices código, sino que entiendas qué estás haciendo, por qué funciona y cómo enfrentarte a un problema por tu cuenta.
              </p>
              </ScrollReveal>

              <ScrollReveal delay={300}>
              <p className="mt-4 max-w-2xl text-lg leading-relaxed text-gray-600 dark:text-gray-400">
                También he trabajado profesionalmente como docente de programación en Algorithmics, impartiendo C# y Python, preparando ejercicios prácticos, resolviendo dudas y revisando código.
              </p>
              </ScrollReveal>

              <ScrollReveal delay={400}>
              <p className="mt-4 max-w-2xl text-lg leading-relaxed text-gray-600 dark:text-gray-400">
                Mi formación en DAM, DAW, ASIR y Ciberseguridad me permite aportar una visión amplia de la informática y relacionar lo que aprendemos con situaciones y problemas reales.
              </p>
              </ScrollReveal>

              <ScrollReveal delay={500}>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-sm text-gray-500 dark:text-gray-400">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-indigo-500" />
                  <span>Formando a estudiantes de FP desde 2020</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-indigo-500" />
                  <span>Explicaciones para entender, no memorizar</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-indigo-500" />
                  <span>Ejercicios prácticos y resolución de problemas</span>
                </div>
              </div>
              </ScrollReveal>
            </div>
          </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ====================================================================
          SECTION 6 — COMO FUNCIONA
          ==================================================================== */}
      <section className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <ScrollReveal>
          <div className="text-center">
            <Badge variant="warning" size="md" className="mb-4">
              Simple
            </Badge>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white sm:text-4xl">
              Empieza en tres pasos
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-600 dark:text-gray-400">
              Sin tarjetas, sin compromisos. Explora, contacta y empieza a aprender.
            </p>
          </div>
          </ScrollReveal>

          <div className="mt-16 grid gap-8 sm:grid-cols-3">
            <ScrollReveal delay={100}>
            <StepCard
              number={1}
              title="Explora los cursos"
              description="Consulta las asignaturas disponibles y descubre el contenido que puedes trabajar en la plataforma."
            />
            </ScrollReveal>
            <ScrollReveal delay={200}>
            <StepCard
              number={2}
              title="Contacto"
              description="Si te interesa acceder a uno de nuestros cursos, ponte en contacto con nosotros."
              buttonText="Contacto"
              buttonTo="/contacto"
            />
            </ScrollReveal>
            <ScrollReveal delay={300}>
            <StepCard
              number={3}
              title="Empieza a aprender"
              description="Cuando tu curso esté asignado, inicia sesión y accede a todo el contenido desde tu panel."
            />
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* ====================================================================
          SECTION 8 — CTA FINAL
          ==================================================================== */}
      <section className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <ScrollReveal delay={100}>
          <div className="hero-gradient relative overflow-hidden rounded-3xl px-8 py-16 text-center text-white sm:px-16">
            {/* Glow */}
            <div className="absolute -left-20 top-0 h-40 w-40 rounded-full bg-indigo-500/20 blur-3xl" />
            <div className="absolute -bottom-20 right-0 h-40 w-40 rounded-full bg-cyan-500/20 blur-3xl" />

            <div className="relative">
              <h2 className="text-3xl font-bold sm:text-4xl">
                Refuerza primero de DAM y DAW{' '}
                <span className="text-cyan-300">con practica real</span>
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-lg text-slate-300">
                Cursos creados para ayudarte a entender, no solo a memorizar.
                Explicaciones claras, ejercicios practicos y a tu ritmo.
              </p>
              <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Link
                  to="/courses"
                  className="btn-glow inline-flex items-center gap-2 rounded-xl bg-white px-8 py-4 text-base font-semibold text-slate-900 shadow-lg transition-all hover:bg-slate-100 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                >
                  Explorar cursos
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </div>
            </div>
          </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ====================================================================
          SECTION 9 — FOOTER
          ==================================================================== */}
      <footer className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
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
              &copy; {new Date().getFullYear()} AulaDev. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

/* ============================================================================
   SUB-COMPONENTS
   ============================================================================ */

function FeatureCard({
  icon,
  iconColor,
  title,
  description,
}: {
  icon: React.ReactNode;
  iconColor: string;
  title: string;
  description: string;
}) {
  const colorMap: Record<string, string> = {
    indigo: 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400',
    cyan: 'bg-cyan-100 dark:bg-cyan-900/50 text-cyan-600 dark:text-cyan-400',
    emerald: 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400',
    violet: 'bg-violet-100 dark:bg-violet-900/50 text-violet-600 dark:text-violet-400',
  };

  return (
    <div className="feature-card group rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 transition-all hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-lg hover:-translate-y-1">
      <div
        className={`feature-icon mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl ${colorMap[iconColor] || colorMap.indigo}`}
      >
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-gray-600 dark:text-gray-400">{description}</p>
    </div>
  );
}

function CourseCard({ course, index }: { course: Course; index: number }) {
  const gradients = [
    'from-indigo-500 to-cyan-500',
    'from-violet-500 to-purple-500',
    'from-cyan-500 to-teal-500',
    'from-blue-500 to-indigo-500',
    'from-emerald-500 to-cyan-500',
    'from-pink-500 to-rose-500',
  ];

  return (
    <Link to={`/courses/${course.id}`} className="group block">
      <div className="tech-card-hover overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        {course.thumbnailUrl ? (
          <img
            src={course.thumbnailUrl}
            alt={course.title}
            className="h-48 w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div
            className={`flex h-48 w-full items-center justify-center bg-gradient-to-br ${gradients[index % gradients.length]}`}
          >
            <Code2 className="h-12 w-12 text-white/40" />
          </div>
        )}

        <div className="p-5">
          <div className="mb-3 flex items-center gap-2">
            <Badge variant="info" size="sm">
              {course.status === 'published' ? 'Disponible' : 'Proximamente'}
            </Badge>
          </div>
          <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-1 group-hover:text-indigo-600 transition-colors">
            {course.title}
          </h3>
          <p className="mt-1.5 text-sm leading-relaxed text-gray-500 dark:text-gray-400 line-clamp-2">
            {course.description || 'Curso para reforzar contenido de primero de DAM/DAW.'}
          </p>
          <div className="mt-4 flex items-center justify-between">
            <span className="text-xs font-medium text-gray-400 dark:text-gray-500">
              {new Date(course.createdAt).toLocaleDateString('es-ES', {
                month: 'short',
                year: 'numeric',
              })}
            </span>
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 group-hover:gap-2 transition-all">
              Ver curso
              <ArrowRight className="h-3.5 w-3.5" />
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

function AreaCard({
  icon,
  name,
  description,
  color,
}: {
  icon: React.ReactNode;
  name: string;
  description: string;
  color: string;
}) {
  const colorMap: Record<string, { bg: string; text: string; border: string; hover: string }> = {
    indigo: {
      bg: 'bg-indigo-50',
      text: 'text-indigo-600',
      border: 'border-indigo-200',
      hover: 'hover:bg-indigo-100 hover:border-indigo-300',
    },
    cyan: {
      bg: 'bg-cyan-50',
      text: 'text-cyan-600',
      border: 'border-cyan-200',
      hover: 'hover:bg-cyan-100 hover:border-cyan-300',
    },
    emerald: {
      bg: 'bg-emerald-50',
      text: 'text-emerald-600',
      border: 'border-emerald-200',
      hover: 'hover:bg-emerald-100 hover:border-emerald-300',
    },
    violet: {
      bg: 'bg-violet-50',
      text: 'text-violet-600',
      border: 'border-violet-200',
      hover: 'hover:bg-violet-100 hover:border-violet-300',
    },
    amber: {
      bg: 'bg-amber-50',
      text: 'text-amber-600',
      border: 'border-amber-200',
      hover: 'hover:bg-amber-100 hover:border-amber-300',
    },
  };

  const c = colorMap[color] || colorMap.indigo;

  return (
    <div
      className={`tech-card-hover group cursor-default rounded-2xl border ${c.border} ${c.bg} p-6 transition-all ${c.hover}`}
    >
      <div className={`mb-3 ${c.text}`}>{icon}</div>
      <h3 className={`text-sm font-bold ${c.text}`}>{name}</h3>
      <p className="mt-1 text-xs leading-relaxed text-gray-500 dark:text-gray-400">{description}</p>
    </div>
  );
}

function StepCard({
  number,
  title,
  description,
  buttonText,
  buttonTo,
}: {
  number: number;
  title: string;
  description: string;
  buttonText?: string;
  buttonTo?: string;
}) {
  return (
    <div className="relative rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-8 text-center">
      <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-indigo-600 text-lg font-bold text-white">
        {number}
      </div>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-gray-600 dark:text-gray-400">{description}</p>
      {buttonText && buttonTo && (
        <Link
          to={buttonTo}
          className="mt-4 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-700"
        >
          {buttonText}
        </Link>
      )}
    </div>
  );
}
