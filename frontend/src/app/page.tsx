'use client';

import { useState } from 'react';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { DashboardLayout, TabNavigation } from '@/components/layout/DashboardLayout';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import { TaskForm } from '@/components/forms/TaskForm';
import { ModelForm } from '@/components/forms/ModelForm';
import { EvaluateTab } from '@/components/tabs/EvaluateTab';
import { ViewTasksTab } from '@/components/tabs/ViewTasksTab';
import { ReviewPerformanceTab } from '@/components/tabs/ReviewPerformanceTab';
import { TaskFormData, ModelFormData } from '@/types';
import { useCreateTask } from '@/hooks/useTasks';
import { useCreateModel } from '@/hooks/useModels';
// import { useDashboardStats } from '@/hooks/useResults'; // Not used yet

export default function Home() {
  const [activeTab, setActiveTab] = useState('evaluate');
  // const { data: dashboardStats } = useDashboardStats(); // Not used yet
  const { mutate: createTask, isPending: isCreatingTask } = useCreateTask();
  const { mutate: createModel, isPending: isCreatingModel } = useCreateModel();

  const handleTaskSubmit = (data: TaskFormData) => {
    createTask(
      {
        name: data.name,
        input: data.input,
        task_type: data.task_type,
        evaluation_method: data.evaluation_method,
        description: data.description,
        expected_output: data.expected_output,
        ground_truth: data.ground_truth,
        rubric: data.rubric,
        tags: data.tags,
        project: data.project,
      },
      {
        onSuccess: () => {
          alert('✅ Task saved successfully!');
          setActiveTab('view-tasks');
        },
        onError: (error: Error) => {
          alert(`❌ Failed to save task: ${error.message}`);
        },
      }
    );
  };

  const handleModelSubmit = (data: ModelFormData) => {
    createModel(
      {
        provider: data.provider,
        model_name: data.model_name,
        prompt_version: data.prompt_version,
        config: data.config,
      },
      {
        onSuccess: () => {
          alert('✅ Model saved successfully!');
          setActiveTab('evaluate');
        },
        onError: (error: Error) => {
          alert(`❌ Failed to save model: ${error.message}`);
        },
      }
    );
  };

  const handleRunEvaluation = (taskIds: number[], modelIds: number[]) => {
    console.log('Running evaluation:', { taskIds, modelIds });
    // Evaluation is now handled by EvaluateTab component via useRunEvaluation hook
    // No alert needed - results will display in the Evaluate tab
  };

  const handleExportResults = () => {
    console.log('Exporting results...');
    // In a real app, this would generate and download a CSV
    alert('Results exported successfully! (This is dummy data)');
  };

  return (
    <ErrorBoundary>
      <DashboardLayout>
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
                <TaskForm onSubmit={handleTaskSubmit} loading={isCreatingTask} />
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
                <ModelForm onSubmit={handleModelSubmit} loading={isCreatingModel} />
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
