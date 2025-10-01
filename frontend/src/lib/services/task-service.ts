/**
 * Task service - API calls for evaluation tasks
 */

import { apiClient } from "../api-client";
import type { EvalTask } from "../../types";

export interface TaskCreate {
  name: string;
  input: string;
  task_type: "classification" | "generation";
  evaluation_method:
    | "exact_match"
    | "contains"
    | "json_exact"
    | "levenshtein"
    | "llm_factuality"
    | "llm_judge"
    | "hybrid";
  description?: string;
  expected_output?: string;
  ground_truth?: string;
  rubric?: string;
  tags?: string[];
  project?: string;
  task_version?: string;
}

export type TaskUpdate = Partial<TaskCreate>;

export const taskService = {
  /**
   * Get all tasks
   */
  async getTasks(): Promise<EvalTask[]> {
    return apiClient.get<EvalTask[]>("/api/tasks");
  },

  /**
   * Get a single task by ID
   */
  async getTask(id: number): Promise<EvalTask> {
    return apiClient.get<EvalTask>(`/api/tasks/${id}`);
  },

  /**
   * Create a new task
   */
  async createTask(data: TaskCreate): Promise<EvalTask> {
    return apiClient.post<EvalTask>("/api/tasks", data);
  },

  /**
   * Update an existing task
   */
  async updateTask(id: number, data: TaskUpdate): Promise<EvalTask> {
    return apiClient.put<EvalTask>(`/api/tasks/${id}`, data);
  },

  /**
   * Delete a task
   */
  async deleteTask(id: number): Promise<void> {
    return apiClient.delete<void>(`/api/tasks/${id}`);
  },
};
