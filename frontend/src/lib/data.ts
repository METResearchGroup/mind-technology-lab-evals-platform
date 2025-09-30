// Data loading utilities for dummy data
import { EvalTask, Model, EvalResult, EvalRun, DashboardMetrics } from '@/types';

// Simulate API delay for realistic testing
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function loadTasks(): Promise<EvalTask[]> {
  await delay(300); // Simulate network delay
  const response = await fetch('/data/tasks.json');
  if (!response.ok) {
    throw new Error('Failed to load tasks');
  }
  return response.json();
}

export async function loadModels(): Promise<Model[]> {
  await delay(200);
  const response = await fetch('/data/models.json');
  if (!response.ok) {
    throw new Error('Failed to load models');
  }
  return response.json();
}

export async function loadResults(): Promise<EvalResult[]> {
  await delay(400);
  const response = await fetch('/data/results.json');
  if (!response.ok) {
    throw new Error('Failed to load results');
  }
  return response.json();
}

export async function loadRuns(): Promise<EvalRun[]> {
  await delay(250);
  const response = await fetch('/data/runs.json');
  if (!response.ok) {
    throw new Error('Failed to load runs');
  }
  return response.json();
}

export async function loadDashboardMetrics(): Promise<DashboardMetrics> {
  await delay(150);
  const response = await fetch('/data/dashboard.json');
  if (!response.ok) {
    throw new Error('Failed to load dashboard metrics');
  }
  return response.json();
}

// Utility functions for data manipulation
export function getTaskById(tasks: EvalTask[], id: number): EvalTask | undefined {
  return tasks.find(task => task.id === id);
}

export function getModelById(models: Model[], id: number): Model | undefined {
  return models.find(model => model.id === id);
}

export function getResultsByRunId(results: EvalResult[], runId: string): EvalResult[] {
  return results.filter(result => result.run_id === runId);
}

export function getResultsByTaskId(results: EvalResult[], taskId: number): EvalResult[] {
  return results.filter(result => result.task_id === taskId);
}

export function getResultsByModelId(results: EvalResult[], modelId: number): EvalResult[] {
  return results.filter(result => result.model_id === modelId);
}

export function filterResultsByStatus(results: EvalResult[], status: 'passed' | 'failed' | 'all'): EvalResult[] {
  if (status === 'all') return results;
  return results.filter(result => 
    status === 'passed' ? result.passed === true : result.passed === false
  );
}

export function calculatePassRate(results: EvalResult[]): number {
  if (results.length === 0) return 0;
  const passed = results.filter(r => r.passed === true).length;
  return passed / results.length;
}

export function calculateAverageScore(results: EvalResult[]): number {
  if (results.length === 0) return 0;
  const totalScore = results.reduce((sum, result) => sum + (result.score || 0), 0);
  return totalScore / results.length;
}

export function calculateTotalCost(results: EvalResult[]): number {
  return results.reduce((sum, result) => sum + result.cost_usd, 0);
}

export function calculateAverageLatency(results: EvalResult[]): number {
  if (results.length === 0) return 0;
  const totalLatency = results.reduce((sum, result) => sum + result.latency_ms, 0);
  return totalLatency / results.length;
}

// Error analysis utilities
export function getErrorCategoryCounts(results: EvalResult[]): Record<string, number> {
  const counts: Record<string, number> = {};
  results.forEach(result => {
    if (result.error_category) {
      counts[result.error_category] = (counts[result.error_category] || 0) + 1;
    }
  });
  return counts;
}

export function getTopFailingTasks(results: EvalResult[], tasks: EvalTask[]): Array<{task: EvalTask, failRate: number}> {
  const taskFailRates: Record<number, {total: number, failed: number}> = {};
  
  results.forEach(result => {
    if (!taskFailRates[result.task_id]) {
      taskFailRates[result.task_id] = { total: 0, failed: 0 };
    }
    taskFailRates[result.task_id].total++;
    if (result.passed === false) {
      taskFailRates[result.task_id].failed++;
    }
  });

  return Object.entries(taskFailRates)
    .map(([taskId, stats]) => ({
      task: tasks.find(t => t.id === parseInt(taskId))!,
      failRate: stats.failed / stats.total
    }))
    .filter(item => item.task)
    .sort((a, b) => b.failRate - a.failRate)
    .slice(0, 5);
}
