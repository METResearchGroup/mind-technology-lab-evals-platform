'use client';

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Copy, Check } from 'lucide-react';
import { useState } from 'react';
import type { EvalResult, EvalTask, Model } from '@/types';

interface ResultDetailModalProps {
  result: EvalResult | null;
  task: EvalTask | null;
  model: Model | null;
  open: boolean;
  onClose: () => void;
}

export function ResultDetailModal({
  result,
  task,
  model,
  open,
  onClose,
}: ResultDetailModalProps) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!result || !task || !model) {
    return null;
  }

  const formatCost = (cost: number) => {
    if (cost < 0.01) return `$${cost.toFixed(4)}`;
    if (cost < 1) return `$${cost.toFixed(3)}`;
    return `$${cost.toFixed(2)}`;
  };

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Evaluation Result Details</span>
            <Badge variant={result.passed ? "default" : "destructive"}>
              {result.passed ? (
                <>
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Passed
                </>
              ) : (
                <>
                  <XCircle className="h-3 w-3 mr-1" />
                  Failed
                </>
              )}
            </Badge>
          </DialogTitle>
          <DialogDescription>
            Result ID: {result.id} | Evaluated: {new Date(result.evaluated_at).toLocaleString()}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Metadata */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-muted rounded-lg">
            <div>
              <div className="text-xs text-muted-foreground">Score</div>
              <div className="text-lg font-bold">
                {result.score !== null && result.score !== undefined ? result.score.toFixed(2) : 'N/A'}
              </div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Cost</div>
              <div className="text-lg font-bold">
                {formatCost(result.cost_usd || 0)}
              </div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Latency</div>
              <div className="text-lg font-bold">
                {result.latency_ms ? `${(result.latency_ms / 1000).toFixed(1)}s` : 'N/A'}
              </div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Method</div>
              <div className="text-lg">
                <Badge variant="outline">{task.evaluation_method}</Badge>
              </div>
            </div>
          </div>

          {/* Task Info */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-muted-foreground">TASK</h3>
            <div className="p-4 bg-muted/50 rounded-lg space-y-2">
              <div>
                <div className="text-xs text-muted-foreground mb-1">Name</div>
                <div className="font-medium">{task.name}</div>
              </div>
              {task.description && (
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Description</div>
                  <div className="text-sm">{task.description}</div>
                </div>
              )}
              <div>
                <div className="text-xs text-muted-foreground mb-1">Input</div>
                <div className="text-sm font-mono bg-background p-3 rounded border">
                  {task.input}
                </div>
              </div>
              {task.expected_output && (
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Expected Output</div>
                  <div className="text-sm font-mono bg-background p-3 rounded border">
                    {task.expected_output}
                  </div>
                </div>
              )}
              {task.ground_truth && (
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Ground Truth</div>
                  <div className="text-sm bg-background p-3 rounded border">
                    {task.ground_truth}
                  </div>
                </div>
              )}
              {task.rubric && (
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Evaluation Rubric</div>
                  <div className="text-sm bg-background p-3 rounded border whitespace-pre-wrap">
                    {task.rubric}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Model Info */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-muted-foreground">MODEL</h3>
            <div className="p-4 bg-muted/50 rounded-lg space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">{model.model_name}</div>
                  <div className="text-xs text-muted-foreground">
                    Provider: {model.provider} | Prompt Version: {model.prompt_version}
                  </div>
                </div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground mb-1">Configuration</div>
                <div className="text-xs font-mono bg-background p-3 rounded border">
                  {JSON.stringify(model.config, null, 2)}
                </div>
              </div>
            </div>
          </div>

          {/* Model Output & Comparison */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-muted-foreground flex items-center justify-between">
              MODEL OUTPUT
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(result.model_output)}
              >
                {copied ? (
                  <>
                    <Check className="h-3 w-3 mr-1" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="h-3 w-3 mr-1" />
                    Copy
                  </>
                )}
              </Button>
            </h3>
            <div className="p-4 bg-muted/50 rounded-lg">
              <div className="text-sm font-mono bg-background p-4 rounded border whitespace-pre-wrap max-h-60 overflow-y-auto">
                {result.model_output}
              </div>
            </div>
          </div>

          {/* Comparison (if expected output exists) */}
          {task.expected_output && (
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-muted-foreground">COMPARISON</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <div className="text-xs text-muted-foreground">Expected</div>
                  <div className="text-sm font-mono bg-green-50 dark:bg-green-950/20 p-3 rounded border border-green-200 dark:border-green-900 whitespace-pre-wrap">
                    {task.expected_output}
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-xs text-muted-foreground">Actual</div>
                  <div
                    className={`text-sm font-mono p-3 rounded border whitespace-pre-wrap ${
                      result.passed
                        ? 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-900'
                        : 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900'
                    }`}
                  >
                    {result.model_output}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Error Info (if failed) */}
          {!result.passed && result.error_category && (
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-muted-foreground">ERROR DETAILS</h3>
              <div className="p-4 bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-200 dark:border-red-900">
                <div className="flex items-center space-x-2">
                  <Badge variant="destructive">{result.error_category}</Badge>
                  <span className="text-sm">
                    The model output did not meet the evaluation criteria.
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Metrics (if available) */}
          {result.metrics && Object.keys(result.metrics).length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-muted-foreground">METRICS</h3>
              <div className="p-4 bg-muted/50 rounded-lg">
                <pre className="text-xs font-mono">
                  {JSON.stringify(result.metrics, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
