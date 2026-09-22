import { useState, useCallback } from 'react';
import { Copy, Check } from 'lucide-react';

interface CodeEditorProps {
  value: string;
  onChange?: (value: string) => void;
  language?: string;
  readOnly?: boolean;
  placeholder?: string;
}

/**
 * Code editor placeholder for Monaco integration.
 * Currently uses a styled textarea. When Monaco is ready:
 * 1. Install @monaco-editor/react
 * 2. Replace textarea with <Editor /> component
 * 3. Lazy load: React.lazy(() => import('@monaco-editor/react'))
 */
export function CodeEditor({
  value,
  onChange,
  language = 'java',
  readOnly = false,
  placeholder = '// Escribe tu codigo aqui...',
}: CodeEditorProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [value]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (readOnly || !onChange) return;

      if (e.key === 'Tab') {
        e.preventDefault();
        const textarea = e.currentTarget;
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const newValue = value.substring(0, start) + '    ' + value.substring(end);
        onChange(newValue);
        requestAnimationFrame(() => {
          textarea.selectionStart = start + 4;
          textarea.selectionEnd = start + 4;
        });
      }
    },
    [value, onChange, readOnly],
  );

  return (
    <div className="relative rounded-lg border border-gray-200 bg-gray-950 dark:border-gray-700">
      <div className="flex items-center justify-between border-b border-gray-700 px-4 py-2">
        <span className="text-xs font-medium text-gray-400">{language}</span>
        <button
          type="button"
          onClick={handleCopy}
          className="flex items-center gap-1 rounded-md px-2 py-1 text-xs text-gray-400 transition-colors hover:bg-gray-800 hover:text-gray-200"
          title="Copiar codigo"
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5 text-emerald-400" />
              <span className="text-emerald-400">Copiado</span>
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5" />
              <span>Copiar</span>
            </>
          )}
        </button>
      </div>
      <textarea
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        onKeyDown={handleKeyDown}
        readOnly={readOnly}
        placeholder={placeholder}
        spellCheck={false}
        className="min-h-[200px] w-full resize-y bg-transparent p-4 font-mono text-sm leading-relaxed text-gray-100 placeholder:text-gray-600 focus:outline-none disabled:cursor-not-allowed disabled:opacity-60"
        style={{ tabSize: 4 }}
      />
    </div>
  );
}
