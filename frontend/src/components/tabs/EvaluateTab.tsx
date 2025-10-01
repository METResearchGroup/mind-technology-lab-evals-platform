'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Play, Clock, AlertTriangle, RotateCcw, Eye } from 'lucide-react';
import { useTasks } from '@/hooks/useTasks';
import { useModels } from '@/hooks/useModels';
import { useRunEvaluation, useRunStatus } from '@/hooks/useEvaluation';
import { useResults } from '@/hooks/useResults';
import { ResultsTable } from '@/components/tables/ResultsTable';
import { ResultDetailModal } from '@/components/ui/ResultDetailModal';
import { TaskDetailModal } from '@/components/ui/TaskDetailModal';
import { ModelBadgeWithTooltip } from '@/components/ui/ModelBadgeWithTooltip';
import { estimateEvalRunCost, getCostWarningLevel, formatCost } from '@/lib/utils/cost-estimation';
import { loadModelMetadata, getProviders, type ModelMetadataMap } from '@/lib/services/model-metadata-service';
import type { EvalResult, EvalTask } from '@/types';

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
  const [selectedTaskForDetail, setSelectedTaskForDetail] = useState<EvalTask | null>(null);
  const [providerFilter, setProviderFilter] = useState<string>('all');
  const [modelMetadata, setModelMetadata] = useState<ModelMetadataMap>({});
  const [showSuccess, setShowSuccess] = useState(false);
  const [lastCompletedRunId, setLastCompletedRunId] = useState<string | null>(null);

  // Load model metadata on mount
  useEffect(() => {
    loadModelMetadata().then(setModelMetadata);
  }, []);

  // Get unique providers from metadata
  const providers = getProviders(modelMetadata);

  // Filter models by provider
  const filteredModels = models.filter((model) => {
    if (providerFilter === 'all') return true;
    const meta = modelMetadata[model.model_name];
    return meta && meta.provider === providerFilter;
  });

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

  // Show success notification when run completes
  useEffect(() => {
    // Check if this is a newly completed run
    if (
      runStatus?.status === 'completed' &&
      runData?.id &&
      lastCompletedRunId !== runData.id
    ) {
      setLastCompletedRunId(runData.id);
      setShowSuccess(true);

      const timer = setTimeout(() => {
        setShowSuccess(false);
      }, 5000); // Show for 5 seconds

      return () => clearTimeout(timer);
    }
  }, [runStatus?.status, runData?.id, lastCompletedRunId]);

  // Determine current model being evaluated
  const getCurrentEvaluationInfo = () => {
    if (!isRunning) return null;
    if (!runStatus) {
      // If no runStatus yet, show first model/task
      if (selectedModels.length > 0 && selectedTasks.length > 0) {
        const firstModel = models.find(m => m.id === selectedModels[0]);
        const firstTask = tasks.find(t => t.id === selectedTasks[0]);
        return {
          model: firstModel?.model_name || 'Unknown',
          task: firstTask?.name || 'Unknown',
          modelIndex: 1,
          taskIndex: 1,
        };
      }
      return null;
    }

    const completedCount = runStatus.completed_tasks;
    const totalTasks = selectedTasks.length;
    const totalModels = selectedModels.length;

    // Calculate which model/task combo is currently running
    const currentIndex = completedCount;
    const currentModelIndex = Math.floor(currentIndex / totalTasks);
    const currentTaskIndex = currentIndex % totalTasks;

    if (currentModelIndex >= totalModels) return null;

    const currentModelId = selectedModels[currentModelIndex];
    const currentTaskId = selectedTasks[currentTaskIndex];
    const currentModel = models.find(m => m.id === currentModelId);
    const currentTask = tasks.find(t => t.id === currentTaskId);

    return {
      model: currentModel?.model_name || 'Unknown',
      task: currentTask?.name || 'Unknown',
      modelIndex: currentModelIndex + 1,
      taskIndex: currentTaskIndex + 1,
    };
  };

  const currentEval = getCurrentEvaluationInfo();

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
                  <div className="flex items-center justify-between mt-2">
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
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedTaskForDetail(task);
                      }}
                      className="text-xs"
                    >
                      <Eye className="h-3 w-3 mr-1" />
                      See More
                    </Button>
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
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Select Models</CardTitle>
              <CardDescription>
                Choose which LLM models to evaluate ({filteredModels.length} available)
              </CardDescription>
            </div>
            <div className="w-[200px]">
              <Select value={providerFilter} onValueChange={setProviderFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Providers" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Providers</SelectItem>
                  {providers.map((provider) => (
                    <SelectItem key={provider} value={provider}>
                      {provider}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredModels.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No models available. Please add models first.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {filteredModels.map((model) => {
                const meta = modelMetadata[model.model_name];
                return (
                  <div
                    key={model.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedModels.includes(model.id)
                        ? 'border-eval-success bg-eval-success/10'
                        : 'border-border hover:border-eval-info'
                    }`}
                    onClick={() => {
                      setSelectedModels((prev) =>
                        prev.includes(model.id)
                          ? prev.filter((id) => id !== model.id)
                          : [...prev, model.id]
                      );
                    }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      {meta ? (
                        <ModelBadgeWithTooltip modelName={model.model_name} className="text-sm" />
                      ) : (
                        <h3 className="font-medium text-sm">{model.model_name}</h3>
                      )}
                    </div>
                    {meta && (
                      <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                        {meta.description}
                      </p>
                    )}
                    <div className="flex justify-between text-xs text-muted-foreground">
                      {meta && (
                        <>
                          <span>{meta.cost_input_per_million.toFixed(2)}/M in</span>
                          <span>{meta.cost_output_per_million.toFixed(2)}/M out</span>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
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

          {/* Status Indicator - appears above button */}
          <div className="flex justify-end min-h-[48px]">
            {currentEval && isRunning && (
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 text-sm shadow-sm">
                <div className="flex items-center gap-1.5">
                  <div className="h-2.5 w-2.5 bg-blue-500 rounded-full animate-pulse" />
                  <span className="font-semibold text-blue-700 dark:text-blue-300">
                    Evaluating:
                  </span>
                </div>
                <Badge variant="secondary" className="text-xs font-mono">
                  {currentEval.model}
                </Badge>
                <span className="text-muted-foreground text-xs">→</span>
                <span className="text-xs font-medium max-w-[200px] truncate">
                  {currentEval.task}
                </span>
                <span className="text-xs text-muted-foreground">
                  ({currentEval.modelIndex}/{selectedModels.length})
                </span>
              </div>
            )}
            {showSuccess && !isRunning && (
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 text-sm shadow-sm animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="flex items-center gap-1.5">
                  <div className="h-2.5 w-2.5 bg-green-500 rounded-full" />
                  <span className="font-semibold text-green-700 dark:text-green-300">
                    ✓ Evaluation Complete!
                  </span>
                </div>
                <span className="text-xs text-muted-foreground">
                  {runStatus?.completed_tasks || 0} evaluations finished
                </span>
              </div>
            )}
          </div>

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

      {/* Task Detail Modal */}
      <TaskDetailModal
        task={selectedTaskForDetail}
        open={!!selectedTaskForDetail}
        onClose={() => setSelectedTaskForDetail(null)}
      />
    </div>
  );
}
