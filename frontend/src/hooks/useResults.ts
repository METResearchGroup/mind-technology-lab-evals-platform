/**
 * React Query hooks for results and analytics
 */

import { useQuery } from "@tanstack/react-query";
import {
  resultService,
  type ResultFilters,
} from "../lib/services/result-service";

/**
 * Fetch evaluation results with optional filters
 */
export function useResults(filters?: ResultFilters) {
  return useQuery({
    queryKey: ["results", filters],
    queryFn: () => resultService.getResults(filters),
  });
}

/**
 * Fetch dashboard statistics
 */
export function useDashboardStats() {
  return useQuery({
    queryKey: ["dashboard"],
    queryFn: resultService.getDashboardStats,
    staleTime: 1000 * 30, // Refresh every 30 seconds
  });
}
