import { useState } from 'react';
import { ExternalLink, Download, FileText, Copy, Check } from 'lucide-react';
import type { ContentBlock } from '../../api/types';
import { TextBlock } from './TextBlock';

interface ContentRendererProps {
  blocks: ContentBlock[];
}

function VideoBlock({ content, metadata }: { content: string; metadata: Record<string, unknown> }) {
  // Video content contains the video URL; metadata may contain additional info
  const videoUrl = content;
  const posterUrl = metadata.posterUrl as string | undefined;

  return (
    <div className="aspect-video w-full overflow-hidden rounded-lg bg-black">
      <video
        src={videoUrl}
        poster={posterUrl}
        controls
        className="h-full w-full"
      >
        <track kind="captions" />
        Tu navegador no soporta el elemento de video.
      </video>
    </div>
  );
}

function CodeBlock({ content, metadata }: { content: string; metadata: Record<string, unknown> }) {
  const language = (metadata.language as string) || '';
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 shadow-sm">
      <div className="flex items-center justify-between bg-slate-800 px-4 py-2">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className="h-3 w-3 rounded-full bg-red-400" />
            <div className="h-3 w-3 rounded-full bg-yellow-400" />
            <div className="h-3 w-3 rounded-full bg-green-400" />
          </div>
          {language && (
            <span className="ml-2 text-xs font-medium text-slate-400">{language}</span>
          )}
        </div>
        <button
          type="button"
          onClick={handleCopy}
          className="flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium text-slate-400 transition-colors hover:bg-slate-700 hover:text-white"
          aria-label={copied ? 'Copiado' : 'Copiar código'}
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5" />
              Copiado
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5" />
              Copiar
            </>
          )}
        </button>
      </div>
      <pre className="overflow-x-auto bg-slate-900 p-4 text-sm leading-relaxed">
        <code className="text-slate-100 font-mono">{content}</code>
      </pre>
    </div>
  );
}

function FileBlock({ content, metadata }: { content: string; metadata: Record<string, unknown> }) {
  const fileName = (metadata.fileName as string) || 'Archivo';
  const fileSize = metadata.fileSize as number | undefined;

  return (
    <a
      href={content}
      download
      className="flex items-center gap-4 rounded-2xl border border-gray-200 bg-gray-50 p-4 transition-all hover:bg-gray-100 hover:shadow-sm"
    >
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-indigo-100">
        <FileText className="h-6 w-6 text-indigo-600" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-gray-900 truncate">{fileName}</p>
        {fileSize && (
          <p className="text-sm text-gray-500">
            {(fileSize / 1024).toFixed(1)} KB
          </p>
        )}
      </div>
      <Download className="h-5 w-5 shrink-0 text-gray-400" />
    </a>
  );
}

function LinkBlock({ content, metadata }: { content: string; metadata: Record<string, unknown> }) {
  const title = (metadata.title as string) || content;
  const description = metadata.description as string | undefined;

  return (
    <a
      href={content}
      target="_blank"
      rel="noopener noreferrer"
      className="block rounded-2xl border border-gray-200 bg-gray-50 p-4 transition-all hover:bg-gray-100 hover:shadow-sm"
    >
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan-100">
          <ExternalLink className="h-5 w-5 text-cyan-600" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-gray-900">{title}</p>
          {description && (
            <p className="mt-1 text-sm text-gray-500 line-clamp-2">{description}</p>
          )}
          <p className="mt-1 text-xs text-gray-400 truncate">{content}</p>
        </div>
      </div>
    </a>
  );
}

export function ContentRenderer({ blocks }: ContentRendererProps) {
  if (blocks.length === 0) {
    return (
      <div className="flex items-center justify-center py-12 text-gray-500">
        <p>No hay contenido disponible para esta lección.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {blocks.map((block) => {
        switch (block.type) {
          case 'text':
            return <TextBlock key={block.id} content={block.content} />;
          case 'video':
            return <VideoBlock key={block.id} content={block.content} metadata={block.metadata} />;
          case 'code':
            return <CodeBlock key={block.id} content={block.content} metadata={block.metadata} />;
          case 'file':
            return <FileBlock key={block.id} content={block.content} metadata={block.metadata} />;
          case 'link':
            return <LinkBlock key={block.id} content={block.content} metadata={block.metadata} />;
          default:
            return null;
        }
      })}
    </div>
  );
}
