import { useState, useCallback, useMemo, useRef } from 'react';
import { Copy, Check } from 'lucide-react';
import Prism from 'prismjs';
import 'prismjs/components/prism-java';
import 'prismjs/components/prism-sql';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-bash';
import 'prismjs/components/prism-python';

interface CodeBlockProps {
  content: string;
  language?: string;
}

/**
 * CodeBlock — Syntax-highlighted code display using PrismJS.
 *
 * Architecture:
 * - rawCode: the original source string, NEVER modified
 * - PrismJS tokenizes rawCode into tokens with CSS classes
 * - dangerouslySetInnerHTML renders the highlighted tokens
 * - Copy button always uses rawCode
 *
 * The raw code string is NEVER reconstructed from highlighted HTML.
 */
export function CodeBlock({ content, language = '' }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);
  const codeRef = useRef<HTMLPreElement>(null);

  // Raw code — this is the single source of truth
  const rawCode = content;

  // Map language aliases to Prism grammar keys
  const langMap: Record<string, string> = {
    java: 'java',
    sql: 'sql',
    json: 'json',
    bash: 'bash',
    shell: 'bash',
    sh: 'bash',
    python: 'python',
    py: 'python',
    javascript: 'javascript',
    js: 'javascript',
    typescript: 'typescript',
    ts: 'typescript',
    html: 'markup',
    css: 'css',
    xml: 'markup',
  };

  const prismLang = langMap[language.toLowerCase()] || '';

  // Tokenize with PrismJS — this produces HTML with CSS classes
  const highlightedHtml = useMemo(() => {
    if (prismLang && Prism.languages[prismLang]) {
      return Prism.highlight(rawCode, Prism.languages[prismLang], prismLang);
    }
    // No grammar — just escape HTML
    return rawCode
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }, [rawCode, prismLang]);

  // Split highlighted HTML into lines for line numbers
  const lines = useMemo(() => highlightedHtml.split('\n'), [highlightedHtml]);

  // Copy handler — ALWAYS copies rawCode
  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(rawCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = rawCode;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [rawCode]);

  return (
    <figure className="my-4 overflow-hidden rounded-xl border border-gray-200 shadow-lg dark:border-gray-700">
      {/* Header bar */}
      <div className="flex items-center justify-between bg-slate-800 px-4 py-2">
        <div className="flex items-center gap-3">
          {/* Traffic lights */}
          <div className="flex gap-1.5" aria-hidden="true">
            <div className="h-3 w-3 rounded-full bg-red-500/80" />
            <div className="h-3 w-3 rounded-full bg-yellow-500/80" />
            <div className="h-3 w-3 rounded-full bg-green-500/80" />
          </div>
          {/* Language badge */}
          {language && (
            <span className="rounded-md bg-slate-700 px-2 py-0.5 text-xs font-medium text-slate-300">
              {language}
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={handleCopy}
          className="flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium text-slate-400 transition-colors hover:bg-slate-700 hover:text-white"
          aria-label={copied ? 'Copiado' : 'Copiar codigo'}
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

      {/* Code body */}
      <div className="overflow-x-auto bg-slate-900">
        <table className="w-full border-collapse" role="presentation">
          <tbody>
            {lines.map((line, i) => (
              <tr key={i} className="hover:bg-slate-800/50">
                {/* Line number */}
                <td className="select-none border-r border-slate-700/50 py-0 pl-4 pr-3 text-right align-top">
                  <span className="inline-block min-w-[2ch] text-xs leading-6 text-slate-500">
                    {i + 1}
                  </span>
                </td>
                {/* Code line — rendered from PrismJS highlighted HTML */}
                <td className="px-4 py-0">
                  <pre ref={codeRef} className="m-0 text-sm leading-6">
                    <code
                      className={`font-mono text-slate-100 ${prismLang ? `language-${prismLang}` : ''}`}
                      dangerouslySetInnerHTML={{ __html: line || ' ' }}
                    />
                  </pre>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </figure>
  );
}
