// Legacy service — not used by the current simplified product.
// Kept as a stub to satisfy TypeScript compilation.

type ParsedCase = {
  input: string;
  expectedOutput: string;
  taskType: string;
  tags: string[];
  difficulty: string;
};

export function parseDatasetFile(_fileName: string, _content: string): ParsedCase[] {
  return [];
}
