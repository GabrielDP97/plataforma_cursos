/**
 * Exact Output Comparator
 * 
 * Compares actual program output against expected output.
 * Normalization: CRLF -> LF, optional trailing newline strip.
 * No case normalization, no space collapsing.
 */

export interface OutputComparison {
  match: boolean;
  actual: string;
  expected: string;
  differences?: string;
}

export function normalizeOutput(output: string, stripTrailingNewline = true): string {
  let normalized = output.replace(/\r\n/g, '\n');
  if (stripTrailingNewline && normalized.endsWith('\n')) {
    normalized = normalized.slice(0, -1);
  }
  return normalized;
}

export function compareExactOutput(
  actual: string,
  expected: string,
  options: { stripTrailingNewline?: boolean } = {}
): OutputComparison {
  const normActual = normalizeOutput(actual, options.stripTrailingNewline);
  const normExpected = normalizeOutput(expected, options.stripTrailingNewline);

  if (normActual === normExpected) {
    return { match: true, actual: normActual, expected: normExpected };
  }

  const actualLines = normActual.split('\n');
  const expectedLines = normExpected.split('\n');
  const diffs: string[] = [];

  if (actualLines.length !== expectedLines.length) {
    diffs.push('Lineas esperadas: ' + expectedLines.length + ', obtenidas: ' + actualLines.length);
  }

  const max = Math.max(actualLines.length, expectedLines.length);
  for (let i = 0; i < max; i++) {
    const a = actualLines[i] || '';
    const e = expectedLines[i] || '';
    if (a !== e) {
      diffs.push('Linea ' + (i+1) + ': esperado "' + e + '" vs obtenido "' + a + '"');
    }
  }

  return { match: false, actual: normActual, expected: normExpected, differences: diffs.join('\n') };
}

export function matchesExpectedOutput(actual: string, expected: string, opts?: { stripTrailingNewline?: boolean }): boolean {
  return compareExactOutput(actual, expected, opts).match;
}
