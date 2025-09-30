/**
 * React Query hooks for evaluation execution
 */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  evaluationService,
  type EvaluationRequest,
  type RunStatus,
} from "../lib/services/evaluation-service";

/**
 * Run an evaluation
 */
export function useRunEvaluation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: EvaluationRequest) =>
      evaluationService.runEvaluation(data),
    onSuccess: () => {
      // Invalidate results and runs to show new data
      queryClient.invalidateQueries({ queryKey: ["results"] });
      queryClient.invalidateQueries({ queryKey: ["runs"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

/**
 * Get run status (for polling)
 */
export function useRunStatus(runId: string | null) {
  return useQuery({
    queryKey: ["runs", runId],
    queryFn: () => evaluationService.getRunStatus(runId!),
    enabled: !!runId,
    refetchInterval: (query) => {
      // Poll every 2 seconds if run is still in progress
      const data = query.state.data as RunStatus | undefined;
      return data?.status === "running" ? 2000 : false;
    },
  });
}

/**
 * Get all evaluation runs
 */
export function useRuns() {
  return useQuery({
    queryKey: ["runs"],
    queryFn: evaluationService.getRuns,
  });
}
