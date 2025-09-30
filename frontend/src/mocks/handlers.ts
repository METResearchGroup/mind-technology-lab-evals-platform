/**
 * MSW Request Handlers for API Mocking
 * Used in tests to mock backend API responses
 */

import { http, HttpResponse } from 'msw';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Mock data
const mockTasks = [
  {
    id: 1,
    task_version: 'v1.0',
    name: 'Test Classification Task',
    description: 'A test task for classification',
    input: 'What is 2+2?',
    expected_output: '4',
    ground_truth: '4',
    task_type: 'classification',
    evaluation_method: 'code',
    rubric: null,
    tags: ['math', 'test'],
    project: 'Test Project',
    created_at: '2025-09-30T00:00:00Z',
    updated_at: '2025-09-30T00:00:00Z',
  },
];

const mockModels = [
  {
    id: 1,
    provider: 'openrouter',
    model_name: 'openai/gpt-4o-mini',
    prompt_version: 'v1',
    config: { temperature: 0.7 },
    created_at: '2025-09-30T00:00:00Z',
  },
];

const mockResults = [
  {
    id: 1,
    task_id: 1,
    model_id: 1,
    run_id: 'run-001',
    model_output: '4',
    passed: true,
    score: 1.0,
    metrics: { accuracy: 1.0 },
    error_category: null,
    latency_ms: 250,
    cost_usd: 0.00015,
    evaluated_at: '2025-09-30T00:00:00Z',
  },
];

export const handlers = [
  // Tasks endpoints
  http.get(`${API_URL}/api/tasks`, () => {
    return HttpResponse.json(mockTasks);
  }),

  http.get(`${API_URL}/api/tasks/:id`, ({ params }) => {
    const task = mockTasks.find((t) => t.id === Number(params.id));
    if (!task) {
      return new HttpResponse(null, { status: 404 });
    }
    return HttpResponse.json(task);
  }),

  http.post(`${API_URL}/api/tasks`, async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    const newTask = {
      id: mockTasks.length + 1,
      task_version: 'v1.0',
      ...body,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    mockTasks.push(newTask as typeof mockTasks[0]);
    return HttpResponse.json(newTask, { status: 201 });
  }),

  // Models endpoints
  http.get(`${API_URL}/api/models`, () => {
    return HttpResponse.json(mockModels);
  }),

  http.get(`${API_URL}/api/models/:id`, ({ params }) => {
    const model = mockModels.find((m) => m.id === Number(params.id));
    if (!model) {
      return new HttpResponse(null, { status: 404 });
    }
    return HttpResponse.json(model);
  }),

  http.post(`${API_URL}/api/models`, async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    const newModel = {
      id: mockModels.length + 1,
      ...body,
      created_at: new Date().toISOString(),
    };
    mockModels.push(newModel as typeof mockModels[0]);
    return HttpResponse.json(newModel, { status: 201 });
  }),

  // Results endpoints
  http.get(`${API_URL}/api/results`, () => {
    return HttpResponse.json(mockResults);
  }),

  // Evaluation endpoints
  http.post(`${API_URL}/api/evaluate`, async ({ request }) => {
    const body = (await request.json()) as { run_name?: string; task_ids?: number[]; model_ids?: number[] };
    const runId = `run-${Date.now()}`;
    return HttpResponse.json({
      id: runId,
      name: body.run_name || 'Evaluation Run',
      description: null,
      task_ids: body.task_ids || [],
      model_ids: body.model_ids || [],
      status: 'running',
      started_at: new Date().toISOString(),
      completed_at: null,
      total_tasks: (body.task_ids?.length || 0) * (body.model_ids?.length || 0),
      completed_tasks: 0,
      failed_tasks: 0,
    });
  }),

  http.get(`${API_URL}/api/runs/:id`, ({ params }) => {
    return HttpResponse.json({
      id: params.id,
      name: 'Evaluation Run',
      description: null,
      task_ids: [1],
      model_ids: [1],
      status: 'completed',
      started_at: '2025-09-30T00:00:00Z',
      completed_at: '2025-09-30T00:01:00Z',
      total_tasks: 1,
      completed_tasks: 1,
      failed_tasks: 0,
    });
  }),
];
