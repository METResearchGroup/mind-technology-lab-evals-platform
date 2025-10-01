'use client';

import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  loadModelMetadata,
  type ModelMetadata,
  formatModelCost,
  formatContextWindow,
} from '@/lib/services/model-metadata-service';

interface ModelBadgeWithTooltipProps {
  modelName: string;
  variant?: 'default' | 'secondary' | 'destructive' | 'outline';
  className?: string;
}

export function ModelBadgeWithTooltip({
  modelName,
  variant = 'outline',
  className = '',
}: ModelBadgeWithTooltipProps) {
  const [metadata, setMetadata] = useState<ModelMetadata | null>(null);

  useEffect(() => {
    loadModelMetadata().then((data) => {
      setMetadata(data[modelName] || null);
    });
  }, [modelName]);

  if (!metadata) {
    // Fallback if metadata not loaded yet
    return (
      <Badge variant={variant} className={className}>
        {modelName.split('/')[1]}
      </Badge>
    );
  }

  return (
    <TooltipProvider>
      <Tooltip delayDuration={200}>
        <TooltipTrigger asChild>
          <Badge variant={variant} className={`cursor-help ${className}`}>
            {metadata.display_name}
          </Badge>
        </TooltipTrigger>
        <TooltipContent className="max-w-md p-4" side="top">
          <div className="space-y-3">
            {/* Header */}
            <div>
              <p className="font-semibold text-sm">{metadata.display_name}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{metadata.provider}</p>
            </div>

            {/* Description */}
            <p className="text-xs">{metadata.description}</p>

            {/* Specs Grid */}
            <div className="grid grid-cols-2 gap-2 pt-2 border-t">
              <div>
                <p className="text-[10px] text-muted-foreground">Context Window</p>
                <p className="text-xs font-mono">{formatContextWindow(metadata.context_window)}</p>
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground">Avg Cost</p>
                <p className="text-xs font-mono">{formatModelCost(metadata)}</p>
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground">Input</p>
                <p className="text-xs font-mono">${metadata.cost_input_per_million.toFixed(2)}/M</p>
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground">Output</p>
                <p className="text-xs font-mono">${metadata.cost_output_per_million.toFixed(2)}/M</p>
              </div>
            </div>

            {/* Architecture */}
            <div className="pt-2 border-t">
              <p className="text-[10px] text-muted-foreground">Architecture</p>
              <p className="text-xs font-mono">{metadata.architecture}</p>
            </div>

            {/* Capabilities */}
            {metadata.capabilities && metadata.capabilities.length > 0 && (
              <div>
                <p className="text-[10px] text-muted-foreground mb-1">Capabilities</p>
                <div className="flex flex-wrap gap-1">
                  {metadata.capabilities.map((cap) => (
                    <Badge key={cap} variant="secondary" className="text-[10px] px-1.5 py-0">
                      {cap.replace(/_/g, ' ')}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Best For */}
            <div className="pt-2 border-t">
              <p className="text-[10px] text-muted-foreground">Best For</p>
              <p className="text-xs">{metadata.best_for}</p>
            </div>

            {/* Footer */}
            <div className="flex justify-between text-[10px] text-muted-foreground border-t pt-2">
              <span>Released: {metadata.released}</span>
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
