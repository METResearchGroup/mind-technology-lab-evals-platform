'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { X, Plus } from 'lucide-react';
import { TaskFormData } from '@/types';

const taskFormSchema = z.object({
  name: z.string().min(1, 'Task name is required'),
  description: z.string().optional(),
  input: z.string().min(1, 'Input is required'),
  expected_output: z.string().optional(),
  ground_truth: z.string().optional(),
  task_type: z.enum(['classification', 'generation']),
  evaluation_method: z.enum(['exact_match', 'contains', 'json_exact', 'levenshtein', 'llm_factuality', 'llm_judge', 'hybrid']),
  rubric: z.string().optional(),
  tags: z.array(z.string()),
  project: z.string().optional(),
});

interface TaskFormProps {
  onSubmit: (data: TaskFormData) => void;
  loading?: boolean;
  initialData?: Partial<TaskFormData> & { id?: number };
  onCancel?: () => void;
}

export function TaskForm({ onSubmit, loading = false, initialData, onCancel }: TaskFormProps) {
  const isEditing = !!initialData?.id;

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<TaskFormData>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: {
      name: initialData?.name || '',
      description: initialData?.description || '',
      input: initialData?.input || '',
      expected_output: initialData?.expected_output || '',
      ground_truth: initialData?.ground_truth || '',
      task_type: initialData?.task_type || 'classification',
      evaluation_method: initialData?.evaluation_method || 'exact_match',
      rubric: initialData?.rubric || '',
      tags: initialData?.tags || [],
      project: initialData?.project || '',
    },
  });

  const watchedTags = watch('tags');
  const taskType = watch('task_type');
  const evaluationMethod = watch('evaluation_method');

  const addTag = (tag: string) => {
    if (tag.trim() && !watchedTags.includes(tag.trim())) {
      setValue('tags', [...watchedTags, tag.trim()]);
    }
  };

  const removeTag = (tagToRemove: string) => {
    setValue('tags', watchedTags.filter(tag => tag !== tagToRemove));
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>{isEditing ? 'Edit Evaluation Task' : 'Add New Task'}</CardTitle>
        <CardDescription>
          {isEditing
            ? 'Update task details and evaluation criteria'
            : 'Create a new evaluation task for testing LLM performance'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Task Name *</Label>
              <Input
                id="name"
                {...register('name')}
                placeholder="e.g., Math Addition"
                className={errors.name ? 'border-eval-error' : ''}
              />
              {errors.name && (
                <p className="text-sm text-eval-error mt-1">{errors.name.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                {...register('description')}
                placeholder="Brief description of the task"
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="project">Project</Label>
              <Input
                id="project"
                {...register('project')}
                placeholder="e.g., math-evals"
              />
            </div>
          </div>

          {/* Task Configuration */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="task_type">Task Type *</Label>
                <Select
                  value={taskType}
                  onValueChange={(value) => setValue('task_type', value as 'classification' | 'generation')}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select task type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="classification">Classification</SelectItem>
                    <SelectItem value="generation">Generation</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="evaluation_method">Evaluation Method *</Label>
                <Select
                  value={evaluationMethod}
                  onValueChange={(value) => setValue('evaluation_method', value as typeof evaluationMethod)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select evaluation method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="exact_match">Exact Match</SelectItem>
                    <SelectItem value="contains">Contains</SelectItem>
                    <SelectItem value="json_exact">JSON Exact</SelectItem>
                    <SelectItem value="levenshtein">Levenshtein (Fuzzy)</SelectItem>
                    <SelectItem value="llm_factuality">LLM Factuality Judge</SelectItem>
                    <SelectItem value="llm_judge">LLM Judge</SelectItem>
                    <SelectItem value="hybrid">Hybrid</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Input/Output */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="input">Input *</Label>
              <Textarea
                id="input"
                {...register('input')}
                placeholder="The input prompt or question for the model"
                rows={4}
                className={errors.input ? 'border-eval-error' : ''}
              />
              {errors.input && (
                <p className="text-sm text-eval-error mt-1">{errors.input.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="expected_output">Expected Output</Label>
              <Textarea
                id="expected_output"
                {...register('expected_output')}
                placeholder="The expected output (for classification tasks)"
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="ground_truth">Ground Truth</Label>
              <Textarea
                id="ground_truth"
                {...register('ground_truth')}
                placeholder="Reference answer for evaluation"
                rows={3}
              />
            </div>

            {evaluationMethod === 'llm_judge' && (
              <div>
                <Label htmlFor="rubric">Evaluation Rubric</Label>
                <Textarea
                  id="rubric"
                  {...register('rubric')}
                  placeholder="Detailed rubric for LLM-as-judge evaluation"
                  rows={4}
                />
              </div>
            )}
          </div>

          {/* Tags */}
          <div className="space-y-4">
            <div>
              <Label>Tags</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {watchedTags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                    {tag}
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() => removeTag(tag)}
                    />
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2 mt-2">
                <Input
                  placeholder="Add tag"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addTag(e.currentTarget.value);
                      e.currentTarget.value = '';
                    }
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const input = document.querySelector('input[placeholder="Add tag"]') as HTMLInputElement;
                    if (input) {
                      addTag(input.value);
                      input.value = '';
                    }
                  }}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4">
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            )}
            <Button type="submit" disabled={loading}>
              {loading
                ? isEditing
                  ? 'Updating...'
                  : 'Saving...'
                : isEditing
                  ? 'Update Task'
                  : 'Save Task'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
