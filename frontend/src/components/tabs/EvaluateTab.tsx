'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Play, Clock, AlertTriangle, RotateCcw } from 'lucide-react';
import { useTasks } from '@/hooks/useTasks';
import { useModels } from '@/hooks/useModels';
import { useRunEvaluation, useRunStatus } from '@/hooks/useEvaluation';
import { useResults } from '@/hooks/useResults';
import { ResultsTable } from '@/components/tables/ResultsTable';
import { ResultDetailModal } from '@/components/ui/ResultDetailModal';
import { estimateEvalRunCost, getCostWarningLevel, formatCost } from '@/lib/utils/cost-estimation';
import type { EvalResult } from '@/types';

interface EvaluateTabProps {
  onRunEvaluation?: (taskIds: number[], modelIds: number[]) => void;
}

export function EvaluateTab({ onRunEvaluation }: EvaluateTabProps) {
  const { data: tasks = [] } = useTasks();
  const { data: models = [] } = useModels();
  const { mutate: runEvaluation, isPending: isRunning, data: runData, error: runError } = useRunEvaluation();
  const { data: runStatus } = useRunStatus(runData?.id || null);
  const { data: currentRunResults = [] } = useResults(
    runData?.id ? { run_id: runData.id } : undefined
  );

  const [selectedTasks, setSelectedTasks] = useState<number[]>([]);
  const [selectedModels, setSelectedModels] = useState<number[]>([]);
  const [runName, setRunName] = useState('');
  const [selectedResult, setSelectedResult] = useState<EvalResult | null>(null);

  // Calculate cost estimation
  const costEstimate = estimateEvalRunCost(selectedTasks, selectedModels, tasks, models);
  const costWarning = getCostWarningLevel(costEstimate.total);

  const handleRunEvaluation = () => {
    if (selectedTasks.length === 0 || selectedModels.length === 0) {
      alert('Please select at least one task and one model');
      return;
    }

    // Confirm if cost is high
    if (costEstimate.total > 2.0) {
      const confirmed = confirm(
        `This run will cost approximately ${formatCost(costEstimate.total)}. Continue?`
      );
      if (!confirmed) return;
    }

    runEvaluation(
      {
        task_ids: selectedTasks,
        model_ids: selectedModels,
        run_name: runName || `Run ${new Date().toLocaleString()}`,
      },
      {
        onSuccess: () => {
          if (onRunEvaluation) {
            onRunEvaluation(selectedTasks, selectedModels);
          }
        },
        onError: (error) => {
          alert(`Failed to run evaluation: ${error.message}`);
        },
      }
    );
  };

  const handleStartNewRun = () => {
    setSelectedTasks([]);
    setSelectedModels([]);
    setRunName('');
    // Reset run data by not storing it (React Query will handle cleanup)
  };

  // Calculate progress from run status
  const progress = runStatus
    ? (runStatus.completed_tasks / runStatus.total_tasks) * 100
    : 0;

  const isCompleted = runStatus?.status === 'completed' || runStatus?.status === 'failed';
  const showResults = isCompleted && currentRunResults.length > 0;

  return (
    <div className="space-y-6">
      {/* Task Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Select Tasks</CardTitle>
          <CardDescription>
            Choose which evaluation tasks to run against your models
          </CardDescription>
        </CardHeader>
        <CardContent>
          {tasks.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No tasks available. Please add tasks first.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    selectedTasks.includes(task.id)
                      ? 'border-eval-success bg-eval-success/10'
                      : 'border-border hover:border-eval-info'
                  }`}
                  onClick={() => {
                    setSelectedTasks(prev =>
                      prev.includes(task.id)
                        ? prev.filter(id => id !== task.id)
                        : [...prev, task.id]
                    );
                  }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-sm">{task.name}</h3>
                    <Badge variant="outline" className="text-xs">{task.task_type}</Badge>
                  </div>
                  {task.description && (
                    <p className="text-xs text-muted-foreground mb-2">
                      {task.description}
                    </p>
                  )}
                  <div className="flex flex-wrap gap-1">
                    {task.tags.slice(0, 3).map((tag: string) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                    {task.tags.length > 3 && (
                      <Badge variant="secondary" className="text-xs">
                        +{task.tags.length - 3}
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Model Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Select Models</CardTitle>
          <CardDescription>
            Choose which LLM models to evaluate
          </CardDescription>
        </CardHeader>
        <CardContent>
          {models.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No models available. Please add models first.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {models.map((model) => (
                <div
                  key={model.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    selectedModels.includes(model.id)
                      ? 'border-eval-success bg-eval-success/10'
                      : 'border-border hover:border-eval-info'
                  }`}
                  onClick={() => {
                    setSelectedModels(prev =>
                      prev.includes(model.id)
                        ? prev.filter(id => id !== model.id)
                        : [...prev, model.id]
                    );
                  }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-sm">{model.model_name}</h3>
                    <Badge variant="outline" className="text-xs">{model.provider}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Temp: {(model.config.temperature as number) ?? 'N/A'} |
                    Tokens: {(model.config.max_tokens as number) ?? 'N/A'}
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Run Configuration & Execution */}
      <Card>
        <CardHeader>
          <CardTitle>Run Evaluation</CardTitle>
          <CardDescription>
            Configure and execute evaluation with selected tasks and models
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Run Name Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Run Name (optional)
            </label>
            <Input
              placeholder="e.g., 'GPT-4 baseline test' or 'Prompt v2.0 comparison'"
              value={runName}
              onChange={(e) => setRunName(e.target.value)}
              disabled={isRunning}
            />
          </div>

          {/* Cost Estimation & Stats */}
          {selectedTasks.length > 0 && selectedModels.length > 0 && (
            <div className="p-4 bg-muted/50 rounded-lg space-y-2">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <div className="text-muted-foreground">Total Evaluations</div>
                  <div className="font-bold">{selectedTasks.length * selectedModels.length}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Est. Cost</div>
                  <div className="font-bold">{formatCost(costEstimate.total)}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Per Eval</div>
                  <div className="font-bold">{formatCost(costEstimate.perEval)}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Est. Time</div>
                  <div className="font-bold">~{(selectedTasks.length * selectedModels.length * 3).toFixed(0)}s</div>
                </div>
              </div>

              {/* Cost warnings */}
              {costWarning === 'medium' && (
                <Alert className="border-yellow-500">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    This run will cost over $0.50. Consider reducing tasks or models.
                  </AlertDescription>
                </Alert>
              )}
              {costWarning === 'high' && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    ⚠️ High cost run (${costEstimate.total.toFixed(2)})! You&apos;ll be asked to confirm.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}

          {/* Run Button */}
          <div className="flex justify-end">
            <Button
              onClick={handleRunEvaluation}
              disabled={isRunning || selectedTasks.length === 0 || selectedModels.length === 0}
              size="lg"
            >
              {isRunning ? (
                <>
                  <Clock className="h-4 w-4 mr-2 animate-spin" />
                  Running...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Run Evaluation
                </>
              )}
            </Button>
          </div>

          {/* Progress Bar */}
          {isRunning && runStatus && (
            <div className="space-y-2">
              <Progress value={progress} className="w-full" />
              <p className="text-sm text-muted-foreground text-center">
                {runStatus.completed_tasks} / {runStatus.total_tasks} evaluations complete ({progress.toFixed(0)}%)
              </p>
            </div>
          )}

          {/* Error Display */}
          {runError && (
            <Alert variant="destructive">
              <AlertDescription>
                Failed to run evaluation: {runError.message}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Results Display */}
      {showResults && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Results</CardTitle>
                <CardDescription>
                  Run: {runData?.name || runData?.id?.slice(0, 8)} |
                  Completed: {runStatus?.completed_at ? new Date(runStatus.completed_at).toLocaleString() : 'N/A'}
                </CardDescription>
              </div>
              <Button
                variant="outline"
                onClick={handleStartNewRun}
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Start New Run
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <ResultsTable
              results={currentRunResults}
              tasks={tasks}
              models={models}
              showSummary={true}
              onResultClick={setSelectedResult}
            />
          </CardContent>
        </Card>
      )}

      {/* Result Detail Modal */}
      <ResultDetailModal
        result={selectedResult}
        task={tasks.find((t) => t.id === selectedResult?.task_id) || null}
        model={models.find((m) => m.id === selectedResult?.model_id) || null}
        open={!!selectedResult}
        onClose={() => setSelectedResult(null)}
      />
    </div>
  );
}
