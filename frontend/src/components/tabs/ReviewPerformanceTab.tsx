'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Download, ArrowLeft, Play } from 'lucide-react';
import { useTasks } from '@/hooks/useTasks';
import { useModels } from '@/hooks/useModels';
import { useResults } from '@/hooks/useResults';
import { useRuns, useRunEvaluation } from '@/hooks/useEvaluation';
import { ResultsTable } from '@/components/tables/ResultsTable';
import { ResultDetailModal } from '@/components/ui/ResultDetailModal';
import type { EvalResult, EvalRun } from '@/types';

interface ReviewPerformanceTabProps {
  onExportResults?: () => void;
}

export function ReviewPerformanceTab({ onExportResults }: ReviewPerformanceTabProps) {
  const { data: tasks = [] } = useTasks();
  const { data: models = [] } = useModels();
  const { data: runs = [], isLoading: runsLoading } = useRuns();
  const { mutate: reRunEvaluation } = useRunEvaluation();

  const [selectedRunId, setSelectedRunId] = useState<string | null>(null);
  const [timeFilter, setTimeFilter] = useState<string>('all');
  const [projectFilter, setProjectFilter] = useState<string>('all');
  const [modelFilter, setModelFilter] = useState<string>('all');
  const [errorFilter, setErrorFilter] = useState<string>('all');
  const [selectedResult, setSelectedResult] = useState<EvalResult | null>(null);

  // Fetch results for selected run
  const { data: selectedRunResults = [] } = useResults(
    selectedRunId ? { run_id: selectedRunId } : undefined
  );

  // Fetch all results for filtering purposes
  const { data: allResults = [] } = useResults({ limit: 1000 });

  // View mode: "list" shows all runs, "detail" shows single run
  const viewMode = selectedRunId ? 'detail' : 'list';

  // Filter runs
  const filteredRuns = runs.filter(run => {
    // Time filter
    const runDate = new Date(run.started_at);
    const now = new Date();
    let dateThreshold = new Date(0); // Beginning of time

    if (timeFilter === '24h') {
      dateThreshold = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    } else if (timeFilter === '7d') {
      dateThreshold = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    } else if (timeFilter === '30d') {
      dateThreshold = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    const matchesTime = timeFilter === 'all' || runDate >= dateThreshold;

    // Model filter (check if run includes this model)
    const matchesModel = modelFilter === 'all' ||
      (run.model_ids && run.model_ids.includes(parseInt(modelFilter)));

    // Project filter (check tasks in this run)
    let matchesProject = true;
    if (projectFilter !== 'all') {
      const runTasks = tasks.filter(t => run.task_ids?.includes(t.id));
      matchesProject = runTasks.some(t => t.project === projectFilter);
    }

    // Error filter (check if run has results with this error category)
    let matchesError = true;
    if (errorFilter !== 'all') {
      const runResults = allResults.filter(r => r.run_id === run.id);
      matchesError = runResults.some(r => r.error_category === errorFilter);
    }

    return matchesTime && matchesModel && matchesProject && matchesError;
  });

  // Helper functions
  const getUniqueProjects = () => {
    const projects = tasks.map(t => t.project).filter(Boolean);
    return Array.from(new Set(projects));
  };

  const getUniqueErrorCategories = () => {
    const categories = allResults
      .map(r => r.error_category)
      .filter(Boolean);
    return Array.from(new Set(categories));
  };

  const calculateRunPassRate = (run: EvalRun) => {
    const passed = run.completed_tasks - run.failed_tasks;
    const total = run.total_tasks || 1;
    return ((passed / total) * 100).toFixed(0);
  };

  const calculateRunCost = (runId: string) => {
    const runResults = allResults.filter(r => r.run_id === runId);
    return runResults.reduce((sum, r) => sum + (r.cost_usd || 0), 0);
  };

  const formatCost = (cost: number) => {
    if (cost < 0.01) return `$${cost.toFixed(4)}`;
    if (cost < 1) return `$${cost.toFixed(3)}`;
    return `$${cost.toFixed(2)}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const getStatusBadge = (status: string) => {
    if (status === 'completed') {
      return <Badge variant="default" className="text-xs">Completed</Badge>;
    } else if (status === 'failed') {
      return <Badge variant="destructive" className="text-xs">Failed</Badge>;
    } else if (status === 'running') {
      return <Badge variant="secondary" className="text-xs">Running</Badge>;
    }
    return <Badge variant="outline" className="text-xs">{status}</Badge>;
  };

  const handleReRun = (run: EvalRun, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!run.task_ids || !run.model_ids) return;

    reRunEvaluation(
      {
        task_ids: run.task_ids,
        model_ids: run.model_ids,
        run_name: `Re-run: ${run.name || run.id.slice(0, 8)}`,
      },
      {
        onSuccess: () => {
          alert('✅ Evaluation re-run started! Check Evaluate tab for progress.');
        },
        onError: (error) => {
          alert(`❌ Failed to re-run: ${error.message}`);
        },
      }
    );
  };

  const selectedRun = runs.find(r => r.id === selectedRunId);

  if (runsLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-eval-info mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading runs...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">
            {viewMode === 'list' ? 'Evaluation Runs' : 'Run Details'}
          </h2>
          <p className="text-muted-foreground">
            {viewMode === 'list'
              ? 'Browse and analyze all evaluation runs'
              : `Viewing: ${selectedRun?.name || selectedRun?.id.slice(0, 8)}`}
          </p>
        </div>
        {viewMode === 'detail' && (
          <Button onClick={() => setSelectedRunId(null)} variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to All Runs
          </Button>
        )}
        {viewMode === 'list' && (
          <Button onClick={onExportResults}>
            <Download className="h-4 w-4 mr-2" />
            Export Results
          </Button>
        )}
      </div>

      {/* List View: All Runs */}
      {viewMode === 'list' && (
        <>
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle>Filters</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Select value={timeFilter} onValueChange={setTimeFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Time Range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Time</SelectItem>
                    <SelectItem value="24h">Last 24 Hours</SelectItem>
                    <SelectItem value="7d">Last 7 Days</SelectItem>
                    <SelectItem value="30d">Last 30 Days</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={modelFilter} onValueChange={setModelFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Model" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Models</SelectItem>
                    {models.map(model => (
                      <SelectItem key={model.id} value={model.id.toString()}>
                        {model.model_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={projectFilter} onValueChange={setProjectFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Project" />
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

                <Select value={errorFilter} onValueChange={setErrorFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Error Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Errors</SelectItem>
                    {getUniqueErrorCategories().map(category => (
                      <SelectItem key={category} value={category!}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold">{filteredRuns.length}</div>
                <div className="text-sm text-muted-foreground">Total Runs</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold">
                  {filteredRuns.reduce((sum, r) => sum + (r.total_tasks || 0), 0)}
                </div>
                <div className="text-sm text-muted-foreground">Total Evaluations</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold">
                  {formatCost(filteredRuns.reduce((sum, r) => sum + calculateRunCost(r.id), 0))}
                </div>
                <div className="text-sm text-muted-foreground">Total Cost</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold">
                  {filteredRuns.length > 0
                    ? (filteredRuns.reduce((sum, r) => sum + parseInt(calculateRunPassRate(r)), 0) / filteredRuns.length).toFixed(0)
                    : 0}%
                </div>
                <div className="text-sm text-muted-foreground">Avg Pass Rate</div>
              </CardContent>
            </Card>
          </div>

          {/* Runs Table */}
          <Card>
            <CardHeader>
              <CardTitle>Runs ({filteredRuns.length})</CardTitle>
              <CardDescription>
                All evaluation runs, sorted by most recent first
              </CardDescription>
            </CardHeader>
            <CardContent>
              {filteredRuns.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No runs found matching your criteria.
                  {runs.length === 0 && (
                    <p className="mt-2 text-sm">
                      Run your first evaluation in the Evaluate tab!
                    </p>
                  )}
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Run Name</TableHead>
                        <TableHead>Date/Time</TableHead>
                        <TableHead>Tasks × Models</TableHead>
                        <TableHead>Pass Rate</TableHead>
                        <TableHead>Total Cost</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredRuns.map((run) => (
                        <TableRow
                          key={run.id}
                          onClick={() => setSelectedRunId(run.id)}
                          className="cursor-pointer hover:bg-muted/50"
                        >
                          <TableCell className="font-medium">
                            {run.name || run.id.slice(0, 8)}
                          </TableCell>
                          <TableCell className="text-sm">
                            {formatDate(run.started_at)}
                          </TableCell>
                          <TableCell className="text-sm">
                            {run.task_ids?.length || 0} × {run.model_ids?.length || 0}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Badge variant="outline">
                                {calculateRunPassRate(run)}%
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                ({run.completed_tasks - run.failed_tasks}/{run.total_tasks})
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="text-sm">
                            {formatCost(calculateRunCost(run.id))}
                          </TableCell>
                          <TableCell>
                            {getStatusBadge(run.status)}
                          </TableCell>
                          <TableCell>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={(e) => handleReRun(run, e)}
                            >
                              <Play className="h-3 w-3 mr-1" />
                              Re-run
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}

      {/* Detail View: Single Run */}
      {viewMode === 'detail' && selectedRun && (
        <>
          {/* Run Metadata */}
          <Card>
            <CardHeader>
              <CardTitle>{selectedRun.name || `Run ${selectedRun.id.slice(0, 8)}`}</CardTitle>
              <CardDescription>
                {selectedRun.description || 'No description provided'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div>
                  <div className="text-xs text-muted-foreground">Status</div>
                  <div className="mt-1">{getStatusBadge(selectedRun.status)}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Started</div>
                  <div className="text-sm font-medium mt-1">
                    {formatDate(selectedRun.started_at)}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Duration</div>
                  <div className="text-sm font-medium mt-1">
                    {selectedRun.completed_at
                      ? `${(
                          (new Date(selectedRun.completed_at).getTime() -
                            new Date(selectedRun.started_at).getTime()) /
                          1000
                        ).toFixed(1)}s`
                      : 'In progress'}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Total Evals</div>
                  <div className="text-sm font-medium mt-1">{selectedRun.total_tasks}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Pass Rate</div>
                  <div className="text-sm font-medium mt-1">
                    {calculateRunPassRate(selectedRun)}% ({selectedRun.completed_tasks - selectedRun.failed_tasks}/{selectedRun.total_tasks})
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Results Table */}
          <Card>
            <CardHeader>
              <CardTitle>Results ({selectedRunResults.length})</CardTitle>
              <CardDescription>
                Detailed results for this evaluation run
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResultsTable
                results={selectedRunResults}
                tasks={tasks}
                models={models}
                showSummary={true}
                onResultClick={setSelectedResult}
              />
            </CardContent>
          </Card>
        </>
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
