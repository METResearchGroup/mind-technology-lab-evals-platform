'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CheckCircle, XCircle, Download } from 'lucide-react';
import { useTasks } from '@/hooks/useTasks';
import { useModels } from '@/hooks/useModels';
import { useResults, useDashboardStats } from '@/hooks/useResults';

interface ReviewPerformanceTabProps {
  onExportResults?: () => void;
}

export function ReviewPerformanceTab({ onExportResults }: ReviewPerformanceTabProps) {
  const { data: tasks = [] } = useTasks();
  const { data: models = [] } = useModels();
  const { data: results = [] } = useResults();
  const { data: dashboardStats } = useDashboardStats();
  const [timeFilter, setTimeFilter] = useState<string>('7d');
  const [projectFilter, setProjectFilter] = useState<string>('all');

  // Filter results based on time and project
  const filteredResults = results.filter(result => {
    const task = tasks.find(t => t.id === result.task_id);
    const resultDate = new Date(result.evaluated_at);
    const now = new Date();

    let timeMatch = true;
    if (timeFilter === '1d') {
      timeMatch = resultDate >= new Date(now.getTime() - 24 * 60 * 60 * 1000);
    } else if (timeFilter === '7d') {
      timeMatch = resultDate >= new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    } else if (timeFilter === '30d') {
      timeMatch = resultDate >= new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    const projectMatch = projectFilter === 'all' || task?.project === projectFilter;

    return timeMatch && projectMatch;
  });

  const getUniqueProjects = () => {
    const projects = tasks.map(t => t.project).filter(Boolean);
    return Array.from(new Set(projects));
  };

  const getModelPerformance = () => {
    const modelStats: Record<number, {name: string, total: number, passed: number, avgScore: number, avgLatency: number, totalCost: number}> = {};

    filteredResults.forEach(result => {
      const model = models.find(m => m.id === result.model_id);
      if (!model) return;

      if (!modelStats[result.model_id]) {
        modelStats[result.model_id] = {
          name: model.model_name,
          total: 0,
          passed: 0,
          avgScore: 0,
          avgLatency: 0,
          totalCost: 0,
        };
      }

      modelStats[result.model_id].total++;
      if (result.passed) modelStats[result.model_id].passed++;
      modelStats[result.model_id].avgScore += result.score || 0;
      modelStats[result.model_id].avgLatency += result.latency_ms;
      modelStats[result.model_id].totalCost += result.cost_usd;
    });

    // Calculate averages
    Object.values(modelStats).forEach(stat => {
      stat.avgScore = stat.total > 0 ? stat.avgScore / stat.total : 0;
      stat.avgLatency = stat.total > 0 ? stat.avgLatency / stat.total : 0;
    });

    return Object.entries(modelStats).map(([id, stats]) => ({
      id: parseInt(id),
      ...stats,
    }));
  };

  const getTaskPerformance = () => {
    const taskStats: Record<number, {name: string, total: number, passed: number, avgScore: number}> = {};

    filteredResults.forEach(result => {
      const task = tasks.find(t => t.id === result.task_id);
      if (!task) return;

      if (!taskStats[result.task_id]) {
        taskStats[result.task_id] = {
          name: task.name,
          total: 0,
          passed: 0,
          avgScore: 0,
        };
      }

      taskStats[result.task_id].total++;
      if (result.passed) taskStats[result.task_id].passed++;
      taskStats[result.task_id].avgScore += result.score || 0;
    });

    // Calculate averages
    Object.values(taskStats).forEach(stat => {
      stat.avgScore = stat.total > 0 ? stat.avgScore / stat.total : 0;
    });

    return Object.entries(taskStats).map(([id, stats]) => ({
      id: parseInt(id),
      ...stats,
    }));
  };

  const getErrorAnalysis = () => {
    const errorCounts: Record<string, number> = {};

    filteredResults.forEach(result => {
      if (result.error_category) {
        errorCounts[result.error_category] = (errorCounts[result.error_category] || 0) + 1;
      }
    });

    return Object.entries(errorCounts)
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count);
  };

  // Loading states handled by React Query

  const modelPerformance = getModelPerformance();
  const taskPerformance = getTaskPerformance();
  const errorAnalysis = getErrorAnalysis();
  const totalPassRate = filteredResults.length > 0
    ? (filteredResults.filter(r => r.passed).length / filteredResults.length) * 100
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Performance Review</h2>
          <p className="text-muted-foreground">
            Analyze evaluation performance and identify areas for improvement
          </p>
        </div>
        <Button onClick={onExportResults}>
          <Download className="h-4 w-4 mr-2" />
          Export Results
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Time Range</label>
              <Select value={timeFilter} onValueChange={setTimeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Select time range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1d">Last 24 hours</SelectItem>
                  <SelectItem value="7d">Last 7 days</SelectItem>
                  <SelectItem value="30d">Last 30 days</SelectItem>
                  <SelectItem value="all">All time</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Project</label>
              <Select value={projectFilter} onValueChange={setProjectFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Select project" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Projects</SelectItem>
                  {getUniqueProjects().map(project => (
                    <SelectItem key={project} value={project!}>
                      {project}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Overview Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">{totalPassRate.toFixed(1)}%</div>
                <div className="text-sm text-muted-foreground">Pass Rate</div>
              </div>
              {/* Trend data from dashboardStats when available */}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{filteredResults.length}</div>
            <div className="text-sm text-muted-foreground">Total Evaluations</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">
              ${filteredResults.reduce((sum, r) => sum + r.cost_usd, 0).toFixed(2)}
            </div>
            <div className="text-sm text-muted-foreground">Total Cost</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">
              {filteredResults.length > 0
                ? Math.round(filteredResults.reduce((sum, r) => sum + r.latency_ms, 0) / filteredResults.length)
                : 0
              }ms
            </div>
            <div className="text-sm text-muted-foreground">Avg Latency</div>
          </CardContent>
        </Card>
      </div>

      {/* Model Performance Comparison */}
      <Card>
        <CardHeader>
          <CardTitle>Model Performance</CardTitle>
          <CardDescription>
            Compare performance across different models
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Model</TableHead>
                  <TableHead>Evaluations</TableHead>
                  <TableHead>Pass Rate</TableHead>
                  <TableHead>Avg Score</TableHead>
                  <TableHead>Avg Latency</TableHead>
                  <TableHead>Total Cost</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {modelPerformance.map((model) => (
                  <TableRow key={model.id}>
                    <TableCell className="font-medium">{model.name}</TableCell>
                    <TableCell>{model.total}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <span>{(model.passed / model.total * 100).toFixed(1)}%</span>
                        {model.passed / model.total >= 0.8 ? (
                          <CheckCircle className="h-4 w-4 text-eval-success" />
                        ) : (
                          <XCircle className="h-4 w-4 text-eval-error" />
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{(model.avgScore * 100).toFixed(1)}%</TableCell>
                    <TableCell>{Math.round(model.avgLatency)}ms</TableCell>
                    <TableCell>${model.totalCost.toFixed(4)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Task Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Task Performance</CardTitle>
          <CardDescription>
            Performance breakdown by task
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Task</TableHead>
                  <TableHead>Evaluations</TableHead>
                  <TableHead>Pass Rate</TableHead>
                  <TableHead>Avg Score</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {taskPerformance.map((task) => (
                  <TableRow key={task.id}>
                    <TableCell className="font-medium">{task.name}</TableCell>
                    <TableCell>{task.total}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <span>{(task.passed / task.total * 100).toFixed(1)}%</span>
                        {task.passed / task.total >= 0.8 ? (
                          <CheckCircle className="h-4 w-4 text-eval-success" />
                        ) : (
                          <XCircle className="h-4 w-4 text-eval-error" />
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{(task.avgScore * 100).toFixed(1)}%</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Error Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>Error Analysis</CardTitle>
          <CardDescription>
            Most common error categories
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {errorAnalysis.length > 0 ? (
              errorAnalysis.map((error) => (
                <div key={error.category} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <h4 className="font-medium">{error.category}</h4>
                    <p className="text-sm text-muted-foreground">
                      {error.count} occurrence{error.count !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <Badge variant="outline" className="text-eval-warning">
                    {((error.count / filteredResults.length) * 100).toFixed(1)}%
                  </Badge>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No errors found in the selected time range.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
