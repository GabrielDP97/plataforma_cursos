import { Terminal, CheckCircle, XCircle, Loader2, AlertTriangle } from 'lucide-react';
import type { CodeExecutionResult } from '../../../services/CodeExecutionProvider';

interface OutputPanelProps {
  result: CodeExecutionResult | null;
  isRunning: boolean;
}

export function OutputPanel({ result, isRunning }: OutputPanelProps) {
  if (isRunning) {
    return (
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Ejecutando...</span>
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900">
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <Terminal className="h-4 w-4" />
          <span>La salida aparecera aqui despues de ejecutar el codigo.</span>
        </div>
      </div>
    );
  }

  const isMock = result.executionResult?.provider === 'mock';

  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
      {/* Mock warning banner */}
      {isMock && (
        <div className="flex items-center gap-2 bg-amber-50 px-4 py-2 text-xs font-medium text-amber-700 dark:bg-amber-950/30 dark:text-amber-400">
          <AlertTriangle className="h-3.5 w-3.5" />
          <span>Simulacion — el codigo NO ha sido ejecutado realmente.</span>
        </div>
      )}

      {/* Status bar */}
      <div
        className={`flex items-center gap-2 px-4 py-2 text-sm font-medium ${
          isMock
            ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400'
            : result.success
            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400'
            : 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400'
        }`}
      >
        {isMock ? (
          <AlertTriangle className="h-4 w-4" />
        ) : result.success ? (
          <CheckCircle className="h-4 w-4" />
        ) : (
          <XCircle className="h-4 w-4" />
        )}
        <span>
          {isMock
            ? 'Entorno de ejecucion no disponible'
            : result.success
            ? 'Ejecucion exitosa'
            : 'Error de ejecucion'}
        </span>
      </div>

      {/* Output */}
      <div className="bg-gray-950 p-4">
        <pre className="whitespace-pre-wrap font-mono text-sm text-gray-100">
          {result.output}
        </pre>
        {result.error && (
          <pre className="mt-2 whitespace-pre-wrap font-mono text-sm text-red-400">
            {result.error}
          </pre>
        )}
      </div>

      {/* Test results */}
      {result.testResults && result.testResults.length > 0 && (
        <div className="border-t border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900">
          <p className="mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">
            {isMock ? 'Resultados de simulacion (NO VERIFICADOS)' : 'Resultados de validacion'}
          </p>
          <ul className="space-y-1">
            {result.testResults.map((test) => (
              <li key={test.name} className="flex items-center gap-2 text-sm">
                {isMock ? (
                  <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
                ) : test.passed ? (
                  <CheckCircle className="h-3.5 w-3.5 text-emerald-500" />
                ) : (
                  <XCircle className="h-3.5 w-3.5 text-red-500" />
                )}
                <span className="text-gray-700 dark:text-gray-300">{test.name}</span>
                {test.output && (
                  <span className="text-gray-400">— {test.output}</span>
                )}
              </li>
            ))}
          </ul>
          {isMock && (
            <p className="mt-2 text-xs text-amber-600 dark:text-amber-500">
              Estos resultados son de simulacion. El ejercicio NO se ha completado.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
