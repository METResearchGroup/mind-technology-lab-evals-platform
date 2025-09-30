'use client';

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Copy, Check } from 'lucide-react';
import { useState } from 'react';
import type { EvalTask } from '@/types';

interface TaskDetailModalProps {
  task: EvalTask | null;
  open: boolean;
  onClose: () => void;
}

export function TaskDetailModal({
  task,
  open,
  onClose,
}: TaskDetailModalProps) {
  const [copiedInput, setCopiedInput] = useState(false);
  const [copiedOutput, setCopiedOutput] = useState(false);

  const copyToClipboard = async (text: string, setter: (val: boolean) => void) => {
    await navigator.clipboard.writeText(text);
    setter(true);
    setTimeout(() => setter(false), 2000);
  };

  if (!task) {
    return null;
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>{task.name}</span>
            <div className="flex items-center space-x-2">
              <Badge variant="outline">{task.task_type}</Badge>
              <Badge variant="outline">{task.evaluation_method}</Badge>
            </div>
          </DialogTitle>
          <DialogDescription>
            Task ID: {task.id} | Version: {task.task_version || 'v1.0'} | Created: {formatDate(task.created_at)}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Metadata */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-muted rounded-lg">
            <div>
              <div className="text-xs text-muted-foreground">Task Type</div>
              <div className="mt-1">
                <Badge variant="outline">{task.task_type}</Badge>
              </div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Evaluation Method</div>
              <div className="mt-1">
                <Badge variant="outline">{task.evaluation_method}</Badge>
              </div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Project</div>
              <div className="text-sm font-medium mt-1">
                {task.project || 'None'}
              </div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Version</div>
              <div className="text-sm font-medium mt-1">
                {task.task_version || 'v1.0'}
              </div>
            </div>
          </div>

          {/* Description */}
          {task.description && (
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-muted-foreground">DESCRIPTION</h3>
              <div className="p-4 bg-muted/50 rounded-lg">
                <p className="text-sm">{task.description}</p>
              </div>
            </div>
          )}

          {/* Input (Prompt) */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-muted-foreground flex items-center justify-between">
              INPUT / PROMPT
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(task.input, setCopiedInput)}
              >
                {copiedInput ? (
                  <>
                    <Check className="h-3 w-3 mr-1" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="h-3 w-3 mr-1" />
                    Copy
                  </>
                )}
              </Button>
            </h3>
            <div className="p-4 bg-muted/50 rounded-lg">
              <div className="text-sm font-mono bg-background p-4 rounded border whitespace-pre-wrap">
                {task.input}
              </div>
            </div>
          </div>

          {/* Expected Output */}
          {task.expected_output && (
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-muted-foreground flex items-center justify-between">
                EXPECTED OUTPUT
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(task.expected_output!, setCopiedOutput)}
                >
                  {copiedOutput ? (
                    <>
                      <Check className="h-3 w-3 mr-1" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="h-3 w-3 mr-1" />
                      Copy
                    </>
                  )}
                </Button>
              </h3>
              <div className="p-4 bg-muted/50 rounded-lg">
                <div className="text-sm font-mono bg-background p-4 rounded border whitespace-pre-wrap">
                  {task.expected_output}
                </div>
              </div>
            </div>
          )}

          {/* Ground Truth */}
          {task.ground_truth && (
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-muted-foreground">GROUND TRUTH</h3>
              <div className="p-4 bg-muted/50 rounded-lg">
                <div className="text-sm bg-background p-4 rounded border whitespace-pre-wrap">
                  {task.ground_truth}
                </div>
              </div>
            </div>
          )}

          {/* Rubric */}
          {task.rubric && (
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-muted-foreground">EVALUATION RUBRIC</h3>
              <div className="p-4 bg-muted/50 rounded-lg">
                <div className="text-sm bg-background p-4 rounded border whitespace-pre-wrap">
                  {task.rubric}
                </div>
              </div>
            </div>
          )}

          {/* Tags */}
          {task.tags.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-muted-foreground">TAGS</h3>
              <div className="flex flex-wrap gap-2">
                {task.tags.map((tag: string) => (
                  <Badge key={tag} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Timestamps */}
          <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
            <div>
              <div className="text-xs text-muted-foreground">Created</div>
              <div className="text-sm font-medium mt-1">
                {formatDate(task.created_at)}
              </div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Last Updated</div>
              <div className="text-sm font-medium mt-1">
                {formatDate(task.updated_at)}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
