/**
 * React Query hooks for task management
 */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  taskService,
  type TaskCreate,
  type TaskUpdate,
} from "../lib/services/task-service";
import type { EvalTask } from "../types";

/**
 * Fetch all tasks
 */
export function useTasks() {
  return useQuery({
    queryKey: ["tasks"],
    queryFn: taskService.getTasks,
  });
}

/**
 * Fetch a single task by ID
 */
export function useTask(id: number) {
  return useQuery({
    queryKey: ["tasks", id],
    queryFn: () => taskService.getTask(id),
    enabled: !!id,
  });
}

/**
 * Create a new task
 */
export function useCreateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: TaskCreate) => taskService.createTask(data),
    onSuccess: (newTask: EvalTask) => {
      // Invalidate tasks list
      queryClient.invalidateQueries({ queryKey: ["tasks"] });

      // Optimistically add to cache
      queryClient.setQueryData<EvalTask[]>(["tasks"], (old = []) => [
        ...old,
        newTask,
      ]);
    },
  });
}

/**
 * Update an existing task
 */
export function useUpdateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: TaskUpdate }) =>
      taskService.updateTask(id, data),
    onSuccess: (updatedTask: EvalTask) => {
      // Invalidate tasks list
      queryClient.invalidateQueries({ queryKey: ["tasks"] });

      // Update specific task cache
      queryClient.setQueryData<EvalTask>(["tasks", updatedTask.id], updatedTask);
    },
  });
}

/**
 * Delete a task
 */
export function useDeleteTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => taskService.deleteTask(id),
    onSuccess: (_, deletedId) => {
      // Invalidate tasks list
      queryClient.invalidateQueries({ queryKey: ["tasks"] });

      // Remove from cache
      queryClient.setQueryData<EvalTask[]>(["tasks"], (old = []) =>
        old.filter((task) => task.id !== deletedId)
      );
    },
  });
}
