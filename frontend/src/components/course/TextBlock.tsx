import { useMemo } from 'react';
import { CodeBlock } from './CodeBlock';

interface TextBlockProps {
  content: string;
}

// ── Segment types ──────────────────────────────────────────────────────────

type Segment =
  | { type: 'html'; html: string }
  | { type: 'code'; language: string; code: string };

// ── Inline formatting (returns HTML string for use inside paragraphs) ───────

function applyInline(text: string): string {
  let result = text;
  // Inline code
  result = result.replace(/`([^`]+)`/g, '<code class="rounded-md bg-slate-100 px-1.5 py-0.5 text-xs font-mono text-indigo-700 dark:bg-slate-800 dark:text-indigo-300">$1</code>');
  // Bold
  result = result.replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold text-gray-900 dark:text-white">$1</strong>');
  // Links
  result = result.replace(
    /\[([^\]]+)\]\(([^)]+)\)/g,
    '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-indigo-600 underline decoration-indigo-300 underline-offset-2 hover:text-indigo-800 dark:text-indigo-400 dark:decoration-indigo-700">$1</a>'
  );
  return result;
}

// ── Callout config ─────────────────────────────────────────────────────────

const CALLOUT_CONFIG: Record<string, { bg: string; border: string; text: string; icon: string }> = {
  note: {
    bg: 'bg-indigo-50 dark:bg-indigo-950/30',
    border: 'border-indigo-200 dark:border-indigo-800',
    text: 'text-indigo-800 dark:text-indigo-200',
    icon: '<svg class="h-5 w-5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>',
  },
  tip: {
    bg: 'bg-emerald-50 dark:bg-emerald-950/30',
    border: 'border-emerald-200 dark:border-emerald-800',
    text: 'text-emerald-800 dark:text-emerald-200',
    icon: '<svg class="h-5 w-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>',
  },
  warning: {
    bg: 'bg-amber-50 dark:bg-amber-950/30',
    border: 'border-amber-200 dark:border-amber-800',
    text: 'text-amber-800 dark:text-amber-200',
    icon: '<svg class="h-5 w-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" /></svg>',
  },
  importante: {
    bg: 'bg-amber-50 dark:bg-amber-950/30',
    border: 'border-amber-200 dark:border-amber-800',
    text: 'text-amber-800 dark:text-amber-200',
    icon: '<svg class="h-5 w-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" /></svg>',
  },
  aviso: {
    bg: 'bg-red-50 dark:bg-red-950/30',
    border: 'border-red-200 dark:border-red-800',
    text: 'text-red-800 dark:text-red-200',
    icon: '<svg class="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" /></svg>',
  },
  consejo: {
    bg: 'bg-emerald-50 dark:bg-emerald-950/30',
    border: 'border-emerald-200 dark:border-emerald-800',
    text: 'text-emerald-800 dark:text-emerald-200',
    icon: '<svg class="h-5 w-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>',
  },
};

// ── Markdown parser → segments ─────────────────────────────────────────────

function parseMarkdownToSegments(text: string): Segment[] {
  const lines = text.split('\n');
  const segments: Segment[] = [];
  let buffer: string[] = [];
  let inCallout = false;
  let calloutType = 'info';
  let calloutLines: string[] = [];

  function flushBuffer() {
    if (buffer.length > 0) {
      segments.push({ type: 'html', html: renderBlockHtml(buffer) });
      buffer = [];
    }
  }

  function flushCallout() {
    if (inCallout && calloutLines.length > 0) {
      const content = applyInline(calloutLines.join('\n'));
      const config = CALLOUT_CONFIG[calloutType] ?? CALLOUT_CONFIG.info;
      segments.push({
        type: 'html',
        html:
          `<div class="flex gap-3 rounded-xl border p-4 my-4 ${config.bg} ${config.border}" role="note">` +
          `<div class="shrink-0 mt-0.5">${config.icon}</div>` +
          `<div class="flex-1 text-sm leading-relaxed ${config.text}">${content}</div>` +
          `</div>`,
      });
      inCallout = false;
      calloutLines = [];
    }
  }

  let inCodeBlock = false;
  let codeLines: string[] = [];
  let codeLanguage = '';

  for (const raw of lines) {
    const line = raw.trimEnd();

    // ── Fenced code block ──────────────────────────────────────────────
    const fenceMatch = line.match(/^```(\w*)/);
    if (fenceMatch) {
      if (!inCodeBlock) {
        flushBuffer();
        flushCallout();
        inCodeBlock = true;
        codeLanguage = fenceMatch[1] || 'text';
        continue;
      }
      // Closing fence
      segments.push({ type: 'code', language: codeLanguage, code: codeLines.join('\n') });
      inCodeBlock = false;
      codeLines = [];
      codeLanguage = '';
      continue;
    }
    if (inCodeBlock) {
      codeLines.push(raw);
      continue;
    }

    // ── Callout ─────────────────────────────────────────────────────────
    const calloutMatch = line.match(/^>\s*(note|tip|warning|importante|aviso|consejo):\s*(.*)/i);
    if (calloutMatch) {
      flushBuffer();
      if (!inCallout) {
        inCallout = true;
        calloutType = calloutMatch[1].toLowerCase();
      }
      calloutLines.push(calloutMatch[2]);
      continue;
    }
    if (inCallout && line.startsWith('>')) {
      calloutLines.push(line.replace(/^>\s*/, ''));
      continue;
    }
    if (inCallout && !line.startsWith('>')) {
      flushCallout();
    }

    // ── Empty line ─────────────────────────────────────────────────────
    if (line.trim() === '') {
      flushBuffer();
      continue;
    }

    // ── Collect into buffer for block rendering ────────────────────────
    buffer.push(line);
  }

  flushBuffer();
  flushCallout();
  if (inCodeBlock && codeLines.length > 0) {
    segments.push({ type: 'code', language: codeLanguage || 'text', code: codeLines.join('\n') });
  }

  return segments;
}

// ── Render a buffer of non-code lines as HTML ──────────────────────────────

function renderBlockHtml(lines: string[]): string {
  const parts: string[] = [];
  let inList = false;

  function flushList() {
    if (inList) {
      parts.push('</ul>');
      inList = false;
    }
  }

  for (const raw of lines) {
    const line = raw.trimEnd();

    // Headers
    const h3 = line.match(/^###\s+(.*)/);
    if (h3) {
      flushList();
      parts.push(`<h4 class="mt-6 mb-2 text-lg font-bold text-gray-900 dark:text-white">${applyInline(h3[1])}</h4>`);
      continue;
    }
    const h2 = line.match(/^##\s+(.*)/);
    if (h2) {
      flushList();
      parts.push(`<h3 class="mt-8 mb-3 text-xl font-bold text-gray-900 dark:text-white">${applyInline(h2[1])}</h3>`);
      continue;
    }

    // List items
    const li = line.match(/^\s*[-*•]\s+(.*)/);
    if (li) {
      if (!inList) {
        parts.push('<ul class="my-3 space-y-1.5 pl-5 text-gray-700 dark:text-gray-300">');
        inList = true;
      }
      parts.push(`<li class="leading-relaxed list-disc text-sm">${applyInline(li[1])}</li>`);
      continue;
    }

    // Paragraph
    flushList();
    parts.push(`<p class="my-3 leading-relaxed text-sm text-gray-700 dark:text-gray-300">${applyInline(line)}</p>`);
  }

  flushList();
  return parts.join('\n');
}

// ── Component ──────────────────────────────────────────────────────────────

/**
 * TextBlock — Renders markdown-like content with proper fenced code block support.
 *
 * Parses into segments:
 * - HTML blocks (paragraphs, headers, lists, callouts)
 * - Code blocks → rendered via CodeBlock component with syntax highlighting
 */
export function TextBlock({ content }: TextBlockProps) {
  const segments = useMemo(() => parseMarkdownToSegments(content), [content]);

  return (
    <div className="prose prose-gray max-w-none text-gray-700 dark:text-gray-300">
      {segments.map((seg, i) => {
        if (seg.type === 'code') {
          return <CodeBlock key={i} content={seg.code} language={seg.language} />;
        }
        return <div key={i} dangerouslySetInnerHTML={{ __html: seg.html }} />;
      })}
    </div>
  );
}
