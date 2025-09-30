'use client';

import { useState, useEffect } from 'react';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { DashboardLayout, TabNavigation } from '@/components/layout/DashboardLayout';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import { TaskForm } from '@/components/forms/TaskForm';
import { ModelForm } from '@/components/forms/ModelForm';
import { EvaluateTab } from '@/components/tabs/EvaluateTab';
import { ViewTasksTab } from '@/components/tabs/ViewTasksTab';
import { ReviewPerformanceTab } from '@/components/tabs/ReviewPerformanceTab';
import { DashboardMetrics, TaskFormData, ModelFormData, EvalTask, Model, EvalResult } from '@/types';
import { loadDashboardMetrics, loadTasks, loadModels, loadResults } from '@/lib/data';

export default function Home() {
  const [activeTab, setActiveTab] = useState('evaluate');
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [tasks, setTasks] = useState<EvalTask[]>([]);
  const [models, setModels] = useState<Model[]>([]);
  const [results, setResults] = useState<EvalResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [metricsData, tasksData, modelsData, resultsData] = await Promise.all([
          loadDashboardMetrics(),
          loadTasks(),
          loadModels(),
          loadResults(),
        ]);
        setMetrics(metricsData);
        setTasks(tasksData);
        setModels(modelsData);
        setResults(resultsData);
      } catch (error) {
        console.error('Failed to load data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleTaskSubmit = (data: TaskFormData) => {
    console.log('Task submitted:', data);
    // In a real app, this would make an API call
    alert('Task saved successfully! (This is dummy data)');
  };

  const handleModelSubmit = (data: ModelFormData) => {
    console.log('Model submitted:', data);
    // In a real app, this would make an API call
    alert('Model saved successfully! (This is dummy data)');
  };

  const handleRunEvaluation = (taskIds: number[], modelIds: number[]) => {
    console.log('Running evaluation:', { taskIds, modelIds });
    // In a real app, this would trigger an evaluation
    alert(`Running evaluation with ${taskIds.length} tasks and ${modelIds.length} models! (This is dummy data)`);
  };

  const handleExportResults = () => {
    console.log('Exporting results...');
    // In a real app, this would generate and download a CSV
    alert('Results exported successfully! (This is dummy data)');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-eval-info mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading evaluation platform...</p>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <DashboardLayout metrics={metrics || undefined}>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />
          
          <div className="mt-6">
            <TabsContent value="evaluate" className="space-y-6">
              <ErrorBoundary>
                <EvaluateTab onRunEvaluation={handleRunEvaluation} />
              </ErrorBoundary>
            </TabsContent>

            <TabsContent value="add-task" className="space-y-6">
              <ErrorBoundary>
                <TaskForm onSubmit={handleTaskSubmit} />
              </ErrorBoundary>
            </TabsContent>

            <TabsContent value="view-tasks" className="space-y-6">
              <ErrorBoundary>
                <ViewTasksTab 
                  onAddTask={() => setActiveTab('add-task')}
                  onEditTask={(id) => console.log('Edit task:', id)}
                  onDeleteTask={(id) => console.log('Delete task:', id)}
                  onRunTask={(id) => console.log('Run task:', id)}
                />
              </ErrorBoundary>
            </TabsContent>

            <TabsContent value="add-model" className="space-y-6">
              <ErrorBoundary>
                <ModelForm onSubmit={handleModelSubmit} />
              </ErrorBoundary>
            </TabsContent>

            <TabsContent value="review-performance" className="space-y-6">
              <ErrorBoundary>
                <ReviewPerformanceTab onExportResults={handleExportResults} />
              </ErrorBoundary>
            </TabsContent>
          </div>
        </Tabs>
      </DashboardLayout>
    </ErrorBoundary>
  );
}