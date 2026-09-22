import { useState } from 'react';
import {
  PlusCircle,
  Pencil,
  Trash2,
  Type,
  Video,
  FileCode,
  File,
  Link,
} from 'lucide-react';
import type { ContentBlock } from '../../api/types';
import { coursesApi } from '../../api/modules/courses';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Dialog } from '../ui/dialog';

interface ContentBlockEditorProps {
  lessonId: string;
  blocks: ContentBlock[];
  onBlocksChange: (blocks: ContentBlock[]) => void;
}

const BLOCK_TYPE_LABELS: Record<ContentBlock['type'], string> = {
  text: 'Texto',
  video: 'Video',
  code: 'Código',
  file: 'Archivo',
  link: 'Enlace',
};

const BLOCK_TYPE_ICONS: Record<ContentBlock['type'], typeof Type> = {
  text: Type,
  video: Video,
  code: FileCode,
  file: File,
  link: Link,
};

export function ContentBlockEditor({
  lessonId,
  blocks,
  onBlocksChange,
}: ContentBlockEditorProps) {
  const [showAddBlock, setShowAddBlock] = useState(false);
  const [newBlockType, setNewBlockType] = useState<ContentBlock['type']>('text');
  const [newBlockContent, setNewBlockContent] = useState('');
  const [editingBlockId, setEditingBlockId] = useState<string | null>(null);
  const [editBlockContent, setEditBlockContent] = useState('');
  const [deletingBlockId, setDeletingBlockId] = useState<string | null>(null);
  const [loadingBlockId, setLoadingBlockId] = useState<string | null>(null);

  const handleAddBlock = async () => {
    if (!newBlockContent.trim()) return;
    setLoadingBlockId('new');
    try {
      const newBlock = await coursesApi.createBlock(lessonId, {
        type: newBlockType,
        content: newBlockContent.trim(),
      });
      onBlocksChange([...blocks, newBlock]);
      setNewBlockContent('');
      setNewBlockType('text');
      setShowAddBlock(false);
    } catch (err) {
      console.error('Failed to create block:', err);
    } finally {
      setLoadingBlockId(null);
    }
  };

  const handleUpdateBlock = async (blockId: string) => {
    if (!editBlockContent.trim()) return;
    setLoadingBlockId(blockId);
    try {
      const updated = await coursesApi.updateBlock(lessonId, blockId, {
        content: editBlockContent.trim(),
      });
      onBlocksChange(
        blocks.map((b) => (b.id === blockId ? updated : b)),
      );
      setEditingBlockId(null);
      setEditBlockContent('');
    } catch (err) {
      console.error('Failed to update block:', err);
    } finally {
      setLoadingBlockId(null);
    }
  };

  const handleDeleteBlock = async (blockId: string) => {
    setLoadingBlockId(blockId);
    try {
      await coursesApi.deleteBlock(lessonId, blockId);
      onBlocksChange(blocks.filter((b) => b.id !== blockId));
      setDeletingBlockId(null);
    } catch (err) {
      console.error('Failed to delete block:', err);
    } finally {
      setLoadingBlockId(null);
    }
  };

  const sortedBlocks = [...blocks].sort((a, b) => a.position - b.position);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-gray-600">
          Bloques de contenido
        </p>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => setShowAddBlock(true)}
        >
          <PlusCircle className="h-3 w-3" />
          Agregar
        </Button>
      </div>

      {blocks.length === 0 && (
        <p className="py-2 text-center text-xs text-gray-400">
          No hay bloques de contenido.
        </p>
      )}

      {sortedBlocks.map((block, index) => {
        const Icon = BLOCK_TYPE_ICONS[block.type];
        return (
          <div
            key={block.id}
            className="flex items-start gap-2 rounded border border-gray-100 bg-white px-3 py-2"
          >
            <Icon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gray-400" />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <Badge variant="default" size="sm">
                  {BLOCK_TYPE_LABELS[block.type]}
                </Badge>
                <span className="text-xs text-gray-400">#{index + 1}</span>
              </div>
              {editingBlockId === block.id ? (
                <div className="mt-2 space-y-2">
                  <textarea
                    autoFocus
                    value={editBlockContent}
                    onChange={(e) => setEditBlockContent(e.target.value)}
                    className="w-full rounded border border-blue-300 px-2 py-1 text-xs focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    rows={3}
                  />
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      onClick={() => handleUpdateBlock(block.id)}
                      loading={loadingBlockId === block.id}
                    >
                      Guardar
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setEditingBlockId(null)}
                    >
                      Cancelar
                    </Button>
                  </div>
                </div>
              ) : (
                <p className="mt-1 truncate text-xs text-gray-600">
                  {block.content}
                </p>
              )}
            </div>
            {editingBlockId !== block.id && (
              <div className="flex shrink-0 items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setEditingBlockId(block.id);
                    setEditBlockContent(block.content);
                  }}
                >
                  <Pencil className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setDeletingBlockId(block.id)}
                >
                  <Trash2 className="h-3 w-3 text-red-500" />
                </Button>
              </div>
            )}
          </div>
        );
      })}

      {/* Add Block Dialog */}
      <Dialog
        open={showAddBlock}
        onClose={() => {
          setShowAddBlock(false);
          setNewBlockContent('');
          setNewBlockType('text');
        }}
        title="Agregar Bloque de Contenido"
      >
        <div className="space-y-4">
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">
              Tipo de Bloque
            </label>
            <div className="flex flex-wrap gap-2">
              {(Object.keys(BLOCK_TYPE_LABELS) as ContentBlock['type'][]).map(
                (type) => {
                  const Icon = BLOCK_TYPE_ICONS[type];
                  return (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setNewBlockType(type)}
                      className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm transition-colors ${
                        newBlockType === type
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <Icon className="h-3.5 w-3.5" />
                      {BLOCK_TYPE_LABELS[type]}
                    </button>
                  );
                },
              )}
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">
              Contenido
            </label>
            <textarea
              value={newBlockContent}
              onChange={(e) => setNewBlockContent(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              rows={4}
              placeholder={
                newBlockType === 'text'
                  ? 'Escribe el contenido del texto...'
                  : newBlockType === 'video'
                    ? 'URL del video...'
                    : newBlockType === 'code'
                      ? 'Código...'
                      : newBlockType === 'link'
                        ? 'URL del enlace...'
                        : 'Descripción del archivo...'
              }
            />
          </div>

          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => {
                setShowAddBlock(false);
                setNewBlockContent('');
                setNewBlockType('text');
              }}
            >
              Cancelar
            </Button>
            <Button
              loading={loadingBlockId === 'new'}
              onClick={handleAddBlock}
            >
              Agregar
            </Button>
          </div>
        </div>
      </Dialog>

      {/* Delete Block Confirmation */}
      <Dialog
        open={deletingBlockId !== null}
        onClose={() => setDeletingBlockId(null)}
        title="Eliminar Bloque"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            ¿Estás seguro de que deseas eliminar este bloque de contenido? Esta
            acción no se puede deshacer.
          </p>
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => setDeletingBlockId(null)}
            >
              Cancelar
            </Button>
            <Button
              variant="danger"
              loading={loadingBlockId === deletingBlockId}
              onClick={() =>
                deletingBlockId && handleDeleteBlock(deletingBlockId)
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
