'use client';

import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CheckCircle, XCircle, Search, Filter, Play, Edit, Trash2 } from 'lucide-react';
import { EvalTask, Model, EvalResult } from '@/types';

interface ResultsTableProps {
  results: EvalResult[];
  tasks: EvalTask[];
  models: Model[];
  onRunEvaluation?: (taskId: number, modelId: number) => void;
  onEditTask?: (taskId: number) => void;
  onDeleteTask?: (taskId: number) => void;
}

export function ResultsTable({ 
  results, 
  tasks, 
  models, 
  onRunEvaluation,
  onEditTask,
  onDeleteTask 
}: ResultsTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'passed' | 'failed'>('all');
  const [modelFilter, setModelFilter] = useState<string>('all');

  // Filter results based on search and filters
  const filteredResults = results.filter(result => {
    const task = tasks.find(t => t.id === result.task_id);
    const model = models.find(m => m.id === result.model_id);
    
    const matchesSearch = !searchTerm || 
      task?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      model?.model_name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'passed' && result.passed === true) ||
      (statusFilter === 'failed' && result.passed === false);
    
    const matchesModel = modelFilter === 'all' || 
      model?.model_name === modelFilter;

    return matchesSearch && matchesStatus && matchesModel;
  });

  const getTaskName = (taskId: number) => {
    return tasks.find(t => t.id === taskId)?.name || `Task ${taskId}`;
  };

  const getModelName = (modelId: number) => {
    return models.find(m => m.id === modelId)?.model_name || `Model ${modelId}`;
  };

  const getStatusBadge = (passed?: boolean) => {
    if (passed === true) {
      return (
        <Badge variant="outline" className="text-eval-success border-eval-success">
          <CheckCircle className="h-3 w-3 mr-1" />
          Pass
        </Badge>
      );
    } else if (passed === false) {
      return (
        <Badge variant="outline" className="text-eval-error border-eval-error">
          <XCircle className="h-3 w-3 mr-1" />
          Fail
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="text-muted-foreground">
        Unknown
      </Badge>
    );
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Evaluation Results</CardTitle>
        <CardDescription>
          View and analyze evaluation results across all tasks and models
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search tasks or models..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as any)}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="passed">Passed</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
            </SelectContent>
          </Select>

          <Select value={modelFilter} onValueChange={setModelFilter}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder="Model" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Models</SelectItem>
              {models.map(model => (
                <SelectItem key={model.id} value={model.model_name}>
                  {model.model_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Results Table */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Task</TableHead>
                <TableHead>Model</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Score</TableHead>
                <TableHead>Latency</TableHead>
                <TableHead>Cost</TableHead>
                <TableHead>Error Category</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredResults.map((result) => (
                <TableRow key={result.id}>
                  <TableCell className="font-medium">
                    {getTaskName(result.task_id)}
                  </TableCell>
                  <TableCell>{getModelName(result.model_id)}</TableCell>
                  <TableCell>{getStatusBadge(result.passed)}</TableCell>
                  <TableCell>
                    {result.score !== undefined ? (result.score * 100).toFixed(1) + '%' : 'N/A'}
                  </TableCell>
                  <TableCell>{result.latency_ms}ms</TableCell>
                  <TableCell>${result.cost_usd.toFixed(4)}</TableCell>
                  <TableCell>
                    {result.error_category ? (
                      <Badge variant="outline" className="text-eval-warning">
                        {result.error_category}
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onRunEvaluation?.(result.task_id, result.model_id)}
                      >
                        <Play className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onEditTask?.(result.task_id)}
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {filteredResults.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            No results found matching your criteria.
          </div>
        )}

        {/* Summary Stats */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-eval-success">
              {filteredResults.filter(r => r.passed === true).length}
            </div>
            <div className="text-sm text-muted-foreground">Passed</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-eval-error">
              {filteredResults.filter(r => r.passed === false).length}
            </div>
            <div className="text-sm text-muted-foreground">Failed</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">
              {filteredResults.length > 0 
                ? (filteredResults.filter(r => r.passed === true).length / filteredResults.length * 100).toFixed(1) + '%'
                : '0%'
              }
            </div>
            <div className="text-sm text-muted-foreground">Pass Rate</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">
              ${filteredResults.reduce((sum, r) => sum + r.cost_usd, 0).toFixed(2)}
            </div>
            <div className="text-sm text-muted-foreground">Total Cost</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
