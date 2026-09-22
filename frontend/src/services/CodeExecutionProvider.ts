export interface ExecutionResult {
  provider: 'mock' | 'real';
  trusted: boolean;
  stdout: string;
  stderr: string;
  exitCode: number | null;
  timedOut: boolean;
  compilationSucceeded: boolean;
}

export interface CodeExecutionResult {
  success: boolean;
  output: string;
  error?: string;
  executionResult?: ExecutionResult;
  testResults?: { name: string; passed: boolean; output?: string }[];
}

export interface CodeExecutionProvider {
  execute(code: string, language: string): Promise<CodeExecutionResult>;
  validate(exerciseId: string, code: string): Promise<CodeExecutionResult>;
}

export class MockCodeExecutionProvider implements CodeExecutionProvider {
  async execute(_code: string, _language: string): Promise<CodeExecutionResult> {
    await new Promise((resolve) => setTimeout(resolve, 500));
    return {
      success: false,
      output: `[Entorno de ejecucion en desarrollo]\n\nEl codigo NO ha sido ejecutado realment.\nEsto es una simulacion de la interfaz de ejecucion.`,
      executionResult: {
        provider: 'mock',
        trusted: false,
        stdout: '',
        stderr: '',
        exitCode: null,
        timedOut: false,
        compilationSucceeded: false,
      },
    };
  }

  async validate(
    exerciseId: string,
    _code: string,
  ): Promise<CodeExecutionResult> {
    await new Promise((resolve) => setTimeout(resolve, 800));
    return {
      success: false,
      output: `Validacion real no disponible todavia.\nEl motor de ejecucion Java no esta implementado.\n\nEjercicio: ${exerciseId}`,
      executionResult: {
        provider: 'mock',
        trusted: false,
        stdout: '',
        stderr: '',
        exitCode: null,
        timedOut: false,
        compilationSucceeded: false,
      },
    };
  }
}

let _provider: CodeExecutionProvider | null = null;

export function getCodeExecutionProvider(): CodeExecutionProvider {
  if (!_provider) {
    _provider = new MockCodeExecutionProvider();
  }
  return _provider;
}

