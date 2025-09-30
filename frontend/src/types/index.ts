// TypeScript interfaces matching backend schema exactly

export interface EvalTask {
  id: number;
  task_version: string;  // CRITICAL: Version from day 1
  name: string;
  description?: string;
  input: string;
  expected_output?: string;
  ground_truth?: string;
  task_type: 'classification' | 'generation';
  evaluation_method: 'code' | 'llm_judge' | 'hybrid';
  rubric?: string;
  tags: string[];  // JSON array, not comma-separated
  project?: string;
  created_at: string;
  updated_at: string;
}

export interface Model {
  id: number;
  provider: string;
  model_name: string;
  prompt_version: string;
  config: Record<string, any>;
  api_key_hash?: string;
  created_at: string;
}

export interface EvalResult {
  id: number;
  task_id: number;
  model_id: number;
  run_id: string;
  model_output: string;
  passed?: boolean;
  score?: number;
  metrics: Record<string, number>;
  error_category?: string;
  latency_ms: number;
  cost_usd: number;
  evaluated_at: string;
}

export interface EvalRun {
  id: string;
  name?: string;
  description?: string;
  task_ids: number[];
  model_ids: number[];
  status: 'running' | 'completed' | 'failed';
  started_at: string;
  completed_at?: string;
  total_tasks: number;
  completed_tasks: number;
  failed_tasks: number;
}

// Form types for UI components
export interface TaskFormData {
  name: string;
  description?: string;
  input: string;
  expected_output?: string;
  ground_truth?: string;
  task_type: 'classification' | 'generation';
  evaluation_method: 'code' | 'llm_judge' | 'hybrid';
  rubric?: string;
  tags: string[];
  project?: string;
}

export interface ModelFormData {
  provider: string;
  model_name: string;
  prompt_version: string;
  config: {
    temperature?: number;
    max_tokens?: number;
    top_p?: number;
  };
  api_key?: string;
}

// Dashboard metrics
export interface DashboardMetrics {
  total_tasks: number;
  total_models: number;
  total_runs: number;
  overall_pass_rate: number;
  pass_rate_trend: number; // percentage change from last period
  critical_failures: number;
  cost_today: number;
  cost_budget: number;
  recent_runs: EvalRun[];
}

// Error categories from expert rubric
export type ErrorCategory = 
  | 'hallucination'
  | 'format_violation'
  | 'refusal_failure'
  | 'over_confidence'
  | 'under_confidence'
  | 'context_loss'
  | 'instruction_following'
  | 'accuracy'
  | 'incomplete'
  | 'off_topic'
  | 'bias';

export const ERROR_CATEGORIES: Record<ErrorCategory, string> = {
  hallucination: 'Model invented facts, features, or capabilities',
  format_violation: 'Model broke expected output structure',
  refusal_failure: 'Model refused to answer when it should have',
  over_confidence: 'Model gave wrong answers with high confidence',
  under_confidence: 'Model refused/hedged on questions it should know',
  context_loss: 'Model forgot earlier parts of conversation',
  instruction_following: 'Model ignored specific user instructions',
  accuracy: 'Model gave incorrect factual information',
  incomplete: 'Model gave partial or incomplete response',
  off_topic: 'Model response was not relevant to the question',
  bias: 'Model response showed demographic or other bias'
};
