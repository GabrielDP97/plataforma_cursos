import { useState } from 'react';
import { PlusCircle, Pencil, Trash2, ChevronDown, ChevronRight } from 'lucide-react';
import type { Lesson, ContentBlock } from '../../api/types';
import { coursesApi } from '../../api/modules/courses';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Dialog } from '../ui/dialog';
import { ContentBlockEditor } from './content-block-editor';

interface LessonEditorProps {
  moduleId: string;
  lessons: Lesson[];
  blocksMap: Record<string, ContentBlock[]>;
  onLessonsChange: (lessons: Lesson[]) => void;
  onBlocksChange: (lessonId: string, blocks: ContentBlock[]) => void;
  onBlocksLoad: (lessonId: string) => void;
}

export function LessonEditor({
  moduleId,
  lessons,
  blocksMap,
  onLessonsChange,
  onBlocksChange,
  onBlocksLoad,
}: LessonEditorProps) {
  const [expandedLessonId, setExpandedLessonId] = useState<string | null>(null);
  const [showAddLesson, setShowAddLesson] = useState(false);
  const [newLessonTitle, setNewLessonTitle] = useState('');
  const [editingLessonId, setEditingLessonId] = useState<string | null>(null);
  const [editLessonTitle, setEditLessonTitle] = useState('');
  const [deletingLessonId, setDeletingLessonId] = useState<string | null>(null);
  const [loadingLessonId, setLoadingLessonId] = useState<string | null>(null);

  const toggleLesson = (lessonId: string) => {
    if (expandedLessonId === lessonId) {
      setExpandedLessonId(null);
    } else {
      setExpandedLessonId(lessonId);
      if (!blocksMap[lessonId]) {
        onBlocksLoad(lessonId);
      }
    }
  };

  const handleAddLesson = async () => {
    if (!newLessonTitle.trim()) return;
    setLoadingLessonId('new');
    try {
      const newLesson = await coursesApi.createLesson(moduleId, {
        title: newLessonTitle.trim(),
      });
      onLessonsChange([...lessons, newLesson]);
      setNewLessonTitle('');
      setShowAddLesson(false);
    } catch (err) {
      console.error('Failed to create lesson:', err);
    } finally {
      setLoadingLessonId(null);
    }
  };

  const handleUpdateLesson = async (lessonId: string) => {
    if (!editLessonTitle.trim()) return;
    setLoadingLessonId(lessonId);
    try {
      const updated = await coursesApi.updateLesson(moduleId, lessonId, {
        title: editLessonTitle.trim(),
      });
      onLessonsChange(
        lessons.map((l) => (l.id === lessonId ? updated : l)),
      );
      setEditingLessonId(null);
      setEditLessonTitle('');
    } catch (err) {
      console.error('Failed to update lesson:', err);
    } finally {
      setLoadingLessonId(null);
    }
  };

  const handleDeleteLesson = async (lessonId: string) => {
    setLoadingLessonId(lessonId);
    try {
      await coursesApi.deleteLesson(moduleId, lessonId);
      onLessonsChange(lessons.filter((l) => l.id !== lessonId));
      setDeletingLessonId(null);
      if (expandedLessonId === lessonId) {
        setExpandedLessonId(null);
      }
    } catch (err) {
      console.error('Failed to delete lesson:', err);
    } finally {
      setLoadingLessonId(null);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-gray-700">Clases</p>
        <Button size="sm" variant="outline" onClick={() => setShowAddLesson(true)}>
          <PlusCircle className="h-3.5 w-3.5" />
          Agregar Clase
        </Button>
      </div>

      {lessons.length === 0 && (
        <p className="py-3 text-center text-xs text-gray-400">
          No hay clases en este módulo.
        </p>
      )}

      {lessons
        .sort((a, b) => a.position - b.position)
        .map((lesson, index) => (
          <div
            key={lesson.id}
            className="rounded-lg border border-gray-100 bg-gray-50"
          >
            {/* Lesson Header */}
            <div className="flex items-center gap-2 px-3 py-2">
              <button
                type="button"
                onClick={() => toggleLesson(lesson.id)}
                className="flex flex-1 items-center gap-2 text-left"
              >
                {expandedLessonId === lesson.id ? (
                  <ChevronDown className="h-3.5 w-3.5 shrink-0 text-gray-400" />
                ) : (
                  <ChevronRight className="h-3.5 w-3.5 shrink-0 text-gray-400" />
                )}
                <span className="text-xs text-gray-400">{index + 1}.</span>
                {editingLessonId === lesson.id ? (
                  <div className="flex flex-1 items-center gap-2">
                    <input
                      autoFocus
                      value={editLessonTitle}
                      onChange={(e) => setEditLessonTitle(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleUpdateLesson(lesson.id);
                        if (e.key === 'Escape') setEditingLessonId(null);
                      }}
                      className="flex-1 rounded border border-blue-300 px-2 py-1 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                    <Button
                      size="sm"
                      onClick={() => handleUpdateLesson(lesson.id)}
                      loading={loadingLessonId === lesson.id}
                    >
                      Guardar
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setEditingLessonId(null)}
                    >
                      Cancelar
                    </Button>
                  </div>
                ) : (
                  <span className="text-sm text-gray-900">{lesson.title}</span>
                )}
              </button>
              {editingLessonId !== lesson.id && (
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setEditingLessonId(lesson.id);
                      setEditLessonTitle(lesson.title);
                    }}
                  >
                    <Pencil className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setDeletingLessonId(lesson.id)}
                  >
                    <Trash2 className="h-3 w-3 text-red-500" />
                  </Button>
                </div>
              )}
            </div>

            {/* Lesson Content Blocks (expanded) */}
            {expandedLessonId === lesson.id && (
              <div className="border-t border-gray-100 px-3 py-2">
                <ContentBlockEditor
                  lessonId={lesson.id}
                  blocks={blocksMap[lesson.id] ?? []}
                  onBlocksChange={(blocks) =>
                    onBlocksChange(lesson.id, blocks)
                  }
                />
              </div>
            )}
          </div>
        ))}

      {/* Add Lesson Dialog */}
      <Dialog
        open={showAddLesson}
        onClose={() => {
          setShowAddLesson(false);
          setNewLessonTitle('');
        }}
        title="Agregar Clase"
      >
        <div className="space-y-4">
          <Input
            label="Título de la Clase"
            required
            placeholder="Lección 1: Conceptos básicos"
            value={newLessonTitle}
            onChange={(e) => setNewLessonTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleAddLesson();
            }}
          />
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => {
                setShowAddLesson(false);
                setNewLessonTitle('');
              }}
            >
              Cancelar
            </Button>
            <Button
              loading={loadingLessonId === 'new'}
              onClick={handleAddLesson}
            >
              Agregar
            </Button>
          </div>
        </div>
      </Dialog>

      {/* Delete Lesson Confirmation */}
      <Dialog
        open={deletingLessonId !== null}
        onClose={() => setDeletingLessonId(null)}
        title="Eliminar Clase"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            ¿Estás seguro de que deseas eliminar esta clase y todos sus bloques
            de contenido? Esta acción no se puede deshacer.
          </p>
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => setDeletingLessonId(null)}
            >
              Cancelar
            </Button>
            <Button
              variant="danger"
              loading={loadingLessonId === deletingLessonId}
              onClick={() =>
                deletingLessonId && handleDeleteLesson(deletingLessonId)
              }
            >
              Eliminar
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
