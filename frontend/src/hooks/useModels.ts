/**
 * React Query hooks for model management
 */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  modelService,
  type ModelCreate,
  type ModelUpdate,
} from "../lib/services/model-service";
import type { Model } from "../types";

/**
 * Fetch all models
 */
export function useModels() {
  return useQuery({
    queryKey: ["models"],
    queryFn: modelService.getModels,
  });
}

/**
 * Fetch a single model by ID
 */
export function useModel(id: number) {
  return useQuery({
    queryKey: ["models", id],
    queryFn: () => modelService.getModel(id),
    enabled: !!id,
  });
}

/**
 * Create a new model
 */
export function useCreateModel() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ModelCreate) => modelService.createModel(data),
    onSuccess: (newModel: Model) => {
      // Invalidate models list
      queryClient.invalidateQueries({ queryKey: ["models"] });

      // Optimistically add to cache
      queryClient.setQueryData<Model[]>(["models"], (old = []) => [
        ...old,
        newModel,
      ]);
    },
  });
}

/**
 * Update an existing model
 */
export function useUpdateModel() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: ModelUpdate }) =>
      modelService.updateModel(id, data),
    onSuccess: (updatedModel: Model) => {
      // Invalidate models list
      queryClient.invalidateQueries({ queryKey: ["models"] });

      // Update specific model cache
      queryClient.setQueryData<Model>(
        ["models", updatedModel.id],
        updatedModel
      );
    },
  });
}

/**
 * Delete a model
 */
export function useDeleteModel() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => modelService.deleteModel(id),
    onSuccess: (_, deletedId) => {
      // Invalidate models list
      queryClient.invalidateQueries({ queryKey: ["models"] });

      // Remove from cache
      queryClient.setQueryData<Model[]>(["models"], (old = []) =>
        old.filter((model) => model.id !== deletedId)
      );
    },
  });
}
