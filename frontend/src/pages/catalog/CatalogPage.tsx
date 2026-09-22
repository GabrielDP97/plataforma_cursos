import { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, Code2, ArrowRight } from 'lucide-react';
import { catalogApi } from '../../api/modules/catalog';
import type { Course, Category } from '../../api/types';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Skeleton } from '../../components/ui/skeleton';
import { EmptyState } from '../../components/ui/empty-state';

const PAGE_SIZE = 12;

export function CatalogPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [courses, setCourses] = useState<Course[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);

  const searchQuery = searchParams.get('q') || '';
  const selectedCategory = searchParams.get('categoryId') || '';
  const page = parseInt(searchParams.get('page') || '1', 10);

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    loadCourses();
  }, [page, selectedCategory, searchQuery]);

  const loadCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      const data = await response.json();
      if (data.success && data.data) {
        setCategories(data.data);
      }
    } catch {
      // Silently handle - categories filter will be hidden
    }
  };

  const loadCourses = async () => {
    setLoading(true);
    try {
      const result = await catalogApi.list({
        q: searchQuery || undefined,
        categoryId: selectedCategory || undefined,
        page,
        limit: PAGE_SIZE,
      });
      setCourses(result.data || []);
      setTotal(result.meta?.total || 0);
    } catch {
      setCourses([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  const updateSearchParams = useCallback(
    (updates: Record<string, string>) => {
      const newParams = new URLSearchParams(searchParams);
      Object.entries(updates).forEach(([key, value]) => {
        if (value) {
          newParams.set(key, value);
        } else {
          newParams.delete(key);
        }
      });
      // Reset to page 1 when filters change (except when changing page)
      if (!('page' in updates)) {
        newParams.delete('page');
      }
      setSearchParams(newParams);
    },
    [searchParams, setSearchParams]
  );

  const handleSearch = useCallback(
    (value: string) => {
      updateSearchParams({ q: value });
    },
    [updateSearchParams]
  );

  const handleCategoryChange = (categoryId: string) => {
    updateSearchParams({ categoryId });
  };

  const handlePageChange = (newPage: number) => {
    updateSearchParams({ page: String(newPage) });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="rounded-2xl bg-gradient-to-r from-indigo-500/10 via-cyan-500/5 to-indigo-500/10 p-8">
        <Badge variant="info" size="md" className="mb-4">
          Catálogo
        </Badge>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white sm:text-4xl">
          Catálogo de cursos
        </h1>
        <p className="mt-3 max-w-2xl text-lg text-gray-600 dark:text-gray-400">
          Explora nuestros cursos disponibles para reforzar primero de DAM y DAW
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="flex-1">
          <label htmlFor="catalog-search" className="sr-only">
            Buscar cursos
          </label>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <input
              id="catalog-search"
              type="text"
              placeholder="Buscar cursos..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="block w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 py-3 pl-12 pr-4 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 shadow-sm transition-all focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              aria-label="Buscar cursos"
            />
          </div>
        </div>
        {categories.length > 0 && (
          <div>
            <label htmlFor="category-filter" className="sr-only">
              Filtrar por categoría
            </label>
            <select
              id="category-filter"
              value={selectedCategory}
              onChange={(e) => handleCategoryChange(e.target.value)}
              className="rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-3 text-sm text-gray-900 dark:text-white shadow-sm transition-all focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              aria-label="Filtrar por categoría"
            >
              <option value="">Todas las categorías</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Results */}
      {loading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Card key={i} padding="none">
              <Skeleton variant="rectangle" className="h-48" />
              <div className="p-4 space-y-2">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            </Card>
          ))}
        </div>
      ) : courses.length === 0 ? (
        <EmptyState
          icon={<Search className="h-12 w-12" />}
          title="No se encontraron cursos"
          message="No se encontraron cursos con esos filtros. Intenta ajustar tu búsqueda o explora otras categorías."
        />
      ) : (
        <>
          {/* Course Grid */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {courses.map((course, index) => (
              <Link key={course.id} to={`/courses/${course.id}`} className="group block">
                <div className="overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                  {course.thumbnailUrl ? (
                    <img
                      src={course.thumbnailUrl}
                      alt={course.title}
                      className="h-48 w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className={`flex h-48 w-full items-center justify-center bg-gradient-to-br ${
                      ['from-indigo-500 to-cyan-500', 'from-violet-500 to-purple-500', 'from-cyan-500 to-teal-500', 'from-blue-500 to-indigo-500', 'from-emerald-500 to-cyan-500'][index % 5]
                    }`}>
                      <Code2 className="h-12 w-12 text-white/40" />
                    </div>
                  )}
                  <div className="p-5">
                    <div className="mb-3 flex items-center gap-2">
                      <Badge variant="info" size="sm">
                        {course.status === 'published' ? 'Disponible' : 'Próximamente'}
                      </Badge>
                    </div>
                    <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-1 group-hover:text-indigo-600 transition-colors">
                      {course.title}
                    </h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-gray-500 dark:text-gray-400 line-clamp-2">
                      {course.description || 'Curso para reforzar contenido de primero de DAM/DAW.'}
                    </p>
                    <div className="mt-4 flex items-end justify-between">
                      <span className="text-xs font-medium text-gray-400 dark:text-gray-500">
                        {new Date(course.createdAt).toLocaleDateString('es-ES', {
                          month: 'short',
                          year: 'numeric',
                        })}
                      </span>
                      <Link
                        to={`/contacto?course=${course.slug}`}
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-700 transition-all"
                      >
                        Solicitar información
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => handlePageChange(page - 1)}
                disabled={page === 1}
              >
                Anterior
              </Button>
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                  .map((p, i, arr) => (
                    <span key={p} className="flex items-center">
                      {i > 0 && arr[i - 1] !== p - 1 && (
                        <span className="px-2 text-gray-400">...</span>
                      )}
                      <button
                        type="button"
                        onClick={() => handlePageChange(p)}
                        className={`h-10 w-10 rounded-xl text-sm font-medium transition-all ${
                          p === page
                            ? 'bg-indigo-600 text-white shadow-sm'
                            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                        }`}
                        aria-label={`Página ${p}`}
                        aria-current={p === page ? 'page' : undefined}
                      >
                        {p}
                      </button>
                    </span>
                  ))}
              </div>
              <Button
                variant="outline"
                onClick={() => handlePageChange(page + 1)}
                disabled={page >= totalPages}
              >
                Siguiente
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
