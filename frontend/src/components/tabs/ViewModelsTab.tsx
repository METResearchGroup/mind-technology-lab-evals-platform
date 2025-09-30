'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Plus, Edit, Trash2, CheckCircle, XCircle } from 'lucide-react';
import { Model } from '@/types';
import { loadModels } from '@/lib/data';

interface ViewModelsTabProps {
  onAddModel?: () => void;
  onEditModel?: (modelId: number) => void;
  onDeleteModel?: (modelId: number) => void;
}

export function ViewModelsTab({ 
  onAddModel, 
  onEditModel, 
  onDeleteModel 
}: ViewModelsTabProps) {
  const [models, setModels] = useState<Model[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [providerFilter, setProviderFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const modelsData = await loadModels();
        setModels(modelsData);
      } catch (error) {
        console.error('Failed to load models:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Filter models based on search and filters
  const filteredModels = models.filter(model => {
    const matchesSearch = !searchTerm || 
      model.model_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      model.provider.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesProvider = providerFilter === 'all' || model.provider === providerFilter;

    return matchesSearch && matchesProvider;
  });

  const getUniqueProviders = () => {
    const providers = models.map(m => m.provider);
    return Array.from(new Set(providers));
  };

  const getProviderBadge = (provider: string) => {
    const colors = {
      openrouter: 'text-eval-info',
      openai: 'text-eval-success',
      anthropic: 'text-eval-warning',
    };
    
    return (
      <Badge variant="outline" className={`text-xs ${colors[provider as keyof typeof colors] || 'text-muted-foreground'}`}>
        {provider}
      </Badge>
    );
  };

  const getConfigSummary = (config: Record<string, any>) => {
    const parts = [];
    if (config.temperature !== undefined) parts.push(`T: ${config.temperature}`);
    if (config.max_tokens !== undefined) parts.push(`Tokens: ${config.max_tokens}`);
    if (config.top_p !== undefined) parts.push(`Top-p: ${config.top_p}`);
    return parts.join(', ');
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-eval-info mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading models...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Models</h2>
          <p className="text-muted-foreground">
            Manage and view all configured LLM models
          </p>
        </div>
        <Button onClick={onAddModel}>
          <Plus className="h-4 w-4 mr-2" />
          Add Model
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search models..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={providerFilter} onValueChange={setProviderFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Provider" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Providers</SelectItem>
                {getUniqueProviders().map(provider => (
                  <SelectItem key={provider} value={provider}>
                    {provider}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Models Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            Models ({filteredModels.length})
          </CardTitle>
          <CardDescription>
            All configured LLM models with their settings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Model Name</TableHead>
                  <TableHead>Provider</TableHead>
                  <TableHead>Prompt Version</TableHead>
                  <TableHead>Configuration</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredModels.map((model) => (
                  <TableRow key={model.id}>
                    <TableCell className="font-medium">
                      {model.model_name}
                    </TableCell>
                    <TableCell>{getProviderBadge(model.provider)}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">
                        {model.prompt_version}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-muted-foreground">
                        {getConfigSummary(model.config)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-eval-success" />
                        <span className="text-sm text-eval-success">Active</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {new Date(model.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onEditModel?.(model.id)}
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onDeleteModel?.(model.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredModels.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No models found matching your criteria.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{models.length}</div>
            <div className="text-sm text-muted-foreground">Total Models</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">
              {models.filter(m => m.provider === 'openrouter').length}
            </div>
            <div className="text-sm text-muted-foreground">OpenRouter</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">
              {models.filter(m => m.provider === 'openai').length}
            </div>
            <div className="text-sm text-muted-foreground">OpenAI</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">
              {models.filter(m => m.provider === 'anthropic').length}
            </div>
            <div className="text-sm text-muted-foreground">Anthropic</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
