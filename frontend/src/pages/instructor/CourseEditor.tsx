import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Eye, EyeOff, Archive } from 'lucide-react';
import { coursesApi } from '../../api/modules/courses';
import type { Course, Module } from '../../api/types';
import { Card } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Skeleton } from '../../components/ui/skeleton';
import { Alert } from '../../components/ui/alert';
import { Dialog } from '../../components/ui/dialog';
import { ModuleEditor } from '../../components/instructor/module-editor';

function statusBadge(status: Course['status']) {
  switch (status) {
    case 'published':
      return <Badge variant="success">Publicado</Badge>;
    case 'draft':
      return <Badge variant="warning">Borrador</Badge>;
    case 'archived':
      return <Badge variant="default">Archivado</Badge>;
  }
}

function EditorSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Skeleton className="h-10 w-10" />
        <Skeleton className="h-8 w-64" />
      </div>
      <Card>
        <div className="space-y-4">
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-24 w-full" />
        </div>
      </Card>
      <Skeleton className="h-6 w-32" />
      <Card>
        <Skeleton className="h-32 w-full" />
      </Card>
    </div>
  );
}

export function CourseEditor() {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();

  const [course, setCourse] = useState<Course | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Editable fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [titleEdited, setTitleEdited] = useState(false);

  // Saving state
  const [saving, setSaving] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [showArchiveDialog, setShowArchiveDialog] = useState(false);

  const fetchCourse = useCallback(async () => {
    if (!courseId) return;
    try {
      const [courseData, modulesData] = await Promise.all([
        coursesApi.getById(courseId),
        coursesApi.listModules(courseId),
      ]);
      setCourse(courseData);
      setModules(modulesData);
      setTitle(courseData.title);
      setDescription(courseData.description || '');
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Error al cargar el curso',
      );
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    fetchCourse();
  }, [fetchCourse]);

  const handleSave = async () => {
    if (!courseId) return;
    setSaving(true);
    setError(null);
    try {
      const updated = await coursesApi.update(courseId, {
        title: title.trim(),
        description: description.trim() || undefined,
      });
      setCourse(updated);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Error al guardar el curso',
      );
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async () => {
    if (!courseId) return;
    setActionLoading(true);
    setError(null);
    try {
      const updated = await coursesApi.publish(courseId);
      setCourse(updated);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Error al publicar el curso',
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleUnpublish = async () => {
    if (!courseId) return;
    setActionLoading(true);
    setError(null);
    try {
      const updated = await coursesApi.unpublish(courseId);
      setCourse(updated);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Error al despublicar el curso',
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleArchive = async () => {
    if (!courseId) return;
    setActionLoading(true);
    setError(null);
    try {
      const updated = await coursesApi.archive(courseId);
      setCourse(updated);
      setShowArchiveDialog(false);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Error al archivar el curso',
      );
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <EditorSkeleton />;

  if (error && !course) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Editar Curso</h1>
        <Alert variant="error" title="Error">
          {error}
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/instructor/courses')}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold text-gray-900">Editar Curso</h1>
          {course && statusBadge(course.status)}
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            loading={saving}
            onClick={handleSave}
          >
            <Save className="h-4 w-4" />
            Guardar
          </Button>

          {course?.status === 'draft' && (
            <Button
              size="sm"
              loading={actionLoading}
              onClick={handlePublish}
            >
              <Eye className="h-4 w-4" />
              Publicar
            </Button>
          )}

          {course?.status === 'published' && (
            <Button
              variant="secondary"
              size="sm"
              loading={actionLoading}
              onClick={handleUnpublish}
            >
              <EyeOff className="h-4 w-4" />
              Despublicar
            </Button>
          )}

          {course?.status !== 'archived' && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowArchiveDialog(true)}
            >
              <Archive className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {error && (
        <Alert variant="error" title="Error">
          {error}
        </Alert>
      )}

      {/* Course Details */}
      <Card>
        <div className="space-y-4">
          <Input
            label="Título del Curso"
            required
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (!titleEdited) setTitleEdited(true);
            }}
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
        </div>
      </Card>

      {/* Modules & Lessons */}
      <ModuleEditor
        courseId={courseId!}
        modules={modules}
        onModulesChange={setModules}
      />

      {/* Archive Dialog */}
      <Dialog
        open={showArchiveDialog}
        onClose={() => setShowArchiveDialog(false)}
        title="Archivar Curso"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            ¿Estás seguro de que deseas archivar este curso? No será visible
            para los estudiantes.
          </p>
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => setShowArchiveDialog(false)}
            >
              Cancelar
            </Button>
            <Button
              variant="danger"
              loading={actionLoading}
              onClick={handleArchive}
            >
              Archivar
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
