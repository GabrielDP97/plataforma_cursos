import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { catalogApi } from '../../api/modules/catalog';
import { Card } from '../../components/ui/card';
import { Skeleton } from '../../components/ui/skeleton';

/** Returns true when the category slug corresponds to the DAM/DAW curriculum. */
const isDamDawCategory = (slug?: string | null): boolean => {
  if (!slug) return false;
  const s = slug.toLowerCase();
  return s === '1-dam-daw' || s === 'dam-daw' || s === 'dam' || s === 'daw';
};

export default function CategoryPage() {
  const { categorySlug } = useParams<{ categorySlug: string }>();
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadCategory();
  }, [categorySlug]);

  const loadCategory = async () => {
    try {
      setLoading(true);
      const result = await catalogApi.list();
      const allCourses = result.data || [];
      setCourses(allCourses);
    } catch {
      setError('No se pudieron cargar los cursos de esta categoría.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <Skeleton className="h-8 w-64 mb-4" />
        <Skeleton className="h-4 w-96 mb-8" />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-64" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Breadcrumbs */}
      <nav className="mb-6 flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
        <Link to="/" className="hover:text-gray-700 dark:hover:text-gray-200">Inicio</Link>
        <ChevronRight className="h-4 w-4" />
        <Link to="/courses" className="hover:text-gray-700 dark:hover:text-gray-200">Cursos</Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-gray-900 dark:text-white">{categorySlug}</span>
      </nav>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white sm:text-4xl">
          {categorySlug || 'Cursos'}
        </h1>
        <p className="mt-3 max-w-2xl text-lg text-gray-600 dark:text-gray-400">
          {categorySlug ? 'Cursos de ' + categorySlug : 'Cursos disponibles en esta categoría.'}
        </p>
      </div>

      {/* Curriculum info (DAM/DAW only) */}
      {isDamDawCategory(categorySlug) && (
        <div className="mb-8 rounded-xl border border-indigo-200 bg-indigo-50/50 p-5 dark:border-indigo-800/50 dark:bg-indigo-950/30">
          <p className="text-sm text-gray-700 dark:text-gray-300">
            Los cursos de esta categoría se han elaborado tomando como referencia los contenidos
            establecidos en el currículo oficial de primer curso de Desarrollo de Aplicaciones
            Multiplataforma (DAM) y Desarrollo de Aplicaciones Web (DAW), organizándolos en
            explicaciones, ejemplos y ejercicios prácticos para facilitar su aprendizaje y refuerzo.
          </p>
          <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
            AulaDev es una plataforma educativa independiente y no está afiliada ni vinculada
            oficialmente con ninguna administración educativa.
          </p>
        </div>
      )}

      {/* Course grid */}
      {error ? (
        <p className="text-red-600 dark:text-red-400">{error}</p>
      ) : courses.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400">No hay cursos disponibles en esta categoría.</p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => (
            <Link key={course.id} to={`/courses/${course.id}`}>
              <Card className="h-full transition-all hover:shadow-md hover:border-indigo-300 dark:hover:border-indigo-600">
                <div className="p-5">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{course.title}</h3>
                  <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 line-clamp-3">{course.description}</p>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
