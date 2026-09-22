import { useState } from 'react';
import { PlusCircle, Pencil, Trash2, ChevronDown, ChevronRight, GripVertical } from 'lucide-react';
import type { Module, Lesson, ContentBlock } from '../../api/types';
import { coursesApi } from '../../api/modules/courses';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Dialog } from '../ui/dialog';
import { LessonEditor } from './lesson-editor';

interface ModuleEditorProps {
  courseId: string;
  modules: Module[];
  onModulesChange: (modules: Module[]) => void;
}

interface ModuleLessons {
  [moduleId: string]: Lesson[];
}

interface LessonBlocks {
  [lessonId: string]: ContentBlock[];
}

export function ModuleEditor({
  courseId,
  modules,
  onModulesChange,
}: ModuleEditorProps) {
  const [expandedModuleId, setExpandedModuleId] = useState<string | null>(null);
  const [lessonsMap, setLessonsMap] = useState<ModuleLessons>({});
  const [blocksMap, setBlocksMap] = useState<LessonBlocks>({});
  const [showAddModule, setShowAddModule] = useState(false);
  const [newModuleTitle, setNewModuleTitle] = useState('');
  const [editingModuleId, setEditingModuleId] = useState<string | null>(null);
  const [editModuleTitle, setEditModuleTitle] = useState('');
  const [deletingModuleId, setDeletingModuleId] = useState<string | null>(null);
  const [loadingModuleId, setLoadingModuleId] = useState<string | null>(null);

  const loadLessons = async (moduleId: string) => {
    try {
      const lessons = await coursesApi.listLessons(moduleId);
      setLessonsMap((prev) => ({ ...prev, [moduleId]: lessons }));
    } catch (err) {
      console.error('Failed to load lessons:', err);
    }
  };

  const loadBlocks = async (lessonId: string) => {
    try {
      const blocks = await coursesApi.listBlocks(lessonId);
      setBlocksMap((prev) => ({ ...prev, [lessonId]: blocks }));
    } catch (err) {
      console.error('Failed to load blocks:', err);
    }
  };

  const toggleModule = (moduleId: string) => {
    if (expandedModuleId === moduleId) {
      setExpandedModuleId(null);
    } else {
      setExpandedModuleId(moduleId);
      if (!lessonsMap[moduleId]) {
        loadLessons(moduleId);
      }
    }
  };

  const handleAddModule = async () => {
    if (!newModuleTitle.trim()) return;
    setLoadingModuleId('new');
    try {
      const newModule = await coursesApi.createModule(courseId, {
        title: newModuleTitle.trim(),
      });
      onModulesChange([...modules, newModule]);
      setNewModuleTitle('');
      setShowAddModule(false);
    } catch (err) {
      console.error('Failed to create module:', err);
    } finally {
      setLoadingModuleId(null);
    }
  };

  const handleUpdateModule = async (moduleId: string) => {
    if (!editModuleTitle.trim()) return;
    setLoadingModuleId(moduleId);
    try {
      const updated = await coursesApi.updateModule(courseId, moduleId, {
        title: editModuleTitle.trim(),
      });
      onModulesChange(
        modules.map((m) => (m.id === moduleId ? updated : m)),
      );
      setEditingModuleId(null);
      setEditModuleTitle('');
    } catch (err) {
      console.error('Failed to update module:', err);
    } finally {
      setLoadingModuleId(null);
    }
  };

  const handleDeleteModule = async (moduleId: string) => {
    setLoadingModuleId(moduleId);
    try {
      await coursesApi.deleteModule(courseId, moduleId);
      onModulesChange(modules.filter((m) => m.id !== moduleId));
      setDeletingModuleId(null);
      if (expandedModuleId === moduleId) {
        setExpandedModuleId(null);
      }
    } catch (err) {
      console.error('Failed to delete module:', err);
    } finally {
      setLoadingModuleId(null);
    }
  };

  const handleLessonsChange = (moduleId: string, lessons: Lesson[]) => {
    setLessonsMap((prev) => ({ ...prev, [moduleId]: lessons }));
  };

  const handleBlocksChange = (lessonId: string, blocks: ContentBlock[]) => {
    setBlocksMap((prev) => ({ ...prev, [lessonId]: blocks }));
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Módulos</h3>
        <Button size="sm" onClick={() => setShowAddModule(true)}>
          <PlusCircle className="h-4 w-4" />
          Agregar Módulo
        </Button>
      </div>

      {modules.length === 0 && (
        <Card>
          <p className="py-4 text-center text-sm text-gray-500">
            No hay módulos. Agrega el primer módulo para estructurar tu curso.
          </p>
        </Card>
      )}

      {modules
        .sort((a, b) => a.position - b.position)
        .map((module, index) => (
          <Card key={module.id} padding="none">
            {/* Module Header */}
            <div className="flex items-center gap-3 border-b border-gray-100 px-4 py-3">
              <GripVertical className="h-4 w-4 shrink-0 text-gray-300" />
              <button
                type="button"
                onClick={() => toggleModule(module.id)}
                className="flex flex-1 items-center gap-2 text-left"
              >
                {expandedModuleId === module.id ? (
                  <ChevronDown className="h-4 w-4 shrink-0 text-gray-400" />
                ) : (
                  <ChevronRight className="h-4 w-4 shrink-0 text-gray-400" />
                )}
                <Badge variant="info" size="sm">
                  {index + 1}
                </Badge>
                {editingModuleId === module.id ? (
                  <div className="flex flex-1 items-center gap-2">
                    <input
                      autoFocus
                      value={editModuleTitle}
                      onChange={(e) => setEditModuleTitle(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleUpdateModule(module.id);
                        if (e.key === 'Escape') setEditingModuleId(null);
                      }}
                      className="flex-1 rounded border border-blue-300 px-2 py-1 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                    <Button
                      size="sm"
                      onClick={() => handleUpdateModule(module.id)}
                      loading={loadingModuleId === module.id}
                    >
                      Guardar
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setEditingModuleId(null)}
                    >
                      Cancelar
                    </Button>
                  </div>
                ) : (
                  <span className="font-medium text-gray-900">
                    {module.title}
                  </span>
                )}
              </button>
              {editingModuleId !== module.id && (
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setEditingModuleId(module.id);
                      setEditModuleTitle(module.title);
                    }}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setDeletingModuleId(module.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5 text-red-500" />
                  </Button>
                </div>
              )}
            </div>

            {/* Module Lessons (expanded) */}
            {expandedModuleId === module.id && (
              <div className="px-4 py-3">
                <LessonEditor
                  moduleId={module.id}
                  lessons={lessonsMap[module.id] ?? []}
                  blocksMap={blocksMap}
                  onLessonsChange={(lessons) =>
                    handleLessonsChange(module.id, lessons)
                  }
                  onBlocksChange={handleBlocksChange}
                  onBlocksLoad={loadBlocks}
                />
              </div>
            )}
          </Card>
        ))}

      {/* Add Module Dialog */}
      <Dialog
        open={showAddModule}
        onClose={() => {
          setShowAddModule(false);
          setNewModuleTitle('');
        }}
        title="Agregar Módulo"
      >
        <div className="space-y-4">
          <Input
            label="Título del Módulo"
            required
            placeholder="Módulo 1: Introducción"
            value={newModuleTitle}
            onChange={(e) => setNewModuleTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleAddModule();
            }}
          />
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => {
                setShowAddModule(false);
                setNewModuleTitle('');
              }}
            >
              Cancelar
            </Button>
            <Button
              loading={loadingModuleId === 'new'}
              onClick={handleAddModule}
            >
              Agregar
            </Button>
          </div>
        </div>
      </Dialog>

      {/* Delete Module Confirmation */}
      <Dialog
        open={deletingModuleId !== null}
        onClose={() => setDeletingModuleId(null)}
        title="Eliminar Módulo"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            ¿Estás seguro de que deseas eliminar este módulo y todas sus clases?
            Esta acción no se puede deshacer.
          </p>
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => setDeletingModuleId(null)}
            >
              Cancelar
            </Button>
            <Button
              variant="danger"
              loading={loadingModuleId === deletingModuleId}
              onClick={() =>
                deletingModuleId && handleDeleteModule(deletingModuleId)
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
