'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle } from 'lucide-react';
import { ModelFormData } from '@/types';

const modelFormSchema = z.object({
  provider: z.string().min(1, 'Provider is required'),
  model_name: z.string().min(1, 'Model name is required'),
  prompt_version: z.string().min(1, 'Prompt version is required'),
  config: z.object({
    temperature: z.number().min(0).max(2).optional(),
    max_tokens: z.number().min(1).max(10000).optional(),
    top_p: z.number().min(0).max(1).optional(),
  }),
  api_key: z.string().min(1, 'API key is required'),
});

interface ModelFormProps {
  onSubmit: (data: ModelFormData) => void;
  loading?: boolean;
  initialData?: Partial<ModelFormData>;
}

export function ModelForm({ onSubmit, loading = false, initialData }: ModelFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ModelFormData>({
    resolver: zodResolver(modelFormSchema),
    defaultValues: {
      provider: initialData?.provider || 'openrouter',
      model_name: initialData?.model_name || '',
      prompt_version: initialData?.prompt_version || 'v1.0',
      config: {
        temperature: initialData?.config?.temperature || 0.7,
        max_tokens: initialData?.config?.max_tokens || 1000,
        top_p: initialData?.config?.top_p || 1.0,
      },
      api_key: initialData?.api_key || '',
    },
  });

  const provider = watch('provider');
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');

  const testConnection = async () => {
    setTestStatus('testing');
    try {
      // Simulate API test
      await new Promise(resolve => setTimeout(resolve, 2000));
      setTestStatus('success');
    } catch {
      setTestStatus('error');
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Add New Model</CardTitle>
        <CardDescription>
          Configure a new LLM model for evaluation
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Provider Selection */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="provider">Provider *</Label>
              <Select
                value={provider}
                onValueChange={(value) => setValue('provider', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select provider" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="openrouter">OpenRouter</SelectItem>
                  <SelectItem value="openai">OpenAI</SelectItem>
                  <SelectItem value="anthropic">Anthropic</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="model_name">Model Name *</Label>
              <Input
                id="model_name"
                {...register('model_name')}
                placeholder="e.g., gpt-4, claude-3-opus"
                className={errors.model_name ? 'border-eval-error' : ''}
              />
              {errors.model_name && (
                <p className="text-sm text-eval-error mt-1">{errors.model_name.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="prompt_version">Prompt Version *</Label>
              <Input
                id="prompt_version"
                {...register('prompt_version')}
                placeholder="e.g., v1.0"
                className={errors.prompt_version ? 'border-eval-error' : ''}
              />
              {errors.prompt_version && (
                <p className="text-sm text-eval-error mt-1">{errors.prompt_version.message}</p>
              )}
            </div>
          </div>

          {/* API Configuration */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="api_key">API Key *</Label>
              <Input
                id="api_key"
                type="password"
                {...register('api_key')}
                placeholder="Enter your API key"
                className={errors.api_key ? 'border-eval-error' : ''}
              />
              {errors.api_key && (
                <p className="text-sm text-eval-error mt-1">{errors.api_key.message}</p>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={testConnection}
                disabled={testStatus === 'testing'}
              >
                {testStatus === 'testing' ? 'Testing...' : 'Test Connection'}
              </Button>
              
              {testStatus === 'success' && (
                <Badge variant="outline" className="text-eval-success border-eval-success">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Connection successful
                </Badge>
              )}
              
              {testStatus === 'error' && (
                <Badge variant="outline" className="text-eval-error border-eval-error">
                  <XCircle className="h-3 w-3 mr-1" />
                  Connection failed
                </Badge>
              )}
            </div>
          </div>

          {/* Model Configuration */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Model Configuration</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="temperature">Temperature</Label>
                <Input
                  id="temperature"
                  type="number"
                  step="0.1"
                  min="0"
                  max="2"
                  {...register('config.temperature', { valueAsNumber: true })}
                  placeholder="0.7"
                />
              </div>

              <div>
                <Label htmlFor="max_tokens">Max Tokens</Label>
                <Input
                  id="max_tokens"
                  type="number"
                  min="1"
                  max="10000"
                  {...register('config.max_tokens', { valueAsNumber: true })}
                  placeholder="1000"
                />
              </div>

              <div>
                <Label htmlFor="top_p">Top P</Label>
                <Input
                  id="top_p"
                  type="number"
                  step="0.1"
                  min="0"
                  max="1"
                  {...register('config.top_p', { valueAsNumber: true })}
                  placeholder="1.0"
                />
              </div>
            </div>
          </div>

          {/* Configuration Preview */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Configuration Preview</h3>
            <div className="p-4 bg-muted rounded-md">
              <pre className="text-sm">
{JSON.stringify({
  provider,
  model_name: watch('model_name'),
  prompt_version: watch('prompt_version'),
  config: watch('config'),
}, null, 2)}
              </pre>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4">
            <Button type="button" variant="outline">
              Cancel
            </Button>
            <Button type="submit" disabled={loading || testStatus !== 'success'}>
              {loading ? 'Saving...' : 'Save Model'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
