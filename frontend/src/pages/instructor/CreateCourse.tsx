import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { coursesApi } from '../../api/modules/courses';
import { Card } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { Alert } from '../../components/ui/alert';

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

export function CreateCourse() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [slug, setSlug] = useState('');
  const [slugEdited, setSlugEdited] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Auto-generate slug from title unless manually edited
  useEffect(() => {
    if (!slugEdited) {
      setSlug(slugify(title));
    }
  }, [title, slugEdited]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const course = await coursesApi.create({
        title: title.trim(),
        description: description.trim() || undefined,
        slug: slug.trim() || undefined,
      });
      navigate(`/instructor/courses/${course.id}`);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Error al crear el curso',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/instructor/courses')}
          aria-label="Volver a mis cursos"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-3xl font-bold text-gray-900">Crear Curso</h1>
      </div>

      {error && (
        <div role="alert" aria-live="polite">
          <Alert variant="error" title="Error">
            {error}
          </Alert>
        </div>
      )}

      <Card>
        <form className="space-y-5" onSubmit={handleSubmit} aria-label="Formulario de creación de curso">
          <Input
            label="Título del Curso"
            required
            placeholder="Mi curso"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <div className="space-y-1">
            <label
              htmlFor="course-description"
              className="block text-sm font-medium text-gray-700"
            >
              Descripción
            </label>
            <textarea
              id="course-description"
              className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm transition-all focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              rows={4}
              placeholder="Descripción del curso..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <Input
            label="Slug"
            placeholder="mi-curso"
            value={slug}
            onChange={(e) => {
              setSlug(e.target.value);
              setSlugEdited(true);
            }}
          />
          <p className="text-xs text-gray-500">
            URL amigable del curso. Se genera automáticamente del título.
          </p>

          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/instructor/courses')}
            >
              Cancelar
            </Button>
            <Button type="submit" loading={loading}>
              Crear Curso
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
