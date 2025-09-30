'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Play, Clock } from 'lucide-react';
import { useTasks } from '@/hooks/useTasks';
import { useModels } from '@/hooks/useModels';
import { useRunEvaluation, useRunStatus } from '@/hooks/useEvaluation';

interface EvaluateTabProps {
  onRunEvaluation?: (taskIds: number[], modelIds: number[]) => void;
}

export function EvaluateTab({ onRunEvaluation }: EvaluateTabProps) {
  const { data: tasks = [] } = useTasks();
  const { data: models = [] } = useModels();
  const { mutate: runEvaluation, isPending: isRunning, data: runData } = useRunEvaluation();
  const { data: runStatus } = useRunStatus(runData?.id || null);

  const [selectedTasks, setSelectedTasks] = useState<number[]>([]);
  const [selectedModels, setSelectedModels] = useState<number[]>([]);

  const handleRunEvaluation = () => {
    if (selectedTasks.length === 0 || selectedModels.length === 0) {
      alert('Please select at least one task and one model');
      return;
    }

    runEvaluation(
      {
        task_ids: selectedTasks,
        model_ids: selectedModels,
        run_name: `Run ${new Date().toLocaleString()}`,
      },
      {
        onSuccess: () => {
          // Clear selections after successful run
          setSelectedTasks([]);
          setSelectedModels([]);
          if (onRunEvaluation) {
            onRunEvaluation(selectedTasks, selectedModels);
          }
        },
      }
    );
  };

  // Calculate progress from run status
  const progress = runStatus
    ? (runStatus.completed_tasks / runStatus.total_tasks) * 100
    : 0;

  // Helper functions removed - results handled in ReviewPerformanceTab

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
      {/* Recent Results - Check ReviewPerformanceTab after running evaluations */}
    </div>
  );
}
