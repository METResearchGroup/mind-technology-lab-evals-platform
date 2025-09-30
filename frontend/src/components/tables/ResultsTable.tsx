'use client';

import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CheckCircle, XCircle, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { EvalResult, EvalTask, Model } from '@/types';

interface ResultsTableProps {
  results: EvalResult[];
  tasks: EvalTask[];
  models: Model[];
  showSummary?: boolean;
  onResultClick?: (result: EvalResult) => void;
}

export function ResultsTable({
  results,
  tasks,
  models,
  showSummary = true,
  onResultClick,
}: ResultsTableProps) {
  const getTaskName = (taskId: number) =>
    tasks.find((t) => t.id === taskId)?.name || `Task ${taskId}`;

  const getModelName = (modelId: number) =>
    models.find((m) => m.id === modelId)?.model_name || `Model ${modelId}`;

  const getEvaluationMethod = (taskId: number) =>
    tasks.find((t) => t.id === taskId)?.evaluation_method || 'unknown';

  const truncateOutput = (output: string, maxLength = 100) => {
    if (output.length <= maxLength) return output;
    return output.slice(0, maxLength) + '...';
  };

  const formatLatency = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  const formatCost = (cost: number) => {
    if (cost < 0.01) return `$${cost.toFixed(4)}`;
    if (cost < 1) return `$${cost.toFixed(3)}`;
    return `$${cost.toFixed(2)}`;
  };

  const getScoreBadgeColor = (score: number | null | undefined) => {
    if (score === null || score === undefined) return 'secondary';
    if (score >= 0.8) return 'default';
    if (score >= 0.5) return 'secondary';
    return 'destructive';
  };

  // Calculate summary stats
  const passedCount = results.filter((r) => r.passed).length;
  const failedCount = results.filter((r) => !r.passed).length;
  const totalCost = results.reduce((sum, r) => sum + (r.cost_usd || 0), 0);
  const avgLatency =
    results.length > 0
      ? results.reduce((sum, r) => sum + (r.latency_ms || 0), 0) / results.length
      : 0;
  const avgScore =
    results.length > 0
      ? results.reduce((sum, r) => sum + (r.score || 0), 0) / results.length
      : 0;

  if (results.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No results to display.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Task</TableHead>
              <TableHead>Model</TableHead>
              <TableHead>Output</TableHead>
              <TableHead>Method</TableHead>
              <TableHead>Result</TableHead>
              <TableHead>Score</TableHead>
              <TableHead>Cost</TableHead>
              <TableHead>Latency</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {results.map((result) => (
              <TableRow key={result.id} className="hover:bg-muted/50">
                <TableCell className="font-medium">
                  {getTaskName(result.task_id)}
                </TableCell>
                <TableCell className="text-sm">
                  {getModelName(result.model_id)}
                </TableCell>
                <TableCell className="max-w-md">
                  <div className="text-sm text-muted-foreground font-mono">
                    {truncateOutput(result.model_output)}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="text-xs">
                    {getEvaluationMethod(result.task_id)}
                  </Badge>
                </TableCell>
                <TableCell>
                  {result.passed ? (
                    <div className="flex items-center text-green-600">
                      <CheckCircle className="h-4 w-4 mr-1" />
                      <span className="text-xs">Pass</span>
                    </div>
                  ) : (
                    <div className="flex items-center text-red-600">
                      <XCircle className="h-4 w-4 mr-1" />
                      <span className="text-xs">Fail</span>
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  <Badge variant={getScoreBadgeColor(result.score)}>
                    {result.score !== null && result.score !== undefined
                      ? result.score.toFixed(2)
                      : 'N/A'}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm">
                  {formatCost(result.cost_usd || 0)}
                </TableCell>
                <TableCell className="text-sm">
                  {formatLatency(result.latency_ms || 0)}
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onResultClick?.(result)}
                  >
                    <Eye className="h-3 w-3" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {showSummary && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="text-center p-3 bg-muted rounded-lg">
            <div className="text-2xl font-bold text-green-600">{passedCount}</div>
            <div className="text-xs text-muted-foreground">Passed</div>
          </div>
          <div className="text-center p-3 bg-muted rounded-lg">
            <div className="text-2xl font-bold text-red-600">{failedCount}</div>
            <div className="text-xs text-muted-foreground">Failed</div>
          </div>
          <div className="text-center p-3 bg-muted rounded-lg">
            <div className="text-2xl font-bold">{formatCost(totalCost)}</div>
            <div className="text-xs text-muted-foreground">Total Cost</div>
          </div>
          <div className="text-center p-3 bg-muted rounded-lg">
            <div className="text-2xl font-bold">{formatLatency(avgLatency)}</div>
            <div className="text-xs text-muted-foreground">Avg Latency</div>
          </div>
          <div className="text-center p-3 bg-muted rounded-lg">
            <div className="text-2xl font-bold">{avgScore.toFixed(2)}</div>
            <div className="text-xs text-muted-foreground">Avg Score</div>
          </div>
        </div>
      )}
    </div>
  );
}
