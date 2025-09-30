'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Play, CheckCircle, XCircle, Clock } from 'lucide-react';
import { EvalTask, Model, EvalResult } from '@/types';
import { loadTasks, loadModels, loadResults } from '@/lib/data';

interface EvaluateTabProps {
  onRunEvaluation?: (taskIds: number[], modelIds: number[]) => void;
}

export function EvaluateTab({ onRunEvaluation }: EvaluateTabProps) {
  const [tasks, setTasks] = useState<EvalTask[]>([]);
  const [models, setModels] = useState<Model[]>([]);
  const [results, setResults] = useState<EvalResult[]>([]);
  const [selectedTasks, setSelectedTasks] = useState<number[]>([]);
  const [selectedModels, setSelectedModels] = useState<number[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [tasksData, modelsData, resultsData] = await Promise.all([
          loadTasks(),
          loadModels(),
          loadResults(),
        ]);
        setTasks(tasksData);
        setModels(modelsData);
        setResults(resultsData);
      } catch (error) {
        console.error('Failed to load data:', error);
      }
    };

    loadData();
  }, []);

  const handleRunEvaluation = async () => {
    if (selectedTasks.length === 0 || selectedModels.length === 0) {
      alert('Please select at least one task and one model');
      return;
    }

    setIsRunning(true);
    setProgress(0);

    // Simulate evaluation progress
    const totalSteps = selectedTasks.length * selectedModels.length;
    let currentStep = 0;

    const progressInterval = setInterval(() => {
      currentStep++;
      setProgress((currentStep / totalSteps) * 100);
      
      if (currentStep >= totalSteps) {
        clearInterval(progressInterval);
        setIsRunning(false);
        setProgress(100);
        onRunEvaluation?.(selectedTasks, selectedModels);
      }
    }, 1000);

    // Simulate evaluation completion
    setTimeout(() => {
      clearInterval(progressInterval);
      setIsRunning(false);
      setProgress(100);
    }, totalSteps * 1000);
  };

  const getTaskName = (taskId: number) => {
    return tasks.find(t => t.id === taskId)?.name || `Task ${taskId}`;
  };

  const getModelName = (modelId: number) => {
    return models.find(m => m.id === modelId)?.model_name || `Model ${modelId}`;
  };

  const getLatestResult = (taskId: number, modelId: number) => {
    return results
      .filter(r => r.task_id === taskId && r.model_id === modelId)
      .sort((a, b) => new Date(b.evaluated_at).getTime() - new Date(a.evaluated_at).getTime())[0];
  };

  return (
    <div className="space-y-6">
      {/* Task Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Select Tasks</CardTitle>
          <CardDescription>
            Choose which tasks to evaluate
          </CardDescription>
        </CardHeader>
        <CardContent>
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
                  <h3 className="font-medium">{task.name}</h3>
                  <Badge variant="outline">{task.task_type}</Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-2">
                  {task.description}
                </p>
                <div className="flex flex-wrap gap-1">
                  {task.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Model Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Select Models</CardTitle>
          <CardDescription>
            Choose which models to test
          </CardDescription>
        </CardHeader>
        <CardContent>
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
                  <h3 className="font-medium">{model.model_name}</h3>
                  <Badge variant="outline">{model.provider}</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Temp: {(model.config.temperature as number) ?? 'N/A'}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Run Evaluation */}
      <Card>
        <CardHeader>
          <CardTitle>Run Evaluation</CardTitle>
          <CardDescription>
            Execute evaluation with selected tasks and models
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">
                Selected: {selectedTasks.length} tasks × {selectedModels.length} models = {selectedTasks.length * selectedModels.length} evaluations
              </p>
            </div>
            <Button
              onClick={handleRunEvaluation}
              disabled={isRunning || selectedTasks.length === 0 || selectedModels.length === 0}
              className="min-w-32"
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

          {isRunning && (
            <div className="space-y-2">
              <Progress value={progress} className="w-full" />
              <p className="text-sm text-muted-foreground text-center">
                {progress.toFixed(0)}% complete
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Results Preview */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Results</CardTitle>
          <CardDescription>
            Latest evaluation results for selected tasks and models
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {selectedTasks.length > 0 && selectedModels.length > 0 ? (
              selectedTasks.map((taskId) =>
                selectedModels.map((modelId) => {
                  const result = getLatestResult(taskId, modelId);
                  return (
                    <div key={`${taskId}-${modelId}`} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <h4 className="font-medium">{getTaskName(taskId)}</h4>
                        <p className="text-sm text-muted-foreground">{getModelName(modelId)}</p>
                      </div>
                      <div className="flex items-center space-x-4">
                        {result ? (
                          <>
                            {result.passed ? (
                              <CheckCircle className="h-5 w-5 text-eval-success" />
                            ) : (
                              <XCircle className="h-5 w-5 text-eval-error" />
                            )}
                            <span className="text-sm">
                              {result.score ? (result.score * 100).toFixed(1) + '%' : 'N/A'}
                            </span>
                            <span className="text-sm text-muted-foreground">
                              {new Date(result.evaluated_at).toLocaleDateString()}
                            </span>
                          </>
                        ) : (
                          <span className="text-sm text-muted-foreground">No results yet</span>
                        )}
                      </div>
                    </div>
                  );
                })
              )
            ) : (
              <p className="text-center text-muted-foreground py-8">
                Select tasks and models to see recent results
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
