/**
 * Evaluation method metadata and descriptions
 * Based on industry research: Braintrust, LangChain, Opik
 */

export interface EvaluationMethodInfo {
  name: string;
  displayName: string;
  category: 'code' | 'llm' | 'hybrid';
  description: string;
  defaultConfig?: Record<string, unknown>;
  examples: {
    pass: Array<{ input: string; reason: string }>;
    fail: Array<{ input: string; reason: string }>;
  };
  cost: string;
  latency: string;
  useWhen: string;
  dontUseWhen?: string;
}

export const EVALUATION_METHODS: Record<string, EvaluationMethodInfo> = {
  exact_match: {
    name: 'exact_match',
    displayName: 'Exact Match',
    category: 'code',
    description: 'Exact string comparison (case-insensitive, whitespace trimmed)',
    defaultConfig: {
      ignore_case: true,
      ignore_punctuation: false,
      ignore_whitespace: true,
    },
    examples: {
      pass: [
        { input: "'Tokyo' == 'tokyo'", reason: 'Case ignored' },
        { input: "'4' == '  4  '", reason: 'Whitespace trimmed' },
      ],
      fail: [
        { input: "'Tokyo' != 'Tokyo, Japan'", reason: 'Extra text' },
        { input: "'4' != 'four'", reason: 'Different representation' },
      ],
    },
    cost: 'Free',
    latency: '<1ms',
    useWhen: 'Single-word answers, math, exact factual Q&A',
    dontUseWhen: 'LLM output is verbose or reformulated',
  },

  contains: {
    name: 'contains',
    displayName: 'Contains',
    category: 'code',
    description: 'Check if output contains expected substring (case-insensitive)',
    defaultConfig: {
      ignore_case: true,
    },
    examples: {
      pass: [
        { input: "'Tokyo' in 'The capital is Tokyo'", reason: 'Substring found' },
        { input: "'error' in 'An error occurred'", reason: 'Keyword present' },
      ],
      fail: [
        { input: "'Tokyo' not in 'Kyoto'", reason: 'Substring missing' },
        { input: "'success' not in 'failed'", reason: 'Wrong keyword' },
      ],
    },
    cost: 'Free',
    latency: '<1ms',
    useWhen: 'Keywords in verbose responses, flexible matching',
    dontUseWhen: 'Need exact wording or format validation',
  },

  json_exact: {
    name: 'json_exact',
    displayName: 'JSON Exact',
    category: 'code',
    description: 'Parse as JSON and check deep equality',
    defaultConfig: {
      ignore_array_order: false,
    },
    examples: {
      pass: [
        { input: '{"a": 1} == {"a": 1}', reason: 'Objects match' },
        { input: '{"a":1} == {"a": 1}', reason: 'Formatting ignored' },
      ],
      fail: [
        { input: '{"a": 1} != {"a": 2}', reason: 'Values differ' },
        { input: '{"a": 1} != {"a": 1, "b": 2}', reason: 'Extra field' },
      ],
    },
    cost: 'Free',
    latency: '<1ms',
    useWhen: 'Structured data, JSON APIs, configuration outputs',
    dontUseWhen: 'Output might not be valid JSON',
  },

  levenshtein: {
    name: 'levenshtein',
    displayName: 'Levenshtein Distance',
    category: 'code',
    description: 'Fuzzy string matching using edit distance (similarity score 0-1)',
    defaultConfig: {
      threshold: 0.8,
      normalize: true,
    },
    examples: {
      pass: [
        { input: "'hello' ≈ 'helo' (0.9)", reason: 'One typo OK' },
        { input: "'Tokyo' ≈ 'Tokio' (0.9)", reason: 'Minor variation' },
      ],
      fail: [
        { input: "'Tokyo' ≈ 'Paris' (0.0)", reason: 'Completely different' },
        { input: "'yes' ≈ 'maybe' (0.4)", reason: 'Below threshold' },
      ],
    },
    cost: 'Free',
    latency: '<1ms',
    useWhen: 'Typos acceptable, minor spelling variations',
    dontUseWhen: 'Need exact match or semantic understanding',
  },

  llm_factuality: {
    name: 'llm_factuality',
    displayName: 'LLM Factuality Judge',
    category: 'llm',
    description: 'LLM evaluates if output is factually correct',
    defaultConfig: {
      judge_model: 'gpt-4o-mini',
    },
    examples: {
      pass: [
        { input: 'Semantically correct', reason: 'Facts align' },
        { input: 'Rephrased correctly', reason: 'Meaning preserved' },
      ],
      fail: [
        { input: 'Hallucination', reason: 'Made up facts' },
        { input: 'Wrong information', reason: 'Incorrect data' },
      ],
    },
    cost: '$0.001-0.01',
    latency: '~2s',
    useWhen: 'Complex factual questions, semantic correctness',
    dontUseWhen: 'Simple exact answers suffice (use exact_match instead)',
  },

  // Keep existing methods
  llm_judge: {
    name: 'llm_judge',
    displayName: 'LLM Judge',
    category: 'llm',
    description: 'LLM evaluates output quality (placeholder implementation)',
    examples: {
      pass: [{ input: 'Good quality output', reason: 'Meets criteria' }],
      fail: [{ input: 'Poor quality', reason: 'Fails criteria' }],
    },
    cost: '$0.001-0.01',
    latency: '~2s',
    useWhen: 'Subjective quality evaluation',
  },

  hybrid: {
    name: 'hybrid',
    displayName: 'Hybrid (Code + LLM)',
    category: 'hybrid',
    description: 'Code check first, LLM fallback if needed',
    examples: {
      pass: [{ input: 'Passes either check', reason: 'Flexible' }],
      fail: [{ input: 'Fails both checks', reason: 'Neither passed' }],
    },
    cost: '$0-0.01',
    latency: '<1ms - 2s',
    useWhen: 'Complex tasks needing multiple validation approaches',
  },
};

/**
 * Get method info with fallback
 */
export function getMethodInfo(method: string): EvaluationMethodInfo {
  return EVALUATION_METHODS[method] || EVALUATION_METHODS.exact_match;
}

/**
 * Get all method names
 */
export function getAllMethodNames(): string[] {
  return Object.keys(EVALUATION_METHODS);
}

/**
 * Get methods by category
 */
export function getMethodsByCategory(category: 'code' | 'llm' | 'hybrid'): EvaluationMethodInfo[] {
  return Object.values(EVALUATION_METHODS).filter(m => m.category === category);
}
