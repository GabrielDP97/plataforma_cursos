import { ExternalLink, Download, FileText, Play, Film } from 'lucide-react';
import { CodeBlock } from './CodeBlock';
import { TextBlock } from './TextBlock';

interface ContentBlock {
  type: string;
  title?: string;
  content?: string;
  metadata?: Record<string, unknown>;
}

interface ContentBlockRendererProps {
  blocks: ContentBlock[];
}

/**
 * VideoBlock — Rendered as a compact badge/link, NOT a main content block.
 * Videos are secondary in the activity-focused design.
 */
function VideoBlock({ title, metadata }: { title?: string; metadata?: Record<string, unknown> }) {
  const duration = metadata?.duration as string | undefined;

  return (
    <div className="flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 transition-colors hover:bg-gray-100 dark:border-gray-800/50 dark:bg-[#12121a] dark:hover:bg-gray-800/50">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-violet-200 bg-violet-50 dark:border-violet-500/20 dark:bg-violet-500/10">
        <Film className="h-4 w-4 text-violet-600 dark:text-violet-400" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-800 truncate dark:text-gray-300">
          {title || 'Video explicativo'}
        </p>
        {duration && (
          <p className="text-[11px] text-gray-500 font-mono">{duration}</p>
        )}
      </div>
      <Play className="h-4 w-4 text-gray-400 dark:text-gray-500" />
    </div>
  );
}

function FileBlock({ content, title, metadata }: { content?: string; title?: string; metadata?: Record<string, unknown> }) {
  const fileName = (metadata?.fileName as string) || title || 'Archivo';
  const fileSize = metadata?.fileSize as number | undefined;

  return (
    <a
      href={content}
      download
      className="flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 p-3 transition-colors hover:bg-gray-100 dark:border-gray-800/50 dark:bg-[#12121a] dark:hover:bg-gray-800/50"
    >
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-blue-200 bg-blue-50 dark:border-blue-500/20 dark:bg-blue-500/10">
        <FileText className="h-4 w-4 text-blue-600 dark:text-blue-400" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-800 truncate dark:text-gray-300">{fileName}</p>
        {fileSize && (
          <p className="text-[11px] text-gray-500">{(fileSize / 1024).toFixed(1)} KB</p>
        )}
      </div>
      <Download className="h-4 w-4 shrink-0 text-gray-400 dark:text-gray-500" />
    </a>
  );
}

function LinkBlock({ content, title, metadata }: { content?: string; title?: string; metadata?: Record<string, unknown> }) {
  const linkTitle = title || (metadata?.title as string) || content;
  const description = metadata?.description as string | undefined;

  return (
    <a
      href={content}
      target="_blank"
      rel="noopener noreferrer"
      className="block rounded-lg border border-gray-200 bg-gray-50 p-3 transition-colors hover:bg-gray-100 dark:border-gray-800/50 dark:bg-[#12121a] dark:hover:bg-gray-800/50"
    >
      <div className="flex items-start gap-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-cyan-200 bg-cyan-50 dark:border-cyan-500/20 dark:bg-cyan-500/10">
          <ExternalLink className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-800 dark:text-gray-300">{linkTitle}</p>
          {description && (
            <p className="mt-1 text-xs text-gray-500 line-clamp-2">{description}</p>
          )}
          <p className="mt-0.5 text-[11px] text-gray-500 truncate font-mono">{content}</p>
        </div>
      </div>
    </a>
  );
}

/**
 * ContentBlockRenderer — Dispatches content blocks to type-specific renderers.
 *
 * Design: schematic, tech-forward. Text and code are primary. Video is secondary.
 */
export function ContentBlockRenderer({ blocks }: ContentBlockRendererProps) {
  if (blocks.length === 0) {
    return (
      <div className="flex items-center justify-center py-12 text-gray-600 dark:text-gray-500">
        <p className="text-sm">No hay contenido disponible para esta leccion.</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {blocks.map((block, index) => {
        switch (block.type) {
          case 'text':
            return (
              <section key={index}>
                {block.title && (
                  <h3 className="mb-2 text-base font-bold text-gray-900 dark:text-white">{block.title}</h3>
                )}
                <TextBlock content={block.content || ''} />
              </section>
            );
          case 'code':
            return (
              <section key={index}>
                {block.title && (
                  <h3 className="mb-2 text-base font-bold text-gray-900 dark:text-white">{block.title}</h3>
                )}
                <CodeBlock content={block.content || ''} language={String(block.metadata?.language || '')} />
              </section>
            );
          case 'video':
            return <VideoBlock key={index} title={block.title} metadata={block.metadata} />;
          case 'file':
            return <FileBlock key={index} content={block.content} title={block.title} metadata={block.metadata} />;
          case 'link':
            return <LinkBlock key={index} content={block.content} title={block.title} metadata={block.metadata} />;
          default:
            return null;
        }
      })}
    </div>
  );
}
